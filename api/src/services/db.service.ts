import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { CfgService } from './cfg.service';
import { PixelDto } from 'src/dto/pixel.dto';
import { LogDto } from 'src/dto/log.dto';
import knex from 'knex';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

@Injectable()
export class DbService implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly cfg: CfgService) {}
  private knex: knex.Knex;

  async onModuleInit() {
    if (this.cfg.dbSqliteEnabled) {
      const dir = dirname(this.cfg.dbSqliteFilePath);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      this.knex = knex({
        client: 'sqlite3',
        connection: {
          filename: this.cfg.dbSqliteFilePath,
        },
        useNullAsDefault: true,
      });
    } else {
      this.knex = knex({
        client: 'pg',
        connection: {
          host: this.cfg.dbPostgresHost,
          port: this.cfg.dbPostgresPort,
          user: this.cfg.dbPostgresUser,
          password: this.cfg.dbPostgresPassword,
          database: this.cfg.dbPostgresDb,
        },
      });
    }
    await this.knex.raw('SELECT 1;');
  }

  async onModuleDestroy() {
    await this.knex.destroy();
  }

  getKnex(): knex.Knex {
    return this.knex;
  }

  async getPixels(page = 0): Promise<PixelDto[]> {
    return await this.knex('pixels')
      .select('*')
      .orderBy('timestamp', 'desc')
      .limit(100)
      .offset(page * 100);
  }

  async getLogs(page = 0, pixel?: string): Promise<LogDto[]> {
    const res = pixel
      ? await this.knex('logs')
          .select('*')
          .orderBy('timestamp', 'desc')
          .where('pixel', pixel)
          .limit(100)
          .offset(page * 100)
      : await this.knex('logs')
          .select('*')
          .orderBy('timestamp', 'desc')
          .limit(100)
          .offset(page * 100);
    return res;
  }

  async getPixel(id: string): Promise<PixelDto | null> {
    const res = await this.knex('pixels').select('*').where('id', id).first();
    return res || null;
  }

  async addPixel(pixel: PixelDto): Promise<void> {
    await this.knex('pixels').insert(pixel);
  }

  async deletePixel(id: string): Promise<void> {
    await this.knex('pixels').where('id', id).del();
  }

  async addLog(log: LogDto): Promise<void> {
    await this.knex('logs').insert(log);
  }
}
