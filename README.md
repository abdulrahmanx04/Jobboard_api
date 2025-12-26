# Job Board API

A professional job board platform built with **NestJS** and **PostgreSQL**, featuring role-based access control, advanced job matching, and comprehensive application management.

## Overview

The Job Board API is a full-featured backend service that enables:
- **User Management**: Registration, authentication, and profile management with role-based access control
- **Job Postings**: Companies can create, manage, and track job listings
- **Job Applications**: Job seekers can apply for positions with resumes and cover letters
- **Company Profiles**: Companies can create and manage their profiles
- **Security**: JWT authentication, rate limiting, XSS protection, and helmet security headers

## Tech Stack

- **Framework**: NestJS 11
- **Language**: TypeScript 5
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with Passport
- **Image Management**: Cloudinary
- **Email**: Nodemailer
- **Security**: Helmet, XSS-Clean, Rate Limiting
- **Testing**: Jest with Supertest
- **API Documentation**: Swagger/OpenAPI

## Features

### Authentication & Authorization
- User registration with email verification
- Login with JWT tokens (access & refresh tokens)
- Password reset and change functionality
- Role-based access control (JOB_SEEKER, EMPLOYER, ADMIN)
- Secure token management with expiration

### Job Management
- Post job listings with detailed requirements and benefits
- Filter jobs by type, experience level, location, salary, and status
- Job status tracking (DRAFT, OPEN, CLOSED, FILLED)
- Multiple job types: FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, FREELANCE
- Experience level filtering: ENTRY, JUNIOR, MID, SENIOR, LEAD, EXECUTIVE
- Job expiration handling

### Application System
- Submit job applications with resume and cover letter
- Track application status: PENDING, REVIEWING, SHORTLISTED, INTERVIEW, ACCEPTED, REJECTED, WITHDRAWN
- Application history and status change tracking
- Expected salary and availability information
- Unique constraint to prevent duplicate applications

### Company Management
- Company profile creation and management
- Logo and media uploads via Cloudinary
- Social links and company metadata
- Industry classification and company size tracking
- Verified company status

### Security Features
- **Rate Limiting**: Multiple throttle strategies (default, strict, medium)
- **XSS Protection**: XSS-Clean middleware
- **Helmet**: Comprehensive security headers with CSP
- **CORS**: Configurable cross-origin requests
- **Data Validation**: Class-validator and class-transformer
- **Input Sanitization**: XSS protection on all inputs

## Database Schema

### Models

**User**
- Authentication and profile information
- Multiple roles: JOB_SEEKER, EMPLOYER, ADMIN
- Email verification and password reset tokens
- Bio, phone, and avatar fields

**Company**
- Company details and metadata
- Owner relationship (one-to-many with User)
- Social links and company size information
- Industry classification

**Job**
- Job posting details with title, description, location
- Salary range with currency support
- Job type and experience level
- Status tracking
- Relationships with Company and User (employer)

**Application**
- Job application tracking
- Applicant and job relationships
- Resume upload and cover letter
- Application status with history
- Expected salary and availability info

**Enums**
- `Role`: JOB_SEEKER, EMPLOYER, ADMIN
- `JobType`: FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, FREELANCE
- `JobStatus`: DRAFT, OPEN, CLOSED, FILLED
- `ApplicationStatus`: PENDING, REVIEWING, SHORTLISTED, INTERVIEW, ACCEPTED, REJECTED, WITHDRAWN
- `ExperienceLevel`: ENTRY, JUNIOR, MID, SENIOR, LEAD, EXECUTIVE

## Project Structure

```
src/
├── auth/                    # Authentication module (login, register, password reset)
├── users/                   # User profile management
├── jobs/                    # Job posting and management
├── applications/            # Application submission and tracking
├── companies/               # Company management
├── cloudinary/              # Image upload integration
├── prisma/                  # Database service
├── common/                  # Shared utilities
│   ├── decorators/         # Custom decorators (@CurrentUser)
│   ├── filters/            # Exception filters
│   ├── guards/             # Authentication guards
│   ├── interfaces/         # TypeScript interfaces
│   └── utils/              # Helper functions
├── app.module.ts           # Root module
└── main.ts                 # Application entry point

prisma/
├── schema.prisma           # Database schema
└── migrations/             # Database migrations

test/
├── app.e2e-spec.ts         # E2E tests
└── jest-e2e.json          # Jest E2E configuration
```

## Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Setup

1. **Clone and install dependencies**
```bash
npm install
```

2. **Configure environment variables**

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/jobboard"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRATION="24h"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_REFRESH_EXPIRATION="7d"

# Frontend
FRONTEND_URL="http://localhost:3001"

# Cloudinary (for image uploads)
CLOUDINARY_NAME="your-cloudinary-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Email (Nodemailer)
MAIL_HOST="smtp.gmail.com"
MAIL_USER="your-email@gmail.com"
MAIL_PASSWORD="your-app-password"
MAIL_FROM="noreply@jobboard.com"
```

3. **Setup database**

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# (Optional) Seed database
npx prisma db seed
```

## Running the Application

### Development
```bash
npm run start
```
The API will be available at `http://localhost:3000`

### Development with debugging
```bash
npm run start:debug
```

### Production
```bash
npm run build
npm run start:prod
```

## API Documentation

Swagger documentation is available at:
```
http://localhost:3000/api/docs
```

### Main Endpoints

#### Auth
- `POST /auth/register` - Register new account
- `POST /auth/login` - Login and get tokens
- `POST /auth/refresh` - Refresh access token
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token
- `PUT /auth/change-password` - Change password (authenticated)
- `POST /auth/verify-email` - Verify email address

#### Users
- `GET /users/:id` - Get user profile
- `PUT /users/:id` - Update user profile
- `DELETE /users/:id` - Delete user account

#### Jobs
- `POST /jobs` - Create job posting (employer only)
- `GET /jobs` - Get all jobs (with filters)
- `GET /jobs/:id` - Get job details
- `PUT /jobs/:id` - Update job (employer only)
- `PATCH /jobs/:id/status` - Update job status
- `DELETE /jobs/:id` - Delete job

#### Applications
- `POST /applications` - Submit job application
- `GET /applications` - Get user applications
- `GET /applications/:id` - Get application details
- `PATCH /applications/:id/status` - Update application status
- `DELETE /applications/:id` - Withdraw application

#### Companies
- `POST /companies` - Create company (employer only)
- `GET /companies` - Get all companies
- `GET /companies/:id` - Get company details
- `PUT /companies/:id` - Update company
- `DELETE /companies/:id` - Delete company

## Testing

### Unit Tests
```bash
npm run test
```

### Test Coverage
```bash
npm run test:cov
```

### E2E Tests
```bash
npm run test:e2e
```

### Watch Mode
```bash
npm run test:watch
```

## Code Quality

### Linting & Formatting
```bash
npm run lint        # Run ESLint
npm run format      # Format code with Prettier
```

## Rate Limiting

The API implements three throttle strategies:

| Strategy | Limit | Window |
|----------|-------|--------|
| `default` | 100 requests | 60 seconds |
| `strict` | 5 requests | 60 seconds |
| `medium` | 10 requests | 1 hour |

Authentication endpoints use stricter limits to prevent brute force attacks.

## Security

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt with salt rounds
- **CORS**: Configurable cross-origin requests
- **Helmet**: Security headers (CSP, X-Frame-Options, etc.)
- **XSS Protection**: Input sanitization and XSS-Clean middleware
- **Rate Limiting**: Prevent brute force and DoS attacks
- **Input Validation**: Class-validator for all DTOs
- **HTTPS Recommended**: Use HTTPS in production

## Error Handling

The API uses a global exception filter that provides:
- Consistent error response format
- Proper HTTP status codes
- Error logging
- Request tracking

## Performance

- Database indexing on frequently queried fields
- Pagination support for large result sets
- Query optimization with Prisma relations
- Caching-ready architecture

## Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT secrets
- [ ] Enable HTTPS
- [ ] Configure CORS for your frontend domain
- [ ] Set up environment variables securely
- [ ] Run database migrations
- [ ] Enable rate limiting
- [ ] Set up monitoring and logging
- [ ] Use PM2 or similar for process management

### Example PM2 Deployment
```bash
npm install -g pm2
npm run build
pm2 start dist/main.js --name "jobboard-api" --instances max
pm2 save
pm2 startup
```

## Troubleshooting

### Database Connection Issues
```bash
# Test connection
npx prisma db execute --stdin < test.sql

# Reset database (development only)
npx prisma migrate reset
```

### Port Already in Use
```bash
# Change port in main.ts or set PORT environment variable
PORT=3001 npm run start
```

### Cloudinary Upload Issues
- Verify API credentials in `.env`
- Check file size limits
- Ensure proper CORS configuration

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

UNLICENSED - All rights reserved

## Support

For issues and feature requests, please contact the development team.

## Changelog

### Version 1.0.0
- Initial release
- User authentication and authorization
- Job posting and management
- Application tracking
- Company profiles
- Cloudinary integration
- Email notifications
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
