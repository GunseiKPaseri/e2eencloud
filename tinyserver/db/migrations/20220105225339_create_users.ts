import { AbstractMigration, ClientMySQL } from "https://deno.land/x/nessie@2.0.4/mod.ts";

export default class extends AbstractMigration<ClientMySQL> {
  /** Runs on migrate */
  async up(): Promise<void> {
    await this.client.query(`
      CREATE TABLE users (
        id varchar(60) unique,
        client_random_value varchar(24),
        encrypted_master_key varchar(24),
        hashed_authentication_key varchar(44),
        created_at datetime default current_timestamp,
        updated_at timestamp default current_timestamp on update current_timestamp,
        INDEX(id)
      )`);
  }

  /** Runs on rollback */
  async down(): Promise<void> {
    await this.client.query("DROP TABLE users");
  }
}
