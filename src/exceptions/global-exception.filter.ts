import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from '../common/bases/api-response';
import { ExceptionHandler } from 'src/common/helpers/exception-handler';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const method = request.method;
    const url = request.url;

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: string[] = [];
    let errorCode: string | undefined;

    if (exception instanceof HttpException) {
      const res = exception.getResponse();

      statusCode = exception.getStatus();

      if (typeof res === 'string') {
        message = res;
        errors = [res];
      } else if (typeof res === 'object' && res !== null && 'message' in res) {
        const responseObj = res as {
          message?: string | string[];
          errorCode?: string;
        };

        if (Array.isArray(responseObj.message)) {
          message = 'Validation failed';
          errors = responseObj.message.map((e) => String(e));
        } else if (typeof responseObj.message === 'string') {
          message = responseObj.message;
          errors = [responseObj.message];
        }

        if (responseObj.errorCode) {
          errorCode = responseObj.errorCode;
        }
      }
      ExceptionHandler.handleHttp(
        statusCode,
        message,
        method,
        url,
        this.logger,
      );
    } else if (exception instanceof Error) {
      message = exception.message;
      errors = [exception.message];
      ExceptionHandler.handleSystem(exception, this.logger, `${method} ${url}`);
    }

    const errorResponse = ApiResponse.error(
      message,
      statusCode,
      errors,
      request.url,
      errorCode,
    );

    response.status(statusCode).json(errorResponse);
  }
}
