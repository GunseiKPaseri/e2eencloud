import { Client, ClientConfig, configLogger, DB_HOSTNAME, DB_NAME, DB_PASS, DB_PORT, DB_USER } from './deps.ts';

// ロギング
await configLogger({ enable: false });

const connectionParam: ClientConfig = {
  hostname: DB_HOSTNAME,
  port: DB_PORT,
  username: DB_USER,
  password: DB_PASS,
  db: DB_NAME,
};

const client = await new Client().connect(connectionParam);

export default client;
