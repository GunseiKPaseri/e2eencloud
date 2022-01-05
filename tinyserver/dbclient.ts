import { Client, configLogger } from "https://deno.land/x/mysql/mod.ts";

// ロギング
await configLogger({ enable: false });

const connectionParam = {
  hostname: 'localhost',
  username: 'root',
  password: 'Passw0rd',
  db: 'e2ee',
}

const client = await new Client().connect(connectionParam);

export default client;