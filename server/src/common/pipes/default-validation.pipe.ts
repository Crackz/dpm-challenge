import {
  ValidationError,
  ValidationPipe,
  ValidationPipeOptions,
} from '@nestjs/common';
import { ApiErrors } from '../utils/api-errors';

interface TransformedError {
  param: string;
  message: string;
}
export class DefaultValidationPipe extends ValidationPipe {
  constructor(overwriteDefaultOptions: ValidationPipeOptions = {}) {
    super({
      transform: true,
      forbidUnknownValues: true,
      whitelist: true,
      validationError: { target: false },
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (errors: ValidationError[]) => {
        const transformedErrs = this.transformErrors(errors);
        return ApiErrors.UnprocessableEntity(transformedErrs);
      },
      ...overwriteDefaultOptions,
    });
  }

  private transformErrors(
    errors: ValidationError[],
    parentProperty = '',
  ): TransformedError[] {
    const transformedErrs: TransformedError[] = [];

    for (const error of errors) {
      const property = parentProperty
        ? `${parentProperty}.${error.property}`
        : error.property;
      if (error.constraints) {
        transformedErrs.push({
          message: JSON.stringify(error.constraints),
          param: property,
        });
      }

      if (error.children && error.children.length > 0) {
        this.transformErrors(error.children, property);
      }
    }

    return transformedErrs;
  }
}
