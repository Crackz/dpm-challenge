import { RECORDS_MODEL_NAME } from '../../../common/constants';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { RecordStatus } from '../interfaces/records.interface';

@Entity({ name: RECORDS_MODEL_NAME })
export class RecordEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({ enum: RecordStatus, enumName: 'recordStatus' })
  status: RecordStatus;

  @Column()
  email: string;

  @Column()
  audioFilePath: string;

  @Column({ nullable: true })
  correctedAudioFilePath?: string;
}
