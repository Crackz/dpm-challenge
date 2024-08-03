import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  MessageEvent,
  Post,
  Query,
  Res,
  Sse,
} from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { CreateRecordDto } from './dtos/create-record.dto';
import { ListenRecordDto } from './dtos/listen-record.dto';
import { RecordsService } from './records.service';
import { OpenApi } from 'src/common/utils';

@ApiTags('Records')
@Controller('records')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @ApiAcceptedResponse(OpenApi.getApiAcceptedResponseErrorOpts())
  @ApiUnprocessableEntityResponse(OpenApi.getApiUnprocessableEntityErrorOpts())
  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  async create(@Body() createRecordDto: CreateRecordDto) {
    await this.recordsService.create(createRecordDto);
  }

  @Sse('events')
  listenRecord(
    @Query() query: ListenRecordDto,
    @Res() response: Response,
  ): Observable<MessageEvent> {
    response.on('close', () => {
      this.recordsService.unlistenRecord(query.recordFilePath);
    });
    return this.recordsService
      .listenRecord(query.recordFilePath)
      .asObservable();
  }
}
