import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions-filters';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule,DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import xss from 'xss-clean';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
  }))

  app.use(helmet({
    contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],        
          styleSrc: ["'self'"],         
          scriptSrc: ["'self'"],         
          imgSrc: ["'self'", "data:", "https:"], 
          fontSrc: ["'self'", "https:"], 
          connectSrc: ["'self'"],        
          frameSrc: ["'none'"],          
        },
      },
      crossOriginEmbedderPolicy: false 
  }));
  app.use(xss())
  
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true
  })
  
  app.useGlobalFilters(new AllExceptionsFilter())
  const config= new DocumentBuilder()
      .setTitle('Job Board API')
      .setDescription('Professional job board with role-based access control')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('Auth', 'User registration, login, and token management')
      .addTag('Jobs', 'Job posting and management')
      .addTag('Applications', 'Job application submission and tracking')
      .addTag('Companies', 'Company profiles and management')
      .build()


  const document= SwaggerModule.createDocument(app,config)    
  SwaggerModule.setup('api/docs', app, document);

  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
