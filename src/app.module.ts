import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { JobsModule } from './jobs/jobs.module';
import { ApplicationsModule } from './applications/applications.module';
import { PrismaModule } from './prisma/prisma.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { CompaniesModule } from './companies/companies.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([ {
        name: 'default',
        ttl: 60000,     
        limit: 100,     
      },
      {
        name: 'strict',
        ttl: 60000,     
        limit: 5,      
      },
      {
        name: 'medium',
        ttl: 3600000,   
        limit: 10,      
      }]),
    AuthModule, UsersModule, JobsModule, ApplicationsModule,PrismaModule, CloudinaryModule, CompaniesModule],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ],
})
export class AppModule {}
