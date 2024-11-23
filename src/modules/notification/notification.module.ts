import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './notification.gateway';
import { Notification } from '@app/core/domain/entities/notification.entity';
import { NotificationRepository } from '@app/infrastructure/persistence/repositories/notification.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    EventEmitterModule.forRoot({
      // Set this to false since we already have it in app.module
      global: false,
    }),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationGateway,
    {
      provide: 'INotificationRepository',
      useClass: NotificationRepository,
    },
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
