import { HttpStatus } from '@nestjs/common';
import { BaseEntity } from '../entities/base.entity';
import {
  ApiErrorStaticFunArgs,
  ErrorMessages,
} from '../interfaces/api-errors.interface';
import { BaseRepo } from '../repos/base.repo';
import { ApiErrors } from '../utils';
import * as validator from 'class-validator';

export type CheckExistsOpts = {
  param?: string;
  statusCode?: HttpStatus.NOT_FOUND | HttpStatus.BAD_REQUEST;
  message?: string;
};

export abstract class BaseService<TEntity extends BaseEntity> {
  constructor(protected repo: BaseRepo<TEntity>) {}

  private getApiErrors(optsOrParam?: CheckExistsOpts | string): ApiErrors {
    const opts = this.handleOptsOrParam(optsOrParam);
    const errOpts: ApiErrorStaticFunArgs = {
      message: opts?.message || ErrorMessages.NOT_FOUND,
      param: opts?.param,
    };

    return opts?.statusCode === HttpStatus.NOT_FOUND
      ? ApiErrors.NotFound(errOpts)
      : ApiErrors.BadRequest(errOpts);
  }

  private handleOptsOrParam(
    optsOrParam?: CheckExistsOpts | string,
  ): CheckExistsOpts | undefined {
    if (typeof optsOrParam === 'string') {
      return { param: optsOrParam };
    }

    return optsOrParam;
  }

  async checkExist(
    id: string,
    optsOrParam?: CheckExistsOpts | string,
  ): Promise<TEntity> {
    const apiError = this.getApiErrors(optsOrParam);

    const isValidId = validator.isUUID(id, '4');
    if (!isValidId) {
      throw apiError;
    }

    const foundModel = await this.repo.findById(id);
    if (!foundModel) {
      throw apiError;
    }

    return foundModel;
  }
}
