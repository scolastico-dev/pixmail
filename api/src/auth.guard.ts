import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from './services/jwt.service';
import { CfgService } from './services/cfg.service';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly cfg: CfgService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (this.cfg.authDisabled) return true;
    const request = context.switchToHttp().getRequest();
    const cookies = request.headers.cookie;
    const token = cookies
      ?.split('; ')
      .find((r: string) => r.startsWith('jwt='))
      ?.split('=')[1];
    if (!token) return false;
    return !!this.jwt.validate(token);
  }
}
