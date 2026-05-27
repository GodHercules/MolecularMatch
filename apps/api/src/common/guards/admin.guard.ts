import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const provided = req.headers["x-admin-password"] as string | undefined;
    const expected = this.configService.get<string>("ADMIN_PASSWORD");

    if (!expected) return true;
    if (provided && provided === expected) return true;
    throw new UnauthorizedException("Senha admin invalida");
  }
}

