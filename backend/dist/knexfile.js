"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
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
exports.default = config;
//# sourceMappingURL=knexfile.js.map