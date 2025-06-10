import * as crypto from 'crypto';

if (!global.crypto) {
  (global as any).crypto = crypto;
}
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = new DocumentBuilder()
    .setTitle('PuppyCupid API')
    .setDescription('PuppyCupid 백엔드 API 문서입니다.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  writeFileSync('./swaggerFile', JSON.stringify(document, null, 2));
  SwaggerModule.setup('api', app, document);

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  app.use(cookieParser());

  app.use(bodyParser.json({ limit: '20mb' }));
  app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));

  app.enableCors({
    origin: [
      'https://puppycupid.co.kr/',
      'http://localhost:3000',
      'http://localhost:4000',
      'http://52.79.135.142',
    ],
    credentials: true,
    exposedHeaders: ['Set-Cookie', 'Authorization', 'Custom-Header'],
  });

  await app.listen(process.env.PORT!);
}
bootstrap();
