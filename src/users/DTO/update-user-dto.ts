import { IsEmail,IsOptional,MinLength,MaxLength,IsNotEmpty } from "class-validator";
import { AtLeastOneField } from '../../common/decorators/atleast-one-field'

export class UpdateProfileDto {

    @IsOptional()
    @IsEmail()
    email: string 

    @IsOptional()
    @MinLength(3)
    @MaxLength(10)
    @MaxLength(10)
    name: string

    @IsOptional()
    password: string

    @AtLeastOneField()
    _atleastone!: string

}