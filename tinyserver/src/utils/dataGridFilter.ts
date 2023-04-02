import { z } from 'tinyserver/deps.ts';
import { ExhaustiveError, recordUnion } from 'tinyserver/src/utils/typeUtil.ts';

import type { Prisma } from 'tinyserver/src/client/dbclient.ts';
import { createUnionSchema } from './zod.ts';
import parseJSONwithoutErr from './parseJSONWithoutErr.ts';

/*******
 *  Boolean Filter
 */

export const filterBooleanItemSchema = <T extends string>(field: T) => filterBooleanItemSchemaCore(z.literal(field));
type FilterBooleanItemSchema<T extends string> = ReturnType<typeof filterBooleanItemSchema<T>>;

const filterBooleanItemSchemaCore = <T extends z.ZodType>(schema: T) =>
  z.object({
    field: schema,
    value: z.union([
      z.literal(''),
      z.literal('true'),
      z.literal('false'),
    ]).optional(),
    operator: z.literal('is'),
  });

export type FilterBooleanItem<T extends string> = {
  field: T;
  value?: '' | 'true' | 'false';
  operator: 'is';
};
type MappedFilterBooleanItem<T extends readonly string[]> = {
  -readonly [K in keyof T]: FilterBooleanItem<T[K]>;
};

// For Union
type MappedFilterBooleanItemScheme<T extends readonly string[]> = {
  -readonly [K in keyof T]: FilterBooleanItemSchema<T[K]>;
};

type CreateFilterBooleanItemUnionReturnType<T extends readonly [string, string, ...string[]]> = z.ZodUnion<
  MappedFilterBooleanItemScheme<T>
>;

export function createFilterBooleanItemUnion<A extends readonly [string, string, ...string[]]>(items: A) {
  return z.union(
    items.map((str) => filterBooleanItemSchema(str)) as MappedFilterBooleanItemScheme<A>,
  );
}

type CreateFilterBooleanItemUnionSchemaReturnType<T extends StrTuple> = T extends readonly [] ? z.ZodNever
  : T extends readonly [string] ? FilterBooleanItemSchema<T[0]>
  : T extends readonly [string, string, ...string[]] ? CreateFilterBooleanItemUnionReturnType<T>
  : unknown;

export const createFilterBooleanItemUnionSchema = <T extends StrTuple>(
  values: T,
): CreateFilterBooleanItemUnionSchemaReturnType<T> => {
  if (values.length > 1) {
    return createFilterBooleanItemUnion(
      values as unknown as [string, string, ...string[]],
    ) as CreateFilterBooleanItemUnionSchemaReturnType<T>;
  } else if (values.length === 1) {
    return filterBooleanItemSchema(values[0]) as CreateFilterBooleanItemUnionSchemaReturnType<T>;
  } else if (values.length === 0) {
    return z.never() as CreateFilterBooleanItemUnionSchemaReturnType<T>;
  }
  throw new Error('Array must have a length');
};

/********
 * Date Filter
 */

export const filterDateItemSchema = <T extends string>(field: T) => filterDateItemSchemaCore(z.literal(field));
type FilterDateItemSchema<T extends string> = ReturnType<typeof filterDateItemSchema<T>>;

export const filterDateItemSchemaCore = <T extends z.ZodType>(schema: T) =>
  z.union([
    z.object({
      field: schema,
      value: z.string().optional(),
      operator: z.union([
        z.literal('is'),
        z.literal('not'),
        z.literal('after'),
        z.literal('onOrAfter'),
        z.literal('before'),
        z.literal('onOrBefore'),
      ]),
    }),
    z.object({
      field: schema,
      operator: z.union([z.literal('isEmpty'), z.literal('isNotEmpty')]),
    }),
  ]);

export type FilterDateItem<T extends string> = {
  field: T;
  value?: string;
  operator: 'is' | 'not' | 'after' | 'onOrAfter' | 'before' | 'onOrBefore';
} | {
  field: T;
  operator: 'isEmpty' | 'isNotEmpty';
};
type MappedFilterDateItem<T extends StrTuple> = {
  -readonly [K in keyof T]: FilterDateItem<T[K]>;
};

// For Union
type MappedFilterDateItemScheme<T extends readonly string[]> = {
  -readonly [K in keyof T]: FilterDateItemSchema<T[K]>;
};
type CreateFilterDateItemUnionReturnType<T extends readonly [string, string, ...string[]]> = z.ZodUnion<
  MappedFilterDateItemScheme<T>
>;
function createFilterDateItemUnion<A extends readonly [string, string, ...string[]]>(items: A) {
  return z.union(
    items.map((str) => filterDateItemSchema(str)) as MappedFilterDateItemScheme<A>,
  );
}

type CreateFilterDateItemUnionSchemaReturnType<T extends StrTuple> = T extends readonly [] ? z.ZodNever
  : T extends readonly [string] ? FilterDateItemSchema<T[0]>
  : T extends readonly [string, string, ...string[]] ? CreateFilterDateItemUnionReturnType<T>
  : unknown;

export const createFilterDateItemUnionSchema = <T extends StrTuple>(
  values: T,
): CreateFilterDateItemUnionSchemaReturnType<T> => {
  if (values.length > 1) {
    return createFilterDateItemUnion(
      values as unknown as [string, string, ...string[]],
    ) as CreateFilterDateItemUnionSchemaReturnType<T>;
  } else if (values.length === 1) {
    return filterDateItemSchema(values[0]) as CreateFilterDateItemUnionSchemaReturnType<T>;
  } else if (values.length === 0) {
    return z.never() as CreateFilterDateItemUnionSchemaReturnType<T>;
  }
  throw new Error('Array must have a length');
};

/*******
 *  Enum Filter
 */

type EnumItem<T extends string, U extends readonly [string, string, ...string[]]> = {
  readonly field: T;
  readonly value: U;
};

export const filterEnumItemSchema = <T extends string, U extends readonly [string, string, ...string[]]>(
  props: EnumItem<T, U>,
) => filterEnumItemSchemaCore(z.literal(props.field), createUnionSchema(props.value));

type FilterEnumItemSchema<T extends string, U extends readonly [string, string, ...string[]]> = ReturnType<
  typeof filterEnumItemSchema<T, U>
>;

const filterEnumItemSchemaCore = <T extends z.ZodType, U extends z.ZodType>(schema: T, value: U) =>
  z.union([
    z.object({
      field: schema,
      value: value.optional(),
      operator: z.union([z.literal('is'), z.literal('not')]),
    }),
    z.object({
      field: schema,
      value: value.array().optional(),
      operator: z.literal('isAnyOf'),
    }),
  ]);

export type FilterEnumItem<T extends EnumItemAbst> = {
  field: T['field'];
  value?: T['value'][number];
  operator: 'is' | 'not';
} | {
  field: T['field'];
  value?: T['value'][number][];
  operator: 'isAnyOf';
};
type MappedFilterEnumItem<T extends EnumItemTuple> = {
  -readonly [K in keyof T]: FilterEnumItem<T[K]>;
};

type EnumItemAbst = EnumItem<string, readonly [string, string, ...string[]]>;
type EnumItemTuple = readonly [] | readonly [EnumItemAbst] | readonly [EnumItemAbst, EnumItemAbst, ...EnumItemAbst[]];

//For Union
type MappedFilterEnumItemScheme<T extends EnumItemTuple> = {
  -readonly [K in keyof T]: FilterEnumItemSchema<T[K]['field'], T[K]['value']>;
};
type CreateFilterEnumItemUnionReturnType<
  T extends readonly [EnumItemAbst, EnumItemAbst, ...EnumItemAbst[]],
> = z.ZodUnion<MappedFilterEnumItemScheme<T>>;

export function createFilterEnumItemUnion<
  T extends [EnumItemAbst, EnumItemAbst, ...EnumItemAbst[]],
>(items: T) {
  return z.union(
    items.map((str) => filterEnumItemSchema(str)) as MappedFilterEnumItemScheme<T>,
  );
}

type CreateFilterEnumItemUnionSchemaReturnType<T extends EnumItemTuple> = T extends readonly [] ? z.ZodNever
  : T extends readonly [EnumItemAbst] ? FilterEnumItemSchema<T[0]['field'], T[0]['value']>
  : T extends readonly [EnumItemAbst, EnumItemAbst, ...EnumItemAbst[]] ? CreateFilterEnumItemUnionReturnType<T>
  : unknown;

export const createFilterEnumItemUnionSchema = <T extends EnumItemTuple>(
  items: T,
): CreateFilterEnumItemUnionSchemaReturnType<T> => {
  if (items.length > 1) {
    return createFilterEnumItemUnion(
      items as unknown as [EnumItemAbst, EnumItemAbst, ...EnumItemAbst[]],
    ) as CreateFilterEnumItemUnionSchemaReturnType<T>;
  } else if (items.length === 1) {
    return filterEnumItemSchema(items[0]) as CreateFilterEnumItemUnionSchemaReturnType<T>;
  } else if (items.length === 0) {
    return z.never() as CreateFilterEnumItemUnionSchemaReturnType<T>;
  }
  throw new Error('Array must have a length');
};

/*****
 * Number filter
 */

export const filterNumberItemSchema = <T extends string>(field: T) => filterNumberItemSchemaCore(z.literal(field));
type FilterNumberItemSchema<T extends string> = ReturnType<typeof filterNumberItemSchema<T>>;

export const filterNumberItemSchemaCore = <T extends z.ZodType>(schema: T) =>
  z.union([
    z.object({
      field: schema,
      value: z.string().optional(),
      operator: z.union([
        z.literal('='),
        z.literal('!='),
        z.literal('>'),
        z.literal('>='),
        z.literal('<'),
        z.literal('<='),
      ]),
    }),
    z.object({
      field: schema,
      value: z.string().array().optional(),
      operator: z.literal('isAnyOf'),
    }),
    z.object({
      field: schema,
      operator: z.union([z.literal('isEmpty'), z.literal('isNotEmpty')]),
    }),
  ]);

export type FilterNumberItem<T extends string> = {
  field: T;
  value?: string;
  operator: '=' | '!=' | '>' | '>=' | '<' | '<=';
} | {
  field: T;
  value?: string[];
  operator: 'isAnyOf';
} | {
  field: T;
  operator: 'isEmpty' | 'isNotEmpty';
};
type MappedFilterNumberItem<T extends StrTuple> = {
  -readonly [K in keyof T]: FilterNumberItem<T[K]>;
};

// For Union
type MappedFilterNumberItemScheme<T extends StrTuple> = {
  -readonly [K in keyof T]: FilterNumberItemSchema<T[K]>;
};
type CreateFilterNumberItemUnionReturnType<T extends readonly [string, string, ...string[]]> = z.ZodUnion<
  MappedFilterNumberItemScheme<T>
>;

function createFilterNumberItemUnion<A extends readonly [string, string, ...string[]]>(items: A) {
  return z.union(
    items.map((str) => filterNumberItemSchema(str)) as MappedFilterNumberItemScheme<A>,
  );
}

type CreateFilterNumberItemUnionSchemaReturnType<T extends StrTuple> = T extends readonly [] ? z.ZodNever
  : T extends readonly [string] ? FilterNumberItemSchema<T[0]>
  : T extends readonly [string, string, ...string[]] ? CreateFilterNumberItemUnionReturnType<T>
  : unknown;

export const createFilterNumberItemUnionSchema = <T extends StrTuple>(
  values: T,
): CreateFilterNumberItemUnionSchemaReturnType<T> => {
  if (values.length > 1) {
    return createFilterNumberItemUnion(
      values as unknown as [string, string, ...string[]],
    ) as CreateFilterNumberItemUnionSchemaReturnType<T>;
  } else if (values.length === 1) {
    return filterNumberItemSchema(values[0]) as CreateFilterNumberItemUnionSchemaReturnType<T>;
  } else if (values.length === 0) {
    return z.never() as CreateFilterNumberItemUnionSchemaReturnType<T>;
  }
  throw new Error('Array must have a length');
};

/********
 * String Filter
 */

export const filterStringItemSchema = <T extends string>(field: T) => filterStringItemSchemaCore(z.literal(field));
type FilterStringItemSchema<T extends string> = ReturnType<typeof filterStringItemSchema<T>>;

export const filterStringItemSchemaCore = <T extends z.ZodType>(schema: T) =>
  z.union([
    z.object({
      field: schema,
      value: z.string().optional(),
      operator: z.union([
        z.literal('contains'),
        z.literal('equals'),
        z.literal('startsWith'),
        z.literal('endsWith'),
      ]),
    }),
    z.object({
      field: schema,
      value: z.string().array().optional(),
      operator: z.literal('isAnyOf'),
    }),
    z.object({
      field: schema,
      operator: z.union([z.literal('isEmpty'), z.literal('isNotEmpty')]),
    }),
  ]);

export type FilterStringItem<T extends string> = {
  field: T;
  value?: string;
  operator: 'contains' | 'equals' | 'startsWith' | 'endsWith';
} | {
  field: T;
  value?: string[];
  operator: 'isAnyOf';
} | {
  field: T;
  operator: 'isEmpty' | 'isNotEmpty';
};
type MappedFilterStringItem<T extends StrTuple> = {
  -readonly [K in keyof T]: FilterStringItem<T[K]>;
};

// For Union
type MappedFilterStringItemScheme<T extends StrTuple> = {
  -readonly [K in keyof T]: FilterStringItemSchema<T[K]>;
};
type CreateFilterStringItemUnionReturnType<T extends readonly [string, string, ...string[]]> = z.ZodUnion<
  MappedFilterStringItemScheme<T>
>;

function createFilterStringItemUnion<A extends readonly [string, string, ...string[]]>(items: A) {
  return z.union(
    items.map((str) => filterStringItemSchema(str)) as MappedFilterStringItemScheme<A>,
  );
}

type CreateFilterStringItemUnionSchemaReturnType<T extends StrTuple> = T extends readonly [] ? z.ZodNever
  : T extends readonly [string] ? FilterStringItemSchema<T[0]>
  : T extends readonly [string, string, ...string[]] ? CreateFilterStringItemUnionReturnType<T>
  : unknown;

export const createFilterStringItemUnionSchema = <T extends StrTuple>(
  values: T,
): CreateFilterStringItemUnionSchemaReturnType<T> => {
  if (values.length > 1) {
    return createFilterStringItemUnion(
      values as typeof values & [string, string, ...string[]],
    ) as CreateFilterStringItemUnionSchemaReturnType<T>;
  } else if (values.length === 1) {
    return filterStringItemSchema(values[0]) as CreateFilterStringItemUnionSchemaReturnType<T>;
  } else if (values.length === 0) {
    return z.never() as CreateFilterStringItemUnionSchemaReturnType<T>;
  }
  throw new Error('Array must have a length');
};

export interface GridFilterModel<
  T extends
    | FilterBooleanItem<string>
    | FilterDateItem<string>
    | FilterEnumItem<EnumItemAbst>
    | FilterNumberItem<string>
    | FilterStringItem<string>,
> {
  items: T[];
  logicOperator?: 'and' | 'or';
  // deno-lint-ignore no-explicit-any
  quickFilterValues?: any;
  quickFilterLogicOperator?: 'and' | 'or';
}

export const anyFilterModelSchema = <T extends z.ZodType>(schema: T, target: unknown) => {
  try {
    return z.object({
      items: schema.array(),
      logicOperator: z.union([z.literal('and'), z.literal('or')]).optional(),
      quickFilterValues: z.any().optional(),
      quickFilterLogincOperator: z.union([z.literal('and'), z.literal('or')]).optional(),
    }).parse(target);
  } catch (_) {
    console.error(_);
    return { items: [] };
  }
};

// generate {[T]: U}
type PrismaFilterReturn<T extends string, U> = T extends string ? { [K in T]: U } : never;

type FilterType = 'Boolean' | 'Number' | 'Date' | 'String';

type GridFilter<T extends string, U extends FilterType> = U extends 'Boolean' ? FilterBooleanItem<T>
  : U extends 'Number' ? FilterNumberItem<T>
  : U extends 'Date' ? FilterDateItem<T>
  : U extends 'String' ? FilterStringItem<T>
  : never;

type PrismaFilter<T extends string, U extends FilterType> = U extends 'Boolean'
  ? PrismaFilterReturn<T, Prisma.BoolFilter>
  : U extends 'Number' ? PrismaFilterReturn<T, Prisma.IntFilter>
  : U extends 'Date' ? PrismaFilterReturn<T, Prisma.DateTimeFilter>
  : U extends 'String' ? PrismaFilterReturn<T, Prisma.StringFilter>
  : never;

export const gridFilterToPrismaFilterBoolean = <T extends string>(
  gf: FilterBooleanItem<T>,
): PrismaFilter<T, 'Boolean'> => {
  const x: Prisma.BoolFilter = { equals: gf.value === '' ? undefined : gf.value === 'true' };
  return {
    [gf.field]: x,
  } as PrismaFilterReturn<T, Prisma.BoolFilter>;
};

const gf2pfsString = <T extends string>(
  gf: FilterStringItem<T>,
): Prisma.StringFilter => {
  switch (gf.operator) {
    case 'contains':
    case 'equals':
    case 'startsWith':
    case 'endsWith':
      return { [gf.operator]: gf.value };
    case 'isEmpty':
      return { equals: undefined };
    case 'isNotEmpty':
      return { not: undefined };
    case 'isAnyOf':
      return { in: gf.value };
    default:
      throw new ExhaustiveError(gf);
  }
};

export const gridFilterToPrismaFilterString = <T extends string>(
  gf: FilterStringItem<T>,
): PrismaFilterReturn<T, Prisma.StringFilter> | null => {
  const x: Prisma.StringFilter = gf2pfsString(gf);
  return {
    [gf.field]: x,
  } as PrismaFilterReturn<T, Prisma.StringFilter>;
};

const str2number = (x: string | undefined) => {
  const t = Number(x);
  if (isNaN(t)) return 0;
  return t;
};

const gf2pfsNumber = <T extends string>(
  gf: FilterNumberItem<T>,
): Prisma.IntFilter => {
  switch (gf.operator) {
    case '=':
      return { equals: str2number(gf.value) };
    case '!=':
      return { not: str2number(gf.value) };
    case '<':
      return { lt: str2number(gf.value) };
    case '>':
      return { gt: str2number(gf.value) };
    case '<=':
      return { lte: str2number(gf.value) };
    case '>=':
      return { gte: str2number(gf.value) };
    case 'isAnyOf':
      return { in: (gf.value ?? []).map((x) => str2number(x)) };
    case 'isEmpty':
      return { equals: undefined };
    case 'isNotEmpty':
      return { not: undefined };
    default:
      throw new ExhaustiveError(gf);
  }
};

export const gridFilterToPrismaFilterNumber = <T extends string>(
  gf: FilterNumberItem<T>,
): PrismaFilterReturn<T, Prisma.IntFilter> | null => {
  const x: Prisma.IntFilter = gf2pfsNumber(gf);
  return {
    [gf.field]: x,
  } as PrismaFilterReturn<T, Prisma.IntFilter>;
};

const gf2pfsDateTime = <T extends string>(
  gf: FilterDateItem<T>,
): Prisma.DateTimeFilter => {
  switch (gf.operator) {
    case 'is':
      return { equals: gf.value };
    case 'not':
      return { not: gf.value };
    case 'before':
      return { lt: gf.value };
    case 'after':
      return { gt: gf.value };
    case 'onOrBefore':
      return { lte: gf.value };
    case 'onOrAfter':
      return { gte: gf.value };
    case 'isEmpty':
      return { equals: undefined };
    case 'isNotEmpty':
      return { not: undefined };
    default:
      throw new ExhaustiveError(gf);
  }
};

export const gridFilterToPrismaFilterDateTime = <T extends string>(
  gf: FilterDateItem<T>,
): PrismaFilterReturn<T, Prisma.DateTimeFilter> | null => {
  const x: Prisma.DateTimeFilter = gf2pfsDateTime(gf);
  return {
    [gf.field]: x,
  } as PrismaFilterReturn<T, Prisma.DateTimeFilter>;
};

const gf2pfsEnum = <T extends EnumItemAbst>(
  gf: FilterEnumItem<T>,
): EnumFilter<T['value'][number]> | undefined => {
  if (typeof gf.value === 'undefined') return undefined;
  switch (gf.operator) {
    case 'is':
      if (typeof gf.value === 'undefined') return undefined;
      return { equals: gf.value };
    case 'not':
      return { not: { equals: gf.value } };
    case 'isAnyOf':
      return { in: gf.value };
    default:
      throw new ExhaustiveError(gf);
  }
};

type EnumFilter<Enum extends string> = {
  equals?: Enum;
  in?: Enum | Enum[];
  notIn?: Enum | Enum[];
  not?: NestedEnumFilter<Enum> | Enum;
};
type NestedEnumFilter<Enum extends string> = {
  equals?: Enum;
  in?: Enum | Enum[];
  notIn?: Enum | Enum[];
  not?: NestedEnumFilter<Enum> | Enum;
};

export const gridFilterToPrismaFilterEnum = <T extends EnumItemAbst>(
  gf: FilterEnumItem<T>,
): PrismaFilterReturn<T['field'], EnumFilter<T['value'][number]> | undefined> | null => {
  const x: EnumFilter<T['value'][number]> | undefined = gf2pfsEnum<T>(gf);
  return {
    [gf.field]: x,
  } as PrismaFilterReturn<T['field'], EnumFilter<T['value'][number]> | undefined>;
};

export const gridFilterToPrismaFilter = <T extends string, U extends FilterType>(
  gf: GridFilter<T, U>,
  type: U,
): PrismaFilter<T, U> | null => {
  switch (type) {
    case 'Boolean':
      return gridFilterToPrismaFilterBoolean(gf as GridFilter<T, 'Boolean'>) as PrismaFilter<T, U> | null;
    case 'Date':
      return gridFilterToPrismaFilterDateTime(gf as GridFilter<T, 'Date'>) as PrismaFilter<T, U> | null;
    case 'Number':
      return gridFilterToPrismaFilterNumber(gf as GridFilter<T, 'Number'>) as PrismaFilter<T, U> | null;
    case 'String':
      return gridFilterToPrismaFilterString(gf as GridFilter<T, 'String'>) as PrismaFilter<T, U> | null;
    default:
      throw new ExhaustiveError(type);
  }
};

type StrTuple = readonly [] | readonly [string] | readonly [string, string, ...string[]];

type DataGridColumn = {
  str: StrTuple;
  bool: StrTuple;
  num: StrTuple;
  date: StrTuple;
  enum: EnumItemTuple;
};

type DataGridFilter<Val extends Readonly<DataGridColumn>> = GridFilterModel<
  | MappedFilterBooleanItem<Val['bool']>[number]
  | MappedFilterDateItem<Val['date']>[number]
  | MappedFilterEnumItem<Val['enum']>[number]
  | MappedFilterNumberItem<Val['num']>[number]
  | MappedFilterStringItem<Val['str']>[number]
>;

// const isBooleanColumn = <T extends DataGridFilter<Val>['items'][number], Val extends Readonly<DataGridColumn>>(
//   x: T,
//   boolcolumns: Val['bool'],
// ): x is FilterBooleanItem<Val['bool'][number]> => boolcolumns.includes((x as {field: string}).field);

// deno-lint-ignore no-explicit-any
type DataGridColumnConfVal<T extends DataGridColumnConf<any>> = T extends DataGridColumnConf<infer R> ? R
  : never;

// deno-lint-ignore no-explicit-any
export type GetFilterFromDataGridColumnConf<T extends DataGridColumnConf<any>> = DataGridFilter<
  DataGridColumnConfVal<T>
>;

type MappedZodLiterals<T extends readonly z.Primitive[]> = {
  -readonly [K in keyof T]: z.ZodLiteral<T[K]>;
};
type MultiZodUnion<T extends readonly [z.Primitive, z.Primitive, ...z.Primitive[]]> = z.ZodUnion<MappedZodLiterals<T>>;

type CreateUnionSchemaWrappterReturnType<
  T extends readonly [] | readonly [z.Primitive] | readonly [z.Primitive, z.Primitive, ...z.Primitive[]],
> = T extends readonly [] ? z.ZodNever
  : T extends readonly [z.Primitive] ? z.ZodLiteral<T[0]>
  : T extends readonly [z.Primitive, z.Primitive, ...z.Primitive[]] ? MultiZodUnion<T>
  : never;
const createUnionSchemaWrapper = <
  T extends readonly [] | readonly [z.Primitive] | readonly [z.Primitive, z.Primitive, ...z.Primitive[]],
>(
  props: T,
  // deno-lint-ignore no-explicit-any
): CreateUnionSchemaWrappterReturnType<T> => createUnionSchema(props as any) as CreateUnionSchemaWrappterReturnType<T>;

type MappedEnumFields<T extends EnumItemTuple> = {
  -readonly [K in keyof T]: T[K]['field'];
};

type EnumField<
  T extends readonly [] | readonly [EnumItemAbst] | readonly [EnumItemAbst, EnumItemAbst, ...EnumItemAbst[]],
> = T extends readonly [] ? readonly []
  : T extends readonly [EnumItemAbst] ? readonly [T[0]['field']]
  : T extends readonly [EnumItemAbst, EnumItemAbst, ...EnumItemAbst[]] ? Readonly<MappedEnumFields<T>>
  : never;

// deno-lint-ignore no-explicit-any
type ExcludeFromTuple<T extends readonly any[], E> = T extends [infer F, ...infer R]
  ? ([F] extends [E] ? ExcludeFromTuple<R, E> : [F, ...ExcludeFromTuple<R, E>])
  : [];

type FilterEnumValue<EnumItems extends EnumItemTuple, T extends string> = ExcludeFromTuple<EnumItems, { field: T }>;
type GetEnumValue<EnumItems extends EnumItemTuple, T extends string> = FilterEnumValue<EnumItems, T> extends
  [EnumItem<T, infer R>] ? R : never;

// type GetPrismaWhereOptionArrayReturnType<Val extends Readonly<DataGridColumn>, T extends DataGridFilter<Val>['items']> =
//   {
//     [K in keyof T]: (
//       T[K] extends FilterBooleanItem<T[K]['field']> ? PrismaFilter<T[K]['field'], 'Boolean'>
//         : T[K] extends FilterDateItem<T[K]['field']> ? PrismaFilter<T[K]['field'], 'Date'>
//         // deno-lint-ignore no-explicit-any
//         : T[K] extends FilterEnumItem<EnumItem<T[K]['field'], any>>
//           ? EnumFilter<GetEnumValue<Val['enum'], T[K]['field']>[number]> | null
//         : T[K] extends FilterNumberItem<T[K]['field']> ? PrismaFilter<T[K]['field'], 'Number'>
//         : T[K] extends FilterStringItem<T[K]['field']> ? PrismaFilter<T[K]['field'], 'String'>
//         : never
//     );
//   };

export class DataGridColumnConf<Val extends Readonly<DataGridColumn>> {
  private val: Val;
  constructor(params: Val) {
    this.val = params;
  }

  get boolItemSchema() {
    return createFilterBooleanItemUnionSchema(this.val.bool) as CreateFilterBooleanItemUnionSchemaReturnType<
      Val['bool']
    >;
  }
  get dateItemSchema() {
    return createFilterDateItemUnionSchema(this.val.date) as CreateFilterDateItemUnionSchemaReturnType<Val['date']>;
  }
  get enumItemSchema() {
    return createFilterEnumItemUnionSchema(this.val.enum) as CreateFilterEnumItemUnionSchemaReturnType<Val['enum']>;
  }
  get numItemSchema() {
    return createFilterNumberItemUnionSchema(this.val.num) as CreateFilterNumberItemUnionSchemaReturnType<Val['num']>;
  }
  get strItemSchema() {
    return createFilterStringItemUnionSchema(this.val.str) as CreateFilterStringItemUnionSchemaReturnType<Val['str']>;
  }
  get anyItemSchema() {
    return z.union([
      this.strItemSchema,
      this.boolItemSchema,
      this.numItemSchema,
      this.dateItemSchema,
      this.enumItemSchema,
    ]);
  }

  get boolField(): Val['bool'] {
    return this.val.bool;
  }
  get dateField(): Val['date'] {
    return this.val.date;
  }
  get enumField() {
    return this.val.enum.map((x) => x.field) as unknown as EnumField<Val['enum']>;
  }
  get numField(): Val['num'] {
    return this.val.num;
  }
  get strField(): Val['str'] {
    return this.val.str;
  }

  get anyField(): readonly [...Val['bool'], ...Val['date'], ...EnumField<Val['enum']>, ...Val['num'], ...Val['str']] {
    return [
      ...this.boolField,
      ...this.dateField,
      ...this.enumField,
      ...this.numField,
      ...this.strField,
    ];
  }

  get anyFieldSchema() {
    return z.union([
      createUnionSchemaWrapper(this.boolField),
      createUnionSchemaWrapper(this.dateField),
      createUnionSchemaWrapper(this.enumField),
      createUnionSchemaWrapper(this.numField),
      createUnionSchemaWrapper(this.strField),
    ]);
  }

  get schema() {
    return z.object({
      items: this.anyItemSchema.array(),
      logicOperator: z.union([z.literal('and'), z.literal('or')]).optional(),
      quickFilterVales: z.any().optional(),
      quiclFilterLogicOperator: z.union([z.literal('and'), z.literal('or')]).optional(),
    });
  }
  parseFromString(query: string) {
    try {
      return this.schema.parse(parseJSONwithoutErr(query));
    } catch (e) {
      console.log(e);
      return { items: [] };
    }
  }

  private assertsBoolField(p: DataGridFilter<Val>['items'][number]): p is FilterBooleanItem<Val['bool'][number]> {
    return (this.boolField as unknown as string[]).includes(p.field);
  }
  private assertsDateField(p: DataGridFilter<Val>['items'][number]): p is FilterDateItem<Val['date'][number]> {
    return (this.dateField as unknown as string[]).includes(p.field);
  }
  private assertsEnumField(p: DataGridFilter<Val>['items'][number]): p is FilterEnumItem<Val['enum'][number]> {
    return (this.enumField as unknown as string[]).includes(p.field);
  }
  private assertsNumField(p: DataGridFilter<Val>['items'][number]): p is FilterNumberItem<Val['num'][number]> {
    return (this.numField as unknown as string[]).includes(p.field);
  }
  private assertsStrField(p: DataGridFilter<Val>['items'][number]): p is FilterStringItem<Val['str'][number]> {
    return (this.strField as unknown as string[]).includes(p.field);
  }

  private getPrismaWhereOptionArray<T extends DataGridFilter<Val>>(dataGridFilter: T) {
    const converted = dataGridFilter.items
      .map((x) => {
        if (this.assertsBoolField(x)) {
          return gridFilterToPrismaFilterBoolean(x);
        } else if (this.assertsDateField(x)) {
          return gridFilterToPrismaFilterDateTime(x);
        } else if (this.assertsEnumField(x)) {
          return gridFilterToPrismaFilterEnum(x);
        } else if (this.assertsNumField(x)) {
          return gridFilterToPrismaFilterNumber(x);
        } else if (this.assertsStrField(x)) {
          return gridFilterToPrismaFilterString(x);
        }
        throw new ExhaustiveError(x);
      });
    return recordUnion(converted) as Partial<ReturnType<typeof recordUnion>>;
  }

  getPrismaWhereInput<T extends DataGridFilter<Val>>(dataGridFilter: T, defaultOperator: 'and' | 'or' = 'and') {
    if (dataGridFilter.logicOperator ?? defaultOperator === 'and') {
      return { 'AND': this.getPrismaWhereOptionArray(dataGridFilter) };
    } else {
      return { 'OR': this.getPrismaWhereOptionArray(dataGridFilter) };
    }
  }
}
