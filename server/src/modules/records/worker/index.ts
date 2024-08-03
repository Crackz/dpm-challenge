import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PROCESSABLE_RECORDS_CHANNEL_NAME,
  PROCESSED_RECORDS_CHANNEL_NAME,
} from '../../../common/constants';
import { EnvironmentVariables } from '../../../common/env/environment-variables';
import { InMemoryService } from '../../../modules/in-memory/in-memory.service';
import { RecordEntity } from '../entities/record.entity';
import { RecordStatus } from '../interfaces/records.interface';
import { RecordsRepo } from '../records.repo';
import dataSource from '../../../config/typeorm';
import { ProcessedRecordMessage } from '../interfaces/records-events.interface';
import { parentPort } from 'node:worker_threads';

const logger = new Logger('Records Worker');
class RecordsWorker {
  private readonly configService = new ConfigService<
    EnvironmentVariables & { typeorm: object }
  >();
  private readonly inMemoryService = new InMemoryService(this.configService);

  private readonly recordsRepo = new RecordsRepo(
    dataSource.getRepository(RecordEntity),
  );

  private async init() {
    await Promise.all([
      this.inMemoryService.onModuleInit(),
      dataSource.initialize(),
    ]);

    parentPort.postMessage('Ready');
  }

  async processRecord(recordId: string) {
    console.log(`Processing record ${recordId}`);

    const record = await this.recordsRepo.findById(recordId);
    // TODO: Read and process audio file from s3
    // TODO: Upload processed audio file to S3

    const [filePath, extension] = record.audioFilePath.split('.');
    // Assume this is the file name after being processed
    const processedAudioFilePath = `${filePath}-processed.${extension}`;
    await this.recordsRepo.findByIdAndUpdate(recordId, {
      correctedAudioFilePath: processedAudioFilePath,
      status: RecordStatus.PROCESSED,
    });

    const processedRecordMsg: ProcessedRecordMessage = {
      id: recordId,
      audioFilePath: record.audioFilePath,
      correctedAudioFilePath: processedAudioFilePath,
    };

    // Send Processed Event
    this.inMemoryService.publish(
      PROCESSED_RECORDS_CHANNEL_NAME,
      processedRecordMsg,
    );
  }

  async run() {
    await this.init();

    this.inMemoryService.subscribe(
      PROCESSABLE_RECORDS_CHANNEL_NAME,
      (message: ProcessedRecordMessage) => this.processRecord(message.id),
    );
  }

  // TODO: Handle graceful shutdown
}

const recordsWorker = new RecordsWorker();
recordsWorker
  .run()
  .then(() => logger.verbose('Records Worker is running...'))
  .catch((err) => logger.error(err));
