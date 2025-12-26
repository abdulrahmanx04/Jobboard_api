import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExperienceLevel, JobStatus, JobType } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsOptional, IsNotEmpty, MinLength, MaxLength, IsString, IsNumber, IsEnum, IsDateString, IsUUID, Min } from 'class-validator';

export class CreateJobDto {

  @ApiProperty({ example: 'company-uuid' })
  @IsNotEmpty()
  @IsUUID()
  companyId: string;

  @ApiProperty({ example: 'Frontend Developer', minLength: 5, maxLength: 40 })
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(40)
  title: string;

  @ApiProperty({ example: 'Build amazing frontend apps', minLength: 10, maxLength: 2000 })
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  description: string;

  @ApiProperty({ example: 'Cairo, Egypt', minLength: 10 })
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  location: string;

  @ApiPropertyOptional({ example: 4000, minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  salary?: number;

  @ApiPropertyOptional({ example: 5000, minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  salaryMax?: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ enum: JobType, example: JobType.FULL_TIME })
  @IsOptional()
  @Transform(({ value }) => value.toUpperCase())
  @IsEnum(JobType)
  type: JobType;

  @ApiPropertyOptional({ example: 'React, TypeScript' })
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


