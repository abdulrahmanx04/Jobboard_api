import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserPayLoad } from 'src/common/interfaces/all-interfaces';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCompanydDto } from './DTO/create-company-dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UploadApiResponse } from 'cloudinary';
import { GetCompaniesDto } from './DTO/GetCompaniteDto';

import { UpdateCompanyDto } from './DTO/update-company-dto';

@Injectable()
export class CompaniesService {
    constructor(private prisma: PrismaService,
        private cloudinaryService: CloudinaryService
    ) {}

    async createCompany(dto: CreateCompanydDto,user: UserPayLoad,file?: Express.Multer.File) {

        if(user.role !== 'ADMIN' && user.role !== 'EMPLOYER'){
            throw new UnauthorizedException('Only admin and employers can create companies')
        }
        
        let logo: string | null = null
        if(file) {
            const uploadFile= await this.cloudinaryService.uploadFile(file,'logo') as UploadApiResponse
            logo= uploadFile.secure_url
        }

        let socialLinks: Record<string , string> | undefined

        if(dto.socialLinks) {
            socialLinks = JSON.parse(dto.socialLinks)
        }

        const company = await this.prisma.company.create({
            data: {
                name: dto.name,
                email: dto.email,
                phone: dto.phone,
                slug: dto.slug,
                logo,
                description: dto.description,
                website: dto.website,
                industry: dto.industry,
                companySize: dto.companySize,
                foundedYear: dto.foundedYear,
                socialLinks,
                benefits: dto.benefits,
                culture: dto.culture,
                owner: {
                    connect: {id: user.id}
                }
            },include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email :true
                    }
                }
            }
        })

        return {
            success: true,
            message: 'Company created successfully',
            data: company
        }
    }

    async getCompanies(query: GetCompaniesDto) {
        const {
            page= 1,
            limit= 10,
            search,
            industry,
            email,
            slug,
            companySize,
            location
        }= query

        const skip= (page - 1)  * limit

        const where: any = {}
        if(industry) where.industry = {contains: industry, mode: 'insensitive'}

        if(email) where.email = email

        if(slug) where.slug= {contains: slug, mode: 'insensitive'}

        if(location) where.headquarters = {contains: location, mode: 'insensitive'}

        if(companySize) where.companySize = companySize


        if(search) {
            where.OR= [
                {name: {contains: search, mode: 'insensitive'}},
                {description: {contains: search, mode: 'insensitive'}}
            ]
        }
       
       
        const [companies,total] = await Promise.all([
                    this.prisma.company.findMany({
                        where,
                        take: limit,
                        skip,
                        orderBy: {createdAt: 'desc'},
                    }),
                    this.prisma.company.count({where})
        ])
    
        
        const totalPages= Math.ceil(total / limit)

        return {
            success: true,
            data: companies,
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

       
    async getCompany(id: string) {

        const company= await this.prisma.company.findUnique({
            where: {
                id
            },
            include : {
                jobs: {
                    select: {
                        id: true,
                        title: true,
                        location: true,
                        type: true,
                        status: true,
                        createdAt: true,
                    }
                }
            }
        })

        if(!company) {
            throw new NotFoundException('Company not found')
        }

        return {
            success: true,
            data: company
        }
    }

    async updateCompany(id: string, dto: UpdateCompanyDto,user: UserPayLoad,file?: Express.Multer.File) {

        const company= await this.prisma.company.findUnique({
            where: {
                id
            }
        })

        if(!company) {
            throw new NotFoundException('Company not found')
        }

        if(user.role !== 'ADMIN' && company.ownerId !== user.id) {
            throw new UnauthorizedException('Only admin and company owner can update companies')
        }
        
        let logo: string | undefined
         if(file) {
            const uploadFile = await this.cloudinaryService.uploadFile(file, 'logo') as UploadApiResponse
            logo = uploadFile.secure_url
        }

        let socialLinks: Record<string, string> | undefined
        if(dto.socialLinks) {
            socialLinks= JSON.parse(dto.socialLinks)
        }
        
        
        const updatedCompany = await this.prisma.company.update({
            where: {
                id
            },
            data: {
                ...(dto.name !== undefined && {name: dto.name}),
                ...(dto.description !== undefined && {description: dto.description}),
                ...(dto.email !== undefined && {email: dto.email}),
                ...(dto.phone !== undefined && {phone: dto.phone}),
                ...(dto.slug !== undefined && {slug: dto.slug}),
                ...(dto.website !== undefined && {website: dto.website}),
                ...(dto.industry !== undefined && {industry: dto.industry}),
                ...(dto.companySize !== undefined && {companySize: dto.companySize}),
                ...(dto.foundedYear !== undefined && {foundedYear: dto.foundedYear}),
                ...(socialLinks !== undefined && {socialLinks}),
                ...(dto.benefits !== undefined && {benefits: dto.benefits}),
                ...(dto.culture !== undefined && {culture: dto.culture}),
                ...(dto.headquarters !== undefined && {headquarters: dto.headquarters}),
                logo: logo ??  null
            }
        })

        return {
            success: true,
            message: 'Company updated successfully',
            data: company
        }
    }

    async deleteCompany(id: string, user: UserPayLoad) {
        const company= await this.prisma.company.findUnique({
            where: {
                id
            }
        })

        if(!company) {
            throw new NotFoundException('Company not found')
        }

        if(user.role !== 'ADMIN' && company.ownerId !== user.id) {
            throw new UnauthorizedException('Only admin and company owner can update companies')
        }

        if(company.logo) {
            const url= company.logo.split('/')
            const logoName= url[url.length - 1]
            const public_id= `logo/${logoName.split('.')[0]}`
            await this.cloudinaryService.deleteFile(public_id)
        }

        await this.prisma.company.delete({
            where: {
                id
            }
        })

        return {
            success: true,
            message: 'Company deleted successfully'
        }
    }
}
