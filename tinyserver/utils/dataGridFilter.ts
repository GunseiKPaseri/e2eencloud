import { z } from '../deps.ts';
import { ExhaustiveError } from '../util.ts';

import type { Prisma } from '../dbclient.ts';

/*******
 *  Boolean Filter
 */

export const filterBooleanItemSchema = <T extends string>(fieldname: T) =>
  filterBooleanItemSchemaCore(z.literal(fieldname));
type FilterBooleanItemSchema<T extends string> = ReturnType<typeof filterBooleanItemSchema<T>>;

const filterBooleanItemSchemaCore = <T extends z.ZodType>(schema: T) =>
  z.object({
    columnField: schema,
    value: z.union([
      z.literal('any'),
      z.literal('true'),
      z.literal('false'),
    ]),
    operatorValue: z.literal('is'),
  });

export type FilterBooleanItem<T extends string> = {
  columnField: T;
  value: 'any' | 'true' | 'false';
  operatorValue: 'is';
};

// For Union
type MappedFilterBooleanItem<T extends readonly string[]> = {
  -readonly [K in keyof T]: FilterBooleanItemSchema<T[K]>;
};

export function createFilterBooleanItemUnion<A extends readonly [string, string, ...string[]]>(items: A) {
  return z.union(
    items.map((str) => filterBooleanItemSchema(str)) as MappedFilterBooleanItem<A>,
  );
}

type CreateFilterBooleanItemUnionSchema = {
  <T extends readonly []>(values: T): z.ZodNever;
  <T extends readonly [string]>(values: T): FilterBooleanItemSchema<T[0]>;
  <T extends readonly [string, string, ...string[]]>(values: T): z.ZodUnion<MappedFilterBooleanItem<T>>;
};
export const createFilterBooleanItemUnionSchema = (<T extends readonly [...string[]]>(
  values: T,
) => {
  if (values.length > 1) {
    return createFilterBooleanItemUnion(
      values as unknown as [string, string, ...string[]],
    );
  } else if (values.length === 1) {
    return filterBooleanItemSchema(values[0]) as FilterBooleanItemSchema<T[0]>;
  } else if (values.length === 0) {
    return z.never();
  }
  throw new Error('Array must have a length');
}) as CreateFilterBooleanItemUnionSchema;

/*****
 * Number filter
 */

export const filterNumberItemSchema = <T extends string>(fieldname: T) =>
  filterNumberItemSchemaCore(z.literal(fieldname));
type FilterNumberItemSchema<T extends string> = ReturnType<typeof filterNumberItemSchema<T>>;

export const filterNumberItemSchemaCore = <T extends z.ZodType>(schema: T) =>
  z.union([
    z.object({
      columnField: schema,
      value: z.string(),
      operatorValue: z.union([
        z.literal('='),
        z.literal('!='),
        z.literal('>'),
        z.literal('>='),
        z.literal('<'),
        z.literal('<='),
      ]),
    }),
    z.object({
      columnField: schema,
      value: z.string().array(),
      operatorValue: z.literal('isAnyOf'),
    }),
    z.object({
      columnField: schema,
      operatorValue: z.union([z.literal('isEmpty'), z.literal('isNotEmpty')]),
    }),
  ]);

export type FilterNumberItem<T extends string> = {
  columnField: T;
  value: string;
  operatorValue: '=' | '!=' | '>' | '>=' | '<' | '<=';
} | {
  columnField: T;
  value: string[];
  operatorValue: 'isAnyOf';
} | {
  columnField: T;
  operatorValue: 'isEmpty' | 'isNotEmpty';
};

// For Union
type MappedFilterNumberItem<T extends readonly string[]> = {
  -readonly [K in keyof T]: FilterNumberItemSchema<T[K]>;
};

function createFilterNumberItemUnion<A extends readonly [string, string, ...string[]]>(items: A) {
  return z.union(
    items.map((str) => filterNumberItemSchema(str)) as MappedFilterNumberItem<A>,
  );
}

type CreateFilterNumberItemUnionSchema = {
  <T extends readonly []>(values: T): z.ZodNever;
  <T extends readonly [string]>(values: T): FilterNumberItemSchema<T[0]>;
  <T extends readonly [string, string, ...string[]]>(values: T): z.ZodUnion<MappedFilterNumberItem<T>>;
};
export const createFilterNumberItemUnionSchema = (<T extends readonly string[]>(values: T) => {
  if (values.length > 1) {
    return createFilterNumberItemUnion(
      values as unknown as [string, string, ...string[]],
    );
  } else if (values.length === 1) {
    return filterNumberItemSchema(values[0]) as FilterNumberItemSchema<T[0]>;
  } else if (values.length === 0) {
    return z.never();
  }
  throw new Error('Array must have a length');
}) as CreateFilterNumberItemUnionSchema;

/********
 * String Filter
 */

export const filterStringItemSchema = <T extends string>(fieldname: T) =>
  filterStringItemSchemaCore(z.literal(fieldname));
type FilterStringItemSchema<T extends string> = ReturnType<typeof filterStringItemSchema<T>>;

export const filterStringItemSchemaCore = <T extends z.ZodType>(schema: T) =>
  z.union([
    z.object({
      columnField: schema,
      value: z.string(),
      operatorValue: z.union([
        z.literal('contains'),
        z.literal('equals'),
        z.literal('startsWith'),
        z.literal('endsWith'),
      ]),
    }),
    z.object({
      columnField: schema,
      value: z.string().array(),
      operatorValue: z.literal('isAnyOf'),
    }),
    z.object({
      columnField: schema,
      operatorValue: z.union([z.literal('isEmpty'), z.literal('isNotEmpty')]),
    }),
  ]);

export type FilterStringItem<T extends string> = {
  columnField: T;
  value: string;
  operatorValue: 'contains' | 'equals' | 'startsWith' | 'endsWith';
} | {
  columnField: T;
  value: string[];
  operatorValue: 'isAnyOf';
} | {
  columnField: T;
  operatorValue: 'isEmpty' | 'isNotEmpty';
};

// For Union
type MappedFilterStringItem<T extends readonly string[]> = {
  -readonly [K in keyof T]: FilterStringItemSchema<T[K]>;
};

function createFilterStringItemUnion<A extends readonly [string, string, ...string[]]>(items: A) {
  return z.union(
    items.map((str) => filterStringItemSchema(str)) as MappedFilterStringItem<A>,
  );
}

type CreateFilterStringItemUnionSchema = {
  <T extends readonly []>(values: T): z.ZodNever;
  <T extends readonly [string]>(values: T): FilterStringItemSchema<T[0]>;
  <T extends readonly [string, string, ...string[]]>(values: T): z.ZodUnion<MappedFilterStringItem<T>>;
};

export const createFilterStringItemUnionSchema = (<T extends readonly string[]>(values: T) => {
  if (values.length > 1) {
    return createFilterStringItemUnion(
      values as typeof values & [string, string, ...string[]],
    );
  } else if (values.length === 1) {
    return filterStringItemSchema(values[0]) as FilterStringItemSchema<T[0]>;
  } else if (values.length === 0) {
    return z.never();
  }
  throw new Error('Array must have a length');
}) as CreateFilterStringItemUnionSchema;

/********
 * Date Filter
 */

export const filterDateItemSchema = <T extends string>(fieldname: T) => filterDateItemSchemaCore(z.literal(fieldname));
type FilterDateItemSchema<T extends string> = ReturnType<typeof filterDateItemSchema<T>>;

export const filterDateItemSchemaCore = <T extends z.ZodType>(schema: T) =>
  z.union([
    z.object({
      columnField: schema,
      value: z.string(),
      operatorValue: z.union([
        z.literal('is'),
        z.literal('not'),
        z.literal('after'),
        z.literal('onOrAfter'),
        z.literal('before'),
        z.literal('onOrBefore'),
      ]),
    }),
    z.object({
      columnField: schema,
      operatorValue: z.union([z.literal('isEmpty'), z.literal('isNotEmpty')]),
    }),
  ]);

export type FilterDateItem<T extends string> = {
  columnField: T;
  value: string;
  operatorValue: 'is' | 'not' | 'after' | 'onOrAfter' | 'before' | 'onOrBefore';
} | {
  columnField: T;
  operatorValue: 'isEmpty' | 'isNotEmpty';
};

// For Union
type MappedFilterDateItem<T extends readonly string[]> = {
  -readonly [K in keyof T]: FilterDateItemSchema<T[K]>;
};

function createFilterDateItemUnion<A extends readonly [string, string, ...string[]]>(items: A) {
  return z.union(
    items.map((str) => filterDateItemSchema(str)) as MappedFilterDateItem<A>,
  );
}

type CreateFilterDateItemUnionSchema = {
  <T extends readonly []>(values: T): z.ZodNever;
  <T extends readonly [string]>(values: T): FilterDateItemSchema<T[0]>;
  <T extends readonly [string, string, ...string[]]>(values: T): z.ZodUnion<MappedFilterDateItem<T>>;
};

export const createFilterDateItemUnionSchema = (<T extends readonly string[]>(values: T) => {
  if (values.length > 1) {
    return createFilterDateItemUnion(
      values as typeof values & [string, string, ...string[]],
    );
  } else if (values.length === 1) {
    return filterDateItemSchema(values[0]) as FilterDateItemSchema<T[0]>;
  } else if (values.length === 0) {
    return z.never();
  }
  throw new Error('Array must have a length');
}) as CreateFilterDateItemUnionSchema;

// type GridFilterModelItem<T extends string> =
//   | FilterBooleanItem<T>
//   | FilterNumberItem<T>
//   | FilterStringItem<T>
//   | FilterDateItem<T>;

export interface GridFilterModel<T> {
  items: T[];
  linkOperator: 'and' | 'or';
}

export const anyFilterModelSchema = <T extends z.ZodType>(schema: T, target: unknown) => {
  try {
    return z.object({
      items: schema.array(),
      linkOperator: z.union([z.literal('and'), z.literal('or')]),
    }).parse(target);
  } catch (_) {
    return { items: [], linkOperator: 'and' as const };
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

type PrismaFilterTuple<T extends string, U extends FilterType> = [T, PrismaFilter<T, U>];

export const gridFilterToPrismaFilterBoolean = <T extends string>(
  gf: FilterBooleanItem<T>,
): PrismaFilter<T, 'Boolean'> => {
  const x: Prisma.BoolFilter = { equals: gf.value === 'any' ? undefined : gf.value === 'true' };
  return {
    [gf.columnField]: x,
  } as PrismaFilterReturn<T, Prisma.BoolFilter>;
};

const gf2pfsString = <T extends string>(
  gf: FilterStringItem<T>,
): Prisma.StringFilter => {
  switch (gf.operatorValue) {
    case 'contains':
    case 'equals':
    case 'startsWith':
    case 'endsWith':
      return { [gf.operatorValue]: gf.value };
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
    [gf.columnField]: x,
  } as PrismaFilterReturn<T, Prisma.StringFilter>;
};

const gf2pfsNumber = <T extends string>(
  gf: FilterNumberItem<T>,
): Prisma.IntFilter => {
  switch (gf.operatorValue) {
    case '=':
      return { equals: Number(gf.value) };
    case '!=':
      return { not: Number(gf.value) };
    case '<':
      return { lt: Number(gf.value) };
    case '>':
      return { gt: Number(gf.value) };
    case '<=':
      return { lte: Number(gf.value) };
    case '>=':
      return { gte: Number(gf.value) };
    case 'isAnyOf':
      return { in: gf.value.map((x) => Number(x)) };
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
    [gf.columnField]: x,
  } as PrismaFilterReturn<T, Prisma.IntFilter>;
};

const gf2pfsDateTime = <T extends string>(
  gf: FilterDateItem<T>,
): Prisma.DateTimeFilter => {
  switch (gf.operatorValue) {
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
    [gf.columnField]: x,
  } as PrismaFilterReturn<T, Prisma.DateTimeFilter>;
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

// export const filterModelToPrismaWhereInput = <T extends string, U extends GridFilterModelItem<T>>(
//   filterModel?: GridFilterModel<U>,
//   additionalObj: WhereInput[] = [],
// ) => {
//   const terms = filterModel
//     ? filterModel.items.map((x) => {
//       switch (x.operatorValue) {
//         // number
//         case '!=':
//           return Where.ne(x.columnField, Number(x.value));
//         case '<':
//           return Where.lt(x.columnField, Number(x.value));
//         case '<=':
//           return Where.lte(x.columnField, Number(x.value));
//         case '>':
//           return Where.gt(x.columnField, Number(x.value));
//         case '>=':
//           return Where.gte(x.columnField, Number(x.value));
//         case '=':
//           return Where.eq(x.columnField, Number(x.value));
//         // string
//         case 'contains':
//           return Where.like(x.columnField, `%${x.value}%`);
//         case 'equals':
//           return Where.like(x.columnField, x.value);
//         case 'startsWith':
//           return Where.like(x.columnField, `${x.value}%`);
//         case 'endsWith':
//           return Where.like(x.columnField, `%${x.value}`);
//         // boolean
//         case 'is':
//           return x.value === 'true'
//             ? Where.eq(x.columnField, true)
//             : x.value === 'false'
//             ? Where.eq(x.columnField, false)
//             : null;
//         // date
//         case 'not':
//           return Where.ne(x.columnField, new Date(x.value));
//         case 'before':
//           return Where.lt(x.columnField, new Date(x.value));
//         case 'onOrBefore':
//           return Where.lte(x.columnField, new Date(x.value));
//         case 'after':
//           return Where.gt(x.columnField, new Date(x.value));
//         case 'onOrAfter':
//           return Where.gte(x.columnField, new Date(x.value));
//         case 'isEmpty':
//           return Where.isNull(x.columnField);
//         case 'isNotEmpty':
//           // return Where.isNotNull(x.columnField); // has bug
//           return Where.expr('?? IS NOT NULL', x.columnField);
//         case 'isAnyOf':
//           return x.value.length > 0 ? Where.in(x.columnField, x.value) : null;
//         default:
//           throw new ExhaustiveError(x);
//       }
//     })
//     : [];
//   return filterModel?.linkOperator === 'or'
//     ? Where.or(...terms, ...additionalObj)
//     : Where.and(...terms, ...additionalObj);
// };
