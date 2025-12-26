import { BadRequestException,UnauthorizedException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './DTO/register-dto';
import { LoginDto } from './DTO/login-dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import crypto from 'crypto'
import { sendEmail } from 'src/common/utils/email';
import { ForgotPassowrdDto } from './DTO/forgot-password-dto';
import { ResetPasswordDto } from './DTO/reset-password-dto';
import { ChangePasswordDto } from './DTO/change-password-dto';
import { UserPayLoad } from 'src/common/interfaces/all-interfaces';



@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService,
        private jwtService: JwtService
    ) {}

    generateTokens(id: string, name: string, role: string) {

        const accessToken= this.jwtService.sign({id,name,role},
            {
              secret: process.env.JWT_ACCESS,
              expiresIn: '7d'  
            }
        )
        const refreshToken= this.jwtService.sign({id},
            {
                secret: process.env.JWT_REFRESH,
                expiresIn: '7d'
            }
        )
        return {accessToken,refreshToken}
    }


    async register(dto: RegisterDto) {

        const existingUser= await this.prisma.user.findUnique({where: { email: dto.email }})
        if(existingUser) {
            throw new BadRequestException('User already exists')
        }

        const hashPass= await bcrypt.hash(dto.password,10)

        const verifyToken= crypto.randomBytes(32).toString('hex')

        const verificationToken= crypto.createHash('sha256').update(verifyToken).digest('hex')

        const verificationTokenExpires= new Date(Date.now() + 7 * 24 *60 * 60 * 1000)
        


        const newUser= await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                password: hashPass,
                verificationToken,
                verificationTokenExpires
            }
        })

        const tokens= await this.generateTokens(
            newUser.id,
            newUser.name,
            newUser.role
        )

        const updateToken= await this.prisma.user.update({
            where: {
                id: newUser.id
            },
            data: {
                refreshToken: await bcrypt.hash(tokens.refreshToken,10)
            }
        })

        const url= `${process.env.FRONTEND_URL}/auth/verify-email/${verifyToken}`
       
        await sendEmail(newUser.email,'verification',{
            name: newUser.name,
            url}
        )

        
        return {
            success: true,
            message: 'User created successfully, please verify your account',
            data: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role
            },
            tokens
        }
    }

    async verifyEmail(token: string) {
        
        if(!token) {
            throw new BadRequestException('Token is required')
        }

        const hashToken= crypto.createHash('sha256').update(token).digest('hex')

        const user= await this.prisma.user.findFirst({
            where: {
                verificationToken: hashToken,
                verificationTokenExpires: {gt: new Date()}
            }
        })
        if(!user) {
            throw new NotFoundException('User not found')
        }

        const verifyUser= await this.prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                isActive: true,
                isVerified: true,
                verificationToken: null,
                verificationTokenExpires: null
            }
        })
        return {
            success: true,
            message: 'Email verified successfully'
        }
    }

  
    async login(dto: LoginDto) {
        const {email,password} = dto

        const user= await this.prisma.user.findUnique({where: {email}})
        if(!user) throw new UnauthorizedException('Email or password is incorrect')

        const isPasswordValid= await bcrypt.compare(password,user.password)
        if (!isPasswordValid) throw new UnauthorizedException('Email or password is incorrect');

        if(!user.isActive) {
          throw new  UnauthorizedException('Email verification is required');
        }
        const tokens = await this.generateTokens(user.id,user.name,user.role)
        await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    refreshToken: await bcrypt.hash(tokens.refreshToken,10),
                },
        });
        return {
            success: true,
            message: 'Login successfully',
            data: {
                id: user.id,
                name: user.name
            },
            tokens
        }

    }

    async refreshToken(refreshToken: string, id: string) {
        const user= await this.prisma.user.findUnique({
            where: {id}
        })

        if(!user || !user.refreshToken) {
            throw new UnauthorizedException('Access denied')
        }
        const isValid= await bcrypt.compare(refreshToken,user.refreshToken)
        if(!isValid) {
            throw new UnauthorizedException('Invalid token or expired')
        }
        
        const tokens= this.generateTokens(user.id,user.name,user.role)

        await this.prisma.user.update({
            where: {
                id: user.id
            },
            data :{
                refreshToken: await bcrypt.hash(tokens.refreshToken,10)
            }
        })
        return {
            success: true,
            data: tokens
        }
    }
    
    async logout(id: string) {

        await this.prisma.user.update({
            where: { id },
            data: {
            refreshToken: null 
            }
        });
        return {
            success: true,
            message: 'Logged out successfully'
        };
    }


    async forgotPassword(dto: ForgotPassowrdDto): Promise<{success: boolean,message: string}> {
        
        const user= await this.prisma.user.findFirst({where: {email: dto.email}})
      
        if (!user) {
            return {success: true,message: 'If email exists a reset password link will be sent to your email'}
        }
        
        const token= crypto.randomBytes(32).toString('hex')

        const hashedToken= crypto.createHash('sha256').update(token).digest('hex')

        const passwordResetExpires= new Date(Date.now() + 15 * 60 * 1000) 

        const url = `${process.env.FRONTEND_URL}/auth/reset-password/${token}`

        await sendEmail(user.email,'password',{name: user.name,url})

        console.log(token)

        const updateUser= await this.prisma.user.update({where: {email: dto.email},
        data: {
            passwordResetExpires,
            passwordResetToken: hashedToken
        }})
        return {
            success: true,
            message: 'If email exists a reset password link will be sent to your email'
        }
    }

    async resetPassword(dto: ResetPasswordDto,token: string): Promise<{success: boolean,message: string}> {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

        const user= await this.prisma.user.findFirst({where: {
            passwordResetToken : hashedToken,
            passwordResetExpires: {gt : new Date()}
        }})
        
        if(!user) throw new NotFoundException('User not found')
        
        const newPassHashed= await bcrypt.hash(dto.newPassword,10)
        
        const updatedUser= await this.prisma.user.update({where: {id: user.id},
        data: {
            password: newPassHashed,
            passwordResetToken : null,
            passwordResetExpires: null,
            refreshToken: null,
            refreshTokenExpires: null
        }})
        return {
            success: true,
            message: 'Passowrd reset done, please login with your new password'
        }
    }
    
    async changePassword(dto: ChangePasswordDto,user: UserPayLoad): Promise<{success: boolean,message: string}> {
        const existingUser= await this.prisma.user.findUnique({where: {id: user.id}})

        if(!existingUser) throw new NotFoundException('User not found')

        if(dto.currentPassword === dto.newPassword) {
            throw new BadRequestException('Current password and new password cannot be equal')
        }    
        const currentPassHash= await bcrypt.compare(dto.currentPassword,existingUser.password)  

        if(!currentPassHash) throw new BadRequestException('Current password is incorrect')

            
        const newPassHash= await bcrypt.hash(dto.newPassword,10) 

        const tokens= this.generateTokens(user.id,user.name,user.role)

        const updatedUser= await this.prisma.user.update({where: {id: user.id},

        data: {
            password: newPassHash,
            refreshToken: await bcrypt.hash(tokens.refreshToken,10)
        }})   

        return {
            success: true,
            message: 'Password changed successfully, please login with your new password'}
    }
    
}
