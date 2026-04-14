import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const roles = await this.prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      permissionCount: role.permissions.length,
      createdAt: role.createdAt,
    }));
  }

  async findOne(id: number) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        users: true,
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return {
      id: role.id,
      name: role.name,
      description: role.description,
      userCount: role.users.length,
      permissions: role.permissions.map((rp) => ({
        id: rp.permission.id,
        key: rp.permission.key,
        group: rp.permission.group,
        description: rp.permission.description,
      })),
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }

  async create(createRoleDto: CreateRoleDto) {
    const { name, description } = createRoleDto;

    // 检查角色名是否已存在
    const existingRole = await this.prisma.role.findUnique({
      where: { name },
    });

    if (existingRole) {
      throw new ConflictException('Role name already exists');
    }

    const role = await this.prisma.role.create({
      data: {
        name,
        description,
      },
    });

    return {
      id: role.id,
      name: role.name,
      description: role.description,
    };
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const role = await this.prisma.role.findUnique({ where: { id } });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // 如果更新名称，检查是否已存在
    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existingRole = await this.prisma.role.findUnique({
        where: { name: updateRoleDto.name },
      });
      if (existingRole) {
        throw new ConflictException('Role name already exists');
      }
    }

    const updatedRole = await this.prisma.role.update({
      where: { id },
      data: updateRoleDto,
    });

    return {
      id: updatedRole.id,
      name: updatedRole.name,
      description: updatedRole.description,
    };
  }

  async remove(id: number) {
    const role = await this.prisma.role.findUnique({ where: { id } });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    await this.prisma.role.delete({ where: { id } });

    return { message: 'Role deleted successfully' };
  }

  async assignPermissions(id: number, assignPermissionsDto: AssignPermissionsDto) {
    const role = await this.prisma.role.findUnique({ where: { id } });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // 删除现有权限
    await this.prisma.rolePermission.deleteMany({
      where: { roleId: id },
    });

    // 分配新权限
    await Promise.all(
      assignPermissionsDto.permissionIds.map((permissionId) =>
        this.prisma.rolePermission.create({
          data: {
            roleId: id,
            permissionId,
          },
        }),
      ),
    );

    return { message: 'Permissions assigned successfully' };
  }
}
