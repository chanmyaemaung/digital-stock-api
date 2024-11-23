import { HttpException, HttpStatus } from '@nestjs/common';

export class ValidationException extends HttpException {
  constructor(errors: Record<string, any>) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Validation Error',
        details: errors,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
