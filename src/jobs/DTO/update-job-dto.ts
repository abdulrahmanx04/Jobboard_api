import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, MinLength, IsDateString, IsEnum, MaxLength, Min, IsString, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';
import { JobType, ExperienceLevel, JobStatus } from '@prisma/client';

export class UpdateJobDto {

  @ApiPropertyOptional({ example: 'Frontend Developer', minLength: 5, maxLength: 40 })
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(40)
  title?: string;

  @ApiPropertyOptional({ example: 'Build amazing frontend apps', minLength: 10, maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ example: 'Cairo, Egypt', minLength: 10 })
  @IsOptional()
  @IsString()
  @MinLength(10)
  location?: string;

  @ApiPropertyOptional({ example: 4000, minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  salary?: number;

  @ApiPropertyOptional({ example: 5000, minimum: 1 })
  @IsOptional()
  @IsNumber()
  salaryMax?: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ enum: JobType, example: JobType.FULL_TIME })
  @IsOptional()
  @Transform(({ value }) => value.toUpperCase())
  @IsEnum(JobType)
  type?: JobType;

  @ApiPropertyOptional({ example: 'React, TypeScript', minLength: 10, maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  requirements?: string;

  @ApiPropertyOptional({ example: ['Health insurance', 'Paid leave'] })
  @IsOptional()
  benefits?: string[];

  @ApiPropertyOptional({ enum: ExperienceLevel, example: ExperienceLevel.MID })
  @IsOptional()
  @Transform(({ value }) => value.toUpperCase())
  @IsEnum(ExperienceLevel)
  experienceLevel?: ExperienceLevel;

  @ApiPropertyOptional({ enum: JobStatus, example: JobStatus.OPEN })
  @IsOptional()
  @Transform(({ value }) => value.toUpperCase())
  @IsEnum(JobStatus)
  status?: JobStatus;

  @ApiPropertyOptional({ example: '2025-12-31T00:00:00.000Z', type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  expiresAt?: Date;
}
