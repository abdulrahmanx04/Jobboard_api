import { Body, Controller, Post,Get,Put,Delete, Query, UploadedFile, UseGuards, UseInterceptors, Param } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { JwtAuthGuard } from 'src/common/guard/AuthGuard';
import { CreateCompanydDto} from './DTO/create-company-dto';
import { UserPayLoad } from 'src/common/interfaces/all-interfaces';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/common/decorators/current-user';
import { GetCompaniesDto } from './DTO/GetCompaniteDto';
import { UpdateCompanyDto } from './DTO/update-company-dto';
import { ApiBearerAuth, ApiBody,ApiQuery, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
@Controller('companies')
export class CompaniesController {
    constructor(private companyService: CompaniesService) {}

    @UseGuards(JwtAuthGuard)
    @ApiOperation({summary: 'Created a company'})
    @ApiBearerAuth()
    @ApiBody({type: CreateCompanydDto})
    @ApiResponse({
        status: 201,
        description: 'Company created successfully',
        schema: {
            example: {
                success: true,
                message: 'Company created successfully',
                data: {
                        id: 'company-id-1',         
                        name: 'Company Name',
                        email: 'contact@example.com',
                        phone: '0123456789',
                        slug: 'company-slug',
                        logo: 'logo-url-or-path',
                        description: 'Company description here...',
                        website: 'https://company.com',
                        industry: 'Technology',
                        companySize: '50-100',
                        foundedYear: 2010,
                        socialLinks: 'https://linkedin.com/company/company', 
                        benefits: ['Health insurance', 'Remote work'],
                        culture: 'Open and collaborative',
                        owner: {
                        id: 'user-id-1',
                        name: 'Owner Name',
                        email: 'owner@example.com'
                        }
                    }
             }
        }
    })
    @Throttle({ medium: { limit: 3, ttl: 3600000 } })
    @Post('/')
    @UseInterceptors(FileInterceptor('logo'))
    async createCompany(@Body() dto: CreateCompanydDto,
     @CurrentUser() user: UserPayLoad,   @UploadedFile() file?: Express.Multer.File) {
        return this.companyService.createCompany(dto,user,file)
    }
    

    @SkipThrottle()
    @Get('/')
    @ApiOperation({summary: 'Get companies paginated'})
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
    @ApiQuery({ name: 'search', required: false, type: String, example: 'keyword' })
    @ApiQuery({ name: 'location', required: false, type: String, example: 'Cairo' })
    @ApiQuery({ name: 'companySize', required: false, type: String, example: '50-100' })
    @ApiQuery({ name: 'slug', required: false, type: String, example: 'abc-company' })
    @ApiQuery({name: 'email',required: false, example: 'example@example.com'})
    @ApiQuery({name: 'industry',required: false, type: String, example: 'exampleindustty'})
    @ApiResponse({
        status: 200,
        description: 'Get companies paginated',
        schema: {
            example: {
                success: true,
                data: {
                        id: 'company-id-1',         
                        name: 'Company Name',
                        email: 'contact@example.com',
                        phone: '0123456789',
                        slug: 'company-slug',
                        logo: 'logo-url-or-path',
                        description: 'Company description here...',
                        website: 'https://company.com',
                        industry: 'Technology',
                        companySize: '50-100',
                        foundedYear: 2010,
                        socialLinks: 'https://linkedin.com/company/company', 
                        benefits: ['Health insurance', 'Remote work'],
                        culture: 'Open and collaborative',
                        owner: {
                        id: 'user-id-1',
                        name: 'Owner Name',
                        email: 'owner@example.com'
                },
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
        }
    })
    async getCompanies(@Query() query: GetCompaniesDto) {
        return this.companyService.getCompanies(query)
    }

    @SkipThrottle()
    @Get('/:id')
    @ApiOperation({summary: 'Get comapny by id'})
    @ApiParam({name: 'id', type: String, example: 'id'})
    @ApiResponse({
        status: 200,
        description: 'Get comapny by id',
        schema: {
            example: {
                success: true,
                data: {
                        id: 'company-id-1',         
                        name: 'Company Name',
                        email: 'contact@example.com',
                        phone: '0123456789',
                        slug: 'company-slug',
                        logo: 'logo-url-or-path',
                        description: 'Company description here...',
                        website: 'https://company.com',
                        industry: 'Technology',
                        companySize: '50-100',
                        foundedYear: 2010,
                        socialLinks: 'https://linkedin.com/company/company', 
                        benefits: ['Health insurance', 'Remote work'],
                        culture: 'Open and collaborative',
                        owner: {
                        id: 'user-id-1',
                        name: 'Owner Name',
                        email: 'owner@example.com'
                        }
                    }
            }
        }
    })
    async getCompany(@Param('id') id: string) {
        return this.companyService.getCompany(id)
    }

     @UseGuards(JwtAuthGuard)
     @ApiOperation({summary: 'Update company'})
     @ApiBearerAuth()
     @ApiBody({type: UpdateCompanyDto})
     @ApiResponse({
        status: 200,
        description: 'Update company',
        schema: {
            example: {
                success: true,
                message: 'Company updated successfully',
                data: {
                        id: 'company-id-1',         
                        name: 'Company Name',
                        email: 'contact@example.com',
                        phone: '0123456789',
                        slug: 'company-slug',
                        logo: 'logo-url-or-path',
                        description: 'Company description here...',
                        website: 'https://company.com',
                        industry: 'Technology',
                        companySize: '50-100',
                        foundedYear: 2010,
                        socialLinks: 'https://linkedin.com/company/company', 
                        benefits: ['Health insurance', 'Remote work'],
                        culture: 'Open and collaborative',
                        owner: {
                        id: 'user-id-1',
                        name: 'Owner Name',
                        email: 'owner@example.com'
                        }
                }
            }
        }
     })
     @Throttle({ strict: { limit: 20, ttl: 60000 } })
     @Put('/:id')
     @UseInterceptors(FileInterceptor('logo'))  
     async updateCompany(@Param('id') id: string,@Body() dto: UpdateCompanyDto,
        @CurrentUser() user: UserPayLoad, @UploadedFile() file?: Express.Multer.File) {
            return this.companyService.updateCompany(id,dto,user,file)
     }


     @UseGuards(JwtAuthGuard)
     @ApiOperation({summary: 'Delete company'})
     @ApiBearerAuth()
     @ApiParam({name: 'id', type: String, example: 'id'})
     @ApiResponse({
        status: 200,
        description: 'Company deleted successfully',
        schema: {
            example: {
                success: true,
                message: 'Company deleted successfully'
            }
        }
     })
     @Throttle({ medium: { limit: 3, ttl: 3600000 } })
     @Delete('/:id')
     async deleteCompany(@Param('id') id: string, @CurrentUser() user: UserPayLoad) {
        return this.companyService.deleteCompany(id,user)
     }

 }
