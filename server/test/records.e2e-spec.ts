import { HttpStatus, INestApplication, ShutdownSignal } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { EnvironmentVariables } from 'src/common/env/environment-variables';
import { HttpExceptionsFilter } from 'src/common/filters/http-exceptions.filter';
import { DefaultValidationPipe } from 'src/common/pipes/default-validation.pipe';
import { ProcessedRecordMessage } from 'src/modules/records/interfaces/records-events.interface';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { CreateRecordDto } from '../src/modules/records/dtos/create-record.dto';
import { RecordStatus } from '../src/modules/records/interfaces/records.interface';
import { RecordsRepo } from '../src/modules/records/records.repo';
import { TestUtils } from './shared/test-utils';
import * as EventSource from 'eventsource';

describe('RecordsController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let recordsRepo: RecordsRepo;
  let configService: ConfigService<EnvironmentVariables>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.enableCors();
    app.setGlobalPrefix('v1');
    app.useGlobalPipes(new DefaultValidationPipe());
    app.useGlobalFilters(new HttpExceptionsFilter());
    app.enableShutdownHooks([ShutdownSignal.SIGTERM, ShutdownSignal.SIGINT]);

    dataSource = app.get<DataSource>(getDataSourceToken());
    recordsRepo = app.get<RecordsRepo>(RecordsRepo);

    configService = app.get<ConfigService<EnvironmentVariables>>(ConfigService);

    await app.listen(configService.get('SERVER_PORT'));
  });

  afterEach(async () => {
    await TestUtils.clearAllDbTables(dataSource);
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/records (POST)', () => {
    it('should return 422 for invalid email', async () => {
      const invalidDto = {
        email: 'invalid-email',
        audioFilePath: 'test.mp3',
      };
      await request(app.getHttpServer())
        .post('/v1/records')
        .send(invalidDto)
        .expect(HttpStatus.UNPROCESSABLE_ENTITY);
    });

    // TODO: Add more invalid test cases

    it('should create a new record', async () => {
      const createRecordDto: CreateRecordDto = {
        email: 'test@example.com',
        audioFilePath: 'audio.mp3',
      };
      await request(app.getHttpServer())
        .post('/v1/records')
        .send(createRecordDto)
        .expect(HttpStatus.ACCEPTED);

      const createdRecord = await recordsRepo.findOne({
        audioFilePath: createRecordDto.audioFilePath,
      });

      expect(createdRecord).toBeDefined();
      expect(createdRecord.email).toBe(createRecordDto.email);
      expect(createdRecord.audioFilePath).toBe(createRecordDto.audioFilePath);
    });

    // TODO: Add tests cases for record status

    it('should notify the consumer when file is processed', async () => {
      const createRecordDto: CreateRecordDto = {
        email: 'test@example.com',
        audioFilePath: 'audio.mp3',
      };

      const eventSource = new EventSource(
        `http://localhost:${configService.get('SERVER_PORT')}/v1/records/events?recordFilePath=${createRecordDto.audioFilePath}`,
      );
      const onMessagePromise = new Promise<ProcessedRecordMessage>(
        (resolve) => {
          eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            resolve(data);
          };
        },
      );

      await request(app.getHttpServer())
        .post('/v1/records')
        .send(createRecordDto)
        .expect(HttpStatus.ACCEPTED);

      const message = await onMessagePromise;
      expect(message.id).toBeDefined();
      expect(message.audioFilePath).toBe(createRecordDto.audioFilePath);
      expect(message.correctedAudioFilePath).toBe('audio-processed.mp3');

      eventSource.close();
    });
  });
});
