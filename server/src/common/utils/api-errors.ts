/* eslint-disable @typescript-eslint/naming-convention */
import { Request, Response } from 'express';
import { NodeEnvironment } from '../constants';
import {
  ApiErrorArgs,
  ApiErrorStaticFunArgs,
  ErrorMessage,
  ErrorMessages,
  ErrorResponse,
} from '../interfaces/api-errors.interface';
import { HttpStatus } from '@nestjs/common';

export class ApiErrors extends Error {
  private status: number;
  private param: string;
  private isArrayOfMessages = false;

  constructor({ errorType, message, param, isArrayOfMessages }: ApiErrorArgs) {
    super(message);
    this.param = param || '';
    this.name = errorType;
    this.status = +HttpStatus[errorType];
    this.isArrayOfMessages =
      typeof isArrayOfMessages === 'boolean' ? isArrayOfMessages : false;
  }

  static GeneralError = (args: ApiErrorStaticFunArgs): ApiErrors =>
    new ApiErrors({ errorType: 'BAD_REQUEST', ...args });
  static BadRequest = (args: ApiErrorStaticFunArgs): ApiErrors =>
    ApiErrors.GeneralError(args);
  static Unauthorized = (args?: ApiErrorStaticFunArgs): ApiErrors =>
    new ApiErrors({
      errorType: 'UNAUTHORIZED',
      message: ErrorMessages.UNAUTHORIZED,
      ...args,
    });
  static NotFound = (args?: ApiErrorStaticFunArgs): ApiErrors =>
    new ApiErrors({
      errorType: 'NOT_FOUND',
      message: ErrorMessages.NOT_FOUND,
      ...args,
    });
  static UnprocessableEntity = (
    args: ApiErrorStaticFunArgs | ApiErrorStaticFunArgs[],
  ): ApiErrors => {
    const isArray = Array.isArray(args);

    if (isArray) {
      const messages = [],
        params = [];
      for (const arg of args) {
        messages.push(arg.message);
        params.push(arg.param);
      }

      return new ApiErrors({
        errorType: 'UNPROCESSABLE_ENTITY',
        isArrayOfMessages: true,
        message: JSON.stringify(messages),
        param: JSON.stringify(params),
      });
    }
    return new ApiErrors({ errorType: 'UNPROCESSABLE_ENTITY', ...args });
  };
  static Conflict = (args: ApiErrorStaticFunArgs): ApiErrors =>
    new ApiErrors({ errorType: 'CONFLICT', ...args });
  static Forbidden = (message?: string): ApiErrors =>
    new ApiErrors({
      errorType: 'FORBIDDEN',
      message: message || ErrorMessages.FORBIDDEN,
    });
  static InternalServerError = (error: Error): ApiErrors => {
    return new ApiErrors({
      errorType: 'INTERNAL_SERVER_ERROR',
      message:
        process.env.NODE_ENV === NodeEnvironment.PRODUCTION
          ? ErrorMessages.INTERNAL_SERVER
          : error.message,
    });
  };

  private getErrorMsg(
    statusCode: number,
    message: string,
    param?: string,
  ): ErrorMessage {
    const shouldParseMessage = statusCode === HttpStatus.UNPROCESSABLE_ENTITY;
    const errorMsg: ErrorMessage = { message };
    if (shouldParseMessage) {
      errorMsg.message = JSON.parse(message);
    }

    if (param) {
      errorMsg.param = param;
    }

    return errorMsg;
  }

  handle(_: Request, res: Response): void {
    const errors: ErrorMessage[] = [];
    if (this.isArrayOfMessages) {
      const messages = JSON.parse(this.message);
      const params = JSON.parse(this.param);

      messages.forEach((message: string, idx: number) => {
        errors.push(this.getErrorMsg(this.status, message, params[idx]));
      });
    } else {
      errors.push(this.getErrorMsg(this.status, this.message, this.param));
    }

    const errResponse: ErrorResponse = {
      error: {
        errors,
      },
    };

    res.status(this.status || 500).json(errResponse);
  }
}
