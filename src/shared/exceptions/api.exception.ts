import { HttpException, HttpStatus } from '@nestjs/common';

export class ApiException extends HttpException {
  constructor(
    message: string,
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
    error?: string,
  ) {
    super(
      {
        statusCode,
        error: error || 'API Error',
        message,
      },
      statusCode,
    );
  }
}
