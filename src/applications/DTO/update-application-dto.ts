import { IsOptional,IsString,MinLength,MaxLength,IsDateString,Min,Max,IsNumber,IsEnum } from "class-validator";
import { Type } from "class-transformer";
import { ApplicationStatus } from "@prisma/client";

export class UpdateApplicationAdminDto {

    @IsOptional()
    @IsString()
    @MinLength(10)
    @MaxLength(5000)
    coverLetter?: string


    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1000)
    @Max(1000000)
    expectedSalary?: number

    @IsOptional()
    @IsString()
    @MinLength(10)
    @MaxLength(2000)
    notes?: string

    @IsOptional()
    @IsDateString()
    availableFrom?: string

    @IsOptional()
    @IsEnum(ApplicationStatus)
    status?: ApplicationStatus
}

export class UpdateApplicationEmployerDto {
    
    @IsEnum(ApplicationStatus)
    status?: ApplicationStatus

    @IsOptional()
    @IsString()
    notes?: string;

}


export class UpdateApplicationJobSeekerDto {

    @IsOptional()
    @IsString()
    @MinLength(10)
    @MaxLength(5000)
    coverLetter?: string  


    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1000)
    @Max(1000000)
    expectedSalary?: number


   @IsOptional()
   @IsString()
   availableFrom?: string;
}

