import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { COMMON_ERROR_MESSAGES } from '../errors/common-error.messages';
import { ApiResponse } from '../response/api-response.type';

type ExceptionBody = {
  message?: string | string[];
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      code: status,
      message: this.getMessage(exception),
      data: null,
    } satisfies ApiResponse<null>);
  }

  private getMessage(exception: unknown) {
    if (!(exception instanceof HttpException)) {
      return COMMON_ERROR_MESSAGES.SERVER_ERROR;
    }

    const body = exception.getResponse();
    if (typeof body === 'string') {
      return body;
    }

    const message = (body as ExceptionBody).message;
    if (Array.isArray(message)) {
      return message.join('，');
    }

    return message ?? exception.message;
  }
}
