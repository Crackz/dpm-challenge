import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import * as express from 'express';
import { ApiErrors } from '../utils';

@Catch()
export class HttpExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionsFilter.name);

  catch(exception: Error, host: ArgumentsHost): unknown {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<express.Request>();
    const response = ctx.getResponse<express.Response>();

    let apiError: ApiErrors;

    if (exception instanceof ApiErrors) {
      apiError = exception;
    } else if (exception instanceof HttpException) {
      if (exception.getStatus() === HttpStatus.INTERNAL_SERVER_ERROR) {
        apiError = ApiErrors.InternalServerError(exception);
      } else {
        response.status(exception.getStatus()).json({
          error: {
            errors: [{ message: exception.message }],
          },
        });
        return;
      }
    } else {
      apiError = ApiErrors.InternalServerError(exception);
    }

    this.logger.debug(apiError);

    apiError.handle(request, response);
  }
}
