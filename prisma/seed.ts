import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 创建 SuperAdmin 角色
  const superAdmin = await prisma.role.upsert({
    where: { name: 'SuperAdmin' },
    update: {},
    create: {
      name: 'SuperAdmin',
      description: '超级管理员，拥有所有权限',
    },
  });

  // 创建 Guest 角色
  const guest = await prisma.role.upsert({
    where: { name: 'Guest' },
    update: {},
    create: {
      name: 'Guest',
      description: '默认角色',
    },
  });

  // 创建基础权限
  const permissions = [
    { key: 'user:read', group: 'user', description: '查看用户' },
    { key: 'user:write', group: 'user', description: '编辑用户' },
    { key: 'user:delete', group: 'user', description: '删除用户' },
    { key: 'role:read', group: 'role', description: '查看角色' },
    { key: 'role:write', group: 'role', description: '编辑角色' },
    { key: 'role:delete', group: 'role', description: '删除角色' },
    { key: 'permission:read', group: 'permission', description: '查看权限' },
    { key: 'permission:write', group: 'permission', description: '编辑权限' },
    { key: 'permission:delete', group: 'permission', description: '删除权限' },
    { key: 'system:manage', group: 'system', description: '系统管理' },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { key: perm.key },
      update: {},
      create: perm,
    });
  }

  // 为 SuperAdmin 分配所有权限
  const allPermissions = await prisma.permission.findMany();
  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdmin.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: superAdmin.id,
        permissionId: perm.id,
      },
    });
  }

  // 创建默认管理员用户
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      status: 'active',
    },
  });

  // 为管理员分配 SuperAdmin 角色
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: superAdmin.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: superAdmin.id,
    },
  });

  console.log('Seed completed!');
  console.log('Default admin user: admin@example.com / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
