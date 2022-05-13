import { AbstractSeed, ClientMySQL } from 'https://deno.land/x/nessie@2.0.4/mod.ts';

export default class extends AbstractSeed<ClientMySQL> {
  /** Runs on seed */
  async run(): Promise<void> {
    // user: admin@example.com
    // pass: MyNameIsAdmin.
    const promiselist: Promise<unknown>[] = [
      this.client.execute(
        `INSERT INTO users(
        email,
        client_random_value,
        encrypted_master_key,
        encrypted_master_key_iv,
        hashed_authentication_key,
        max_capacity,
        file_usage,
        is_email_confirmed,
        authority) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'admin@example.com',
          'igNeTCHNOmeLLKi2+zwDZQ==',
          '7Bc78BWEkyscSA3srdi3LA==',
          '9YILoP6VIfbP+2FB2syn3Q==',
          '+9r5hQSRxudtBPNtu+M5kuh1VCr0G/lO3QVyDhhGFwY=',
          10485760,
          0,
          true,
          'ADMIN',
        ],
      ),
      // user: testuser+ddd@example.com
      // pass: MyNameIsTestUser.
      ...[...Array(100)].map((_, i) => {
        return this.client.execute(
          `INSERT INTO users(
          email,
          client_random_value,
          encrypted_master_key,
          encrypted_master_key_iv,
          hashed_authentication_key,
          max_capacity,
          file_usage,
          is_email_confirmed) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            `testuser+${i.toString().padStart(3, '0')}@example.com`,
            'cvS0uIG9i12nRoYAZZOLzw==',
            'CE1gbIq42ZyjtyhNjOJEnw==',
            'ExzLEGedk4W8/nXJ0Gxd+A==',
            'RU0w0+KonDCm+7nElCia1UWE9c3GQiYjAvrxcdcrEv8=',
            10485760,
            0,
            true,
          ],
        );
      }),
      // user: baduser+ddd@example.com
      // pass: MyNameIsTestUser.
      ...[...Array(20)].map((_, i) => {
        return this.client.execute(
          `INSERT INTO users(
          email,
          client_random_value,
          encrypted_master_key,
          encrypted_master_key_iv,
          hashed_authentication_key,
          max_capacity,
          file_usage,
          is_email_confirmed) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            `baduser+${i.toString().padStart(3, '0')}@example.com`,
            'cvS0uIG9i12nRoYAZZOLzw==',
            'CE1gbIq42ZyjtyhNjOJEnw==',
            'ExzLEGedk4W8/nXJ0Gxd+A==',
            'RU0w0+KonDCm+7nElCia1UWE9c3GQiYjAvrxcdcrEv8=',
            10485760,
            0,
            false,
          ],
        );
      }),
    ];
    await Promise.all(promiselist);
  }
}
