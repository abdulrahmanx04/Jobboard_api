import { Controller,Post,Get,Put,Delete,Body, Param, BadRequestException, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './DTO/register-dto';
import { LoginDto } from './DTO/login-dto';
import { JwtService } from '@nestjs/jwt';
import { UserPayLoad } from 'src/common/interfaces/all-interfaces';
import { CurrentUser } from 'src/common/decorators/current-user';
import { ForgotPassowrdDto } from './DTO/forgot-password-dto';
import { ResetPasswordDto } from './DTO/reset-password-dto';
import { ChangePasswordDto } from './DTO/change-password-dto';
import { JwtAuthGuard  } from 'src/common/guard/AuthGuard';
import { ApiOperation, ApiResponse, ApiTags,ApiBody,ApiBearerAuth,ApiParam } from '@nestjs/swagger';
import { SkipThrottle, Throttle } from '@nestjs/throttler';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService,
        private jwtService: JwtService
    ) {}

    @Throttle({medium : {limit: 3, ttl: 3600000}})
    @Post('/register')
    @ApiOperation({summary: 'Register a new account'})
    @ApiBody({
        schema: {
          example: {
             name: 'John Doe',
             email: 'user@example.com',
             password: '123456',
         },
       },
    })
    @ApiResponse({
        status: 201,
        description: 'User created successfully, please verify your account',
        schema: {
            example: {
                success: true,
                message: 'User created successfully, please verify your account',
                data: {
                    id: 'a1b2c3d4',
                    email: 'user@example.com',
                    name: 'John Doe',
                    role: 'user',
                },
                tokens: {
                    access_token: 'eyJhbGciOiJIUzI1NiIsInR5...',
                    refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5...',
                }
            }
        }
        })
    async register(@Body() dto: RegisterDto) {
        return this.authService.register(dto)
    }

    @Throttle({ medium: { limit: 5, ttl: 3600000 } })
    @Get('/verify-email/:token')
    @ApiOperation({summary: 'Verify email'})
    @ApiResponse({
        status: 200,
        description: 'Email verified successfully',
        schema: {
            example: {
                success: true,
                 message: 'Email verified successfully'
            }
        }
    })
    async verifyEmail(@Param('token') token: string) {
        return this.authService.verifyEmail(token)
    }


    @Throttle({strict: {limit: 5, ttl: 60000}})
    @Post('login')
    @ApiOperation({summary: 'Login user'})
    @ApiBody({
        schema: {
            example: {
                email: 'email@example.com',
                password: 'password123'
            }
        }
    })
    @ApiResponse({
        status: 201,
        description: 'Login successfully',
        schema: {
            example: {
                success: true,
                message: 'Login successfully',
                data: {
                    id: 'id123',
                    name: 'name12'
                },
                tokens: {
                    access_token: 'eyJhbGciOiJIUzI1NiIsInR5...',
                    refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5...',
                }
            }
        }
    })
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto)
    } 
    
    
    @Throttle({strict: {limit: 10, ttl: 60000}})
    @Post('/refresh-token')
    @ApiOperation({ summary: 'Refresh access token using refresh token' })
    @ApiBody({
     schema: {
        example: {
           refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5...',
        },
     },
    })
    @ApiResponse({
    status: 200,
    description: 'Tokens refreshed successfully',
    schema: {
        example: {
        success: true,
        data: {
            access_token: 'eyJhbGciOiJIUzI1NiIsInR5...',
            refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5...',
        },
    },
  },
    })
    async refreshToken(@Body('refreshToken') refreshToken: string) {
        if(!refreshToken) {
            throw new BadRequestException('Refresh token is required')
        }
        let payload

        try {
        payload= this.jwtService.verify(refreshToken,{secret: process.env.JWT_REFRESH})

        }catch(err){
            throw new UnauthorizedException('Invalid token')
        }

        return this.authService.refreshToken(refreshToken,payload.id)
    }

    
    @SkipThrottle()
    @ApiOperation({ summary: 'Logout user and invalidate refresh token' })
    @ApiBearerAuth() 
    @ApiResponse({
        status: 200,
        description: 'User logged out successfully',
        schema: {
            example: {
            success: true,
            message: 'Logged out successfully',
            },
        },
    })
    @Post('/logout')
    @UseGuards(JwtAuthGuard)
    async logout(@CurrentUser() user: UserPayLoad) {
        return this.authService.logout(user.id)
    }  

    @ApiOperation({ summary: 'Send password reset link to user email' })
    @ApiBody({
    schema: {
        example: {
        email: 'user@example.com',
        },
    },
    })
    @ApiResponse({
    status: 200,
    description: 'If email exists, a reset link will be sent',
    schema: {
        example: {
        success: true,
        message: 'If email exists a reset password link will be sent to your email',
        },
    },
    })
    @Throttle({strict: {limit: 3, ttl: 3600000}})
    @Post('forgot-password')
    async forgotPassword(@Body() dto: ForgotPassowrdDto) {
        return this.authService.forgotPassword(dto)
    }

    @ApiOperation({ summary: 'Reset password using reset token' })
    @ApiParam({
    name: 'token',
    required: true,
    description: 'Reset password token received in email link',
    example: '8f12e9a0b2c84d3e9ffb6a22b9d8f5b7'
    })
    @ApiBody({
    schema: {
        example: {
        newPassword: 'NewStrongPass123!',
        confirmPassword: 'NewStrongPass123!',
        },
    },
    })
    @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
    schema: {
        example: {
        success: true,
        message: 'Password reset done, please login with your new password',
        },
    },
    })
    @Throttle({medium: {limit: 3,ttl: 3600000}})
    @Post('reset-password/:token')
    async resetPassword(@Body() dto: ResetPasswordDto, @Param('token') token: string) {
        return this.authService.resetPassword(dto,token)
    }  

    @ApiOperation({ summary: 'Change current user password (requires authentication)' })
    @ApiBearerAuth() 
    @ApiBody({
    schema: {
        example: {
        currentPassword: 'OldPassword123',
        newPassword: 'NewPassword456',
        confirmPassword: 'NewPassword456',
        },
    },
    })
    @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    schema: {
        example: {
        success: true,
        message: 'Password changed successfully, please login with your new password',
        },
    },
    })
    @UseGuards(JwtAuthGuard)
    @Throttle({medium: {limit: 3,ttl: 360000}})
    @Put('change-password')
    async changePassword(@Body() dto: ChangePasswordDto,@CurrentUser() user: UserPayLoad) {
        return this.authService.changePassword(dto,user)
    } 

}
