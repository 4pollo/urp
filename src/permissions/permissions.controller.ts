import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { CheckPermissionDto } from './dto/check-permission.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api')
@UseGuards(JwtAuthGuard)
export class PermissionsController {
  constructor(private permissionsService: PermissionsService) {}

  @Get('permissions')
  async findAll(@Query('group') group?: string) {
    return this.permissionsService.findAll(group);
  }

  @Get('permissions/me')
  async getUserPermissions(@Request() req) {
    return this.permissionsService.getUserPermissions(req.user.userId);
  }

  @Get('permissions/:id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.permissionsService.findOne(id);
  }

  @Post('permissions')
  async create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }

  @Put('permissions/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionsService.update(id, updatePermissionDto);
  }

  @Delete('permissions/:id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.permissionsService.remove(id);
  }

  @Post('check')
  async checkPermission(
    @Request() req,
    @Body() checkPermissionDto: CheckPermissionDto,
  ) {
    return this.permissionsService.checkPermission(
      req.user.userId,
      checkPermissionDto.permission,
    );
  }
}
