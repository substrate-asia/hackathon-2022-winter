import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  if (process.argv) {
    for (const g of process.argv) {
      console.log(g);
    }
  }
  if (process.env) {
    console.log(process.env);
  }
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const config = new DocumentBuilder()
    .setTitle('go-staking-portal-service')
    .setDescription('staking analysis service')
    .setVersion('0.1')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api', app, document);

  await app.listen(process.env.PORT || 20055);
}
bootstrap();

