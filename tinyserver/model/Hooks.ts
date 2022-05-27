import { bs58 } from '../deps.ts';
import client from '../dbclient.ts';
import { User } from './Users.ts';

interface SQLTableHook {
  id: string;
  name: string;
  data: string | HookData;
  user_id: number;
  created_at: Date;
  expired_at: Date | null;
}

export type HookData = {
  method: 'USER_DELETE';
} | {
  method: 'NONE';
};

export const parseHookData = (object: unknown): HookData | null => {
  if (typeof object !== 'object' || object === null) return null;
  const maybeHookData: Partial<HookData> = object;
  if (maybeHookData.method && maybeHookData.method === 'USER_DELETE') {
    return { method: maybeHookData.method };
  }
  return null;
};

export class Hook {
  readonly id: string;
  readonly created_at: Date;
  readonly user_id: User | number;
  #name: string;
  #data: HookData;
  #expired_at: Date | null;
  constructor(hook: SQLTableHook) {
    this.id = hook.id;
    this.created_at = hook.created_at;
    this.user_id = hook.user_id;
    this.#data = typeof hook.data === 'string'
      ? (parseHookData(JSON.parse(hook.data)) ?? { method: 'NONE' })
      : hook.data;
    this.#name = hook.name;
    this.#expired_at = hook.expired_at;
  }

  get name() {
    return this.#name;
  }

  get data() {
    return this.#data;
  }

  get expired_at() {
    return this.#expired_at;
  }

  value() {
    return {
      id: this.id,
      created_at: this.created_at,
      name: this.name,
      data: this.#data,
      expired_at: this.#expired_at,
    };
  }

  async update(params: { name: string; expired_at: Date }) {
    await client.execute(
      `UPDATE hooks SET name = ?, expired_at = ? WHERE id = ?`,
      [params.name, params.expired_at, typeof this.user_id === 'number' ? this.user_id : this.user_id.id],
    );
    this.#name = params.name;
    this.#expired_at = params.expired_at;
  }
}

export const addHook = async (
  params: { name: string; data: HookData; user_id: number; expired_at?: Date },
): Promise<Hook> => {
  const newId = bs58.encode(crypto.getRandomValues(new Uint8Array(25)));
  const now = new Date(Date.now());
  await client.execute(
    `INSERT INTO hooks(
      id,
      name,
      data,
      user_id,
      expired_at) VALUES(?, ?, ?, ?, ?)`,
    [
      newId,
      params.name,
      JSON.stringify(params.data),
      params.user_id,
      params.expired_at,
    ],
  );
  return new Hook({
    id: newId,
    name: params.name,
    data: params.data,
    user_id: params.user_id,
    created_at: now,
    expired_at: params.expired_at ?? null,
  });
};

export const getHooksList = async (user_id: number, offset: number, limit: number): Promise<Hook[]> => {
  const hooks: SQLTableHook[] = await client.query(
    `SELECT * FROM hooks WHERE user_id = ? ORDER BY created_at LIMIT ? OFFSET ?`,
    [
      user_id,
      limit,
      offset,
    ],
  );
  return hooks.map((hook) => new Hook(hook));
};

export const getNumberOfHooks = async (user_id: number): Promise<number> => {
  const [result]: [{ 'COUNT(*)': number }] = await client.query(`SELECT COUNT(*) FROM hooks WHERE user_id = ?`, [
    user_id,
  ]);
  return result['COUNT(*)'];
};

export const getHook = async (hookid: string): Promise<Hook | null> => {
  const hook: [SQLTableHook] | [] = await client.query(
    `SELECT * FROM hooks WHERE id = ?`,
    [hookid],
  );
  return hook.length === 1 ? new Hook(hook[0]) : null;
};
