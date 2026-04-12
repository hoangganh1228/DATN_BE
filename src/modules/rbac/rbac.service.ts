import { Injectable, HttpStatus } from '@nestjs/common';
import { RoleRepository } from './repositories/role.repository';
import { PermissionRepository } from './repositories/permission.repository';
import { UserRoleRepository } from './repositories/user-role.repository';
import { AppException } from 'src/common/exceptions/app.exception';
import { Permission } from './entities/permission.entity';
import {
  CreateRoleDto,
  UpdateRoleDto,
  AssignRoleDto,
  CreatePermissionDto,
  UpdatePermissionDto,
} from './dtos/rbac.dto';

@Injectable()
export class RbacService {
  constructor(
    private readonly roleRepo:       RoleRepository,
    private readonly permissionRepo: PermissionRepository,
    private readonly userRoleRepo:   UserRoleRepository,
  ) {}

  // ════════════════════════════════════════════════
  //  ROLES
  // ════════════════════════════════════════════════

  async findAllRoles() {
    return this.roleRepo.findAllWithPermissions();
  }

  async findRoleById(id: number) {
    const role = await this.roleRepo.findById(id);
    if (!role) throw new AppException('ROLE_NOT_FOUND', HttpStatus.NOT_FOUND);
    return role;
  }

  async createRole(dto: CreateRoleDto) {
    const exists = await this.roleRepo.existsByName(dto.name);
    if (exists) throw new AppException('ROLE_ALREADY_EXISTS', HttpStatus.CONFLICT);

    // Lấy permissions nếu có truyền permissionIds
    let permissions: Permission[] = [];
    if (dto.permissionIds?.length) {
      permissions = await this.permissionRepo.findByIds(dto.permissionIds);
      if (permissions.length !== dto.permissionIds.length) {
        throw new AppException('PERMISSION_NOT_FOUND', HttpStatus.NOT_FOUND);
      }
    }

    const role = this.roleRepo.create({
      name:        dto.name,
      description: dto.description,
      permissions,
    });

    return this.roleRepo.save(role);
  }

  async updateRole(id: number, dto: UpdateRoleDto) {
    const role = await this.findRoleById(id);

    // Kiểm tra tên trùng với role khác
    if (dto.name && dto.name !== role.name) {
      const exists = await this.roleRepo.existsByName(dto.name, id);
      if (exists) throw new AppException('ROLE_ALREADY_EXISTS', HttpStatus.CONFLICT);
    }

    // Cập nhật permissions nếu có
    if (dto.permissionIds !== undefined) {
      const permissions = dto.permissionIds.length
        ? await this.permissionRepo.findByIds(dto.permissionIds)
        : [];

      if (dto.permissionIds.length && permissions.length !== dto.permissionIds.length) {
        throw new AppException('PERMISSION_NOT_FOUND', HttpStatus.NOT_FOUND);
      }
      role.permissions = permissions;
    }

    if (dto.name)        role.name        = dto.name;
    role.description = dto.description;

    return this.roleRepo.save(role);
  }

  async removeRole(id: number) {
    const role = await this.findRoleById(id);
    await this.roleRepo.remove(role);
  }

  async assignPermissionToRole(roleId: number, permissionId: number) {
    const role = await this.findRoleById(roleId);
    const permission = await this.findPermissionById(permissionId);

    const alreadyAssigned = role.permissions.some((item) => item.id === permission.id);
    if (alreadyAssigned) {
      throw new AppException('PERMISSION_ALREADY_ASSIGNED_TO_ROLE', HttpStatus.CONFLICT);
    }

    role.permissions = [...role.permissions, permission];
    return this.roleRepo.save(role);
  }

  async revokePermissionFromRole(roleId: number, permissionId: number) {
    const role = await this.findRoleById(roleId);

    const wasAssigned = role.permissions.some((item) => item.id === permissionId);
    if (!wasAssigned) {
      throw new AppException('PERMISSION_NOT_ASSIGNED_TO_ROLE', HttpStatus.NOT_FOUND);
    }

    role.permissions = role.permissions.filter((item) => item.id !== permissionId);
    return this.roleRepo.save(role);
  }

  // ════════════════════════════════════════════════
  //  PERMISSIONS
  // ════════════════════════════════════════════════

  async findAllPermissions() {
    return this.permissionRepo.find();
  }

  async findPermissionById(id: number) {
    const permission = await this.permissionRepo.findById(id);
    if (!permission) throw new AppException('PERMISSION_NOT_FOUND', HttpStatus.NOT_FOUND);
    return permission;
  }

  async createPermission(dto: CreatePermissionDto) {
    const exists = await this.permissionRepo.existsByName(dto.name);
    if (exists) throw new AppException('PERMISSION_ALREADY_EXISTS', HttpStatus.CONFLICT);

    const permission = this.permissionRepo.create({
      name:        dto.name,
      action:      dto.action,
      description: dto.description,
    });

    return this.permissionRepo.save(permission);
  }

  async updatePermission(id: number, dto: UpdatePermissionDto) {
    const permission = await this.findPermissionById(id);

    if (dto.name && dto.name !== permission.name) {
      const exists = await this.permissionRepo.existsByName(dto.name, id);
      if (exists) throw new AppException('PERMISSION_ALREADY_EXISTS', HttpStatus.CONFLICT);
    }

    Object.assign(permission, dto);
    return this.permissionRepo.save(permission);
  }

  async removePermission(id: number) {
    const permission = await this.findPermissionById(id);
    await this.permissionRepo.remove(permission);
  }

  // ════════════════════════════════════════════════
  //  USER ↔ ROLE ASSIGNMENT
  // ════════════════════════════════════════════════

  async assignRoleToUser(dto: AssignRoleDto) {
    // Kiểm tra role tồn tại
    const role = await this.roleRepo.findById(dto.roleId);
    if (!role) throw new AppException('ROLE_NOT_FOUND', HttpStatus.NOT_FOUND);

    // Kiểm tra đã assign chưa
    const alreadyAssigned = await this.userRoleRepo.existsAssignment(dto.userId, dto.roleId);
    if (alreadyAssigned) throw new AppException('ROLE_ALREADY_ASSIGNED', HttpStatus.CONFLICT);

    const userRole = this.userRoleRepo.create({
      userId: dto.userId,
      roleId: dto.roleId,
    });

    return this.userRoleRepo.save(userRole);
  }

  async revokeRoleFromUser(dto: AssignRoleDto) {
    const userRole = await this.userRoleRepo.findOne_(dto.userId, dto.roleId);
    if (!userRole) throw new AppException('ROLE_NOT_ASSIGNED', HttpStatus.NOT_FOUND);

    await this.userRoleRepo.remove(userRole);
  }

  async getUserRoles(userId: number) {
    return this.userRoleRepo.findByUserId(userId);
  }

  async getUserPermissions(userId: number): Promise<string[]> {
    return this.userRoleRepo.getUserPermissions(userId);
  }

  async hasPermission(userId: number, permissionName: string): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissions.includes(permissionName);
  }
}