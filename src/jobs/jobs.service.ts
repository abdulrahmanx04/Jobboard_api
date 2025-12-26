import { Injectable, NotFoundException, BadRequestException,UnauthorizedException } from '@nestjs/common';
import { UserPayLoad } from 'src/common/interfaces/all-interfaces';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateJobDto } from './DTO/create-job-dto';
import { GetJobsDto } from './DTO/GetJobs-dto';
import { UpdateJobDto } from './DTO/update-job-dto';
import { UpdateStatus } from './DTO/update-job-status-dto';


@Injectable()
export class JobsService {
    constructor(private prisma: PrismaService) {}

    
    async postJob( dto: CreateJobDto,user: UserPayLoad) {
        const company= await this.prisma.company.findUnique({
            where: {
                id: dto.companyId
            }
        })

        if(!company) {
            throw new NotFoundException('Company not found')
        }
        if (user.role !== 'ADMIN' && company.ownerId !== user.id) {
            throw new UnauthorizedException('You can only post jobs for your own company');
        }
        if (dto.salary && dto.salaryMax && dto.salary > dto.salaryMax) {
            throw new BadRequestException('Minimum salary cannot be greater than maximum salary');
        }
       
        if (dto.expiresAt && new Date(dto.expiresAt) < new Date()) {
            throw new BadRequestException('Job expiration date must be in the future');
        }     

        const job = await this.prisma.job.create({
            data: {
                title: dto.title,
                description: dto.description,
                location: dto.location,
                salary: dto.salary,
                salaryMax: dto.salaryMax,
                currency: dto.currency,
                type: dto.type,
                requirements: dto.requirements,
                benefits: dto.benefits,
                experienceLevel: dto.experienceLevel,
                status: dto.status,
                employer: {
                    connect : {
                        id: user.id
                    }
                },
                company: {
                    connect: {
                        id: dto.companyId
                    }
                },
                expiresAt: dto.expiresAt
            },
            include :{
                company: {
                    select: {
                    id: true,
                    name: true,
                    ownerId: true
                 }
                }
            }
        })

        return {
            success: true,
            message: 'Job posted successfully',
            data:job
        }

    }

    async getJobs(query: GetJobsDto) {
        const {page=1,
            limit= 10,
            search,
            status,
            experienceLevel,
            type
        }= query

        const skip = (page - 1) * limit

        const where: any = {}

        if(type) where.type= type
        if(experienceLevel) where.experienceLevel= experienceLevel
        if(status) where.status= status
        if(search) {
            where.OR= [
                {title: {contains: search, mode: 'insensitive'}},
                {description: {contains: search, mode: 'insensitive'}},
                {company: {contains: search, mode: 'insensitive'}}
            ]
        }

        const [jobs, total]= await Promise.all([
            this.prisma.job.findMany({
                where,
                take: limit,
                skip,
                orderBy: {createdAt: 'desc'},
                include: {
                    company: {
                        select: {
                        id: true,
                        name: true,
                        email: true,
                        description: true,
                        industry: true
                    }
                  }
                }
            }),
            this.prisma.job.count({where})
        ])

        const totalPages= Math.ceil(total / limit)

        return {
            success: true,
            data: jobs,
            pagination: {
                page,
                limit,
                total,
                prevPage: page > 1 ? page - 1 : null,
                nextPage: page < totalPages ? page + 1: null,
                totalPages
            }
        }

    }

    async getJob(id: string) {
        
        const job= await this.prisma.job.findUnique({
           where: {
            id
           }, include: {
            employer: {
                select: {
                    id: true,
                    name: true,
                    email :true
                }
            },
            company: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                    email: true,
                    industry: true,
                }
            }
           }
        })

        if(!job) {
            throw new NotFoundException('Job not found')
        }
        return {
            success: true,
            data: job
        }
    }

    async updateJob(id: string,dto: UpdateJobDto,user: UserPayLoad) {

        const job = await this.prisma.job.findUnique({
            where: {
                id,
                
            },include: {
                company: true
            }
        })

        if(!job) {
            throw new NotFoundException('Job not found')
        }

        if(user.role !== 'ADMIN' &&  job.company.id  !== user.id) {
            throw new UnauthorizedException('Only admin and employers can update jobs')
        }
        const updatedJob= await this.prisma.job.update({
            where: {
                id : job.id
            },
            data: {
                ...(dto.title !== undefined && {title: dto.title}),
                ...(dto.description !== undefined && {description: dto.description}),
                ...(dto.location !== undefined && {location: dto.location}),
                ...(dto.salary !== undefined && {salary: dto.salary}),
                ...(dto.salaryMax !== undefined && {salaryMax: dto.salaryMax}),
                ...(dto.currency !== undefined && {currency: dto.currency}),
                ...(dto.type !== undefined && {type: dto.type}),
                ...(dto.requirements !== undefined && {requirements: dto.requirements}),
                ...(dto.benefits !== undefined && { benefits: dto.benefits}),
                ...(dto.experienceLevel !== undefined && {experienceLevel: dto.experienceLevel}),
                ...(dto.status !== undefined && {status: dto.status}),
                ...(dto.expiresAt !== undefined && {expiresAt: dto.expiresAt})
            }
        })
        return {
            success: true,
            message: 'Job updated successfully',
            data: updatedJob
        }
    }

    async updateJobStatus(id: string, dto: UpdateStatus,user: UserPayLoad) {
        const job = await this.prisma.job.findUnique({
            where: {
                id
            },include: {
                company: true
            }
        })
        if(!job) {
            throw new NotFoundException('Job not found')
        }

        if(user.role !== 'ADMIN' && job.company.ownerId !== user.id) {
            throw new UnauthorizedException("Only admin and company owners can update jobs's status")
        }

        const updatedStatus= await this.prisma.job.update({
            where: {
                id
            },
            data: {
                status: dto.status
            },include: {
                company: {
                    select: {
                        id: true,
                        name: true,
                        email :true,
                        industry: true
                    }
                }
            }
        })
        return {
            success: true,
            message: 'Job status updated successfully',
            data: updatedStatus
        }
    }

    async deleteJob(id: string, user: UserPayLoad) {
        const job = await this.prisma.job.findUnique({
            where: {
                id
            },include: {
                company: true
            }
        })
        if(!job) {
            throw new NotFoundException('Job not found')
        }
        if(user.role !== 'ADMIN' && job.company.ownerId !== user.id) {
            throw new UnauthorizedException('Only admin and employers can delete jobs')
        }
        await this.prisma.job.delete({
            where: {
                id
            }
        })

        return {
            success: true,
            message: 'Job deleted successfully'
        }
    }
}
