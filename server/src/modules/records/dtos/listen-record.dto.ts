import { IsDefined, IsString } from 'class-validator';
import { IsNotBlank } from '../../../common/validators/is-not-blank.validator';

export class ListenRecordDto {
  @IsDefined()
  @IsString()
  @IsNotBlank()
  recordFilePath: string;
}
