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

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const config = new DocumentBuilder()
    .setTitle('PuppyCupid API')
    .setDescription('PuppyCupid 백엔드 API 문서입니다.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  app.use(cookieParser());

  app.enableCors({
    origin: ['http://43.203.242.14', 'http://43.201.114.228'],
    credentials: true,
  });

  await app.listen(process.env.PORT!);
}
bootstrap();
