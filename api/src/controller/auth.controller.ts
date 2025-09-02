import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
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

  readonly expiresIn = 60 * 60 * 24 * 1000;

  @Get('token')
  async showTokenLogin(@Res() res: Response): Promise<void> {
    res.header('Content-Type', 'text/html');
    res.send(`
      <html>
        <body>
          <h1>Token Login</h1>
          <form action="/auth/token" method="post">
            <input type="text" name="token" placeholder="Enter your token" />
            <button type="submit">Login</button>
          </form>
        </body>
      </html>
    `);
  }

  @Post('token')
  async token(@Req() req: Request, @Res() res: Response): Promise<void> {
    if (req.body.token !== this.cfg.authToken) {
      res.status(HttpStatus.UNAUTHORIZED).send('Invalid token');
      return;
    }
    res.cookie(
      'jwt',
      this.jwt.sign({
        sub: 'api-token-user',
        exp: Math.floor((Date.now() + this.expiresIn) / 1000),
      }),
      {
        httpOnly: true,
        expires: new Date(Date.now() + this.expiresIn - 60_000),
      },
    );
    res.redirect('/');
  }

  @Get('login')
  async login(@Req() req: Request, @Res() res: Response): Promise<void> {
    if (
      this.cfg.authDisabled ||
      !this.cfg.authClientId ||
      !this.cfg.authClientSecret
    ) {
      res.redirect('/auth/token');
      return;
    }
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
    if (
      this.cfg.authDisabled ||
      !this.cfg.authClientId ||
      !this.cfg.authClientSecret
    )
      throw new HttpException(
        'Authentication is disabled',
        HttpStatus.BAD_REQUEST,
      );

    if (error) throw new HttpException(error, HttpStatus.UNAUTHORIZED);

    if (!state || !code)
      throw new HttpException('Invalid request', HttpStatus.BAD_REQUEST);

    const callbackUrl = new URL(`${req.protocol}://${req.get('host')}`);
    callbackUrl.pathname = '/auth/callback';

    const token = await this.oidc.getToken(callbackUrl.toString(), code);
    const user = await this.oidc.getUserInfo(token);
    const jwt = this.jwt.sign({
      sub: user.sub,
      exp: Math.floor((Date.now() + this.expiresIn) / 1000),
    });

    res.cookie('jwt', jwt, {
      httpOnly: true,
      expires: new Date(Date.now() + this.expiresIn - 60_000),
    });
    res.redirect('/');
  }
}
