import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { DbService } from './db.service';
import { CfgService } from './cfg.service';
import knex from 'knex';

@Injectable()
export class MigrationService implements OnApplicationBootstrap {
  private readonly logger = new Logger(MigrationService.name);
  private readonly breakString = ';;BREAK;;';

  constructor(
    private readonly db: DbService,
    private readonly cfg: CfgService,
  ) {}

  private readonly migrations: ((knex: knex.Knex) => Promise<void>)[] = [
    async (knex) => {
      await knex.schema.createTable('logs', (table) => {
        table.string('id', 32).primary().notNullable();
        table.string('pixel', 32).nullable().index();
        table.string('ip', 45).notNullable().index();
        table.integer('timestamp', 64).notNullable();
        table.string('user_agent', 512).notNullable();
        table.string('label', 2048).notNullable();
      });
      await knex.schema.createTable('pixels', (table) => {
        table.string('id', 32).primary().notNullable();
        table.integer('timestamp', 64).notNullable();
        table.string('img', 2048).notNullable();
        table.string('label', 2048).notNullable();
      });
      await knex('migrations').insert({
        id: 1,
        revert: [
          knex.schema.dropTable('logs').toString(),
          knex.schema.dropTable('pixels').toString(),
        ].join(this.breakString),
      });
    },
  ];

  async onApplicationBootstrap() {
    const knex = this.db.getKnex();
    const hasTable = await knex.schema.hasTable('migrations');
    if (!hasTable) {
      this.logger.log('Creating migrations table');
      await knex.schema.createTable('migrations', (table) => {
        table.integer('id', 4).primary().notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.text('revert').notNullable();
      });
    }
    let level = Number(
      (await knex('migrations').count('id as count').first()).count,
    );
    this.logger.log(`Migrations level: ${level} / ${this.migrations.length}`);

    if (level > this.migrations.length) {
      if (!this.cfg.dbAllowRevertingMigrations) {
        this.logger.fatal(
          'The database seems to be of a newer version than the application and reverting migrations is disabled',
        );
        process.exit(1);
      }
      this.logger.log(
        'Database is newer than the application, reverting migrations...',
      );
      while (level > this.migrations.length) {
        const revertEntry = await knex('migrations')
          .where('id', level)
          .select('revert')
          .first();
        if (!revertEntry) break;
        const statements = revertEntry.revert.split(this.breakString);
        for (const statement of statements) await knex.raw(statement);
        await knex('migrations').where('id', level).del();
        level--;
        this.logger.log(
          `Migrations level: ${level} / ${this.migrations.length}`,
        );
      }
      return;
    }

    if (level < this.migrations.length) {
      while (level < this.migrations.length) {
        this.logger.log(`Running migration ${level + 1}`);
        await knex.transaction(this.migrations[level]);
        level++;
      }
      this.logger.log(
        `Migrated successfully to the latest version (level ${level})`,
      );
    }
  }
}
