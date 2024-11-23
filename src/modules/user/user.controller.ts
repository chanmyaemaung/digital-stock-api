import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@shared/guards/roles.guard';
import { CustomThrottlerGuard } from '@shared/guards/throttle.guard';
import { Roles } from '@shared/decorators/roles.decorator';
import { Role } from '@app/core/domain/enums/role.enum';
import { User } from '@app/core/domain/entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard, CustomThrottlerGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async update(@Param('id') id: string, @Body() updateData: Partial<User>) {
    return this.userService.update(id, updateData);
  }
}
