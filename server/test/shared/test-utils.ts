import { DataSource } from 'typeorm';

export class TestUtils {
  static clearAllDbTables = async (dataSource: DataSource): Promise<void> => {
    try {
      const entities = dataSource.entityMetadatas;
      const tableNames = entities
        .map((entity) => `"${entity.tableName}"`)
        .join(', ');
      await dataSource.query(
        `TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE;`,
      );
    } catch (error) {
      throw new Error(`ERROR: Cleaning test database: ${error}`);
    }
  };
}
