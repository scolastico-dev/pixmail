import { Injectable, Logger } from '@nestjs/common';
import { CfgService } from './cfg.service';
import axios, { AxiosError } from 'axios';

type OAuthConfig = {
  tokenUrl: string;
  authUrl: string;
  userInfoUrl: string;
};

@Injectable()
export class OidcService {
  private readonly logger = new Logger(OidcService.name);
  private cache: OAuthConfig | null = null;
  constructor(private readonly cfg: CfgService) {}

  async getConfig(): Promise<OAuthConfig> {
    if (this.cache) return this.cache;
    if (this.cfg.oidcIssuerUrl) {
      const { data } = await axios.get(this.cfg.oidcIssuerUrl);
      this.cache = {
        tokenUrl: data.token_endpoint,
        authUrl: data.authorization_endpoint,
        userInfoUrl: data.userinfo_endpoint,
      };
    } else {
      this.cache = {
        tokenUrl: this.cfg.oAuth2TokenUrl,
        authUrl: this.cfg.oAuth2AuthUrl,
        userInfoUrl: this.cfg.oAuth2UserInfoUrl,
      };
    }
    return this.cache;
  }

  async getAuthUrl(callbackUrl: string, state: string): Promise<string> {
    const cfg = await this.getConfig();
    const authUrl = new URL(cfg.authUrl);
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('redirect_uri', callbackUrl);
    authUrl.searchParams.append('client_id', this.cfg.authClientId);
    authUrl.searchParams.append('scope', this.cfg.oAuth2Scope);
    authUrl.searchParams.append('response_type', 'code');
    return authUrl.toString();
  }

  async getToken(redirectUrl: string, code: string): Promise<string> {
    const cfg = await this.getConfig();
    const params = new URLSearchParams();
    params.append('client_id', this.cfg.authClientId);
    params.append('client_secret', this.cfg.authClientSecret);
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', redirectUrl);
    params.append('scope', this.cfg.oAuth2Scope);
    return await axios
      .post(cfg.tokenUrl, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(
            `${this.cfg.authClientId}:${this.cfg.authClientSecret}`,
          ).toString('base64')}`,
        },
      })
      .then((res) => res.data.access_token)
      .catch((err) => {
        if (err instanceof AxiosError) {
          this.logger.error('Code:', err.response?.status);
          this.logger.error('Data:', err.response?.data);
        }
        throw err;
      });
  }

  async getUserInfo(token: string): Promise<any> {
    const cfg = await this.getConfig();
    return await axios
      .get(cfg.userInfoUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => res.data)
      .catch((err) => {
        if (err instanceof AxiosError) {
          this.logger.error('Code:', err.response?.status);
          this.logger.error('Data:', err.response?.data);
        }
        throw err;
      });
  }
}
