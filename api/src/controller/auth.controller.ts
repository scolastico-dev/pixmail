import { Controller, Get, HttpStatus, Query, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { CfgService } from 'src/services/cfg.service';
import { JwtService } from 'src/services/jwt.service';
import { OidcService } from 'src/services/oidc.service';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly jwt: JwtService,
    private readonly oidc: OidcService,
    private readonly cfg: CfgService,
  ) {}

  @Get('login')
  async login(@Req() req: Request, @Res() res: Response): Promise<void> {
    const url = new URL(`${req.protocol}://${req.get('host')}`);
    url.pathname = '/auth/callback';
    res.redirect(
      await this.oidc.getAuthUrl(
        url.toString(),
        Math.random().toString(36).substring(2),
      ),
    );
  }

  @Get('callback')
  async callback(
    @Req() req: Request,
    @Res() res: Response,
    @Query('state') state: string,
    @Query('code') code: string,
    @Query('error') error?: string,
  ): Promise<void> {
    if (error) {
      res.status(HttpStatus.UNAUTHORIZED).send(error);
      return;
    }

    if (!state || !code) {
      res
        .header({ Refresh: '5; url=/' })
        .status(HttpStatus.UNAUTHORIZED)
        .send('Invalid request');
      return;
    }

    const callbackUrl = new URL(`${req.protocol}://${req.get('host')}`);
    callbackUrl.pathname = '/auth/callback';

    const token = await this.oidc.getToken(callbackUrl.toString(), code);
    const user = await this.oidc.getUserInfo(token);
    const jwt = this.jwt.sign({
      sub: user.sub,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    });

    res.cookie('jwt', jwt, {
      httpOnly: true,
      expires: new Date(Date.now() + 60 * 60 * 23 * 1000),
    });
    res.redirect('/');
  }
}
