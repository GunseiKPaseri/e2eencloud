import { AbstractMigration, ClientMySQL } from "https://deno.land/x/nessie@2.0.4/mod.ts";

export default class extends AbstractMigration<ClientMySQL> {
  /** Runs on migrate */
  async up(): Promise<void> {
    await this.client.query(`
      CREATE TABLE users (
        id int auto_increment NOT NULL,
        email varchar(256) NOT NULL UNIQUE,
        client_random_value VARCHAR(24) NOT NULL,
        encrypted_master_key VARCHAR(24) NOT NULL,
        hashed_authentication_key VARCHAR(44) NOT NULL,
        is_email_confirmed BOOLEAN NOT NULL,
        two_factor_authentication_secret_key VARCHAR(32),
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX(id)
      )`);
    await this.client.query(`
      CREATE TABLE email_confirmations (
        email varchar(256) NOT NULL,
        email_confirmation_token VARCHAR(24) NOT NULL,
        expired_at datetime NOT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX(email)
      )`);
  }

  /** Runs on rollback */
  async down(): Promise<void> {
    await this.client.query("DROP TABLE users");
    await this.client.query("DROP TABLE email_confirmations");
  }
}
