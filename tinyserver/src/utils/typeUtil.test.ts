import { assertType, expect, type IsExact } from 'tinyserver/deps.ts';
import type { Intersectionize } from './typeUtil.ts';
import { recordUnion } from './typeUtil.ts';

Deno.test('#Intersectionize', () => {
  assertType<IsExact<Intersectionize<{ a: 'hoge' } | { b: 'fuga' }>, { a: 'hoge'; b: 'fuga' }>>(true);
  assertType<IsExact<Intersectionize<'a' | 'b'>, never>>(true);
  assertType<IsExact<Intersectionize<{ a: 'hoge' } | { a: 'fuga' }>, never>>(true);
});

Deno.test('#recordUnion', () => {
  const x = { a: 'hoge' } as const;
  const y = { b: 'fuga' } as const;
  expect(recordUnion([x, y, null])).toEqual({ a: 'hoge', b: 'fuga' } as const);

  const a = { a: 'hoge' } as const;
  const b = { a: 'fuga' } as const;
  expect(recordUnion([a, b])).toEqual({ a: 'fuga' } as const);
});
