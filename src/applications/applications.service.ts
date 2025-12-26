import { Injectable, NotFoundException, UnauthorizedException,BadRequestException } from '@nestjs/common';
import { UploadApiResponse } from 'cloudinary';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UserPayLoad } from 'src/common/interfaces/all-interfaces';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateApplicationDto } from './DTO/create-applicantion-dto';
import { GetApplicationsDto } from './DTO/GetPaginationsDto';
import { UpdateApplicationAdminDto, UpdateApplicationEmployerDto, UpdateApplicationJobSeekerDto } from './DTO/update-application-dto';

@Injectable()
export class ApplicationsService {
    constructor(private prisma: PrismaService,
        private cloudinaryService: CloudinaryService
    ) {}

    async createApplication(dto: CreateApplicationDto, user: UserPayLoad, file: Express.Multer.File) {
        this.ensureRole(user,['ADMIN','JOB_SEEKER'])

        if (!file) {
            throw new BadRequestException('Resume file is required');
        }

        const [job,existingApplicaiton]= await Promise.all([
            this.prisma.job.findUnique({
                where: {
                    id: dto.jobId
                },
                select: {
                    id: true,
                    status: true
                }
            }),
            this.prisma.application.findUnique({
                where: {
                    jobId_applicantId: {
                        jobId: dto.jobId,
                        applicantId: user.id
                    }
                }
            })

        ])
        

        if(!job) {
            throw new NotFoundException('Job not found')
        }
        if(job.status  !== 'OPEN') {
            throw new BadRequestException('This job is no longer accepting applications')
        }


        if(existingApplicaiton) {
            throw new BadRequestException('You already applied for this job')
        }

        
        let uploadedResume : UploadApiResponse | null = null

        uploadedResume= await this.cloudinaryService.uploadFile(file,'applications')  as UploadApiResponse

        const resumeFileName= uploadedResume.public_id

        const resumeUrl= uploadedResume.secure_url



        const application= await this.prisma.application.create({
            data: {
                jobId: dto.jobId,
                applicantId: user.id,
                resumeUrl,
                resumeFileName,
                coverLetter: dto.coverLetter,
                statusHistory: [
                    {
                        status: "PENDING",
                        changedAt: new Date(),
                        changedBy: user.id
                    }
                ],
                expectedSalary: dto.expectedSalary,
                notes: dto.notes,
            }, include : {
                job: {
                  select: {
                    title: true,
                    company: true    
                  }
                },
                applicant: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        })

        return {
            success: true,
            message: 'Application applied successfully',
            data: application
        }
      }

      
    async getApplications(query: GetApplicationsDto,user: UserPayLoad) {

        let {
            page=1,
            limit=10,
            search,
            status,
            sortBy= 'appliedAt',
            sortOrder= 'desc',
            appliedFrom,
            appliedTo
        }= query

        const skip =(page- 1) * limit
        
        const where: any = {}

        if(user.role === 'EMPLOYER') {
            where.job= {company: { ownerId: user.id }}
        }
        else if(user.role === 'JOB_SEEKER') {
            where.applicantId= user.id
        }
        else if (user.role !== 'ADMIN') {
            throw new UnauthorizedException('You are not allowed to view applications');
        }

        
        if(status) {
            where.status=status
        }

        if(search) {
            where.OR= [
                {applicant: {name: {contains: search,mode: 'insensitive'}}},
                {job: {title: {contains: search, mode: 'insensitive' }}}
            ]
        }

        if(appliedTo || appliedFrom) {
            where.appliedAt= {}
            if(appliedTo) where.appliedAt.lte= new Date(appliedTo)
            if(appliedFrom) where.appliedAt.gte= new Date(appliedFrom)    
        }
        const validSortFields = ['appliedAt', 'expectedSalary', 'status'];

        if(!validSortFields.includes(sortBy)){ 
            sortBy = 'appliedAt'
        }
        
        const [applications,total]= await Promise.all([
            this.prisma.application.findMany({where,
                skip,
                take: limit,
                orderBy: {[sortBy] : sortOrder},
                include: {
                    applicant: {
                        select: {
                            name: true,
                            email: true
                        }
                    },
                    job: {
                        select: {
                            title: true,
                            company: {select: {
                                name: true
                            }}
                        }
                    }
                }
            }),
            this.prisma.application.count({where})
        ])    

        const totalPages= Math.ceil(total/limit)

        return {
            success: true,
            data: applications,
            pagination : {
                page,
                limit,
                total,
                prevPage: page > 1 ? page - 1 : null,
                nextPage: page < totalPages ? page + 1 : null,
                totalPages
            }
        }

    }



    
    async getApplication(id: string,user: UserPayLoad){

        const application= await this.prisma.application.findUnique({
            where: {
                id
            },
            include: {
                job: {
                    select: {
                        title: true,
                        type: true,
                        company: {
                            select: {
                                name: true,
                                slug: true,
                                ownerId: true
                            }
                        }
                    },
                    
                }
            }
        })
        if(!application) {
            throw new NotFoundException('Application not found')
        }
        if(user.role === 'EMPLOYER') {
            if(application.job.company.ownerId !== user.id){
                throw new UnauthorizedException('You can only view applications for your own company')
            }
        }else if (user.role == 'JOB_SEEKER') {
            if(application.applicantId !== user.id) {
                throw new UnauthorizedException('You can only view your own applications')
            }
        }else if(user.role !== 'ADMIN'){
            throw new UnauthorizedException('You cant view this application')
        }
        

        return {
            success: true,
            data: {
                ...application,
                job: {
                    ...application.job,
                    company: {
                        name: application.job.company.name,
                        slug: application.job.company.slug
                    }
                }
            }
        }
    }

    async updateApplicationAdmin(id: string,user: UserPayLoad, updatedData: UpdateApplicationAdminDto)
      {
        this.ensureRole(user,['ADMIN'])
        const application= await this.findApplicationOrFail(id)
        
        const currentHistory: any[] = Array.isArray(application.statusHistory) ?
        application.statusHistory
        : []
        
        const updatedApplication = await this.prisma.application.update({
            where: {
                id
            },
            data: {
                ...(updatedData.coverLetter !== undefined && {coverLetter: updatedData.coverLetter}),
                ...(updatedData.notes !== undefined && {notes: updatedData.notes}),
                ...(updatedData.expectedSalary !== undefined && {expectedSalary: updatedData.expectedSalary}),
                ...(updatedData.availableFrom !== undefined && {availableFrom: new Date(updatedData.availableFrom)}),
                ...(updatedData.status !== undefined && {status: updatedData.status}),
                statusHistory : updatedData.status !== undefined ?
                    [
                        ...currentHistory,
                        {
                            status: updatedData.status,
                            changedBy: user.id,
                            changedAt: new Date(),
                            previousStatus: application.status
                        }
                    ] : currentHistory,
                    ...(updatedData.status !== undefined && {respondedAt: new Date()}),
            }
        })

        return {
            success: true,
            message: 'Application updated successfully',
            data: updatedApplication
        }
    }

    async updateApplicationEmployer(id: string,
        updatedData: UpdateApplicationEmployerDto, user: UserPayLoad) {

        this.ensureRole(user,['ADMIN','EMPLOYER'])

        const application= await this.findApplicationOrFail(id)

        if(application.job.company.ownerId !== user.id && user.role !== 'ADMIN') {
            throw new UnauthorizedException('You cant update this application')
        }

        const currentHistory: any[]= Array.isArray(application.statusHistory) ?
        application.statusHistory
        : []

        const updatedApplication= await this.prisma.application.update({
            where: {
                id
            },
            data: {
                ...(updatedData.status !== undefined && {status: updatedData.status}),
                ...(updatedData.notes !== undefined && {notes: updatedData.notes}),
                statusHistory: updatedData.status !== undefined ?
                [
                    ...currentHistory,
                    {
                        status: updatedData.status,
                        changedBy: user.id,
                        changedAt: new Date(),
                        previousStatus: application.status
                    }
                ] : currentHistory,
                ...(updatedData.status !== undefined && {respondedAt: new Date()}),
            }
        })

        return {
            success: true,
            message: 'Application updated successfully',
            data: updatedApplication
        }
    }
    async updateApplicationJobSeeker(id: string,
        updatedData: UpdateApplicationJobSeekerDto, user: UserPayLoad, file?: Express.Multer.File){
         
        this.ensureRole(user,['ADMIN','JOB_SEEKER'])

        const application= await this.findApplicationOrFail(id)

        if (application.applicantId !== user.id) {
            throw new UnauthorizedException('You can only update your own application');
        }

        let resumeUrl: string | undefined
        if(file) {
            if(application.resumeUrl) {
                const part= application.resumeUrl.split('/')
                const fileName=  part[ part.length - 1]
                const public_id= `applications/${fileName.split('.')[0]}`
                await this.cloudinaryService.deleteFile(public_id)
            }
            const uploadedFile= await this.cloudinaryService.uploadFile(file,'applications') as UploadApiResponse
            resumeUrl= uploadedFile.secure_url
        }    

        const updatedApplication= await this.prisma.application.update({
            where: {
                id
            },
            data: {
                ...(updatedData.expectedSalary !== undefined && {expectedSalary: updatedData.expectedSalary}),
                ...(updatedData.availableFrom !== undefined && {availableFrom: new Date(updatedData.availableFrom)}),
                ...(updatedData.coverLetter!== undefined && {coverLetter: updatedData.coverLetter}),
                ...(resumeUrl !== undefined && {resumeUrl})
        }})

        return {
            success: true,
            message: 'Applicaiton updated successfully',
            data: updatedApplication
        }
    }

    async deleteApplication(id: string, user: UserPayLoad) {
        const application= await this.findApplicationOrFail(id)

        if(user.role == 'JOB_SEEKER' && application.applicantId !== user.id) {
            throw new UnauthorizedException('You can only delete your own applications')
        }
        if(user.role == 'EMPLOYER' && application.job.company.ownerId !== user.id) {
            throw new UnauthorizedException('You can only delete applications for your own company')
        }
        console.log('yoyoyooyoyo')    
        if(application.resumeUrl) {
             try {
             const public_id = application.resumeUrl
                .split('/')
                .slice(-2)
                .join('/')
                .split('.')[0];
            await this.cloudinaryService.deleteFile(public_id);
        }catch (error) {
           console.warn('Failed to delete file from Cloudinary:', error.message);
        } 
        }
        await this.prisma.application.delete({
            where: {
                id
            }
        })
        return {
            success: true,
            message: 'Application deleted successfully',
        };
    }


    private ensureRole(user: UserPayLoad, role: string[]) {
        if(!role.includes(user.role)) {
            throw new UnauthorizedException('You do not have permission to do this action')
        }
    }
    private async findApplicationOrFail(id: string) {
        const application= await this.prisma.application.findUnique({
            where: {
                id
            },
            include: {
                job: {
                    select: {
                        company: true
                    }
                }
        }
        })    
        if(!application) {
            throw new NotFoundException('Application not found')
        }
        return application
    }
    
}


