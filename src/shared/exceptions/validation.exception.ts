import { HttpException, HttpStatus } from '@nestjs/common';

interface ValidationExceptionResponse {
  status: number;
  message: string | string[];
  error: string;
}

export class ValidationException extends HttpException {
  constructor(response: ValidationExceptionResponse) {
    super(response, response.status || HttpStatus.BAD_REQUEST);
  }
}
