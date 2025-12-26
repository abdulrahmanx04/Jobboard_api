import { Controller,Post,Get,Put,Delete, Body, UseGuards, Query, Param, Patch } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './DTO/create-job-dto';
import { UserPayLoad } from 'src/common/interfaces/all-interfaces';
import { JwtAuthGuard } from 'src/common/guard/AuthGuard';
import { CurrentUser } from 'src/common/decorators/current-user';
import { GetJobsDto } from './DTO/GetJobs-dto';
import { UpdateJobDto } from './DTO/update-job-dto';
import { UpdateStatus } from './DTO/update-job-status-dto';
import { ApiTags,ApiOperation,ApiResponse,ApiBody, ApiBearerAuth, ApiQuery, ApiParam} from '@nestjs/swagger';
import { SkipThrottle, Throttle } from '@nestjs/throttler';


@Controller('jobs')
@ApiTags('Jobs')
export class JobsController {
    constructor(private jobService: JobsService) {}
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Create a new job posting' })
    @ApiBearerAuth()
    @ApiResponse({
        status: 201,
        description: 'Job posted successfully',
        schema: {
            example: {
                success: true,
                message: 'Job posted successfully',
                data: {
                     id: 'job-id',
                    title: 'Frontend Developer',
                    description: 'Job description here',
                    location: 'Cairo, Egypt',
                    salary: 4000,
                    salaryMax: 5000,
                    currency: 'USD',
                    type: 'FULL_TIME',
                    requirements: ['React', 'TypeScript'],
                    benefits: ['Health insurance'],
                    experienceLevel: 'MID', 
                    status: 'OPEN', 
                    expiresAt: '2025-12-31T00:00:00.000Z',
                    company: { id: 'company-id', name: 'ABC Company', ownerId: 'owner-id' }
                }
            }
        }
    })
    @Throttle({ medium: { limit: 20, ttl: 3600000 } })
    @Post('/')
    async postJob(@Body() dto: CreateJobDto,@CurrentUser() user: UserPayLoad) {
        return this.jobService.postJob(dto,user)
    }


    @SkipThrottle()
    @Get('/')
    @ApiOperation({ summary: 'Get a paginated list of jobs' })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
    @ApiQuery({ name: 'search', required: false, type: String, example: 'frontend' })
    @ApiQuery({ name: 'status', required: false, enum: ['DRAFT', 'OPEN', 'CLOSED', 'FILLED'] })
    @ApiQuery({ name: 'type', required: false, enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE'] })
    @ApiQuery({ name: 'experienceLevel', required: false, enum: ['ENTRY','JUNIOR','MID','SENIOR','LEAD','EXECUTIVE'] })
    @ApiResponse({
        status: 200,
        description: 'List of jobs retrieved successfully',
        schema: {
        example: {
            success: true,
            data: [
            {
                id: 'job-id-1',
                title: 'Frontend Developer',
                description: 'Job description here',
                location: 'Cairo, Egypt',
                salary: 4000,
                salaryMax: 5000,
                currency: 'USD',
                type: 'FULL_TIME',
                requirements: 'React, TypeScript',
                benefits: ['Health insurance'],
                experienceLevel: 'MID',
                status: 'OPEN',
                expiresAt: '2025-12-31T00:00:00.000Z',
                createdAt: '2025-11-01T08:00:00.000Z',
                updatedAt: '2025-11-13T08:30:00.000Z',
                employerId: 'employer-id',
                companyId: 'company-id',
                company: {
                id: 'company-id',
                name: 'ABC Company',
                email: 'contact@abc.com',
                description: 'Company description',
                industry: 'Technology'
                }
            }
            ],
            pagination: {
            page: 1,
            limit: 10,
            total: 50,
            prevPage: null,
            nextPage: 2,
            totalPages: 5
            }
        }
        }
    })
    async getJobs(@Query() query: GetJobsDto) {
        return this.jobService.getJobs(query)
    }

    @SkipThrottle()
    @Get('/:id')
    @ApiOperation({summary: 'Get a job by id'})
    @ApiParam({name: 'id', description: 'Job id', type: String, example: 'job-id-1'})
    @ApiResponse({
        status: 200,
        description: 'Job retrieved successfully',
        schema: {
        example: {
            success: true,
            data: {
            id: 'job-id-1',
            title: 'Frontend Developer',
            description: 'Job description here',
            location: 'Cairo, Egypt',
            salary: 4000,
            salaryMax: 5000,
            currency: 'USD',
            type: 'FULL_TIME',             
            requirements: 'React, TypeScript',
            benefits: ['Health insurance'],
            experienceLevel: 'MID',        
            status: 'OPEN',                
            expiresAt: '2025-12-31T00:00:00.000Z',
            createdAt: '2025-11-01T08:00:00.000Z',
            updatedAt: '2025-11-13T08:30:00.000Z',
            employerId: 'employer-id',
            companyId: 'company-id',
            employer: {
                id: 'employer-id',
                name: 'John Doe',
                email: 'employer@example.com'
            },
            company: {
                id: 'company-id',
                name: 'ABC Company',
                description: 'Company description',
                email: 'contact@abc.com',
                industry: 'Technology'
            }
            }
        }
        }
    })
    async getJob(@Param('id') id: string) {
        return this.jobService.getJob(id)
    }

    @UseGuards(JwtAuthGuard)
    @ApiOperation({summary: 'Update job'})
    @ApiBearerAuth()
    @ApiBody({type: UpdateJobDto})
    @ApiResponse({
        status: 200,
        description: 'Job updated successfully',
        schema: {
            example: {
                success: true,
                message: 'Job updated successfully',
                data: {
                    id: 'job-id',
                    title: 'Senior Frontend Developer',         
                    description: 'Updated job description',    
                    location: 'Cairo, Egypt',                  
                    salary: 4500,                               
                    salaryMax: 5500,                          
                    currency: 'USD',                            
                    type: 'FULL_TIME',                          
                    requirements: 'React, TypeScript, Redux',   
                    benefits: ['Health insurance', 'Paid leave'], 
                    experienceLevel: 'MID',                      
                    status: 'OPEN',                              
                    expiresAt: '2025-12-31T00:00:00.000Z',      
                    createdAt: '2025-11-01T08:00:00.000Z',
                    updatedAt: '2025-11-13T09:00:00.000Z',
                    employerId: 'employer-id',
                    companyId: 'company-id'
                }
                }
         }
    })
    @Throttle({ strict: { limit: 30, ttl: 60000 } })
    @Put('/:id')
    async updateJob(@Param('id') id: string, @Body() dto: UpdateJobDto, @CurrentUser() user: UserPayLoad) {
        return this.jobService.updateJob(id,dto,user)
    }


    @UseGuards(JwtAuthGuard)
    @ApiOperation({summary: 'Update job status'})
    @ApiBearerAuth()
    @ApiBody({type: UpdateStatus})
    @ApiResponse({
        status: 200,
        description: 'Job status updated',
        schema: {
            example: {
                success: true,
                message: 'Job status updated',
                data: {
                        id: 'job-id',
                        title: 'Frontend Developer',
                        description: 'Job description here',
                        location: 'Cairo, Egypt',
                        salary: 4000,
                        salaryMax: 5000,
                        currency: 'USD',
                        type: 'FULL_TIME',           
                        requirements: 'React, TypeScript',
                        benefits: ['Health insurance'],
                        experienceLevel: 'MID',     
                        status: 'OPEN',               
                        expiresAt: '2025-12-31T00:00:00.000Z',
                        createdAt: '2025-11-01T08:00:00.000Z',
                        updatedAt: '2025-11-13T08:30:00.000Z',
                        employerId: 'employer-id',
                        companyId: 'company-id',
                        company: {
                            id: 'company-id',
                            name: 'ABC Company',
                            email: 'contact@abc.com',
                            industry: 'Technology'
                        }
                }
            }
        }
    })
    @Throttle({ strict: { limit: 50, ttl: 60000 } })
    @Patch('/:id')
    async updateStatus(@Param('id') id: string, @Body() dto: UpdateStatus, @CurrentUser() user: UserPayLoad){
        return this.jobService.updateJobStatus(id,dto,user)        
    }
    @UseGuards(JwtAuthGuard)
    @ApiOperation({summary: 'Delete job post'})
    @ApiBearerAuth()
    @ApiParam({name: 'id', description: 'Job id', type: String, example: 'job-id-1'})
    @ApiResponse({
        status: 200,
        description: 'Job deleted successfully',
        schema: {
        example: {
            success: true,
            message: 'Job deleted successfully'
        }
      }
    })
    @Throttle({ medium: { limit: 5, ttl: 3600000 } }) 
    @Delete('/:id')
    async deleteJob(@Param('id') id: string, @CurrentUser() user: UserPayLoad) {
        return this.jobService.deleteJob(id,user)
    }

}
