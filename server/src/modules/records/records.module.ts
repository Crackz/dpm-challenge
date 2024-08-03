import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InMemoryModule } from '../in-memory/in-memory.module';
import { RecordEntity } from './entities/record.entity';
import { RecordsController } from './records.controller';
import { RecordsRepo } from './records.repo';
import { RecordsService } from './records.service';

@Module({
  imports: [TypeOrmModule.forFeature([RecordEntity]), InMemoryModule],
  controllers: [RecordsController],
  providers: [RecordsService, RecordsRepo],
  exports: [RecordsService],
})
export class RecordsModule {}
