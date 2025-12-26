import { Transform, Type } from "class-transformer";
import { IsOptional,IsNotEmpty,IsUUID, Min,Max, IsString, MinLength, MaxLength, IsUrl, IsNumber } from "class-validator";


export class CreateApplicationDto {

    @IsNotEmpty()
    @IsUUID()
    jobId: string



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

}