import {
  Injectable,
  Logger,
  MessageEvent,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import * as path from 'path';
import { Subject } from 'rxjs';
import {
  PROCESSABLE_RECORDS_CHANNEL_NAME,
  PROCESSED_RECORDS_CHANNEL_NAME,
} from '../../common/constants';
import { InMemoryService } from '../in-memory/in-memory.service';
import { CreateRecordDto } from './dtos/create-record.dto';
import {
  ProcessableRecordMessage,
  ProcessedRecordMessage,
} from './interfaces/records-events.interface';
import { RecordStatus } from './interfaces/records.interface';
import { RecordsRepo } from './records.repo';
import { WorkerUtils } from 'src/common/utils/worker';
import { Worker } from 'worker_threads';

@Injectable()
export class RecordsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RecordsService.name);
  private readonly recordFilePathToSubject: Record<
    string,
    Subject<MessageEvent>
  > = {};
  private worker: Worker;

  constructor(
    private readonly recordsRepo: RecordsRepo,
    private readonly inMemoryService: InMemoryService,
  ) {}

  private handleProcessedRecordMessage(message: ProcessedRecordMessage) {
    const listener = this.recordFilePathToSubject[message.audioFilePath];
    if (!listener) {
      return;
    }

    listener.next({
      data: message,
    });
  }

  async onModuleInit() {
    const workerFilePath = path.join(__dirname, './worker');
    this.worker = await WorkerUtils.init(workerFilePath);

    this.inMemoryService.subscribe(
      PROCESSED_RECORDS_CHANNEL_NAME,
      async (message: ProcessedRecordMessage) =>
        this.handleProcessedRecordMessage(message),
    );
  }

  async create(createRecordDto: CreateRecordDto): Promise<void> {
    const createdRecord = await this.recordsRepo.create({
      ...createRecordDto,
      status: RecordStatus.PROCESSABLE,
    });

    const processableRecordMsg: ProcessableRecordMessage = {
      id: createdRecord.id,
    };
    // Use redis pub / sub to notify the worker to process the record
    this.inMemoryService.publish(
      PROCESSABLE_RECORDS_CHANNEL_NAME,
      processableRecordMsg,
    );
  }

  listenRecord(recordFilePath: string): Subject<MessageEvent> {
    if (this.recordFilePathToSubject[recordFilePath]) {
      return;
    }

    this.recordFilePathToSubject[recordFilePath] = new Subject();
    return this.recordFilePathToSubject[recordFilePath];
  }

  unlistenRecord(recordFilePath: string): void {
    if (!this.recordFilePathToSubject[recordFilePath]) {
      return;
    }

    this.recordFilePathToSubject[recordFilePath].complete();
    delete this.recordFilePathToSubject[recordFilePath];
  }

  async onModuleDestroy() {
    await this.worker?.terminate();
  }
}
