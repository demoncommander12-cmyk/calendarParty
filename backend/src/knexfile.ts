import { Knex } from 'knex';

const config: { [key: string]: Knex.Config } = {

  development: {
    client: 'pg',
    connection: {
      host: 'localhost',
      port: 5432,
      database: 'scheduler_db',
      user: 'scheduler_user',
      password: 'scheduler_pass'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations'
    }
  },

  production: {
    client: 'pg',
    connection: {
      host: 'localhost',
      port: 5432,
      database: 'scheduler_db',
      user: 'scheduler_user',
      password: 'scheduler_pass'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations'
    }
  }

};

export default config;
