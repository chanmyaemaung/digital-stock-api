import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
  constructor(message: string) {
    super(
      {
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        error: 'Business Rule Violation',
        message,
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}
