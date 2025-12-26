import { Body, Post,Get,Put,Delete,Controller, UseInterceptors, UploadedFile, UseGuards, Query, Param } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './DTO/create-applicantion-dto';
import { UserPayLoad } from 'src/common/interfaces/all-interfaces';
import { CurrentUser } from 'src/common/decorators/current-user';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/common/guard/AuthGuard';
import { GetApplicationsDto } from './DTO/GetPaginationsDto';
import { UpdateApplicationAdminDto, UpdateApplicationEmployerDto, UpdateApplicationJobSeekerDto } from './DTO/update-application-dto';
import { ApiTags,ApiBearerAuth,ApiOperation } from '@nestjs/swagger';
import { SkipThrottle,Throttle } from '@nestjs/throttler';


@Controller('applications')
@ApiTags('Applications')
export class ApplicationsController {
    constructor(private applicationService: ApplicationsService) {}

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Create application' })
    @ApiBearerAuth()
    @Throttle({ medium: { limit: 10, ttl: 3600000 } })
    @Post('/')
    @UseInterceptors(FileInterceptor('resume'))
    async createApplication(@Body() dto: CreateApplicationDto,
    @CurrentUser() user: UserPayLoad, @UploadedFile() file: Express.Multer.File) {
        return this.applicationService.createApplication(dto,user,file)
    }

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get paginated applications' })
    @ApiBearerAuth()
    @SkipThrottle()
    @Get('/')
    async getApplications(@Query() dto: GetApplicationsDto,@CurrentUser() user: UserPayLoad) {
        return this.applicationService.getApplications(dto,user)
    }

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Create application by id' })
    @ApiBearerAuth()
    @SkipThrottle()
    @Get('/:id')
    async getApplication(@Param('id') id: string,@CurrentUser() user: UserPayLoad) {
        return this.applicationService.getApplication(id,user)
    }

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Update application for employers' })
    @ApiBearerAuth()
    @Throttle({ strict: { limit: 10, ttl: 60000 } })
    @Put('/:id/employer')
    async updateApplicationEmployer(@Param('id') id: string,@Body() dto: UpdateApplicationEmployerDto,
    @CurrentUser() user: UserPayLoad
    ) {
        return this.applicationService.updateApplicationEmployer(id,dto,user)
    }

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Update application for job_seekers' })
    @ApiBearerAuth()
    @Throttle({ short: { limit: 10, ttl: 3600000 } })
    @Put('/:id/job-seeker')
    @UseInterceptors(FileInterceptor('resume'))
    async updateApplicationJobSeeker(@Param('id') id: string, @Body() dto: UpdateApplicationJobSeekerDto,
    @CurrentUser() user: UserPayLoad, @UploadedFile() file?: Express.Multer.File
    ) {
        return this.applicationService.updateApplicationJobSeeker(id,dto,user, file)
    }

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Update application for admin' })
    @ApiBearerAuth()
     @Throttle({ strict: { limit: 10, ttl: 60000 } })
    @Put('/:id/admin')
    async updateApplicationAdmin(@Param('id') id: string, @Body() dto: UpdateApplicationAdminDto,
    @CurrentUser() user: UserPayLoad
    ) {
         return this.applicationService.updateApplicationAdmin(id, user, dto)
    }

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Delete application' })
    @ApiBearerAuth()
    @Throttle({ strict: { limit: 30, ttl: 60000 } })
    @Delete('/:id')
    async deleteApplication(@Param('id') id: string, @CurrentUser() user: UserPayLoad) {
        return this.applicationService.deleteApplication(id,user)
    }

}
