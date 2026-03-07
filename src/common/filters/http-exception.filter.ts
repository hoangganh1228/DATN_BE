import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorCode } from '../constants/error-code.constant';


@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx      = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request  = ctx.getRequest<Request>();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string   = ErrorCode.INTERNAL_SERVER_ERROR.message;
    let errorCode: string = ErrorCode.INTERNAL_SERVER_ERROR.code;
    let errors: string[] | undefined;

    if (exception instanceof HttpException) {
      const body = exception.getResponse();

      if (typeof body === 'object' && body !== null) {
        const b = body as Record<string, any>;
        message   = b.message   ?? message;
        errorCode = b.errorCode ?? errorCode;

        if (Array.isArray(b.message)) {
          errors    = b.message;
          message   = ErrorCode.VALIDATION_ERROR.message;
          errorCode = ErrorCode.VALIDATION_ERROR.code;
        }
      } else if (typeof body === 'string') {
        message = body;
      }
    }

    if (status >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} → ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json({
      success:   false,
      data:      null,
      message,
      errorCode,
      ...(errors && { errors }),
      timestamp: new Date().toISOString(),
      path:      request.url,
    });
  }
  
}
