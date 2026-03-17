import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RolesGuard } from '../guards/roles.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { RbacService } from '../rbac.service';

// ── Helper to create mock ExecutionContext ─────────────────────────────────
function createMockContext(user: any): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
    getHandler: () => ({}),
    getClass:   () => ({}),
  } as unknown as ExecutionContext;
}

// ── Mock RbacService ───────────────────────────────────────────────────────
const mockRbacService = {
  getUserPermissions: jest.fn(),
};

// ════════════════════════════════════════════════
//  RolesGuard
// ════════════════════════════════════════════════
describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard     = new RolesGuard(reflector);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow when route has no @Roles()', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const ctx = createMockContext({ role: 'customer' });

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should allow when user has the required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
    const ctx = createMockContext({ role: 'admin' });

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should allow when user has one of the required roles', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin', 'staff']);
    const ctx = createMockContext({ role: 'staff' });

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should throw ForbiddenException when user lacks required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
    const ctx = createMockContext({ role: 'customer' });

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException when user is null', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
    const ctx = createMockContext(null);

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});

// ════════════════════════════════════════════════
//  PermissionsGuard
// ════════════════════════════════════════════════
describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard     = new PermissionsGuard(reflector, mockRbacService as unknown as RbacService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow when route has no @RequirePermissions()', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const ctx = createMockContext({ id: 1, role: 'customer' });

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it('should bypass permission check for admin', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['product.delete']);
    const ctx = createMockContext({ id: 1, role: 'admin' });

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(mockRbacService.getUserPermissions).not.toHaveBeenCalled();
  });

  it('should allow when user has required permissions', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['product.create']);
    mockRbacService.getUserPermissions.mockResolvedValue(['product.create', 'product.read']);
    const ctx = createMockContext({ id: 1, role: 'staff' });

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it('should allow when user has all required permissions', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['product.create', 'product.read']);
    mockRbacService.getUserPermissions.mockResolvedValue(['product.create', 'product.read', 'order.read']);
    const ctx = createMockContext({ id: 1, role: 'staff' });

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it('should throw ForbiddenException when user is missing a permission', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['product.delete']);
    mockRbacService.getUserPermissions.mockResolvedValue(['product.read']);
    const ctx = createMockContext({ id: 1, role: 'staff' });

    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException when user has no permissions', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['product.create']);
    mockRbacService.getUserPermissions.mockResolvedValue([]);
    const ctx = createMockContext({ id: 1, role: 'customer' });

    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException when user is null', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['product.create']);
    const ctx = createMockContext(null);

    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });
});