import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { ValidationPipe } from './pipes/validation.pipe';
import { GlobalExceptionFilter } from './exceptions/global-exception.filter';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(
    express.json({
      verify: (req: any, _, buf, __) => {
        if (buf && buf.length) {
          // Lưu Raw Body vào req.rawBody
          req.rawBody = buf;
        }
        return true;
      },
      limit: '10mb',
    }),
  );
  app.use(express.urlencoded({ extended: true }));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.use(cookieParser());
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://192.168.11.1:3000',
      process.env.CLIENT_URL,
      process.env.BASE_URL,
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3001);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
