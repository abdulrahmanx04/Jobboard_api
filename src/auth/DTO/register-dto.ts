import { Role } from '@prisma/client'
import {IsOptional,IsNotEmpty,MinLength,MaxLength,IsString,IsNumber, IsEmail, IsEnum} from 'class-validator'

export class RegisterDto {

@IsNotEmpty()
@IsString()
@MinLength(5)
@MaxLength(25)
name: string


@IsNotEmpty()
@IsEmail()
email: string

@IsNotEmpty()
@IsString()
@MinLength(6)
@MaxLength(20)
password: string




@IsOptional()
@MinLength(9)
@MaxLength(12)
phone?: string

@IsOptional()
@MinLength(10)
@MaxLength(30)
bio?: string

@IsOptional()
avatar?: string
}