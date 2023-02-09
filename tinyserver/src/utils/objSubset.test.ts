import { expect } from 'tinyserver/deps.ts';

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
