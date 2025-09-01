import { Module } from '@nestjs/common';
import { LogReadController } from './controller/log/read.controller';
import { PixelCreateController } from './controller/pixel/create.controller';
import { PixelReadController } from './controller/pixel/read.controller';
import { PixelDeleteController } from './controller/pixel/delete.controller';
import { AuthController } from './controller/auth.controller';
import { TrackingController } from './controller/tracking.controller';
import { CfgService } from './services/cfg.service';
import { DbService } from './services/db.service';
import { MigrationService } from './services/migration.service';
import { JwtService } from './services/jwt.service';
import { OidcService } from './services/oidc.service';
import { AuthGuard } from './auth.guard';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
  ],
  controllers: [
    LogReadController,
    PixelCreateController,
    PixelReadController,
    PixelDeleteController,
    AuthController,
    TrackingController,
  ],
  providers: [
    CfgService,
    DbService,
    MigrationService,
    JwtService,
    OidcService,
    AuthGuard,
  ],
})
export class AppModule {}
