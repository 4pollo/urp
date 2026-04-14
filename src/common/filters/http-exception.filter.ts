import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 5000;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = (exceptionResponse as any).message || message;
      }

      // 映射 HTTP 状态码到自定义错误码
      switch (status) {
        case HttpStatus.UNAUTHORIZED:
          code = 4001;
          break;
        case HttpStatus.CONFLICT:
          code = 4002;
          break;
        case HttpStatus.BAD_REQUEST:
          code = 4003;
          break;
        case HttpStatus.NOT_FOUND:
          code = 4004;
          break;
        case HttpStatus.FORBIDDEN:
          code = 4006;
          break;
        default:
          code = status >= 500 ? 5000 : 4000;
      }
    }

    response.status(status).json({
      code,
      message,
      data: null,
    });
  }
}
