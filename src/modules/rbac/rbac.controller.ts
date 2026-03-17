import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { RbacService } from './rbac.service';
import {
  CreateRoleDto,
  UpdateRoleDto,
  AssignRoleDto,
  CreatePermissionDto,
  UpdatePermissionDto,
} from './dtos/rbac.dto';

// ── Roles ──────────────────────────────────────────────────────────────────
@Controller('roles')
export class RolesController {
  constructor(private readonly rbacService: RbacService) {}

  @Get()
  findAll() {
    return this.rbacService.findAllRoles();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rbacService.findRoleById(id);
  }

  @Post()
  create(@Body() dto: CreateRoleDto) {
    return this.rbacService.createRole(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRoleDto) {
    return this.rbacService.updateRole(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rbacService.removeRole(id);
  }
}

// ── Permissions ────────────────────────────────────────────────────────────
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly rbacService: RbacService) {}

  @Get()
  findAll() {
    return this.rbacService.findAllPermissions();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rbacService.findPermissionById(id);
  }

  @Post()
  create(@Body() dto: CreatePermissionDto) {
    return this.rbacService.createPermission(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePermissionDto) {
    return this.rbacService.updatePermission(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rbacService.removePermission(id);
  }
}

// ── User ↔ Role assignment ─────────────────────────────────────────────────
@Controller('user-roles')
export class UserRolesController {
  constructor(private readonly rbacService: RbacService) {}

  @Get(':userId')
  getUserRoles(@Param('userId', ParseIntPipe) userId: number) {
    return this.rbacService.getUserRoles(userId);
  }

  @Get(':userId/permissions')
  getUserPermissions(@Param('userId', ParseIntPipe) userId: number) {
    return this.rbacService.getUserPermissions(userId);
  }

  @Post('assign')
  assign(@Body() dto: AssignRoleDto) {
    return this.rbacService.assignRoleToUser(dto);
  }

  @Delete('revoke')
  revoke(@Body() dto: AssignRoleDto) {
    return this.rbacService.revokeRoleFromUser(dto);
  }
}