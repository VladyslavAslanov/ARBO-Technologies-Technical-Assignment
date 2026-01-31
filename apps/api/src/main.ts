import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

import * as fs from 'fs';
import * as path from 'path';

function ensureDir(dirPath: string) {
  fs.mkdirSync(dirPath, { recursive: true });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Global prefix /api
  app.setGlobalPrefix('api');

  // CORS (for Expo/external clients; does not interfere)
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Strict validation of DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger /docs (NOT prefixed with /api)
  const swaggerConfig = new DocumentBuilder()
    .setTitle('TreeFeatureCollector API')
    .setDescription('Local REST API for demo (mock server logic)')
    .setVersion('1.0.0')
    .addApiKey(
      { type: 'apiKey', name: 'x-device-id', in: 'header' },
      'device-id',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  // Ensure folders for SQLite and uploads
  const uploadDir = config.get<string>('UPLOAD_DIR') ?? './uploads';
  ensureDir(path.resolve(process.cwd(), 'data'));
  ensureDir(path.resolve(process.cwd(), uploadDir));

  const port = Number(config.get<string>('PORT') ?? 3000);

  // Important for access with iPhone by IP: listen on 0.0.0.0
  await app.listen(port, '0.0.0.0');
}

bootstrap();
