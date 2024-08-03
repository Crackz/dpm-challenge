import { HttpStatus } from '@nestjs/common';

export type ApiErrorArgs = {
  errorType: keyof typeof HttpStatus;
  message?: string;
  param?: string;
  isArrayOfMessages?: boolean;
};

export type ApiErrorStaticFunArgs = Omit<ApiErrorArgs, 'errorType'>;

export enum ErrorMessages {
  NOT_FOUND = 'Not Found',
  FORBIDDEN = 'You are not allowed to access this resource',
  INTERNAL_SERVER = 'Internal Server Error',
  UNAUTHORIZED = 'UNAUTHORIZED',
}

export type ErrorMessage = {
  message: string | Record<string, string>;
  param?: string;
};

export type ErrorResponse = {
  error: {
    errors: ErrorMessage[];
  };
};
