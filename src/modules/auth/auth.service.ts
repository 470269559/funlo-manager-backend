import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { verifyPassword } from '../../common/auth/password.util';
import { PrismaService } from '../../prisma/prisma.service';
import { AUTH_ERROR_MESSAGES } from './auth-error.messages';
import { LoginDto } from './dto/login.dto';

type TreeNode<T> = T & { children: Array<TreeNode<T>> };

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.systemUser.findUnique({
      where: { username: dto.username },
      include: { role: true },
    });

    if (
      !user ||
      !user.isEnabled ||
      !user.role.isEnabled ||
      !verifyPassword(dto.password, user.passwordHash)
    ) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    const payload = {
      userId: user.id,
      username: user.username,
      roleId: user.roleId,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: this.safeUser(user),
    };
  }

  async getProfile(userId: number) {
    const user = await this.prisma.systemUser.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.USER_NOT_FOUND);
    }

    return this.safeUser(user);
  }

  async getMenus(userId: number) {
    const user = await this.prisma.systemUser.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            roleMenus: {
              include: { menu: true },
            },
          },
        },
      },
    });

    if (!user || !user.isEnabled || !user.role.isEnabled) {
      throw new UnauthorizedException(
        AUTH_ERROR_MESSAGES.USER_DISABLED_OR_NOT_FOUND,
      );
    }

    const roleMenuIds = user.role.roleMenus
      .map((roleMenu) => roleMenu.menu)
      .filter((menu) => menu.isEnabled && menu.isVisible)
      .map((menu) => menu.id);
    const menus = await this.resolveAuthMenuTree(roleMenuIds);

    return this.buildMenuTree(menus);
  }

  private async resolveAuthMenuTree(menuIds: number[]) {
    if (menuIds.length === 0) {
      return [];
    }

    const allMenus = await this.prisma.systemMenu.findMany({
      where: {
        isEnabled: true,
        isVisible: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
    const menuMap = new Map(allMenus.map((menu) => [menu.id, menu]));
    const resolvedIds = new Set(menuIds);

    for (const menuId of menuIds) {
      let parentId = menuMap.get(menuId)?.parentId;
      while (parentId) {
        resolvedIds.add(parentId);
        parentId = menuMap.get(parentId)?.parentId;
      }
    }

    return allMenus.filter((menu) => resolvedIds.has(menu.id));
  }

  private buildMenuTree<T extends { id: number; parentId: number | null }>(
    menus: T[],
  ) {
    const nodeMap = new Map<number, TreeNode<T>>();
    const roots: Array<TreeNode<T>> = [];

    for (const menu of menus) {
      nodeMap.set(menu.id, { ...menu, children: [] });
    }

    for (const menu of nodeMap.values()) {
      if (menu.parentId && nodeMap.has(menu.parentId)) {
        nodeMap.get(menu.parentId)?.children.push(menu);
      } else {
        roots.push(menu);
      }
    }

    return roots;
  }

  private safeUser<T extends { passwordHash: string }>(user: T) {
    const { passwordHash, ...safe } = user;
    void passwordHash;
    return safe;
  }
}
