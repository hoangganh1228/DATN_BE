import { Test, TestingModule } from '@nestjs/testing';
import {
  RolesController,
  PermissionsController,
  UserRolesController,
} from './rbac.controller';
import { RbacService } from './rbac.service';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';

const mockPermission: Partial<Permission> = {
  id:     1,
  name:   'product.create',
  action: 'create',
};

const mockRole: Partial<Role> = {
  id:          1,
  name:        'admin',
  description: 'Administrator',
  permissions: [mockPermission as Permission],
};

const mockUserRole = {
  userId: 1,
  roleId: 1,
  role:   mockRole,
};

const mockRbacService = {
  // Roles
  findAllRoles:        jest.fn(),
  findRoleById:        jest.fn(),
  createRole:          jest.fn(),
  updateRole:          jest.fn(),
  removeRole:          jest.fn(),
  // Permissions
  findAllPermissions:  jest.fn(),
  findPermissionById:  jest.fn(),
  createPermission:    jest.fn(),
  updatePermission:    jest.fn(),
  removePermission:    jest.fn(),
  // User ↔ Role
  getUserRoles:        jest.fn(),
  getUserPermissions:  jest.fn(),
  assignRoleToUser:    jest.fn(),
  revokeRoleFromUser:  jest.fn(),
};

// ── Test Suite ─────────────────────────────────────────────────────────────
describe('RolesController', () => {
  let controller: RolesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [{ provide: RbacService, useValue: mockRbacService }],
    }).compile();

    controller = module.get<RolesController>(RolesController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll — should call service.findAllRoles', async () => {
    mockRbacService.findAllRoles.mockResolvedValue([mockRole]);
    const result = await controller.findAll();
    expect(mockRbacService.findAllRoles).toHaveBeenCalled();
    expect(result).toHaveLength(1);
  });

  it('findOne — should call service.findRoleById with correct id', async () => {
    mockRbacService.findRoleById.mockResolvedValue(mockRole);
    const result = await controller.findOne(1);
    expect(mockRbacService.findRoleById).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockRole);
  });

  it('create — should call service.createRole with correct dto', async () => {
    const dto = { name: 'staff', description: 'Staff' };
    mockRbacService.createRole.mockResolvedValue({ ...mockRole, ...dto });
    const result = await controller.create(dto);
    expect(mockRbacService.createRole).toHaveBeenCalledWith(dto);
    expect(result.name).toBe('staff');
  });

  it('update — should call service.updateRole with correct id and dto', async () => {
    const dto = { description: 'New description' };
    mockRbacService.updateRole.mockResolvedValue({ ...mockRole, ...dto });
    const result = await controller.update(1, dto);
    expect(mockRbacService.updateRole).toHaveBeenCalledWith(1, dto);
    expect(result.description).toBe('New description');
  });

  it('remove — should call service.removeRole with correct id', async () => {
    mockRbacService.removeRole.mockResolvedValue(undefined);
    await controller.remove(1);
    expect(mockRbacService.removeRole).toHaveBeenCalledWith(1);
  });
});

describe('PermissionsController', () => {
  let controller: PermissionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionsController],
      providers: [{ provide: RbacService, useValue: mockRbacService }],
    }).compile();

    controller = module.get<PermissionsController>(PermissionsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll — should call service.findAllPermissions', async () => {
    mockRbacService.findAllPermissions.mockResolvedValue([mockPermission]);
    const result = await controller.findAll();
    expect(mockRbacService.findAllPermissions).toHaveBeenCalled();
    expect(result).toHaveLength(1);
  });

  it('findOne — should call service.findPermissionById with correct id', async () => {
    mockRbacService.findPermissionById.mockResolvedValue(mockPermission);
    const result = await controller.findOne(1);
    expect(mockRbacService.findPermissionById).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockPermission);
  });

  it('create — should call service.createPermission with correct dto', async () => {
    const dto = { name: 'order.read', action: 'read' as const };
    mockRbacService.createPermission.mockResolvedValue({ ...mockPermission, ...dto });
    const result = await controller.create(dto);
    expect(mockRbacService.createPermission).toHaveBeenCalledWith(dto);
  });

  it('update — should call service.updatePermission with correct id and dto', async () => {
    const dto = { description: 'New description' };
    mockRbacService.updatePermission.mockResolvedValue({ ...mockPermission, ...dto });
    const result = await controller.update(1, dto);
    expect(mockRbacService.updatePermission).toHaveBeenCalledWith(1, dto);
  });

  it('remove — should call service.removePermission with correct id', async () => {
    mockRbacService.removePermission.mockResolvedValue(undefined);
    await controller.remove(1);
    expect(mockRbacService.removePermission).toHaveBeenCalledWith(1);
  });
});

describe('UserRolesController', () => {
  let controller: UserRolesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserRolesController],
      providers: [{ provide: RbacService, useValue: mockRbacService }],
    }).compile();

    controller = module.get<UserRolesController>(UserRolesController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getUserRoles — should call service.getUserRoles with correct userId', async () => {
    mockRbacService.getUserRoles.mockResolvedValue([mockUserRole]);
    const result = await controller.getUserRoles(1);
    expect(mockRbacService.getUserRoles).toHaveBeenCalledWith(1);
    expect(result).toHaveLength(1);
  });

  it('getUserPermissions — should call service.getUserPermissions with correct userId', async () => {
    mockRbacService.getUserPermissions.mockResolvedValue(['product.create']);
    const result = await controller.getUserPermissions(1);
    expect(mockRbacService.getUserPermissions).toHaveBeenCalledWith(1);
    expect(result).toContain('product.create');
  });

  it('assign — should call service.assignRoleToUser with correct dto', async () => {
    const dto = { userId: 1, roleId: 1 };
    mockRbacService.assignRoleToUser.mockResolvedValue(mockUserRole);
    const result = await controller.assign(dto);
    expect(mockRbacService.assignRoleToUser).toHaveBeenCalledWith(dto);
    expect(result).toEqual(mockUserRole);
  });

  it('revoke — should call service.revokeRoleFromUser with correct dto', async () => {
    const dto = { userId: 1, roleId: 1 };
    mockRbacService.revokeRoleFromUser.mockResolvedValue(undefined);
    await controller.revoke(dto);
    expect(mockRbacService.revokeRoleFromUser).toHaveBeenCalledWith(dto);
  });
});