import 'dotenv/config';
import { randomBytes, scryptSync } from 'node:crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

const systemMenus = [
  {
    menuName: '系统管理',
    path: '/system',
    component: 'Layout',
    icon: 'settings',
    sortOrder: 1,
    children: [
      {
        menuName: '用户管理',
        path: '/system/users',
        component: 'system/users',
        icon: 'users',
        sortOrder: 1,
      },
      {
        menuName: '角色管理',
        path: '/system/roles',
        component: 'system/roles',
        icon: 'shield',
        sortOrder: 2,
      },
      {
        menuName: '菜单管理',
        path: '/system/menus',
        component: 'system/menus',
        icon: 'menu',
        sortOrder: 3,
      },
      {
        menuName: '字典管理',
        path: '/system/dictionaries',
        component: 'system/dictionaries',
        icon: 'book',
        sortOrder: 4,
      },
    ],
  },
];

async function upsertMenu(menu, parentId = null) {
  const existing = menu.path
    ? await prisma.systemMenu.findFirst({ where: { path: menu.path } })
    : null;

  const saved = existing
    ? await prisma.systemMenu.update({
        where: { id: existing.id },
        data: {
          parentId,
          menuName: menu.menuName,
          component: menu.component,
          icon: menu.icon,
          sortOrder: menu.sortOrder,
          isVisible: true,
          isEnabled: true,
        },
      })
    : await prisma.systemMenu.create({
        data: {
          parentId,
          menuName: menu.menuName,
          path: menu.path,
          component: menu.component,
          icon: menu.icon,
          sortOrder: menu.sortOrder,
          isVisible: true,
          isEnabled: true,
        },
      });

  for (const child of menu.children ?? []) {
    await upsertMenu(child, saved.id);
  }

  return saved;
}

async function main() {
  for (const menu of systemMenus) {
    await upsertMenu(menu);
  }

  const allMenus = await prisma.systemMenu.findMany({
    where: { isEnabled: true },
    select: { id: true },
  });

  const role = await prisma.systemRole.upsert({
    where: { roleCode: 'SYSTEM_ADMIN' },
    update: {
      roleName: '系统管理员',
      description: '系统初始化管理员角色',
      isEnabled: true,
    },
    create: {
      roleName: '系统管理员',
      roleCode: 'SYSTEM_ADMIN',
      description: '系统初始化管理员角色',
      isEnabled: true,
    },
  });

  await prisma.systemRoleMenu.deleteMany({ where: { roleId: role.id } });
  await prisma.systemRoleMenu.createMany({
    data: allMenus.map((menu) => ({ roleId: role.id, menuId: menu.id })),
    skipDuplicates: true,
  });

  const existingAdmin = await prisma.systemUser.findUnique({
    where: { username: 'admin' },
  });

  if (existingAdmin) {
    await prisma.systemUser.update({
      where: { id: existingAdmin.id },
      data: {
        roleId: role.id,
        nickname: existingAdmin.nickname ?? '管理员',
        isEnabled: true,
      },
    });
  } else {
    await prisma.systemUser.create({
      data: {
        username: 'admin',
        passwordHash: hashPassword('admin123'),
        nickname: '管理员',
        roleId: role.id,
        isEnabled: true,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('System seed completed. Login with admin / admin123');
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
