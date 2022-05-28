import client from '../dbclient.ts';
import { createSalt, ExhaustiveError } from '../util.ts';
import { deleteEmailConfirms, isEmailConfirmSuccess } from './EmailConfirmations.ts';
import { byteArray2base64, Order, Query } from '../deps.ts';
import parseJSONwithoutErr from '../utils/parseJSONWithoutErr.ts';
import {
  easyIsFilterItem,
  FilterBooleanItem,
  filterModelToSQLWhereObj,
  FilterNumberItem,
  FilterStringItem,
  isFilterBooleanItem,
  isFilterNumberItem,
  isFilterStringItem,
} from '../utils/dataGridFilter.ts';
import { GridFilterModel } from '../utils/dataGridFilter.ts';

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

  value() {
    return {
      id: this.id,
      email: this.email,
      max_capacity: this.max_capacity,
      file_usage: this.file_usage,
      authority: this.authority ?? undefined,
      two_factor_authentication: this.two_factor_authentication_secret_key ? true : false,
    };
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

  async patch(params: {
    max_capacity?: number;
    two_factor_authentication?: boolean;
  }) {
    // validation
    if (typeof params.max_capacity === 'number' && params.max_capacity < 0) return false;
    if (params.two_factor_authentication) return false;
    try {
      await client.execute(
        `UPDATE users SET
        max_capacity = ?,
        two_factor_authentication_secret_key = ?
        WHERE id = ?`,
        [
          typeof params.max_capacity === 'number' ? params.max_capacity : this.max_capacity,
          params.two_factor_authentication === false ? null : this.#two_factor_authentication_secret_key,
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

const userFields = ['id', 'email', 'max_capacity', 'file_usage', 'authority', 'two_factor_authentication'] as const;
type UserField = typeof userFields[number];
const isUserField = (field: string): field is UserField => {
  return userFields.some((value) => value === field);
};
export const userFieldValidate = (
  field: unknown,
): UserField => (typeof field === 'string' ? (isUserField(field) ? field : 'email') : 'email');

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

export const getUsers = async (
  params: {
    offset: number;
    limit: number;
    orderBy: UserField;
    order: 'asc' | 'desc';
    queryFilter: GridUserFilterModel;
  },
): Promise<User[]> => {
  const query = (new Query())
    .select('*')
    .table('users')
    .limit(params.offset, params.limit)
    .order(Order.by(params.orderBy)[params.order]);
  const whereobj = filterModelToSQLWhereObj(params.queryFilter);
  // If there is no condition, remove the WHERE clause.
  const query2 = (whereobj.value !== '()' ? query.where(whereobj) : query).build();

  const users: SQLTableUser[] = await client.query(query2);
  return users.map((user) => new User(user));
};

export const getNumberOfUsers = async (queryFilter?: GridUserFilterModel): Promise<number> => {
  const wherequery = filterModelToSQLWhereObj(queryFilter).value;
  const query = queryFilter && wherequery !== '()'
    ? `SELECT COUNT(*) FROM users WHERE ${wherequery}`
    : `SELECT COUNT(*) FROM users`;
  const [result]: [{ 'COUNT(*)': number }] = await client.query(query);
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

type GridUserFilterItem =
  | FilterBooleanItem<'two_factor_authentication'>
  | FilterStringItem<'email' | 'authority'>
  | FilterNumberItem<'id' | 'max_capacity' | 'file_usage'>;
const isGridUserFilterItem = (item: unknown): item is GridUserFilterItem => {
  if (!easyIsFilterItem<GridUserFilterItem['columnField']>(item)) return false;
  switch (item.columnField) {
    case 'email':
    case 'authority':
      return isFilterStringItem<'email' | 'authority'>(item);
    case 'two_factor_authentication':
      return isFilterBooleanItem<'two_factor_authentication'>(item);
    case 'id':
    case 'max_capacity':
    case 'file_usage':
      return isFilterNumberItem<'id' | 'max_capacity' | 'file_usage'>(item);
    default:
      console.log(new ExhaustiveError(item));
      return false;
  }
};

type FixedGridUserFilterItem =
  | FilterStringItem<'email' | 'authority'>
  | FilterStringItem<'two_factor_authentication_secret_key'> // true two_factor_authentication check item
  | FilterNumberItem<'id' | 'max_capacity' | 'file_usage'>;

type GridUserFilterModel = GridFilterModel<FixedGridUserFilterItem>;

/**
 * parse as MUI DataGrid FilterModel
 * @param query DataGrid FilterModel(for Users)
 * @returns
 */
export const parseUserFilterQuery = (query: string): GridUserFilterModel => {
  const parsed = parseJSONwithoutErr(query);
  const linkOperator = parsed.linkOperator === 'or' ? 'or' : 'and';
  if (!Array.isArray(parsed.items)) return { items: [], linkOperator: 'and' };
  const items = parsed.items.filter(isGridUserFilterItem).map((x): FixedGridUserFilterItem => (
    x.columnField === 'two_factor_authentication'
      ? {
        columnField: 'two_factor_authentication_secret_key',
        operatorValue: (x.value === 'true' ? 'isNotEmpty' : 'isEmpty'),
      }
      : x
  ));
  return { items, linkOperator };
};
