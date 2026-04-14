import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { UserRole } from '../users/entities/user-role.entity';
import { UserStatus } from '../users/entities/user-status.enum';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(UserRole) private userRoleRepo: Repository<UserRole>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password } = registerDto;

    const existingUser = await this.userRepo.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = this.userRepo.create({
      email,
      password: hashedPassword,
      status: UserStatus.ACTIVE,
    });
    await this.userRepo.save(user);

    const guestRole = await this.roleRepo.findOne({
      where: { name: 'Guest' },
    });

    if (guestRole) {
      await this.userRoleRepo.save({
        userId: user.id,
        roleId: guestRole.id,
      });
    }

    const tokens = await this.generateTokens(user.id, user.email);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        status: user.status,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepo.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === UserStatus.FROZEN) {
      throw new UnauthorizedException('User account is frozen');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.userRepo.update(user.id, { lastLoginAt: new Date() });

    const tokens = await this.generateTokens(user.id, user.email);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        status: user.status,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_SECRET'),
      });

      const user = await this.userRepo.findOne({
        where: { id: payload.sub },
      });

      if (!user || user.status === UserStatus.FROZEN) {
        throw new UnauthorizedException('Invalid token');
      }

      const tokens = await this.generateTokens(user.id, user.email);

      return {
        accessToken: tokens.accessToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const { oldPassword, newPassword } = changePasswordDto;

    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Old password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await this.userRepo.update(userId, { password: hashedPassword });

    return { message: 'Password changed successfully' };
  }

  async getMe(userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: {
        roles: {
          role: true,
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      status: user.status,
      lastLoginAt: user.lastLoginAt,
      roles: user.roles.map((ur) => ({
        id: ur.role.id,
        name: ur.role.name,
      })),
    };
  }

  private async generateTokens(userId: number, email: string) {
    const payload = { sub: userId, email };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRES') || '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES') || '7d',
    });

    return { accessToken, refreshToken };
  }
}
