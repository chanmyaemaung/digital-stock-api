import { IsEnum } from 'class-validator';
import { Role } from '@app/core/domain/enums/role.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserRoleDto {
  @ApiProperty({
    enum: Role,
    description: 'The new role to assign to the user',
    example: Role.ADMIN,
  })
  @IsEnum(Role)
  role: Role;
}
