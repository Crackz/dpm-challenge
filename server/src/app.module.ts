import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { EnvironmentVariables } from './common/env/environment-variables';
import { NodeEnvironment } from './common/constants';
import { envFilePaths } from './config';
import { typeormConfig } from './config/typeorm';
import { validateEnvironmentVariables } from './common/env/validation';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecordsModule } from './modules/records/records.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: envFilePaths,
      load: [typeormConfig],
      validate: validateEnvironmentVariables,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return configService.get('typeorm');
      },
    }),
    RecordsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  private readonly logger = new Logger(AppModule.name);

  constructor(
    private dataSource: DataSource,
    private configService: ConfigService<EnvironmentVariables>,
  ) {}
  async onModuleInit() {
    if (
      this.configService.get('NODE_ENV') === NodeEnvironment.DEVELOPMENT ||
      this.configService.get('NODE_ENV') === NodeEnvironment.TESTING
    ) {
      await this.dataSource.runMigrations();
      this.logger.log('Migrations are executed');
    }
  }
}
