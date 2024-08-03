import { IsDefined, IsEmail, IsString } from 'class-validator';
import { IsNotBlank } from '../../../common/validators/is-not-blank.validator';

export class CreateRecordDto {
  @IsDefined()
  @IsEmail()
  email: string;

  @IsDefined()
  @IsString()
  @IsNotBlank()
  audioFilePath: string;
}
