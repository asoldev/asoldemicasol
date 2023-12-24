import {
  HttpStatus,
  Logger,
  UnprocessableEntityException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ApiExceptionFilter } from './common/filters/api-exception.filter';
import { ApiTransformInterceptor } from './common/interceptors/api-transform.interceptor';
import { AppModule } from './modules/app.module';
import { setupSwagger } from './setup-swagger';
import { LoggerService } from './shared/logging/logger.service';
import { LoggingInterceptor } from './shared/logging/logging.interceptor';

const SERVER_PORT = process.env.SERVER_PORT;

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      bufferLogs: true,
    },
  );

  app.enableCors();
  app.useLogger(app.get(LoggerService));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      exceptionFactory: (errors: ValidationError[]) => {
        return new UnprocessableEntityException(
          errors
            .filter((item) => !!item.constraints)
            .flatMap((item) => Object.values(item.constraints))
            .join('; '),
        );
      },
    }),
  );
  app.useGlobalFilters(new ApiExceptionFilter(app.get(LoggerService)));
  app.useGlobalInterceptors(
    new ApiTransformInterceptor(new Reflector()),
    new LoggingInterceptor(app.get(LoggerService)),
  );
  setupSwagger(app);
  await app.listen(SERVER_PORT, '0.0.0.0');
  const serverUrl = await app.getUrl();
  Logger.log(`API service has been started, please visit: ${serverUrl}`);
  Logger.log(
    `API document has been generated, please visit: ${serverUrl}/${process.env.SWAGGER_PATH}/`,
  );
}

bootstrap();
