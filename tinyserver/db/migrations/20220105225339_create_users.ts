import { AbstractMigration, ClientMySQL } from 'https://deno.land/x/nessie@2.0.4/mod.ts';

export default class extends AbstractMigration<ClientMySQL> {
  /** Runs on migrate */
  async up(): Promise<void> {
    await this.client.query(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
        email VARCHAR(256) NOT NULL UNIQUE,
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
        id varchar(36) PRIMARY KEY NOT NULL,
        session_key varchar(36) NOT NULL UNIQUE,
        data TEXT NOT NULL,
        user_id INT,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX(id),
        INDEX(session_key),
        INDEX(user_id),
        CONSTRAINT fk_session_user_id
          FOREIGN KEY (user_id)
          REFERENCES users (id)
          ON DELETE CASCADE ON UPDATE RESTRICT
      )`);
    await this.client.query(`
      CREATE TABLE files (
        id varchar(36) PRIMARY KEY NOT NULL,
        encrypted_file_iv TEXT,
        encrypted_file_key TEXT NOT NULL,
        encrypted_file_info TEXT NOT NULL,
        encrypted_file_info_iv TEXT NOT NULL,
        size BIGINT NOT NULL,
        created_by INT NOT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX(id),
        CONSTRAINT fk_user_id
          FOREIGN KEY (created_by)
          REFERENCES users (id)
          ON DELETE RESTRICT ON UPDATE RESTRICT
      )`);
  }

  /** Runs on rollback */
  async down(): Promise<void> {
    await this.client.query('DROP TABLE email_confirmations');
    await this.client.query('DROP TABLE sessions');
    await this.client.query('DROP TABLE files');
    await this.client.query('DROP TABLE users');
  }
}
