import { Injectable } from '@nestjs/common';
import { DeleteUserDto } from './DTO/delete-user-dto';
import { UpdateProfileDto } from './DTO/update-user-dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserPayLoad } from 'src/common/interfaces/all-interfaces';
import { NotFoundException,BadRequestException,UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs'
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UploadApiResponse } from 'cloudinary';


@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService,
        private cloudinaryService: CloudinaryService
    ) {}

    async getProfile(user: UserPayLoad) {
        const userProfile= await this.prisma.user.findUnique({where: {id: user.id},
        select :{
            id: true,
            name: true,
            email: true,
            avatar: true
        }})
        if(!userProfile) throw new NotFoundException('User not found')
        return{
            success: true,
            data: userProfile    
        }    
    }
     async updateProfile(dto: UpdateProfileDto, user: UserPayLoad, file?: Express.Multer.File)
        {
            
            const updateUser= await this.prisma.user.findUnique({where: {id: user.id}})
            if(!updateUser) throw new NotFoundException('User not found')
        
            const updatedFields: Record<string, string | null>= {}    
            if(dto.name) updatedFields.name= dto.name

            if(dto.email) {
                const existingUser= await this.prisma.user.findUnique({
                    where: {email: dto.email}
                })
                if(existingUser) {
                    throw new BadRequestException('Email already in use')
                }
                if(!dto.password) throw new BadRequestException('Password is required')
                const checkPass= await bcrypt.compare(dto.password, updateUser.password)
                if(!checkPass) throw new UnauthorizedException('Incorrect password')
                updatedFields.email = dto.email    
            }
            let avatar: string | null = null

            if(file) {
                const uploadResult=
                await this.cloudinaryService.uploadFile(file,'avatar') as UploadApiResponse
                if(uploadResult && uploadResult.secure_url) {
                    avatar= uploadResult.secure_url 
                    updatedFields.avatar= avatar 
                }
            }
      
            const updatedUser= await this.prisma.user.update({where: {id: updateUser.id},
                data: updatedFields,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true
                }
            })
            return {success: true, message: 'Profile updated successfully',data: updatedUser}
    }

     async deleteUser(dto: DeleteUserDto,user: UserPayLoad) {

        const deleteUser= await this.prisma.user.findUnique({where: {id: user.id}})
        if(!deleteUser) throw new NotFoundException('User not found')

        const checkPass= await bcrypt.compare(dto.password,deleteUser.password)    
        if(!checkPass) throw new UnauthorizedException('Incorrect password')
         
        if(deleteUser.avatar) {
            const url= deleteUser.avatar.split('/')
            const avatarName= url[url.length - 1]
            const avatarPublicId= `avatar/${avatarName.split('.')[0]}`
            await this.cloudinaryService.deleteFile(avatarPublicId)
        }    

        const deletedUser= await this.prisma.user.delete({where: {id: user.id}})

        return { success: true, message: 'User deleted successfully' };    

    }


}
