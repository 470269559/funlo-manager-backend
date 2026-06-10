import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { hashPassword } from '../../../common/auth/password.util';
import { PrismaService } from '../../../prisma/prisma.service';
import { SYSTEM_ERROR_MESSAGES } from '../system-error.messages';
import { CreateSystemUserDto } from './dto/create-system-user.dto';
import { UpdateSystemUserDto } from './dto/update-system-user.dto';

@Injectable()
export class SystemUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSystemUserDto) {
    if (!dto.username?.trim()) {
      throw new BadRequestException(
        SYSTEM_ERROR_MESSAGES.users.USERNAME_REQUIRED,
      );
    }
    if (!dto.password) {
      throw new BadRequestException(
        SYSTEM_ERROR_MESSAGES.users.PASSWORD_REQUIRED,
      );
    }
    await this.ensureRoleExists(dto.roleId);

    try {
      const user = await this.prisma.systemUser.create({
        data: {
          username: dto.username.trim(),
          passwordHash: hashPassword(dto.password),
          nickname: dto.nickname ?? null,
          roleId: dto.roleId,
          isEnabled: dto.isEnabled ?? true,
        },
        include: { role: true },
      });

      return this.safeUser(user);
    } catch (error) {
      this.handleUniqueError(error);
      throw error;
    }
  }

  async findAll() {
    const users = await this.prisma.systemUser.findMany({
      orderBy: { id: 'asc' },
      include: { role: true },
    });

    return users.map((user) => this.safeUser(user));
  }

  async findOne(id: number) {
    const user = await this.prisma.systemUser.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!user) {
      throw new NotFoundException(SYSTEM_ERROR_MESSAGES.users.NOT_FOUND);
    }

    return this.safeUser(user);
  }

  async update(id: number, dto: UpdateSystemUserDto) {
    await this.ensureUserExists(id);
    if (dto.roleId !== undefined) {
      await this.ensureRoleExists(dto.roleId);
    }

    try {
      const user = await this.prisma.systemUser.update({
        where: { id },
        data: {
          username: dto.username?.trim(),
          passwordHash: dto.password ? hashPassword(dto.password) : undefined,
          nickname: dto.nickname,
          roleId: dto.roleId,
          isEnabled: dto.isEnabled,
        },
        include: { role: true },
      });

      return this.safeUser(user);
    } catch (error) {
      this.handleUniqueError(error);
      throw error;
    }
  }

  async remove(id: number) {
    await this.ensureUserExists(id);
    await this.prisma.systemUser.delete({ where: { id } });
    return { success: true };
  }

  private safeUser<T extends { passwordHash: string }>(user: T) {
    const { passwordHash, ...safe } = user;
    void passwordHash;
    return safe;
  }

  private async ensureUserExists(id: number) {
    const user = await this.prisma.systemUser.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(SYSTEM_ERROR_MESSAGES.users.NOT_FOUND);
    }
    return user;
  }

  private async ensureRoleExists(roleId: number) {
    const role = await this.prisma.systemRole.findUnique({
      where: { id: roleId },
    });
    if (!role) {
      throw new BadRequestException(SYSTEM_ERROR_MESSAGES.roles.NOT_FOUND);
    }
    return role;
  }

  private handleUniqueError(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(SYSTEM_ERROR_MESSAGES.users.USERNAME_EXISTS);
    }
  }
}
