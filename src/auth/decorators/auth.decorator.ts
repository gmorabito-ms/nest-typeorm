
import { applyDecorators, UseGuards } from '@nestjs/common';
import { ValidRoles } from '../interfaces/valid-roles';
import { RoleProtectd } from './role-protected.decorator';
import { AuthGuard } from '@nestjs/passport';
import { UserRoleGuard } from '../guards/user-role.guard';
// https://docs.nestjs.com/custom-decorators#decorator-composition
export function Auth(...roles: ValidRoles[]) {
  return applyDecorators(
    RoleProtectd(...roles),
    UseGuards(AuthGuard(), UserRoleGuard)
  );
}
