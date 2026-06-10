import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { SYSTEM_ERROR_MESSAGES } from '../system-error.messages';
import { CreateSystemRoleDto } from './dto/create-system-role.dto';
import { UpdateSystemRoleDto } from './dto/update-system-role.dto';

@Injectable()
export class SystemRolesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSystemRoleDto) {
    this.validateRoleInput(dto.roleName, dto.roleCode);
    const menuIds = await this.resolveMenuIds(dto.menuIds);

    try {
      return await this.prisma.systemRole.create({
        data: {
          roleName: dto.roleName.trim(),
          roleCode: dto.roleCode.trim(),
          description: dto.description ?? null,
          isEnabled: dto.isEnabled ?? true,
          roleMenus: {
            create: menuIds.map((menuId) => ({ menuId })),
          },
        },
        include: this.roleInclude,
      });
    } catch (error) {
      this.handleUniqueError(error);
      throw error;
    }
  }

  async findAll() {
    const roles = await this.prisma.systemRole.findMany({
      orderBy: { id: 'asc' },
      include: {
        _count: {
          select: { roleMenus: true, users: true },
        },
      },
    });

    return roles.map((role) => ({
      ...role,
      menuCount: role._count.roleMenus,
      userCount: role._count.users,
      _count: undefined,
    }));
  }

  async findOne(id: number) {
    const role = await this.prisma.systemRole.findUnique({
      where: { id },
      include: this.roleInclude,
    });

    if (!role) {
      throw new NotFoundException(SYSTEM_ERROR_MESSAGES.roles.NOT_FOUND);
    }

    return role;
  }

  async update(id: number, dto: UpdateSystemRoleDto) {
    await this.ensureRoleExists(id);
    if (dto.roleName !== undefined || dto.roleCode !== undefined) {
      this.validateRoleInput(dto.roleName ?? 'valid', dto.roleCode ?? 'VALID');
    }

    const menuIds =
      dto.menuIds === undefined
        ? undefined
        : await this.resolveMenuIds(dto.menuIds);

    try {
      return await this.prisma.$transaction(async (tx) => {
        const role = await tx.systemRole.update({
          where: { id },
          data: {
            roleName: dto.roleName?.trim(),
            roleCode: dto.roleCode?.trim(),
            description: dto.description,
            isEnabled: dto.isEnabled,
          },
        });

        if (menuIds) {
          await tx.systemRoleMenu.deleteMany({ where: { roleId: id } });
          if (menuIds.length > 0) {
            await tx.systemRoleMenu.createMany({
              data: menuIds.map((menuId) => ({ roleId: id, menuId })),
            });
          }
        }

        return tx.systemRole.findUnique({
          where: { id: role.id },
          include: this.roleInclude,
        });
      });
    } catch (error) {
      this.handleUniqueError(error);
      throw error;
    }
  }

  async remove(id: number) {
    await this.ensureRoleExists(id);

    const userCount = await this.prisma.systemUser.count({
      where: { roleId: id },
    });
    if (userCount > 0) {
      throw new BadRequestException(
        SYSTEM_ERROR_MESSAGES.roles.DELETE_WITH_USERS,
      );
    }

    await this.prisma.systemRole.delete({ where: { id } });
    return { success: true };
  }

  private get roleInclude() {
    return {
      roleMenus: {
        include: {
          menu: true,
        },
        orderBy: {
          menuId: 'asc' as const,
        },
      },
    };
  }

  private validateRoleInput(roleName: string, roleCode: string) {
    if (!roleName?.trim()) {
      throw new BadRequestException(
        SYSTEM_ERROR_MESSAGES.roles.ROLE_NAME_REQUIRED,
      );
    }
    if (!roleCode?.trim()) {
      throw new BadRequestException(
        SYSTEM_ERROR_MESSAGES.roles.ROLE_CODE_REQUIRED,
      );
    }
  }

  private normalizeMenuIds(menuIds?: number[]) {
    if (!Array.isArray(menuIds)) {
      return [];
    }
    return [...new Set(menuIds.map(Number))].filter((id) =>
      Number.isInteger(id),
    );
  }

  private async resolveMenuIds(menuIds?: number[]) {
    const normalizedIds = this.normalizeMenuIds(menuIds);
    if (normalizedIds.length === 0) {
      return [];
    }

    const menus = await this.prisma.systemMenu.findMany({
      select: { id: true, parentId: true },
    });
    const menuMap = new Map(menus.map((menu) => [menu.id, menu]));

    if (normalizedIds.some((id) => !menuMap.has(id))) {
      throw new BadRequestException(
        SYSTEM_ERROR_MESSAGES.roles.INVALID_MENU_ID,
      );
    }

    const childrenMap = new Map<number, number[]>();
    for (const menu of menus) {
      if (!menu.parentId) {
        continue;
      }
      childrenMap.set(menu.parentId, [
        ...(childrenMap.get(menu.parentId) ?? []),
        menu.id,
      ]);
    }

    const resolvedIds = new Set<number>();
    const addDescendants = (menuId: number) => {
      for (const childId of childrenMap.get(menuId) ?? []) {
        resolvedIds.add(childId);
        addDescendants(childId);
      }
    };

    for (const menuId of normalizedIds) {
      resolvedIds.add(menuId);
      addDescendants(menuId);
    }

    return [...resolvedIds].sort((a, b) => a - b);
  }

  private async ensureRoleExists(id: number) {
    const role = await this.prisma.systemRole.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException(SYSTEM_ERROR_MESSAGES.roles.NOT_FOUND);
    }
    return role;
  }

  private handleUniqueError(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(SYSTEM_ERROR_MESSAGES.roles.ROLE_CODE_EXISTS);
    }
  }
}
