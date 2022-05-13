import client from '../dbclient.ts';
import { createSalt } from '../util.ts';
import { deleteEmailConfirms, isEmailConfirmSuccess } from './EmailConfirmations.ts';
import { byteArray2base64 } from '../deps.ts';

const DEFAULT_MAX_CAPACITY = 10 * 1024 * 1024; //10MiB

interface SQLTableUser {
  id: number;
  email: string;
  client_random_value: string;
  encrypted_master_key: string;
  encrypted_master_key_iv: string;
  hashed_authentication_key: string;
  is_email_confirmed: boolean;
  max_capacity: number;
  file_usage: number;
  two_factor_authentication_secret_key: string | null;
  rsa_public_key: string | null;
  encrypted_rsa_private_key: string | null;
  encrypted_rsa_private_key_iv: string | null;
  authority: string | null;
}

export class User {
  readonly id: number;
  readonly email: string;
  readonly client_random_value: string;
  readonly encrypted_master_key: string;
  readonly encrypted_master_key_iv: string;
  readonly hashed_authentication_key: string;
  readonly is_email_confirmed: boolean;
  readonly max_capacity: number;
  #file_usage: number;
  #two_factor_authentication_secret_key: string | null;
  #rsa_public_key: string | null;
  #encrypted_rsa_private_key: string | null;
  #encrypted_rsa_private_key_iv: string | null;
  #authority: 'ADMIN' | null;
  constructor(user: SQLTableUser) {
    this.id = user.id;
    this.email = user.email;
    this.client_random_value = user.client_random_value;
    this.encrypted_master_key = user.encrypted_master_key;
    this.encrypted_master_key_iv = user.encrypted_master_key_iv;
    this.hashed_authentication_key = user.hashed_authentication_key;
    this.is_email_confirmed = !!(user.is_email_confirmed);
    this.max_capacity = user.max_capacity;
    this.#file_usage = user.file_usage;
    this.#two_factor_authentication_secret_key = user.two_factor_authentication_secret_key;
    this.#rsa_public_key = user.rsa_public_key;
    this.#encrypted_rsa_private_key = user.encrypted_rsa_private_key;
    this.#encrypted_rsa_private_key_iv = user.encrypted_rsa_private_key_iv;
    this.#authority = user.authority === 'ADMIN' ? 'ADMIN' : null;
  }

  get two_factor_authentication_secret_key() {
    return this.#two_factor_authentication_secret_key;
  }
  get rsa_public_key() {
    return this.#rsa_public_key;
  }
  get encrypted_rsa_private_key() {
    return this.#encrypted_rsa_private_key;
  }
  get encrypted_rsa_private_key_iv() {
    return this.#encrypted_rsa_private_key_iv;
  }
  get file_usage() {
    return this.#file_usage;
  }
  get authority() {
    return this.#authority;
  }

  async patchUsage(diffUsage: number) {
    try {
      if (diffUsage > 0) {
        const result = await client.execute(
          `UPDATE users SET file_usage = file_usage + ? WHERE id = ? AND max_capacity - file_usage >= ?`,
          [diffUsage, this.id, diffUsage],
        );
        if (result.affectedRows === 0) return null;
      } else {
        await client.execute(
          `UPDATE users SET file_usage = file_usage - ? WHERE id = ?`,
          [-diffUsage, this.id],
        );
      }
      this.#file_usage += diffUsage;
      return this.#file_usage;
    } catch (_) {
      return null;
    }
  }

  async addTwoFactorAuthSecretKey(key: string | null) {
    try {
      await client.execute(
        `UPDATE users SET two_factor_authentication_secret_key = ? WHERE email = ?`,
        [key, this.email],
      );
      this.#two_factor_authentication_secret_key = key;
      return true;
    } catch (_) {
      return false;
    }
  }

  async addRSAPublicKey(params: {
    encrypted_rsa_private_key: string;
    encrypted_rsa_private_key_iv: string;
    rsa_public_key: string;
  }) {
    try {
      await client.execute(
        `UPDATE users SET encrypted_rsa_private_key = ?, encrypted_rsa_private_key_iv = ?, rsa_public_key = ? WHERE id = ?`,
        [
          params.encrypted_rsa_private_key,
          params.encrypted_rsa_private_key_iv,
          params.rsa_public_key,
          this.id,
        ],
      );
      this.#encrypted_rsa_private_key = params.encrypted_rsa_private_key;
      this.#encrypted_rsa_private_key_iv = params.encrypted_rsa_private_key_iv;
      this.#rsa_public_key = params.rsa_public_key;
      return true;
    } catch (_) {
      return false;
    }
  }

  async patchPassword(params: {
    client_random_value: string;
    encrypted_master_key: string;
    encrypted_master_key_iv: string;
    hashed_authentication_key: string;
  }) {
    try {
      await client.execute(
        `UPDATE users SET
        client_random_value = ?,
        encrypted_master_key = ?,
        encrypted_master_key_iv = ?,
        hashed_authentication_key = ?
        WHERE id = ?`,
        [
          params.client_random_value,
          params.encrypted_master_key,
          params.encrypted_master_key_iv,
          params.hashed_authentication_key,
          this.id,
        ],
      );
      return true;
    } catch (_) {
      return false;
    }
  }
}

export const addUser = async (params: {
  email: string;
  client_random_value: string;
  encrypted_master_key: string;
  encrypted_master_key_iv: string;
  hashed_authentication_key: string;
  max_capacity?: number;
}) => {
  try {
    await client.execute(
      `INSERT INTO users(
      email,
      client_random_value,
      encrypted_master_key,
      encrypted_master_key_iv,
      hashed_authentication_key,
      max_capacity,
      file_usage,
      is_email_confirmed) values(?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        params.email,
        params.client_random_value,
        params.encrypted_master_key,
        params.encrypted_master_key_iv,
        params.hashed_authentication_key,
        params.max_capacity ?? DEFAULT_MAX_CAPACITY,
        0,
        false,
      ],
    );
  } catch (_) {
    console.log(_);
    // ユーザが既に存在する場合
    const alreadyExistUsers = await client.query(
      `SELECT * FROM users WHERE email = ?`,
      [params.email],
    );
    if (alreadyExistUsers.length !== 1) throw new Error('why!?');
    const is_email_confirmed: boolean = alreadyExistUsers[0].is_email_confirmed;
    if (is_email_confirmed) {
      // メールが確認状態ならば追加不可
      return false;
    }
    await client.execute(
      `UPDATE users
      SET client_random_value = ?,
      encrypted_master_key = ?,
      encrypted_master_key_iv = ?,
      hashed_authentication_key = ?
      WHERE email = ?`,
      [
        params.client_random_value,
        params.encrypted_master_key,
        params.encrypted_master_key_iv,
        params.hashed_authentication_key,
        params.email,
      ],
    );
    // これまでの確認メールに付属していたリンクは削除する
    await deleteEmailConfirms(params.email);
  }
  return true;
};

export const userEmailConfirm = async (
  email: string,
  email_confirmation_token: string,
) => {
  try {
    const confirmed = await isEmailConfirmSuccess(
      email,
      email_confirmation_token,
    );
    if (confirmed) {
      await client.execute(
        `UPDATE users SET is_email_confirmed = ? WHERE email = ?`,
        [true, email],
      );
    }
    return confirmed;
  } catch (_) {
    return false;
  }
};

export const getUserById = async (id: number | null): Promise<User | null> => {
  if (!id) return null;
  const users = await client.query(`SELECT * FROM users WHERE id = ?`, [id]);
  if (users.length !== 1) return null;
  return new User(users[0]);
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const users = await client.query(`SELECT * FROM users WHERE email = ?`, [
    email,
  ]);
  if (users.length !== 1) return null;
  return new User(users[0]);
};

export const getClientRandomSalt = async (email: string): Promise<string> => {
  const users = await client.query(
    `SELECT client_random_value FROM users WHERE email = ?`,
    [email],
  );
  const hashedClientRandomSalt = await createSalt(
    email,
    users.length === 1 ? users[0].client_random_value : null,
  );
  return byteArray2base64(hashedClientRandomSalt);
};

export const getUsers = async (offset: number, limit: number): Promise<User[]> => {
  const users: SQLTableUser[] = await client.query(`SELECT * FROM users ORDER BY email LIMIT ? OFFSET ?`, [
    limit,
    offset,
  ]);
  return users.map((user) => new User(user));
};

export const getNumberOfUsers = async (): Promise<number> => {
  const [result]: [{ 'COUNT(*)': number }] = await client.query(`SELECT COUNT(*) FROM users`);
  return result['COUNT(*)'];
};

export const deleteUserById = async (id: number | null): Promise<{ success: boolean }> => {
  if (!id) return { success: false };
  const result = await client.execute(`DELETE FROM users WHERE id = ?`, [
    id,
  ]);
  return {
    success: (result.affectedRows && result.affectedRows > 0 ? true : false),
  };
};
