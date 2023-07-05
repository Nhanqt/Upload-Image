import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  //add versioning
  app.enableVersioning({
    type: VersioningType.URI,
  });
  //config swagger
  const config = new DocumentBuilder()
    .setTitle('IT-now')
    .setDescription('The ITNow API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/', app, document);
  // --end config swagger--
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  //enable cors
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
    next();
});

app.enableCors({
    allowedHeaders:"*",
    origin: "*"
});
  //use cookie
  app.use(cookieParser());
  app.useGlobalGuards();
  await app.listen(3002);
}
bootstrap();
