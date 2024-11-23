import { HttpException } from '@nestjs/common';

interface ApiExceptionResponse {
  status: number;
  message: string;
  error: string;
}

export class ApiException extends HttpException {
  constructor(response: ApiExceptionResponse) {
    super(response, response.status);
  }
}
