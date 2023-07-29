import { assertType, expect, z } from 'tinyserver/deps.ts';
import type { IsExact } from 'tinyserver/deps.ts';

import {
  DataGridColumnConf,
  filterBooleanItemSchema,
  filterDateItemSchema,
  filterNumberItemSchema,
  filterStringItemSchema,
  GetFilterFromDataGridColumnConf,
} from './dataGridFilter.ts';
import type { FilterBooleanItem, FilterDateItem, FilterNumberItem, FilterStringItem } from './dataGridFilter.ts';

Deno.test('スキーマと同じ型宣言を行っている', () => {
  assertType<IsExact<z.infer<ReturnType<typeof filterBooleanItemSchema<'hoge'>>>, FilterBooleanItem<'hoge'>>>(true);
  assertType<IsExact<z.infer<ReturnType<typeof filterDateItemSchema<'hoge'>>>, FilterDateItem<'hoge'>>>(true);
  assertType<IsExact<z.infer<ReturnType<typeof filterNumberItemSchema<'hoge'>>>, FilterNumberItem<'hoge'>>>(true);
  assertType<IsExact<z.infer<ReturnType<typeof filterStringItemSchema<'hoge'>>>, FilterStringItem<'hoge'>>>(true);
});

Deno.test('field', () => {
  const sampleFilterConfig = new DataGridColumnConf(
    {
      bool: ['isConfirmed', 'useMFA'],
      date: ['created_at', 'updated_at'],
      enum: [{ field: 'role', value: ['ADMIN', 'USER'] }, { field: 'plan', value: ['FREE', 'PRO', 'ENTERPRISE'] }],
      num: ['capacity', 'file_usage'],
      str: ['id', 'email'],
    } as const,
  );
  expect(sampleFilterConfig.boolField).toEqual(['isConfirmed', 'useMFA']);
  assertType<IsExact<typeof sampleFilterConfig.boolField, readonly ['isConfirmed', 'useMFA']>>(true);
  expect(sampleFilterConfig.dateField).toEqual(['created_at', 'updated_at']);
  assertType<IsExact<typeof sampleFilterConfig.dateField, readonly ['created_at', 'updated_at']>>(true);
  expect(sampleFilterConfig.enumField).toEqual(['role', 'plan']);
  assertType<IsExact<typeof sampleFilterConfig.enumField, readonly ['role', 'plan']>>(true);
  expect(sampleFilterConfig.numField).toEqual(['capacity', 'file_usage']);
  assertType<IsExact<typeof sampleFilterConfig.numField, readonly ['capacity', 'file_usage']>>(true);
  expect(sampleFilterConfig.strField).toEqual(['id', 'email']);
  assertType<IsExact<typeof sampleFilterConfig.strField, readonly ['id', 'email']>>(true);
  expect(sampleFilterConfig.anyField).toEqual([
    'isConfirmed',
    'useMFA',
    'created_at',
    'updated_at',
    'role',
    'plan',
    'capacity',
    'file_usage',
    'id',
    'email',
  ]);
  assertType<
    IsExact<
      typeof sampleFilterConfig.anyField,
      readonly [
        'isConfirmed',
        'useMFA',
        'created_at',
        'updated_at',
        'role',
        'plan',
        'capacity',
        'file_usage',
        'id',
        'email',
      ]
    >
  >(true);

  assertType<
    IsExact<
      z.infer<typeof sampleFilterConfig.anyFieldSchema>,
      (
        | 'isConfirmed'
        | 'useMFA'
        | 'created_at'
        | 'updated_at'
        | 'role'
        | 'plan'
        | 'capacity'
        | 'file_usage'
        | 'id'
        | 'email'
      )
    >
  >(true);

  const anyFieldSchema = sampleFilterConfig.anyFieldSchema;
  expect(anyFieldSchema.safeParse('isConfirmed')).toEqual({ data: 'isConfirmed', success: true });
  expect(anyFieldSchema.safeParse('isConfirm').success).toBe(false);
  expect(anyFieldSchema.safeParse('role')).toEqual({ data: 'role', success: true });
});

Deno.test('datagrid schema', () => {
  const sampleFilterConfig = new DataGridColumnConf(
    {
      bool: ['isConfirmed', 'useMFA'],
      date: ['created_at', 'updated_at'],
      enum: [{ field: 'role', value: ['ADMIN', 'USER'] }, { field: 'plan', value: ['FREE', 'PRO', 'ENTERPRISE'] }],
      num: ['capacity', 'file_usage'],
      str: ['id', 'email'],
    } as const,
  );
  const schema = sampleFilterConfig.schema;

  type Schema = {
    logicOperator?: 'and' | 'or' | undefined;
    // deno-lint-ignore no-explicit-any
    quickFilterVales?: any;
    quiclFilterLogicOperator?: 'and' | 'or' | undefined;
    items: (
      // bool
      | {
        field: 'isConfirmed';
        value?: '' | 'true' | 'false';
        operator: 'is';
      }
      | {
        field: 'useMFA';
        value?: '' | 'true' | 'false';
        operator: 'is';
      }
      // date
      | {
        field: 'created_at';
        value?: string;
        operator: 'is' | 'not' | 'after' | 'onOrAfter' | 'before' | 'onOrBefore';
      }
      | {
        field: 'created_at';
        operator: 'isEmpty' | 'isNotEmpty';
      }
      | {
        field: 'updated_at';
        value?: string;
        operator: 'is' | 'not' | 'after' | 'onOrAfter' | 'before' | 'onOrBefore';
      }
      | {
        field: 'updated_at';
        operator: 'isEmpty' | 'isNotEmpty';
      }
      // enum
      | {
        value?: 'ADMIN' | 'USER' | undefined;
        field: 'role';
        operator: 'is' | 'not';
      }
      | {
        value?: ('ADMIN' | 'USER')[] | undefined;
        field: 'role';
        operator: 'isAnyOf';
      }
      | {
        value?: 'FREE' | 'PRO' | 'ENTERPRISE' | undefined;
        field: 'plan';
        operator: 'is' | 'not';
      }
      | {
        value?: ('FREE' | 'PRO' | 'ENTERPRISE')[] | undefined;
        field: 'plan';
        operator: 'isAnyOf';
      }
      // num
      | {
        value?: string | undefined;
        field: 'capacity';
        operator: '=' | '!=' | '>' | '>=' | '<' | '<=';
      }
      | {
        value?: string[] | undefined;
        field: 'capacity';
        operator: 'isAnyOf';
      }
      | {
        field: 'capacity';
        operator: 'isEmpty' | 'isNotEmpty';
      }
      | {
        value?: string | undefined;
        field: 'file_usage';
        operator: '=' | '!=' | '>' | '>=' | '<' | '<=';
      }
      | {
        value?: string[] | undefined;
        field: 'file_usage';
        operator: 'isAnyOf';
      }
      | {
        field: 'file_usage';
        operator: 'isEmpty' | 'isNotEmpty';
      }
      // string
      | {
        value?: string | undefined;
        field: 'id';
        operator: 'contains' | 'equals' | 'startsWith' | 'endsWith';
      }
      | {
        value?: string[] | undefined;
        field: 'id';
        operator: 'isAnyOf';
      }
      | {
        field: 'id';
        operator: 'isEmpty' | 'isNotEmpty';
      }
      | {
        value?: string | undefined;
        field: 'email';
        operator: 'contains' | 'equals' | 'startsWith' | 'endsWith';
      }
      | {
        value?: string[] | undefined;
        field: 'email';
        operator: 'isAnyOf';
      }
      | {
        field: 'email';
        operator: 'isEmpty' | 'isNotEmpty';
      }
    )[];
  };
  assertType<IsExact<z.infer<typeof schema>, Schema>>(true);
  expect(schema.safeParse({
    items: [{
      value: 'FREE',
      field: 'plan',
      operator: 'is',
    }],
  })).toEqual({
    data: {
      items: [{
        value: 'FREE',
        field: 'plan',
        operator: 'is',
      }],
    },
    success: true,
  });
});

Deno.test('prisma', () => {
  const sampleFilterConfig = new DataGridColumnConf(
    {
      bool: ['isConfirmed', 'useMFA'],
      date: ['created_at', 'updated_at'],
      enum: [{ field: 'role', value: ['ADMIN', 'USER'] }, { field: 'plan', value: ['FREE', 'PRO', 'ENTERPRISE'] }],
      num: ['capacity', 'file_usage'],
      str: ['id', 'email'],
    } as const,
  );
  const prismaTestCase: {
    dataGridFilter: GetFilterFromDataGridColumnConf<typeof sampleFilterConfig>;
    expect: ReturnType<typeof sampleFilterConfig.getPrismaWhereInput>;
  }[] = [
    // bool
    {
      dataGridFilter: { items: [{ value: 'false', field: 'isConfirmed', operator: 'is' }], logicOperator: 'and' },
      expect: { 'AND': { isConfirmed: { equals: false } } },
    },
    {
      dataGridFilter: { items: [{ value: 'true', field: 'isConfirmed', operator: 'is' }], logicOperator: 'and' },
      expect: { 'AND': { isConfirmed: { equals: true } } },
    },
    {
      dataGridFilter: { items: [{ value: 'true', field: 'isConfirmed', operator: 'is' }], logicOperator: 'and' },
      expect: { 'AND': { isConfirmed: { equals: true } } },
    },
    // date
    {
      dataGridFilter: { items: [{ value: 'hoge', field: 'created_at', operator: 'is' }], logicOperator: 'and' },
      expect: { 'AND': { created_at: { equals: 'hoge' } } },
    },
    // enum
    {
      dataGridFilter: { items: [{ value: ['FREE', 'PRO'], field: 'plan', operator: 'isAnyOf' }], logicOperator: 'and' },
      expect: { 'AND': { plan: { 'in': ['FREE', 'PRO'] } } },
    },
    {
      dataGridFilter: { items: [{ value: 'FREE', field: 'plan', operator: 'is' }], logicOperator: 'and' },
      expect: { 'AND': { plan: { equals: 'FREE' } } },
    },
    {
      dataGridFilter: { items: [{ value: 'FREE', field: 'plan', operator: 'not' }], logicOperator: 'and' },
      expect: { 'AND': { plan: { not: { equals: 'FREE' } } } },
    },
  ];

  prismaTestCase.map((x) => {
    const prismaWhereInputSample = sampleFilterConfig.getPrismaWhereInput(x.dataGridFilter);
    const y = prismaWhereInputSample?.AND;
    type C = keyof (Exclude<typeof y, undefined>);
    expect(prismaWhereInputSample).toEqual(x.expect);
  });
});
