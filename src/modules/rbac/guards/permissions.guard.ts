import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RbacService } from '../rbac.service';
import { PERMISSIONS_KEY } from 'src/common/decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rbacService: RbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions?.length) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException('You are not logged in');

    if (user.role === 'admin') return true;

    const userPermissions = await this.rbacService.getUserPermissions(user.id);

    const hasAll = requiredPermissions.every((p) => userPermissions.includes(p));
    if (!hasAll) {
      throw new ForbiddenException('You do not have permission to perform this action');
    }

    return true;
  }
}