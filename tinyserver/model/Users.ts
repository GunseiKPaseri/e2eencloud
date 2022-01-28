import client from '../dbclient.ts';
import { createSalt } from '../util.ts';
import { deleteEmailConfirms, isEmailConfirmSuccess } from './EmailConfirmations.ts';
import { encode as byteArray2base64 } from 'https://deno.land/std/encoding/base64.ts';

export class User {
  readonly id: number;
  readonly email: string;
  readonly client_random_value: string;
  readonly encrypted_master_key: string;
  readonly encrypted_master_key_iv: string;
  readonly hashed_authentication_key: string;
  readonly is_email_confirmed: boolean;
  #two_factor_authentication_secret_key: string | null;
  #rsa_public_key: string | null;
  #encrypted_rsa_private_key: string | null;
  #encrypted_rsa_private_key_iv: string | null;
  constructor(user: {
    id: number;
    email: string;
    client_random_value: string;
    encrypted_master_key: string;
    encrypted_master_key_iv: string;
    hashed_authentication_key: string;
    is_email_confirmed: boolean;
    two_factor_authentication_secret_key: string | null;
    rsa_public_key: string | null;
    encrypted_rsa_private_key: string | null;
    encrypted_rsa_private_key_iv: string | null;
  }) {
    this.id = user.id;
    this.email = user.email;
    this.client_random_value = user.client_random_value;
    this.encrypted_master_key = user.encrypted_master_key;
    this.encrypted_master_key_iv = user.encrypted_master_key_iv;
    this.hashed_authentication_key = user.hashed_authentication_key;
    this.is_email_confirmed = !!(user.is_email_confirmed);
    this.#two_factor_authentication_secret_key = user.two_factor_authentication_secret_key;
    this.#rsa_public_key = user.rsa_public_key;
    this.#encrypted_rsa_private_key = user.encrypted_rsa_private_key;
    this.#encrypted_rsa_private_key_iv = user.encrypted_rsa_private_key_iv;
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
}

export const addUser = async (params: {
  email: string;
  client_random_value: string;
  encrypted_master_key: string;
  encrypted_master_key_iv: string;
  hashed_authentication_key: string;
}) => {
  try {
    await client.execute(
      `INSERT INTO users(
      email,
      client_random_value,
      encrypted_master_key,
      encrypted_master_key_iv,
      hashed_authentication_key,
      is_email_confirmed) values(?, ?, ?, ?, ?, ?)`,
      [
        params.email,
        params.client_random_value,
        params.encrypted_master_key,
        params.encrypted_master_key_iv,
        params.hashed_authentication_key,
        false,
      ],
    );
  } catch (_) {
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
