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
import {
  ApiAssignPermissionToRole,
  ApiAssignRoleToUser,
  ApiCreatePermission,
  ApiCreateRole,
  ApiFindAllPermissions,
  ApiFindAllRoles,
  ApiFindOnePermission,
  ApiFindOneRole,
  ApiGetUserPermissions,
  ApiGetUserRoles,
  ApiRevokeRoleFromUser,
  ApiRemovePermission,
  ApiRemoveRole,
  ApiRevokePermissionFromRole,
  ApiUpdatePermission,
  ApiUpdateRole,
} from './swagger/rbac.swagger';

// ── Roles ──────────────────────────────────────────────────────────────────
@Controller('roles')
export class RolesController {
  constructor(private readonly rbacService: RbacService) {}

  @Get()
  @ApiFindAllRoles()
  findAll() {
    return this.rbacService.findAllRoles();
  }

  @Get(':id')
  @ApiFindOneRole()
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rbacService.findRoleById(id);
  }

  @Post()
  @ApiCreateRole()
  create(@Body() dto: CreateRoleDto) {
    return this.rbacService.createRole(dto);
  }

  @Patch(':id')
  @ApiUpdateRole()
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRoleDto) {
    return this.rbacService.updateRole(id, dto);
  }

  @Delete(':id')
  @ApiRemoveRole()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rbacService.removeRole(id);
  }

  @Post(':roleId/permissions/:permissionId')
  @ApiAssignPermissionToRole()
  assignPermissionToRole(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Param('permissionId', ParseIntPipe) permissionId: number,
  ) {
    return this.rbacService.assignPermissionToRole(roleId, permissionId);
  }

  @Delete(':roleId/permissions/:permissionId')
  @ApiRevokePermissionFromRole()
  revokePermissionFromRole(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Param('permissionId', ParseIntPipe) permissionId: number,
  ) {
    return this.rbacService.revokePermissionFromRole(roleId, permissionId);
  }
}

// ── Permissions ────────────────────────────────────────────────────────────
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly rbacService: RbacService) {}

  @Get()
  @ApiFindAllPermissions()
  findAll() {
    return this.rbacService.findAllPermissions();
  }

  @Get(':id')
  @ApiFindOnePermission()
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rbacService.findPermissionById(id);
  }

  @Post()
  @ApiCreatePermission()
  create(@Body() dto: CreatePermissionDto) {
    return this.rbacService.createPermission(dto);
  }

  @Patch(':id')
  @ApiUpdatePermission()
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePermissionDto) {
    return this.rbacService.updatePermission(id, dto);
  }

  @Delete(':id')
  @ApiRemovePermission()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rbacService.removePermission(id);
  }
}

// ── User ↔ Role assignment ─────────────────────────────────────────────────
@Controller('user-roles')
export class UserRolesController {
  constructor(private readonly rbacService: RbacService) {}

  @Get(':userId')
  @ApiGetUserRoles()
  getUserRoles(@Param('userId', ParseIntPipe) userId: number) {
    return this.rbacService.getUserRoles(userId);
  }

  @Get(':userId/permissions')
  @ApiGetUserPermissions()
  getUserPermissions(@Param('userId', ParseIntPipe) userId: number) {
    return this.rbacService.getUserPermissions(userId);
  }

  @Post('assign')
  @ApiAssignRoleToUser()
  assign(@Body() dto: AssignRoleDto) {
    return this.rbacService.assignRoleToUser(dto);
  }

  @Delete('revoke')
  @ApiRevokeRoleFromUser()
  revoke(@Body() dto: AssignRoleDto) {
    return this.rbacService.revokeRoleFromUser(dto);
  }
}