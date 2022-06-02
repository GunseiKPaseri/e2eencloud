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
          'pHzUQIIyKNqXylNe4huAWA==',
          '4Uul0HgyTXt2hBMI+ceAyQ==',
          'gYOzUPc1tdkP6toSUFKTwQ==',
          'bTebDNGn+ysNDZ0LZWt9SLFzFWlKCG9Co0sbZ/AmlmA=',
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
            'OzN38sFE2X1LSi0BibW8nw==',
            'DtIqXDtlUH7VWdTSoJAo6g==',
            'zLw6WwbqPir2gPwtzNUdMQ==',
            'p9dJ8Fc5clRV86T5iUaPTtyW4V/VJF9sIxWIHNeSglw=',
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
            'OzN38sFE2X1LSi0BibW8nw==',
            'DtIqXDtlUH7VWdTSoJAo6g==',
            'zLw6WwbqPir2gPwtzNUdMQ==',
            'p9dJ8Fc5clRV86T5iUaPTtyW4V/VJF9sIxWIHNeSglw=',
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
