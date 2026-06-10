import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { SYSTEM_ERROR_MESSAGES } from '../system-error.messages';
import { CreateSystemMenuDto } from './dto/create-system-menu.dto';
import { UpdateSystemMenuDto } from './dto/update-system-menu.dto';

@Injectable()
export class SystemMenusService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSystemMenuDto) {
    if (!dto.menuName?.trim()) {
      throw new BadRequestException(
        SYSTEM_ERROR_MESSAGES.menus.MENU_NAME_REQUIRED,
      );
    }

    if (dto.parentId) {
      await this.ensureMenuExists(dto.parentId);
    }

    return this.prisma.systemMenu.create({
      data: {
        parentId: dto.parentId ?? null,
        menuName: dto.menuName.trim(),
        path: dto.path ?? null,
        component: dto.component ?? null,
        icon: dto.icon ?? null,
        sortOrder: dto.sortOrder ?? 0,
        isVisible: dto.isVisible ?? true,
        isEnabled: dto.isEnabled ?? true,
      },
    });
  }

  findAll() {
    return this.prisma.systemMenu.findMany({
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
  }

  async findTree() {
    const menus = await this.findAll();
    const nodeMap = new Map<
      number,
      (typeof menus)[number] & { children: any[] }
    >();
    const roots: Array<(typeof menus)[number] & { children: any[] }> = [];

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

  async findOne(id: number) {
    const menu = await this.prisma.systemMenu.findUnique({
      where: { id },
      include: {
        children: {
          orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        },
      },
    });

    if (!menu) {
      throw new NotFoundException(SYSTEM_ERROR_MESSAGES.menus.NOT_FOUND);
    }

    return menu;
  }

  async update(id: number, dto: UpdateSystemMenuDto) {
    await this.ensureMenuExists(id);

    if (dto.parentId === id) {
      throw new BadRequestException(
        SYSTEM_ERROR_MESSAGES.menus.PARENT_CANNOT_BE_SELF,
      );
    }

    if (dto.parentId) {
      await this.ensureMenuExists(dto.parentId);
    }

    return this.prisma.systemMenu.update({
      where: { id },
      data: {
        parentId: dto.parentId,
        menuName: dto.menuName?.trim(),
        path: dto.path,
        component: dto.component,
        icon: dto.icon,
        sortOrder: dto.sortOrder,
        isVisible: dto.isVisible,
        isEnabled: dto.isEnabled,
      },
    });
  }

  async remove(id: number) {
    await this.ensureMenuExists(id);
    await this.prisma.systemMenu.delete({ where: { id } });
    return { success: true };
  }

  private async ensureMenuExists(id: number) {
    const menu = await this.prisma.systemMenu.findUnique({ where: { id } });
    if (!menu) {
      throw new NotFoundException(SYSTEM_ERROR_MESSAGES.menus.NOT_FOUND);
    }
    return menu;
  }
}
