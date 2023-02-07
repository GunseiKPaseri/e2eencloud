import { prisma } from '../dbclient.ts';
import type { DBHooks, Prisma } from '../dbclient.ts';

import { bs58, compareAsc, z } from '../deps.ts';

import { User } from './Users.ts';
import {
  anyFilterModelSchema,
  filterDateItemSchema,
  filterStringItemSchema,
  gridFilterToPrismaFilter,
} from '../utils/dataGridFilter.ts';
import type { GridFilterModel } from '../utils/dataGridFilter.ts';
import { ExhaustiveError } from '../util.ts';
import parseJSONwithoutErr from '../utils/parseJSONWithoutErr.ts';
import { recordUnion } from '../utils/typeUtil.ts';
import { createUnionSchema } from '../utils/zod.ts';

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
  const object = typeof target === 'string' ? parseJSONwithoutErr(target) : target;
  try {
    return hookScheme.parse(object);
  } catch (_) {
    console.log(_);
    return null;
  }
};

export class Hook {
  readonly id: string;
  readonly created_at: Date;
  readonly user_id: User | string;
  #name: string;
  #data: HookData;
  #expired_at: Date | null;
  constructor(hook: DBHooks) {
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
    await prisma.hooks.update({
      where: {
        id: this.id,
      },
      data: {
        name: params.name === undefined ? this.#name : params.name,
        expired_at: params.expired_at === undefined ? this.#expired_at : params.expired_at,
      },
    });
    if (params.name) this.#name = params.name;
    if (params.expired_at !== undefined) this.#expired_at = params.expired_at;
    return true;
  }

  async delete() {
    await prisma.hooks.delete({
      where: { id: this.id },
    });
    return true;
  }
}

export const addHook = async (
  params: { name: string; data: HookData; user_id: string; expired_at?: Date | null },
): Promise<Hook> => {
  const newId = bs58.encode(crypto.getRandomValues(new Uint8Array(25)));
  const now = new Date(Date.now());
  const hooksData = {
    id: newId,
    name: params.name,
    data: JSON.stringify(params.data),
    user_id: params.user_id,
    expired_at: params.expired_at === undefined ? null : params.expired_at,
  };
  await prisma.hooks.create({
    data: hooksData,
  });
  return new Hook({ ...hooksData, created_at: now, updated_at: now });
};

// ===================================================================
//  Filter
// ===================================================================

const filterDateColumns = ['created_at', 'expired_at'] as const;
const filterStringColumns = ['id', 'name', 'data'] as const;

const filterColumns = [...filterDateColumns, ...filterStringColumns] as const;

export const hooksColumnsSchema = createUnionSchema(filterColumns);
type HooksColumns = z.infer<typeof hooksColumnsSchema>;

const hooksFilterItemSchema = z.union([
  filterStringItemSchema('id'),
  filterStringItemSchema('name'),
  filterStringItemSchema('data'),
  filterDateItemSchema('created_at'),
  filterDateItemSchema('expired_at'),
]);

type GridHookFilterItem = z.infer<typeof hooksFilterItemSchema>;
type GridHookFilterModel = GridFilterModel<GridHookFilterItem>;

/**
 * parse as MUI DataGrid FilterModel
 * @param query DataGrid FilterModel(for Hooks)
 * @returns
 */
export const parseHookFilterQuery = (query: string): GridFilterModel<GridHookFilterItem> => {
  const parsed = anyFilterModelSchema(hooksFilterItemSchema, parseJSONwithoutErr(query));
  return parsed;
};

const hookFilterQueryToPrismaQuery = (gridFilter: GridHookFilterModel): Prisma.CouponsWhereInput => {
  const t = gridFilter.items
    .map((x) => {
      switch (x.columnField) {
        case 'id':
        case 'data':
        case 'name':
          return gridFilterToPrismaFilter(x, 'String');
        case 'created_at':
        case 'expired_at':
          return gridFilterToPrismaFilter(x, 'Date');
        default:
          console.log(new ExhaustiveError(x));
      }
    });
  return recordUnion(t);
};

export const getHooksList = async (params: {
  user_id: string;
  offset: number;
  limit: number;
  orderBy: HooksColumns;
  order: 'asc' | 'desc';
  queryFilter: GridHookFilterModel;
  select: Prisma.HooksSelect;
}) => {
  const x = await prisma.hooks.findMany({
    select: params.select,
    skip: params.offset,
    take: params.limit,
    orderBy: { [params.orderBy]: params.order },
    where: {
      ...hookFilterQueryToPrismaQuery(params.queryFilter),
      user_id: params.user_id,
    },
  });
  return x;
};

export const getNumberOfHooks = async (queryFilter?: GridHookFilterModel): Promise<number> => {
  return await prisma.hooks.count({
    where: {
      ...(queryFilter ? hookFilterQueryToPrismaQuery(queryFilter) : {}),
    },
  });
};

export const getHook = async (hook_id: string): Promise<Hook | null> => {
  const hook = await prisma.hooks.findUnique({
    select: {
      id: true,
      name: true,
      data: true,
      user_id: true,
      expired_at: true,
      created_at: true,
      updated_at: true,
    },
    where: {
      id: hook_id,
    },
  });
  return hook !== null ? new Hook(hook) : null;
};
