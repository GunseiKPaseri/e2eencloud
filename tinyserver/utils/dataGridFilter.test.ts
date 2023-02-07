import { assertType, z } from '../deps.ts'
import type { IsExact } from '../deps.ts'

import {
  filterBooleanItemSchema,
  filterDateItemSchema,
  filterNumberItemSchema,
  filterStringItemSchema,
} from './dataGridFilter.ts'
import type { FilterBooleanItem, FilterDateItem, FilterNumberItem, FilterStringItem } from './dataGridFilter.ts'

Deno.test('スキーマと同じ型宣言を行っている', () => {
  assertType<IsExact<z.infer<ReturnType<typeof filterBooleanItemSchema<'hoge'>>>, FilterBooleanItem<'hoge'>>>(true)
  assertType<IsExact<z.infer<ReturnType<typeof filterDateItemSchema<'hoge'>>>, FilterDateItem<'hoge'>>>(true)
  assertType<IsExact<z.infer<ReturnType<typeof filterNumberItemSchema<'hoge'>>>, FilterNumberItem<'hoge'>>>(true)
  assertType<IsExact<z.infer<ReturnType<typeof filterStringItemSchema<'hoge'>>>, FilterStringItem<'hoge'>>>(true)
})
