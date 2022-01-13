import { Client, ClientConfig, configLogger } from "https://deno.land/x/mysql@v2.10.2/mod.ts";

// ロギング
await configLogger({ enable: false });

const connectionParam: ClientConfig = {
  hostname: "localhost",
  username: "root",
  password: "Passw0rd",
  db: "e2ee",
};

const client = await new Client().connect(connectionParam);

export default client;
