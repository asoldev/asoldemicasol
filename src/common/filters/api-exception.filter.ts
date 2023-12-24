import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { LoggerService } from 'src/shared/logging/logger.service';
import { ApiException } from '../exceptions/api.exception';
import { ResponseDto } from '../class/res.class';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  constructor(private logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<FastifyReply>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    response.header('Content-Type', 'application/json; charset=utf-8');

    const code =
      exception instanceof ApiException
        ? (exception as ApiException).getErrorCode()
        : status;

    let message = 'Server exception, please try again later';

    message =
      exception instanceof HttpException ? exception.message : `${exception}`;

    if (status >= 500) {
      this.logger.error(exception, ApiExceptionFilter.name);
    }

    const result = new ResponseDto(code, null, message);

    response.status(status).send(result);
  }
}
