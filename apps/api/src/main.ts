import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

import { NestExpressApplication } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';

function ensureDir(dirPath: string) {
  fs.mkdirSync(dirPath, { recursive: true });
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

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

  const uploadDir = config.get<string>('UPLOAD_DIR') ?? './uploads';

  // Ensure local directories exist
  ensureDir(path.resolve(process.cwd(), 'data'));
  ensureDir(path.resolve(process.cwd(), uploadDir));

  // Serve uploaded files from /uploads (not under /api)
  app.useStaticAssets(path.resolve(process.cwd(), uploadDir), {
    prefix: '/uploads',
  });

  const port = Number(config.get<string>('PORT') ?? 3000);

  // Listen on 0.0.0.0 to allow access from a real device
  await app.listen(port, '0.0.0.0');
}

bootstrap();
