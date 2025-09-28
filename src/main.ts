import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

function parseOrigins(list?: string): boolean | string[] {
  if (!list) return true;
  const arr = list.split(',').map(s => s.trim()).filter(Boolean);
  return arr.length ? arr : true;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  const config = app.get(ConfigService);
  const allowed = parseOrigins(config.get<string>('ALLOWED_ORIGINS'));

  app.use(helmet());
  app.enableCors({ origin: allowed });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Swagger
  const swaggerCfg = new DocumentBuilder()
    .setTitle('Chat API')
    .setVersion('1.0')
    .addApiKey({ type: 'apiKey', name: 'X-API-Key', in: 'header' }, 'apiKey')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerCfg);
  SwaggerModule.setup('docs', app, document);

  const port = Number(config.get<string>('PORT') ?? 4000);
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
}
bootstrap();
