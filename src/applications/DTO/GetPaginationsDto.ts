import { ApplicationStatus } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsDateString,IsNumber,IsOptional,IsString } from "class-validator";



export class GetApplicationsDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    page?: number

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    limit?: number


    @IsOptional()
    @IsString()
    search?: string


    @IsOptional()
    @IsString()
    sortOrder?: 'asc' | 'desc' = 'desc'

    @IsOptional()
    @IsString()
    sortBy?: 'appliedAt' | 'expectedSalary' | 'status' = 'appliedAt'


    @IsOptional()
    @IsEnum(ApplicationStatus)
    status?: ApplicationStatus

    @IsOptional()
    @IsDateString()
    appliedFrom?: string

    @IsOptional()
    @IsDateString()
    appliedTo?: string


}