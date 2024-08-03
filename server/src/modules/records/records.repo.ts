import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepo } from '../../common/repos/base.repo';
import { Repository } from 'typeorm';
import { RecordEntity } from './entities/record.entity';

@Injectable()
export class RecordsRepo extends BaseRepo<RecordEntity> {
  constructor(
    @InjectRepository(RecordEntity) private repo: Repository<RecordEntity>,
  ) {
    super(repo);
  }
}
