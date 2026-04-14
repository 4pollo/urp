import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { AssignRolesDto } from './dto/assign-roles.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(page: number = 1, pageSize: number = 10, status?: string, roleId?: number) {
    const skip = (page - 1) * pageSize;
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (roleId) {
      where.roles = {
        some: {
          roleId: roleId,
        },
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: items.map((user) => ({
        id: user.id,
        email: user.email,
        status: user.status,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        roles: user.roles.map((ur) => ({
          id: ur.role.id,
          name: ur.role.name,
        })),
      })),
      total,
      page,
      pageSize,
    };
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      status: user.status,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      roles: user.roles.map((ur) => ({
        id: ur.role.id,
        name: ur.role.name,
        description: ur.role.description,
      })),
    };
  }

  async create(createUserDto: CreateUserDto) {
    const { email, password, roleIds } = createUserDto;

    // 检查邮箱是否已存在
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // 哈希密码
    const hashedPassword = await bcrypt.hash(password, 12);

    // 创建用户
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        status: 'active',
      },
    });

    // 分配角色
    if (roleIds && roleIds.length > 0) {
      await Promise.all(
        roleIds.map((roleId) =>
          this.prisma.userRole.create({
            data: {
              userId: user.id,
              roleId,
            },
          }),
        ),
      );
    } else {
      // 默认分配 Guest 角色
      const guestRole = await this.prisma.role.findUnique({
        where: { name: 'Guest' },
      });
      if (guestRole) {
        await this.prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: guestRole.id,
          },
        });
      }
    }

    return {
      id: user.id,
      email: user.email,
      status: user.status,
    };
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 如果更新邮箱，检查是否已存在
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      status: updatedUser.status,
    };
  }

  async remove(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({ where: { id } });

    return { message: 'User deleted successfully' };
  }

  async updateStatus(id: number, updateUserStatusDto: UpdateUserStatusDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id },
      data: { status: updateUserStatusDto.status },
    });

    return { message: 'User status updated successfully' };
  }

  async assignRoles(id: number, assignRolesDto: AssignRolesDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 删除现有角色
    await this.prisma.userRole.deleteMany({
      where: { userId: id },
    });

    // 分配新角色
    await Promise.all(
      assignRolesDto.roleIds.map((roleId) =>
        this.prisma.userRole.create({
          data: {
            userId: id,
            roleId,
          },
        }),
      ),
    );

    return { message: 'Roles assigned successfully' };
  }
}
