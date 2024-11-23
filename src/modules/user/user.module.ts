import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@app/core/domain/entities/user.entity';
import { UserRepository } from '@app/infrastructure/persistence/repositories/user.repository';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
    UserService,
  ],
  controllers: [UserController],
  exports: ['IUserRepository', UserService, TypeOrmModule],
})
export class UserModule {}
