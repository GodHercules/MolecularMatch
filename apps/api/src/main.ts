import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";
import { ResponseTransformInterceptor } from "./common/interceptors/response-transform.interceptor";
import { StructuredLogger } from "./common/structured-logger";

async function bootstrap() {
  const logger = new StructuredLogger();
  const app = await NestFactory.create(AppModule, { logger });

  const config = app.get(ConfigService);
  const port = config.get<number>("API_PORT") ?? 4000;
  const corsOrigin = config.get<string>("CORS_ORIGIN") ?? "http://localhost:3000";

  app.enableCors({ origin: corsOrigin, credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true })
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new ResponseTransformInterceptor());

  const swaggerConfig = new DocumentBuilder()
    .setTitle("MolecularMatch API")
    .setDescription("API para correspondencia molecular por massa")
    .setVersion("0.1.0")
    .addApiKey({ type: "apiKey", name: "x-admin-password", in: "header" }, "admin")
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("swagger", app, document);

  await app.listen(port);
  logger.log(`API em execucao na porta ${port}`);
}

bootstrap();

