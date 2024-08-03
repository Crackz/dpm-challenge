import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ShutdownSignal } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from './common/env/environment-variables';
import { HttpExceptionsFilter } from './common/filters/http-exceptions.filter';
import { DefaultValidationPipe } from './common/pipes/default-validation.pipe';
import { OpenApi } from './common/utils';
import { useContainer } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService =
    app.get<ConfigService<EnvironmentVariables>>(ConfigService);
  const serverPort = configService.get('SERVER_PORT');

  OpenApi.setup('/docs', app);

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.enableCors();
  app.setGlobalPrefix('v1');
  app.useGlobalPipes(new DefaultValidationPipe());
  app.useGlobalFilters(new HttpExceptionsFilter());

  app.enableShutdownHooks([ShutdownSignal.SIGTERM, ShutdownSignal.SIGINT]);

  await app.listen(serverPort);
}
bootstrap();
