import { bs58, compareAsc, Order, Query, Where, z } from '../deps.ts';
import client from '../dbclient.ts';
import { User } from './Users.ts';
import {
  easyIsFilterItem,
  FilterDateItem,
  filterModelToSQLWhereObj,
  FilterStringItem,
  GridFilterModel,
  isFilterStringItem,
} from '../utils/dataGridFilter.ts';
import { ExhaustiveError } from '../util.ts';
import { isFilterDateItem } from '../utils/dataGridFilter.ts';
import parseJSONwithoutErr from '../utils/parseJSONWithoutErr.ts';
interface SQLTableHook {
  id: string;
  name: string;
  data: string | HookData;
  user_id: number;
  created_at: Date;
  expired_at: Date | null;
}

export const hookScheme = z.union([
  z.object({
    method: z.literal('USER_DELETE'),
  }),
  z.object({
    method: z.literal('NONE'),
  }),
]);

export type HookData = z.infer<typeof hookScheme>;

export const parseHookData = (target: string | unknown): HookData | null => {
  const object = (typeof target === 'string' ? parseJSONwithoutErr(target) : target);
  try {
    return hookScheme.parse(object);
  } catch (_) {
    return null;
  }
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
    this.#data = parseHookData(hook.data) ?? { method: 'NONE' };
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

  async patch(params: { name?: string; expired_at?: Date | null }) {
    // validate
    if (
      params.expired_at !== undefined &&
      params.expired_at !== null &&
      (
        Number.isNaN(params.expired_at.getTime()) ||
        !(
          compareAsc(new Date(), params.expired_at) < 0
        )
      )
    ) {
      return false;
    }
    await client.execute(
      `UPDATE hooks SET name = ?, expired_at = ? WHERE id = ?`,
      [
        params.name === undefined ? this.#name : params.name,
        params.expired_at === undefined ? this.#expired_at : params.expired_at,
        this.id,
      ],
    );
    if (params.name) this.#name = params.name;
    if (params.expired_at !== undefined) this.#expired_at = params.expired_at;
    return true;
  }

  async delete() {
    const result = await client.execute(`DELETE FROM hooks WHERE id = ?`, [
      this.id,
    ]);

    return result.affectedRows && result.affectedRows > 0 ? true : false;
  }
}

export const addHook = async (
  params: { name: string; data: HookData; user_id: number; expired_at?: Date | null },
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

const hookFields = ['id', 'created_at', 'name', 'data', 'expired_at'] as const;
type HookField = typeof hookFields[number];
const isHookField = (field: string): field is HookField => {
  return hookFields.some((value) => value === field);
};
export const hookFieldValidate = (
  field: unknown,
): HookField => (typeof field === 'string' ? (isHookField(field) ? field : 'created_at') : 'created_at');

type GridHookFilterItem =
  | FilterStringItem<'id' | 'name' | 'data'>
  | FilterDateItem<'created_at' | 'expired_at'>;
type GridHookFilterModel = GridFilterModel<GridHookFilterItem>;
const isGridHookFilterItem = (item: unknown): item is GridHookFilterItem => {
  if (!easyIsFilterItem<GridHookFilterItem['columnField']>(item)) return false;
  switch (item.columnField) {
    case 'id':
    case 'name':
    case 'data':
      return isFilterStringItem<'id' | 'name' | 'data'>(item);
    case 'created_at':
    case 'expired_at':
      return isFilterDateItem<'created_at' | 'expired_at'>(item);
    default:
      console.log(new ExhaustiveError(item));
      return false;
  }
};

/**
 * parse as MUI DataGrid FilterModel
 * @param query DataGrid FilterModel(for Users)
 * @returns
 */
export const parseHookFilterQuery = (query: string): GridHookFilterModel => {
  const parsed = parseJSONwithoutErr(query);
  const linkOperator = parsed.linkOperator === 'or' ? 'or' : 'and';
  if (!Array.isArray(parsed.items)) return { items: [], linkOperator: 'and' };
  const items = parsed.items.filter((x): x is GridHookFilterItem => (
    isGridHookFilterItem(x) && (x.columnField !== 'data')
  ));
  return { items, linkOperator };
};

export const getHooksList = async (params: {
  user_id: number;
  offset: number;
  limit: number;
  orderBy: HookField;
  order: 'asc' | 'desc';
  queryFilter: GridHookFilterModel;
}): Promise<Hook[]> => {
  const whereobj = filterModelToSQLWhereObj(params.queryFilter);
  const query = (new Query())
    .select('*')
    .table('hooks')
    .limit(params.offset, params.limit)
    .order(Order.by(params.orderBy)[params.order])
    // If there is no condition, remove the WHERE clause.
    .where(Where.and(
      whereobj.value !== '()' ? whereobj : null,
      Where.eq('user_id', params.user_id),
    ))
    .build();

  const hooks: SQLTableHook[] = await client.query(query);
  return hooks.map((hook) => new Hook(hook));
};

export const getNumberOfHooks = async (user_id: number, queryFilter?: GridHookFilterModel): Promise<number> => {
  const query = `SELECT COUNT(*) FROM hooks WHERE ${
    filterModelToSQLWhereObj(queryFilter, [Where.eq('user_id', user_id)]).value
  }`;
  const [result]: [{ 'COUNT(*)': number }] = await client.query(query, [
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
