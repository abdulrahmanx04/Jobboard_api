import { ExceptionFilter,Catch,ArgumentsHost,HttpException,HttpStatus } from "@nestjs/common";  
import { ThrottlerException } from "@nestjs/throttler";
import { Prisma } from "@prisma/client";


@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const response= host.switchToHttp().getResponse()
        let status: number= HttpStatus.INTERNAL_SERVER_ERROR
        let message: any
        
        if(exception instanceof HttpException) {
            status= exception.getStatus()
            const exceptionResponse= exception.getResponse()
            message= typeof exceptionResponse === 'string'?
            {success: false, message: exceptionResponse}
            :{success: false, ...exceptionResponse}
        } else if (exception instanceof ThrottlerException) {
            status= exception.getStatus()
            message= {
                    success: false,
                    message: 'Too many requests. Please try again later.',
                    error: 'Rate Limit Exceeded',
            }
        }
        else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
            if(exception.code === 'P2002') {
                status= HttpStatus.CONFLICT
                message= {
                    success: false,
                    message: `Duplicated Field: 
                    ${Array.isArray(exception.meta?.target) ? 
                     exception.meta.target.join(', ') : exception.meta?.target}`
                }
            }
            else if(exception.code === 'P2003'){
                status= HttpStatus.BAD_REQUEST
                message= {
                    success: false,
                    message: `Foreign key error:
                    ${exception.meta?.field_name ?? 'related field'}`
                }
            } else if(exception.code === 'P2000') {
                status= HttpStatus.BAD_REQUEST
                message= {
                    success: false,
                    message: 'Invalid value'
                }
            } else if (exception.code === 'P2025'){
                status= HttpStatus.NOT_FOUND
                message = {
                    success: false,
                    message: 'Record not found'
                }
            }
            else {
                status= HttpStatus.INTERNAL_SERVER_ERROR
                message= {
                    success: false,
                    message: 'Internal server error'
                }
            }
        }
        else if(exception instanceof Prisma.PrismaClientValidationError) {
            status = HttpStatus.BAD_REQUEST
           
            const regex =/Unknown Argument `([\w.]+)`|Unknown field `([\w.]+)`| Argument `([\w.]+)`|Invalid value for argument `([\w.]+)`/;
            const fieldMatch = exception.message.match(regex);
            const field = fieldMatch ? (fieldMatch[1] || fieldMatch[2] || fieldMatch[3] || fieldMatch[4]) : 'unknown field';
            message= {
                success: false,
                message: `Prisma validation error: ${field}`
            }
        } 
        else {
             status= HttpStatus.INTERNAL_SERVER_ERROR
             message= {
                success: false,
                message: 'Internal server error'
            } 
        }

        response.status(status).json({
            ...message,
            timestamps: new Date().toISOString(),
        })
    }
}