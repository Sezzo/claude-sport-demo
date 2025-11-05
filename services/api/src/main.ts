import { NestFactory } from '@nestjs/core';
import { AppModule } from './module';
import * as process from 'node:process';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const port = process.env.API_PORT || 8080;
  await app.listen(port as number, '0.0.0.0');
  // eslint-disable-next-line no-console
  console.log(`API listening on ${port}`);
}
bootstrap();
