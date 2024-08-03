import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
  UpdateResult,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { BaseEntity } from '../entities/base.entity';
import { DeepWritable } from '../types/writable';

export abstract class BaseRepo<T extends BaseEntity> {
  constructor(private readonly _repo: Repository<T>) {}

  async find(
    query?: FindManyOptions<T>['where'],
    opts = {} as { order?: FindManyOptions<T>['order'] },
  ): Promise<T[]> {
    return await this._repo.find({ where: query, ...opts });
  }

  async findOne(
    query?: FindOneOptions<T>['where'],
    opts = {} as { order?: FindManyOptions<T>['order'] },
  ): Promise<T | null> {
    return await this._repo.findOne({ where: query, ...opts });
  }

  async findById<TId extends string | number = string>(
    id: string,
  ): Promise<T | null> {
    return await this._repo.findOne({
      where: { id } as FindOptionsWhere<T & { id: TId }>,
    });
  }

  async findByIdAndUpdate<TId extends string | number = string>(
    id: TId,
    updatedData: QueryDeepPartialEntity<T>,
  ): Promise<UpdateResult> {
    return await this._repo.update(id, updatedData);
  }

  async create(data: DeepWritable<T>): Promise<T> {
    return await this._repo.save(data as DeepPartial<T>);
  }

  async deleteById<TId extends string | number = string>(id: TId) {
    await this._repo.delete({ id } as FindOptionsWhere<T & { id: TId }>);
  }

  async count(): Promise<number> {
    return await this._repo.count();
  }
}
