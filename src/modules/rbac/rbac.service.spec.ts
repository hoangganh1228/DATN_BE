import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { RbacService } from './rbac.service';
import { RoleRepository } from './repositories/role.repository';
import { PermissionRepository } from './repositories/permission.repository';
import { UserRoleRepository } from './repositories/user-role.repository';
import { AppException } from 'src/common/exceptions/app.exception';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { UserRole } from './entities/user-role.entity';

// ── Mock data ──────────────────────────────────────────────────────────────
const mockPermission: Permission = {
  id:          1,
  name:        'product.create',
  action:      'create',
  description: 'Create product',
  roles:       [],
  createdAt:   new Date('2024-01-01'),
  updatedAt:   new Date('2024-01-01'),
};

const mockPermission2: Permission = {
  id:          2,
  name:        'product.delete',
  action:      'delete',
  description: 'Delete product',
  roles:       [],
  createdAt:   new Date('2024-01-01'),
  updatedAt:   new Date('2024-01-01'),
};

const mockRole: Role = {
  id:          1,
  name:        'admin',
  description: 'Administrator',
  permissions: [mockPermission],
  createdAt:   new Date('2024-01-01'),
  updatedAt:   new Date('2024-01-01'),
};

const mockUserRole: UserRole = {
  userId:    1,
  roleId:    1,
  user:      {} as any,
  role:      mockRole,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

// ── Mock repositories ──────────────────────────────────────────────────────
const mockRoleRepo = {
  findAllWithPermissions: jest.fn(),
  findById:               jest.fn(),
  findByName:             jest.fn(),
  existsByName:           jest.fn(),
  create:                 jest.fn(),
  save:                   jest.fn(),
  remove:                 jest.fn(),
};

const mockPermissionRepo = {
  find:          jest.fn(),
  findById:      jest.fn(),
  findByIds:     jest.fn(),
  existsByName:  jest.fn(),
  create:        jest.fn(),
  save:          jest.fn(),
  remove:        jest.fn(),
};

const mockUserRoleRepo = {
  findByUserId:      jest.fn(),
  findOne_:          jest.fn(),
  existsAssignment:  jest.fn(),
  getUserPermissions: jest.fn(),
  create:            jest.fn(),
  save:              jest.fn(),
  remove:            jest.fn(),
};

// ── Test Suite ─────────────────────────────────────────────────────────────
describe('RbacService', () => {
  let service: RbacService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RbacService,
        { provide: RoleRepository,       useValue: mockRoleRepo },
        { provide: PermissionRepository, useValue: mockPermissionRepo },
        { provide: UserRoleRepository,   useValue: mockUserRoleRepo },
      ],
    }).compile();

    service = module.get<RbacService>(RbacService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ════════════════════════════════════════════════
  //  ROLES
  // ════════════════════════════════════════════════

  describe('findAllRoles', () => {
    it('should return all roles with permissions', async () => {
      mockRoleRepo.findAllWithPermissions.mockResolvedValue([mockRole]);

      const result = await service.findAllRoles();

      expect(mockRoleRepo.findAllWithPermissions).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].permissions).toHaveLength(1);
    });
  });

  describe('findRoleById', () => {
    it('should return role when found', async () => {
      mockRoleRepo.findById.mockResolvedValue(mockRole);

      const result = await service.findRoleById(1);

      expect(result).toEqual(mockRole);
    });

    it('should throw ROLE_NOT_FOUND when not found', async () => {
      mockRoleRepo.findById.mockResolvedValue(null);

      await expect(service.findRoleById(999)).rejects.toThrow(AppException);
      await expect(service.findRoleById(999)).rejects.toMatchObject({
        errorCode: 'RBAC_001',
      });
    });
  });

  describe('createRole', () => {
    const dto = { name: 'staff', description: 'Staff' };

    it('should create role successfully without permissions', async () => {
      mockRoleRepo.existsByName.mockResolvedValue(false);
      mockRoleRepo.create.mockReturnValue({ ...mockRole, name: 'staff', permissions: [] });
      mockRoleRepo.save.mockResolvedValue({ ...mockRole, name: 'staff', permissions: [] });

      const result = await service.createRole(dto);

      expect(mockRoleRepo.existsByName).toHaveBeenCalledWith('staff');
      expect(result.name).toBe('staff');
    });

    it('should create role successfully with permissions', async () => {
      const dtoWithPerms = { ...dto, permissionIds: [1, 2] };
      mockRoleRepo.existsByName.mockResolvedValue(false);
      mockPermissionRepo.findByIds.mockResolvedValue([mockPermission, mockPermission2]);
      mockRoleRepo.create.mockReturnValue({ ...mockRole, permissions: [mockPermission, mockPermission2] });
      mockRoleRepo.save.mockResolvedValue({ ...mockRole, permissions: [mockPermission, mockPermission2] });

      const result = await service.createRole(dtoWithPerms);

      expect(mockPermissionRepo.findByIds).toHaveBeenCalledWith([1, 2]);
      expect(result.permissions).toHaveLength(2);
    });

    it('should throw ROLE_ALREADY_EXISTS when name already exists', async () => {
      mockRoleRepo.existsByName.mockResolvedValue(true);

      await expect(service.createRole(dto)).rejects.toThrow(AppException);
      await expect(service.createRole(dto)).rejects.toMatchObject({
        errorCode: 'RBAC_002',
      });
    });

    it('should throw PERMISSION_NOT_FOUND when permissionId does not exist', async () => {
      mockRoleRepo.existsByName.mockResolvedValue(false);
      mockPermissionRepo.findByIds.mockResolvedValue([mockPermission]); // only 1 of 2 found

      await expect(
        service.createRole({ ...dto, permissionIds: [1, 999] }),
      ).rejects.toThrow(AppException);
    });
  });

  describe('updateRole', () => {
    it('should update role successfully', async () => {
      mockRoleRepo.findById.mockResolvedValue(mockRole);
      mockRoleRepo.save.mockResolvedValue({ ...mockRole, description: 'New description' });

      const result = await service.updateRole(1, { description: 'New description' });

      expect(result.description).toBe('New description');
    });

    it('should update role permissions', async () => {
      mockRoleRepo.findById.mockResolvedValue(mockRole);
      mockPermissionRepo.findByIds.mockResolvedValue([mockPermission2]);
      mockRoleRepo.save.mockResolvedValue({ ...mockRole, permissions: [mockPermission2] });

      const result = await service.updateRole(1, { permissionIds: [2] });

      expect(result.permissions).toHaveLength(1);
      expect(result.permissions[0].id).toBe(2);
    });

    it('should clear permissions when permissionIds = []', async () => {
      mockRoleRepo.findById.mockResolvedValue(mockRole);
      mockPermissionRepo.findByIds.mockResolvedValue([]);
      mockRoleRepo.save.mockResolvedValue({ ...mockRole, permissions: [] });

      const result = await service.updateRole(1, { permissionIds: [] });

      expect(result.permissions).toHaveLength(0);
    });

    it('should throw ROLE_ALREADY_EXISTS when renaming to existing role name', async () => {
      mockRoleRepo.findById.mockResolvedValue(mockRole);
      mockRoleRepo.existsByName.mockResolvedValue(true);

      await expect(
        service.updateRole(1, { name: 'customer' }),
      ).rejects.toThrow(AppException);
    });

    it('should throw ROLE_NOT_FOUND when role does not exist', async () => {
      mockRoleRepo.findById.mockResolvedValue(null);

      await expect(service.updateRole(999, {})).rejects.toThrow(AppException);
    });
  });

  describe('removeRole', () => {
    it('should delete role successfully', async () => {
      mockRoleRepo.findById.mockResolvedValue(mockRole);
      mockRoleRepo.remove.mockResolvedValue(undefined);

      await service.removeRole(1);

      expect(mockRoleRepo.remove).toHaveBeenCalledWith(mockRole);
    });

    it('should throw ROLE_NOT_FOUND when role does not exist', async () => {
      mockRoleRepo.findById.mockResolvedValue(null);

      await expect(service.removeRole(999)).rejects.toThrow(AppException);
    });
  });

  // ════════════════════════════════════════════════
  //  PERMISSIONS
  // ════════════════════════════════════════════════

  describe('findAllPermissions', () => {
    it('should return all permissions', async () => {
      mockPermissionRepo.find.mockResolvedValue([mockPermission, mockPermission2]);

      const result = await service.findAllPermissions();

      expect(result).toHaveLength(2);
    });
  });

  describe('findPermissionById', () => {
    it('should return permission when found', async () => {
      mockPermissionRepo.findById.mockResolvedValue(mockPermission);

      const result = await service.findPermissionById(1);

      expect(result).toEqual(mockPermission);
    });

    it('should throw PERMISSION_NOT_FOUND when not found', async () => {
      mockPermissionRepo.findById.mockResolvedValue(null);

      await expect(service.findPermissionById(999)).rejects.toThrow(AppException);
    });
  });

  describe('createPermission', () => {
    const dto = { name: 'order.read', action: 'read' as const, description: 'Read orders' };

    it('should create permission successfully', async () => {
      mockPermissionRepo.existsByName.mockResolvedValue(false);
      mockPermissionRepo.create.mockReturnValue(mockPermission);
      mockPermissionRepo.save.mockResolvedValue(mockPermission);

      const result = await service.createPermission(dto);

      expect(mockPermissionRepo.existsByName).toHaveBeenCalledWith('order.read');
      expect(result).toEqual(mockPermission);
    });

    it('should throw PERMISSION_ALREADY_EXISTS when name already exists', async () => {
      mockPermissionRepo.existsByName.mockResolvedValue(true);

      await expect(service.createPermission(dto)).rejects.toThrow(AppException);
      await expect(service.createPermission(dto)).rejects.toMatchObject({
        errorCode: 'RBAC_102',
      });
    });
  });

  describe('updatePermission', () => {
    it('should update permission successfully', async () => {
      mockPermissionRepo.findById.mockResolvedValue(mockPermission);
      mockPermissionRepo.save.mockResolvedValue({ ...mockPermission, description: 'New description' });

      const result = await service.updatePermission(1, { description: 'New description' });

      expect(result.description).toBe('New description');
    });

    it('should throw when renaming to existing permission name', async () => {
      mockPermissionRepo.findById.mockResolvedValue(mockPermission);
      mockPermissionRepo.existsByName.mockResolvedValue(true);

      await expect(
        service.updatePermission(1, { name: 'product.delete' }),
      ).rejects.toThrow(AppException);
    });
  });

  describe('removePermission', () => {
    it('should delete permission successfully', async () => {
      mockPermissionRepo.findById.mockResolvedValue(mockPermission);
      mockPermissionRepo.remove.mockResolvedValue(undefined);

      await service.removePermission(1);

      expect(mockPermissionRepo.remove).toHaveBeenCalledWith(mockPermission);
    });
  });

  // ════════════════════════════════════════════════
  //  USER ↔ ROLE
  // ════════════════════════════════════════════════

  describe('assignRoleToUser', () => {
    const dto = { userId: 1, roleId: 1 };

    it('should assign role to user successfully', async () => {
      mockRoleRepo.findById.mockResolvedValue(mockRole);
      mockUserRoleRepo.existsAssignment.mockResolvedValue(false);
      mockUserRoleRepo.create.mockReturnValue(mockUserRole);
      mockUserRoleRepo.save.mockResolvedValue(mockUserRole);

      const result = await service.assignRoleToUser(dto);

      expect(mockUserRoleRepo.existsAssignment).toHaveBeenCalledWith(1, 1);
      expect(mockUserRoleRepo.save).toHaveBeenCalled();
      expect(result).toEqual(mockUserRole);
    });

    it('should throw ROLE_NOT_FOUND when role does not exist', async () => {
      mockRoleRepo.findById.mockResolvedValue(null);

      await expect(service.assignRoleToUser(dto)).rejects.toThrow(AppException);
      await expect(service.assignRoleToUser(dto)).rejects.toMatchObject({
        errorCode: 'RBAC_001',
      });
    });

    it('should throw ROLE_ALREADY_ASSIGNED when already assigned', async () => {
      mockRoleRepo.findById.mockResolvedValue(mockRole);
      mockUserRoleRepo.existsAssignment.mockResolvedValue(true);

      await expect(service.assignRoleToUser(dto)).rejects.toThrow(AppException);
      await expect(service.assignRoleToUser(dto)).rejects.toMatchObject({
        errorCode: 'RBAC_003',
      });
    });
  });

  describe('revokeRoleFromUser', () => {
    const dto = { userId: 1, roleId: 1 };

    it('should revoke role from user successfully', async () => {
      mockUserRoleRepo.findOne_.mockResolvedValue(mockUserRole);
      mockUserRoleRepo.remove.mockResolvedValue(undefined);

      await service.revokeRoleFromUser(dto);

      expect(mockUserRoleRepo.remove).toHaveBeenCalledWith(mockUserRole);
    });

    it('should throw ROLE_NOT_ASSIGNED when user does not have this role', async () => {
      mockUserRoleRepo.findOne_.mockResolvedValue(null);

      await expect(service.revokeRoleFromUser(dto)).rejects.toThrow(AppException);
      await expect(service.revokeRoleFromUser(dto)).rejects.toMatchObject({
        errorCode: 'RBAC_004',
      });
    });
  });

  describe('getUserRoles', () => {
    it('should return roles of user', async () => {
      mockUserRoleRepo.findByUserId.mockResolvedValue([mockUserRole]);

      const result = await service.getUserRoles(1);

      expect(result).toHaveLength(1);
      expect(result[0].role.name).toBe('admin');
    });

    it('should return empty array when user has no roles', async () => {
      mockUserRoleRepo.findByUserId.mockResolvedValue([]);

      const result = await service.getUserRoles(1);

      expect(result).toHaveLength(0);
    });
  });

  describe('getUserPermissions', () => {
    it('should return permissions of user', async () => {
      mockUserRoleRepo.getUserPermissions.mockResolvedValue(['product.create', 'product.delete']);

      const result = await service.getUserPermissions(1);

      expect(result).toContain('product.create');
      expect(result).toContain('product.delete');
    });
  });

  describe('hasPermission', () => {
    it('should return true when user has permission', async () => {
      mockUserRoleRepo.getUserPermissions.mockResolvedValue(['product.create']);

      const result = await service.hasPermission(1, 'product.create');

      expect(result).toBe(true);
    });

    it('should return false when user lacks permission', async () => {
      mockUserRoleRepo.getUserPermissions.mockResolvedValue(['product.create']);

      const result = await service.hasPermission(1, 'order.delete');

      expect(result).toBe(false);
    });
  });
});