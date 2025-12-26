import { IsNotEmpty,IsOptional,MinLength,MaxLength,IsString,IsNumber, IsEmail, IsJSON } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';
export class CreateCompanydDto {

   @ApiProperty({example: 'name123', minLength: 5, maxLength: 30})
    @IsNotEmpty()
    @IsString()
    @MinLength(5)
    @MaxLength(30)
    name: string

    @ApiProperty({example: 'slug123', minLength: 5, maxLength: 50})
    @IsNotEmpty()
    @IsString()
    @MinLength(5)
    @MaxLength(50)
    slug: string

    @ApiProperty({example: 'company consists of......', minLength: 20, maxLength: 1000})
    @IsNotEmpty()
    @IsString()
    @MinLength(20)
    @MaxLength(1000)
    description: string

    
    @ApiProperty({example: 'website.com'})
    @IsOptional()
    @IsString()
    website?: string

    @ApiProperty({example: 'website.com',minLength: 3, maxLength: 30})
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    @MaxLength(30)
    industry: string

    @ApiProperty({example: '500*600'})
    @IsOptional()
    @IsString()
    companySize?: string

    @ApiProperty({example: '2004/7/7'})
    @IsOptional()
    @IsNumber()
    foundedYear?: number

    @ApiProperty({example: 'email@example.com'})
    @IsOptional()
    @IsEmail()
    email?: string

    @ApiProperty({example: '0123867322'})
    @IsOptional()
    @MinLength(10)
    @MaxLength(30)
    @IsString()
    phone?: string

    @ApiProperty({example: {
      link: "example.com"
    }})
    @IsOptional()
    socialLinks?: string


    @ApiProperty({example: ['Try new things','example']})
    @IsOptional()
    benefits?: string[]

    @ApiProperty({example: 'cultureexample'})
    @IsOptional()
    @IsString()
    @MinLength(5)
    @MaxLength(100)
    culture?: string

    @ApiProperty({example: 'location'})
    @IsOptional()
    @IsString()
    headquarters?: string


}


