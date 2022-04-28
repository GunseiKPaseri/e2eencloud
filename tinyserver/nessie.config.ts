import { ClientMySQL, DB_HOSTNAME, DB_NAME, DB_PASS, DB_PORT, DB_USER } from './deps.ts';
import type { NessieConfig } from './deps.ts';

/** Select one of the supported clients */
// const client = new ClientPostgreSQL({
//     database: "nessie",
//     hostname: "localhost",
//     port: 5432,
//     user: "root",
//     password: "pwd",
// });

const client = new ClientMySQL({
  hostname: DB_HOSTNAME,
  port: DB_PORT,
  username: DB_USER,
  password: DB_PASS,
  db: DB_NAME,
});

// const client = new ClientSQLite("./sqlite.db");

/** This is the final config object */
const config: NessieConfig = {
  client,
  migrationFolders: ['./db/migrations'],
  seedFolders: ['./db/seeds'],
};

export default config;
