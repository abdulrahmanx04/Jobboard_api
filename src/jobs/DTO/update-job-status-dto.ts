import { IsNotEmpty,IsEnum } from "class-validator";
import { Transform } from "class-transformer";
import { JobStatus } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";
export class UpdateStatus {
    @ApiProperty({enum: JobStatus, example: JobStatus.OPEN})
    @IsNotEmpty()
    @IsEnum(JobStatus)
    @Transform(({value}) => value.toUpperCase())
    status: JobStatus 
}