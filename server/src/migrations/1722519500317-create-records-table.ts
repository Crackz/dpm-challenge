import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRecordsTable1722519500317 implements MigrationInterface {
  private recordsTableName = 'records';
  private recordStatusEnumName = 'recordStatus';
  public async up(queryRunner: QueryRunner): Promise<void> {
    const createRecordStatusEnumQuery = `CREATE TYPE ${this.recordStatusEnumName} AS ENUM ('PROCESSABLE', 'PROCESSED');`;
    await queryRunner.query(createRecordStatusEnumQuery);
    const createTableQuery = `
    CREATE TABLE "${this.recordsTableName}" (
      "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
      "email" varchar(255) NOT NULL,
      "status" ${this.recordStatusEnumName} NOT NULL,
      "audioFilePath" varchar NOT NULL,
      "correctedAudioFilePath" varchar,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );`;

    await queryRunner.query(createTableQuery);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.recordsTableName);
    await queryRunner.query(`DROP TYPE ${this.recordStatusEnumName};`);
  }
}
