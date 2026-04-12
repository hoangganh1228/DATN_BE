import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import {
  AssignRoleDto,
  CreatePermissionDto,
  CreateRoleDto,
  UpdatePermissionDto,
  UpdateRoleDto,
} from '../dtos/rbac.dto';
import { PermissionResponseDto } from '../dtos/permission-response.dto';
import { RoleResponseDto } from '../dtos/role-response.dto';
import { UserRoleResponseDto } from '../dtos/user-role-response.dto';

export function ApiFindAllRoles() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all roles' }),
    ApiResponse({ status: HttpStatus.OK, description: 'List of roles', type: [RoleResponseDto] }),
  );
}

export function ApiFindOneRole() {
  return applyDecorators(
    ApiOperation({ summary: 'Get role by ID' }),
    ApiParam({ name: 'id', type: 'number' }),
    ApiResponse({ status: HttpStatus.OK, description: 'Role record', type: RoleResponseDto }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Role not found' }),
  );
}

export function ApiCreateRole() {
  return applyDecorators(
    ApiOperation({ summary: 'Create new role' }),
    ApiBody({ type: CreateRoleDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Role created successfully',
      type: RoleResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'Role already exists',
      schema: { example: { errorCode: 'RBAC_002', message: 'Role already exists' } },
    }),
  );
}

export function ApiUpdateRole() {
  return applyDecorators(
    ApiOperation({ summary: 'Update role' }),
    ApiParam({ name: 'id', type: 'number' }),
    ApiBody({ type: UpdateRoleDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Role updated successfully',
      type: RoleResponseDto,
    }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Role not found' }),
  );
}

export function ApiRemoveRole() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete role' }),
    ApiParam({ name: 'id', type: 'number' }),
    ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Role deleted successfully' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Role not found' }),
  );
}

export function ApiAssignPermissionToRole() {
  return applyDecorators(
    ApiOperation({ summary: 'Assign permission to role' }),
    ApiParam({ name: 'roleId', type: 'number' }),
    ApiParam({ name: 'permissionId', type: 'number' }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Permission assigned to role successfully',
      type: RoleResponseDto,
    }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Role or permission not found' }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'Permission already assigned to role',
      schema: {
        example: {
          errorCode: 'RBAC_PERMISSION_ALREADY_ASSIGNED_TO_ROLE',
          message: 'Permission already assigned to role',
        },
      },
    }),
  );
}

export function ApiRevokePermissionFromRole() {
  return applyDecorators(
    ApiOperation({ summary: 'Revoke permission from role' }),
    ApiParam({ name: 'roleId', type: 'number' }),
    ApiParam({ name: 'permissionId', type: 'number' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Permission revoked from role successfully',
      type: RoleResponseDto,
    }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Permission not assigned to role' }),
  );
}

export function ApiFindAllPermissions() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all permissions' }),
    ApiResponse({ status: HttpStatus.OK, description: 'List of permissions', type: [PermissionResponseDto] }),
  );
}

export function ApiFindOnePermission() {
  return applyDecorators(
    ApiOperation({ summary: 'Get permission by ID' }),
    ApiParam({ name: 'id', type: 'number' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Permission record',
      type: PermissionResponseDto,
    }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Permission not found' }),
  );
}

export function ApiCreatePermission() {
  return applyDecorators(
    ApiOperation({ summary: 'Create new permission' }),
    ApiBody({ type: CreatePermissionDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Permission created successfully',
      type: PermissionResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'Permission already exists',
      schema: { example: { errorCode: 'RBAC_102', message: 'Permission already exists' } },
    }),
  );
}

export function ApiUpdatePermission() {
  return applyDecorators(
    ApiOperation({ summary: 'Update permission' }),
    ApiParam({ name: 'id', type: 'number' }),
    ApiBody({ type: UpdatePermissionDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Permission updated successfully',
      type: PermissionResponseDto,
    }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Permission not found' }),
  );
}

export function ApiRemovePermission() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete permission' }),
    ApiParam({ name: 'id', type: 'number' }),
    ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Permission deleted successfully' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Permission not found' }),
  );
}

export function ApiGetUserRoles() {
  return applyDecorators(
    ApiOperation({ summary: 'Get roles assigned to a user' }),
    ApiParam({ name: 'userId', type: 'number' }),
    ApiResponse({ status: HttpStatus.OK, description: 'User roles', type: [UserRoleResponseDto] }),
  );
}

export function ApiGetUserPermissions() {
  return applyDecorators(
    ApiOperation({ summary: 'Get permission names granted to a user' }),
    ApiParam({ name: 'userId', type: 'number' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'List of permission names',
      schema: { type: 'array', items: { type: 'string' } },
    }),
  );
}

export function ApiAssignRoleToUser() {
  return applyDecorators(
    ApiOperation({ summary: 'Assign role to user' }),
    ApiBody({ type: AssignRoleDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Role assigned successfully',
      type: UserRoleResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'Role already assigned to user',
      schema: { example: { errorCode: 'RBAC_003', message: 'Role already assigned to user' } },
    }),
  );
}

export function ApiRevokeRoleFromUser() {
  return applyDecorators(
    ApiOperation({ summary: 'Revoke role from user' }),
    ApiBody({ type: AssignRoleDto }),
    ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Role revoked successfully' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Role not assigned to user' }),
  );
}

