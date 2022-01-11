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
        encrypted_master_key_iv VARCHAR(24) NOT NULL,
        hashed_authentication_key VARCHAR(44) NOT NULL,
        is_email_confirmed BOOLEAN NOT NULL,
        two_factor_authentication_secret_key VARCHAR(32),
        encrypted_rsa_private_key TEXT,
        encrypted_rsa_private_key_iv VARCHAR(24),
        rsa_public_key TEXT,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX(id),
        INDEX(email)
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
    await this.client.query(`
      CREATE TABLE sessions (
        id varchar(36) UNIQUE NOT NULL,
        data TEXT NOT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX(id)
      )`);
    await this.client.query(`
      CREATE TABLE files (
        id varchar(36) UNIQUE NOT NULL,
        encrypted_file_iv TEXT NOT NULL,
        encrypted_file_key TEXT NOT NULL,
        encrypted_file_info TEXT NOT NULL,
        encrypted_file_info_iv TEXT NOT NULL,
        size BIGINT NOT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX(id)
      )`);
  }

  /** Runs on rollback */
  async down(): Promise<void> {
    await this.client.query("DROP TABLE users");
    await this.client.query("DROP TABLE email_confirmations");
    await this.client.query("DROP TABLE sessions");
    await this.client.query("DROP TABLE files");
  }
}
