import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { version } from '../package.json';
import { NestExpressApplication } from '@nestjs/platform-express';
import { CfgService } from './services/cfg.service';

async function bootstrap() {
  const cfg = new CfgService();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();
  app.set('trust proxy', cfg.trustProxy);

  const config = new DocumentBuilder()
    .setTitle('pixmail')
    .setDescription('Pixmail, your email tracking solution')
    .setVersion(version)
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, documentFactory, {
    jsonDocumentUrl: '/swagger.json',
  });

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
