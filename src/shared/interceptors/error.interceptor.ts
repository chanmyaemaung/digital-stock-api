import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BusinessException } from '../exceptions/business.exception';
import { ValidationException } from '../exceptions/validation.exception';
import { ApiException } from '../exceptions/api.exception';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ErrorInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        // Log the error
        this.logger.error(
          `Error in ${context.getClass().name}:`,
          error.stack || error,
        );

        // Transform known errors
        if (error instanceof BusinessException) {
          return throwError(() => error);
        }

        if (error instanceof ValidationException) {
          return throwError(() => error);
        }

        if (error.code === '23505') {
          // PostgreSQL unique violation
          return throwError(
            () =>
              new ApiException(
                'Duplicate entry found',
                409,
                'Database Constraint Violation',
              ),
          );
        }

        // Default error transformation
        return throwError(
          () =>
            new ApiException(
              'An unexpected error occurred',
              500,
              'Internal Server Error',
            ),
        );
      }),
    );
  }
}
