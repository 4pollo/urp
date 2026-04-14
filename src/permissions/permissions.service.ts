import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(group?: string) {
    const where = group ? { group } : {};

    const permissions = await this.prisma.permission.findMany({
      where,
      orderBy: [
        { group: 'asc' },
        { key: 'asc' },
      ],
    });

    return permissions;
  }

  async findOne(id: number) {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    return permission;
  }

  async create(createPermissionDto: CreatePermissionDto) {
    const { key, group, description } = createPermissionDto;

    // 检查权限 key 是否已存在
    const existingPermission = await this.prisma.permission.findUnique({
      where: { key },
    });

    if (existingPermission) {
      throw new ConflictException('Permission key already exists');
    }

    const permission = await this.prisma.permission.create({
      data: {
        key,
        group,
        description,
      },
    });

    return permission;
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto) {
    const permission = await this.prisma.permission.findUnique({ where: { id } });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    // 如果更新 key，检查是否已存在
    if (updatePermissionDto.key && updatePermissionDto.key !== permission.key) {
      const existingPermission = await this.prisma.permission.findUnique({
        where: { key: updatePermissionDto.key },
      });
      if (existingPermission) {
        throw new ConflictException('Permission key already exists');
      }
    }

    const updatedPermission = await this.prisma.permission.update({
      where: { id },
      data: updatePermissionDto,
    });

    return updatedPermission;
  }

  async remove(id: number) {
    const permission = await this.prisma.permission.findUnique({ where: { id } });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    await this.prisma.permission.delete({ where: { id } });

    return { message: 'Permission deleted successfully' };
  }

  async checkPermission(userId: number, permissionKey: string) {
    // 获取用户的所有角色
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    // 收集所有权限
    const permissions = new Set<string>();
    for (const userRole of userRoles) {
      for (const rolePermission of userRole.role.permissions) {
        permissions.add(rolePermission.permission.key);
      }
    }

    return {
      allowed: permissions.has(permissionKey),
    };
  }

  async getUserPermissions(userId: number) {
    // 获取用户的所有角色
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    // 收集所有权限和角色
    const permissions = new Set<string>();
    const roles = new Set<string>();

    for (const userRole of userRoles) {
      roles.add(userRole.role.name);
      for (const rolePermission of userRole.role.permissions) {
        permissions.add(rolePermission.permission.key);
      }
    }

    return {
      permissions: Array.from(permissions),
      roles: Array.from(roles),
    };
  }
}
