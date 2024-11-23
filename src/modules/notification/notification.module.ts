import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Notification } from '@app/core/domain/entities/notification.entity';
import { NotificationRepository } from '@app/infrastructure/persistence/repositories/notification.repository';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationGateway } from './notification.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    EventEmitterModule.forRoot(),
  ],
  providers: [
    {
      provide: 'INotificationRepository',
      useClass: NotificationRepository,
    },
    NotificationService,
    NotificationGateway,
  ],
  controllers: [NotificationController],
  exports: [NotificationService],
})
export class NotificationModule {}
