import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiException } from '../exceptions/api.exception';
import { BusinessException } from '../exceptions/business.exception';
import { ValidationException } from '../exceptions/validation.exception';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        console.error('Error caught by interceptor:', error);

        if (error instanceof UnauthorizedException) {
          return throwError(
            () =>
              new ApiException({
                status: error.getStatus(),
                message: 'Invalid email/phone or password',
                error: 'Authentication failed',
              }),
          );
        }

        if (error instanceof BadRequestException) {
          const response = error.getResponse() as any;
          if (typeof response === 'object' && 'message' in response) {
            const message = Array.isArray(response.message)
              ? response.message
              : [response.message].filter(
                  (m): m is string => typeof m === 'string',
                );

            return throwError(
              () =>
                new ValidationException({
                  status: error.getStatus(),
                  message,
                  error: 'Validation failed',
                }),
            );
          }
        }

        if (error instanceof BusinessException) {
          return throwError(
            () =>
              new ApiException({
                status: error.getStatus(),
                message: error.message,
                error: error.name,
              }),
          );
        }

        if (error instanceof HttpException) {
          return throwError(
            () =>
              new ApiException({
                status: error.getStatus(),
                message: error.message,
                error: error.name,
              }),
          );
        }

        return throwError(
          () =>
            new ApiException({
              status: 500,
              message: 'An unexpected error occurred',
              error: 'Internal Server Error',
            }),
        );
      }),
    );
  }
}
