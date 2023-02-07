import { expect } from 'https://deno.land/x/expect@v0.2.10/mod.ts';

import { omit, pick } from './objSubset.ts';

Deno.test('can emit string arr', () => {
  const x = {
    a: 'hoge',
    b: 'fuga',
    c: 'piyo',
  };
  expect(pick(x, ['a'])).toEqual({ a: 'hoge' });
  expect(omit(x, ['a'])).toEqual({ b: 'fuga', c: 'piyo' });
});
