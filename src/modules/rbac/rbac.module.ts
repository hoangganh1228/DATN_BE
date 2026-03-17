import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RbacService } from './rbac.service';
import { RolesController, PermissionsController, UserRolesController } from './rbac.controller';
import { RoleRepository } from './repositories/role.repository';
import { PermissionRepository } from './repositories/permission.repository';
import { UserRoleRepository } from './repositories/user-role.repository';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { UserRole } from './entities/user-role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission, UserRole])],
  controllers: [RolesController, PermissionsController, UserRolesController],
  providers: [
    RbacService,
    RoleRepository,
    PermissionRepository,
    UserRoleRepository,
  ],
  exports: [RbacService, UserRoleRepository],
})
export class RbacModule {}