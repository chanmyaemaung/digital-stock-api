import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';
import { HttpExceptionFilter } from '@shared/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn'],
  });

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Security
  app.use(helmet());
  app.disable('x-powered-by');

  // Validation
  app.useGlobalPipes(new ValidationPipe());

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Digital Stock API')
    .setDescription(
      `
      API documentation for Digital Stock subscription management system.
      
      ## Features
      - User Authentication & Authorization
      - Subscription Management
      - Wallet System
      - Real-time Notifications
      - Rate Limiting
      
      ## Authentication
      All protected endpoints require a Bearer token.
      Get your token by logging in through /auth/login.
    `,
    )
    .setVersion('1.0')
    .addTag('Authentication', 'User authentication endpoints')
    .addTag('Subscriptions', 'Subscription management endpoints')
    .addTag('Wallet', 'Wallet management endpoints')
    .addTag('Notifications', 'Real-time notification endpoints')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
