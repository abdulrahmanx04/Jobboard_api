import { IsOptional,MinLength,MaxLength,IsString,IsNumber, IsEmail } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateCompanyDto {
    @ApiPropertyOptional({example: 'name123',minLength: 5,maxLength: 30})
    @IsOptional()
    @IsString()
    @MinLength(5)
    @MaxLength(30)
    name?: string

    @ApiPropertyOptional({example: 'email@example.com'})
    @IsOptional()
    @IsEmail()
    email?: string

    @ApiPropertyOptional({example: '01982370123',minLength: 10,maxLength: 30})
    @IsOptional()
    @MinLength(10)
    @MaxLength(30)
    @IsString()
    phone?: string

    @ApiPropertyOptional({example: 'slug123',minLength: 5,maxLength: 30})
    @IsOptional()
    @IsString()
    @MinLength(5)
    @MaxLength(30)
    slug?: string

    @ApiPropertyOptional({example: 'description about.....',minLength: 20,maxLength: 1000})
    @IsOptional()
    @IsString()
    @MinLength(20)
    @MaxLength(1000)
    description?: string

    @ApiPropertyOptional({example: 'websitex.com'})
    @IsOptional()
    @IsString()
    website?: string

    @ApiPropertyOptional({example: 'industry123'})
    @IsOptional()
    @IsString()
    industry?: string

    @ApiPropertyOptional({example: '50-100'})
    @IsOptional()
    @IsString()
    companySize?: string

    @ApiPropertyOptional({example: 2004})
    @IsOptional()
    @IsNumber()
    foundedYear?: number

    @ApiPropertyOptional({example: {
        link1: 'example.com'
    }})
    @IsOptional()
    socialLinks?: string

    @ApiPropertyOptional({example: ['benefit1', 'benefit2']})
    @IsOptional()
    benefits?: string[]

    @ApiPropertyOptional({example: 'cultureexample',minLength: 5,maxLength: 100})
    @IsOptional()
    @IsString()
    @MinLength(5)
    @MaxLength(100)
    culture?: string
    @ApiPropertyOptional({example: 'location123'})
    @IsOptional()
    @IsString()
    headquarters?: string


}