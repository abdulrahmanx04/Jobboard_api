import { Controller,Body,UseGuards,Get,Put,Delete, UseInterceptors, UploadedFile, } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/common/guard/AuthGuard';
import { CurrentUser } from 'src/common/decorators/current-user';
import { UpdateProfileDto } from './DTO/update-user-dto';
import { DeleteUserDto } from './DTO/delete-user-dto';
import { UserPayLoad } from 'src/common/interfaces/all-interfaces';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle, Throttle } from '@nestjs/throttler';

@Controller('users')
@ApiTags('Users')
export class UsersController {
    constructor(private readonly userService: UsersService) {}

    @SkipThrottle()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({summary: 'Get user profile'})
    @Get('me')
    async getProfile(@CurrentUser() user: UserPayLoad) {
        return this.userService.getProfile(user)
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({summary: 'Update user profile'})
    @Throttle({strict: {limit: 10, ttl: 60000}})
    @Put('me')
    @UseInterceptors(FileInterceptor('logo'))
    async updateProfile (@Body() dto: UpdateProfileDto,
    @CurrentUser() user: UserPayLoad,
    @UploadedFile() file?: Express.Multer.File) {
        return this.userService.updateProfile(dto,user,file)
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({summary: 'Delete account'})
    @Throttle({ medium: { limit: 20, ttl: 3600000 } })
    @Delete('/me')
    async deleteUser(@Body() dto: DeleteUserDto,@CurrentUser() user: UserPayLoad) {
        return this.userService.deleteUser(dto,user)
    }
}