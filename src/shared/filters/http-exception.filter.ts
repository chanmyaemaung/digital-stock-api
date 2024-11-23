import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiException } from '../exceptions/api.exception';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const path = ctx.getRequest().url;

    let errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: path,
      message: 'An error occurred',
      error: 'Internal Server Error',
    };

    if (exception instanceof ApiException) {
      const error = exception.getResponse() as any;
      errorResponse = {
        ...errorResponse,
        message: error.message || exception.message,
        error: error.error || 'API Error',
      };
    } else {
      const error = exception.getResponse() as any;
      errorResponse = {
        ...errorResponse,
        message:
          typeof error === 'string'
            ? error
            : error.message || exception.message,
        error: error.error || exception.name,
      };
    }

    // Log the error
    this.logger.error(
      `Error processing request: ${path}`,
      JSON.stringify(errorResponse),
    );

    response.status(status).json(errorResponse);
  }
}
