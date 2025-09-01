import { Injectable } from '@nestjs/common';
import { $bool, $min, $range, $str } from '@scolastico-dev/env-helper';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class CfgService {
  /** @hidden */
  constructor() {
    if (this.authDisabled) return;
    if (!this.authClientId || !this.authClientSecret)
      throw new Error('Missing AUTH_CLIENT_ID or AUTH_CLIENT_SECRET');
    if (this.oidcIssuerUrl) return;
    if (!this.oAuth2AuthUrl || !this.oAuth2TokenUrl || !this.oAuth2UserInfoUrl)
      throw new Error(
        'Missing OAUTH2_AUTH_URL, OAUTH2_TOKEN_URL or OAUTH2_USER_INFO_URL',
      );
  }

  /**
   * If sqlite is used instead of postgresql
   * @example DB_SQLITE_ENABLED=true
   * @default false
   */
  readonly dbSqliteEnabled = $bool('DB_SQLITE_ENABLED', false);

  /**
   * The sqlite file path
   * @example DB_SQLITE_FILE_PATH=/path/to/sqlite.db
   * @default ./data/sqlite.db
   */
  readonly dbSqliteFilePath = $str('DB_SQLITE_FILE_PATH', './data/sqlite.db');

  /**
   * The postgresql host
   * @example DB_POSTGRES_HOST=localhost
   * @default localhost
   */
  readonly dbPostgresHost = $str('DB_POSTGRES_HOST', 'db');

  /**
   * The postgresql port
   * @example DB_POSTGRES_PORT=5432
   * @default 5432
   */
  readonly dbPostgresPort = $range('DB_POSTGRES_PORT', 0, 65535, 5432);

  /**
   * The postgresql database name
   * @example DB_POSTGRES_DB=pixmail
   * @default pixmail
   */
  readonly dbPostgresDb = $str('DB_POSTGRES_DB', 'pixmail');

  /**
   * The postgresql user
   * @example DB_POSTGRES_USER=pixmail
   * @default pixmail
   */
  readonly dbPostgresUser = $str('DB_POSTGRES_USER', 'pixmail');

  /**
   * The postgresql password
   * @example DB_POSTGRES_PASSWORD=secret
   * @default pixmail
   */
  readonly dbPostgresPassword = $str('DB_POSTGRES_PASSWORD', 'pixmail');

  /**
   * Allow reverting migrations, needed to downgrade a newer db version.
   * WARNING: This can lead to data loss!
   * @example DB_ALLOW_REVERTING_MIGRATIONS=true
   * @default false
   */
  readonly dbAllowRevertingMigrations = $bool(
    'DB_ALLOW_REVERTING_MIGRATIONS',
    false,
  );

  /**
   * Delete old logs after n minutes, zero to disable
   * @example LOGS_DELETE_OLD_AFTER=60
   * @default 0
   */
  readonly logsDeleteOldAfter = $min('LOGS_DELETE_OLD_AFTER', 0, 0);

  /**
   * The JWT secret
   * @example JWT_SECRET=supersecret
   */
  readonly jwtSecret = $str('JWT_SECRET', Math.random().toString(36).slice(-8));

  /**
   * Default pixel image, also used if no pixel was found
   * @example DEFAULT_PIXEL_IMAGE=https://example.com/my-pixel.png
   * @default https://placehold.co/1x1
   */
  readonly defaultPixelImage = $str(
    'DEFAULT_PIXEL_IMAGE',
    'https://placehold.co/1x1',
  );

  /**
   * Disable authentication
   * @example AUTH_DISABLED=true
   * @default false
   */
  readonly authDisabled = $bool('AUTH_DISABLED', false);

  /**
   * The auth (oidc or oauth2) client id
   * @example AUTH_CLIENT_ID=supersecret
   */
  readonly authClientId = $str('AUTH_CLIENT_ID', '');

  /**
   * The auth (oidc or oauth2) client secret
   * @example AUTH_CLIENT_SECRET=supersecret
   */
  readonly authClientSecret = $str('AUTH_CLIENT_SECRET', '');

  /**
   * The OIDC issuer url, oAuth2 config is not required if OIDC issuer is set.
   * @example OIDC_ISSUER_URL=https://example.com/oidc
   * @default ''
   */
  readonly oidcIssuerUrl = $str('OIDC_ISSUER_URL', '');

  /**
   * The oAuth2 token url
   * @example OAUTH2_TOKEN_URL=https://example.com/oauth2/token
   * @default ''
   */
  readonly oAuth2TokenUrl = $str('OAUTH2_TOKEN_URL', '');

  /**
   * The oAuth2 authorization url
   * @example OAUTH2_AUTH_URL=https://example.com/oauth2/auth
   * @default ''
   */
  readonly oAuth2AuthUrl = $str('OAUTH2_AUTH_URL', '');

  /**
   * The oAuth2 user info url
   * @example OAUTH2_USER_INFO_URL=https://example.com/oauth2/userinfo
   * @default ''
   */
  readonly oAuth2UserInfoUrl = $str('OAUTH2_USER_INFO_URL', '');

  /**
   * The oAuth2 scope
   * @example OAUTH2_SCOPE=openid
   * @default 'openid'
   */
  readonly oAuth2Scope = $str('OAUTH2_SCOPE', 'openid');
}
