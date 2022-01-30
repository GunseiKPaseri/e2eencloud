import { Client, ClientConfig, configLogger } from './deps.ts';

// ロギング
await configLogger({ enable: false });

const connectionParam: ClientConfig = {
  hostname: 'localhost',
  username: 'root',
  password: 'Passw0rd',
  db: 'e2ee',
};

const client = await new Client().connect(connectionParam);

export default client;
