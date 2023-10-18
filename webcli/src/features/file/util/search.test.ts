import type { Infer } from 'lizod';
import { describe, test, expect } from 'vitest';
import { buildFileTable } from '~/features/file/utils';
import { assertType, type IsExact } from '~/utils/testingTypes';
import {
  addEmptyIdToQuery,
  highlightMark,
  omitIdFromQuery,
  searchFromTable,
  searchQueryBuilder,
  SearchQueryParser,
} from './search';
import type {
  searchQuerySetTypeValidator,
  SearchQuerySetForRedux,
  strSearchTypeValidator,
  StrSearchType,
  NumberSearchType,
  numberSearchTypeValidator,
  SearchQueryForReduxOmitId,
} from './search.type';
import {
  genFileInfoFolder,
  genFileInfoFile,
  genFileInfoDiff,
} from './testutil';

describe('Validator', () => {
  test('要求する型に一致する', () => {
    assertType<
      IsExact<
        Infer<typeof searchQuerySetTypeValidator>,
        SearchQuerySetForRedux['type']
      >
    >(true);
    assertType<IsExact<Infer<typeof strSearchTypeValidator>, StrSearchType>>(
      true,
    );
    assertType<
      IsExact<Infer<typeof numberSearchTypeValidator>, NumberSearchType>
    >(true);
  });
});

describe('#highlightMark', () => {
  test('正しくハイライトできる', () => {
    expect(
      highlightMark('abcdefghijklmnopqrstu', 'name', [
        ['name', 3, 8],
        ['mime', 10, 15],
      ]),
    ).toBe('abc<mark>defgh</mark>ijklmnopqrstu');
    expect(
      highlightMark('abcdefghijklmnopqrstu', 'name', [
        ['name', 3, 8],
        ['name', 6, 10],
      ]),
    ).toBe('abc<mark>defghij</mark>klmnopqrstu');
    expect(
      highlightMark('abcdefghijklmnopqrstu', 'name', [
        ['name', 3, 8],
        ['name', 8, 10],
      ]),
    ).toBe('abc<mark>defgh</mark><mark>ij</mark>klmnopqrstu');
    expect(
      highlightMark('abcdefghijklmnopqrstu', 'name', [
        ['name', 3, 8],
        ['name', 10, 15],
      ]),
    ).toBe('abc<mark>defgh</mark>ij<mark>klmno</mark>pqrstu');
  });
});

describe('#searchFromTable', () => {
  test('正しく取得できる', () => {
    const a = genFileInfoFolder({ id: 'a', parentId: null, tag: [] });
    const b = genFileInfoFile({
      id: 'b',
      name: 'b.hoge',
      parentId: 'a',
      tag: [],
    });
    const c = genFileInfoDiff({
      diff: { addtag: ['あ'] },
      id: 'c',
      name: 'b.hoge',
      parentId: 'a',
      prevId: 'b',
    });
    const d = genFileInfoDiff({
      diff: { addtag: ['い'] },
      id: 'd',
      name: 'b.hoge',
      parentId: 'a',
      prevId: 'c',
    });
    const e = genFileInfoFile({
      id: 'e',
      name: 'b.hoge',
      parentId: 'a',
      prevId: 'd',
      tag: ['あ', 'い'],
    });
    const f = genFileInfoFile({
      id: 'f',
      name: 'b.hoge',
      parentId: 'a',
      prevId: 'e',
      tag: ['あ'],
    });
    const g = genFileInfoDiff({
      diff: { addtag: ['い'] },
      id: 'g',
      name: 'b.hoge',
      parentId: 'a',
      prevId: 'f',
    });
    const h = genFileInfoFile({
      id: 'h',
      name: 'h.hoge',
      parentId: 'a',
      tag: ['う'],
    });
    const i = genFileInfoFile({
      id: 'i',
      name: 'i.hoge',
      parentId: 'a',
      tag: [],
    });
    const j = genFileInfoDiff({
      diff: { addtag: ['い'] },
      id: 'j',
      name: 'がi.fuga',
      parentId: null,
      prevId: 'i',
    });
    const k = genFileInfoDiff({
      diff: { addtag: ['う', 'え'], deltag: ['あ'] },
      id: 'k',
      name: 'g.hoge',
      parentId: 'a',
      prevId: 'g',
    });
    const { fileTable } = buildFileTable([a, b, c, d, e, f, g, h, i, j, k]);
    const resultName = searchFromTable(fileTable, {
      id: '',
      term: [{ id: '', term: [{ id: '', type: 'name', word: 'g.hoge' }] }],
    }).sort();
    expect(resultName).toEqual([['f', [['name', 0, 6]]]]);
    const resultNameReg = searchFromTable(fileTable, {
      id: '',
      term: [{ id: '', term: [{ id: '', type: 'name', word: /.hoge$/ }] }],
    }).sort();
    expect(resultNameReg).toEqual([
      ['f', [['name', 1, 6]]],
      ['h', [['name', 1, 6]]],
    ]);

    const resultTag = searchFromTable(fileTable, {
      id: '',
      term: [{ id: '', term: [{ id: '', type: 'tag', value: 'い' }] }],
    }).sort();
    expect(resultTag).toEqual([
      ['f', []],
      ['i', []],
    ]);

    const resultNameRegAndTag = searchFromTable(fileTable, {
      id: '',
      term: [
        {
          id: '',
          term: [
            { id: '', type: 'name', word: /.hoge$/ },
            { id: '', type: 'tag', value: 'い' },
          ],
        },
      ],
    }).sort();
    expect(resultNameRegAndTag).toEqual([['f', [['name', 1, 6]]]]);
    const resultNameRegOrTag = searchFromTable(fileTable, {
      id: '',
      term: [
        { id: '', term: [{ id: '', type: 'name', word: /.hoge$/ }] },
        { id: '', term: [{ id: '', type: 'tag', value: 'い' }] },
      ],
    }).sort();
    expect(resultNameRegOrTag).toEqual([
      ['f', [['name', 1, 6]]],
      ['h', [['name', 1, 6]]],
      ['i', []],
    ]);
    const resultNameNFKD = searchFromTable(fileTable, {
      id: '',
      term: [{ id: '', term: [{ id: '', type: 'name', word: 'が' }] }],
    }).sort();
    expect(resultNameNFKD).toEqual([['i', [['name', 0, 2]]]]);
    const resultNameUpperCase = searchFromTable(fileTable, {
      id: '',
      term: [{ id: '', term: [{ id: '', type: 'name', word: 'Ｇ．HOGE' }] }],
    }).sort();
    expect(resultNameUpperCase).toEqual([['f', [['name', 0, 6]]]]);
  });
});

const SearchQueryTestCase: [string, SearchQueryForReduxOmitId][] = [
  ['', { term: [] }],
  ['Hogehoge', { term: [{ term: [{ type: 'name', word: 'Hogehoge' }] }] }],
  [
    '"Hogehoge"',
    {
      term: [{ term: [{ searchType: 'in', type: 'name', word: 'Hogehoge' }] }],
    },
  ],
  ['tag:', { term: [{ term: [{ type: 'tag', value: '' }] }] }],
  [
    'Hogehoge mime: image/png　OR Fugafuga tag:😃',
    {
      term: [
        {
          term: [
            { type: 'name', word: 'Hogehoge' },
            { type: 'mime', word: 'image/png' },
          ],
        },
        {
          term: [
            { type: 'name', word: 'Fugafuga' },
            { type: 'tag', value: '😃' },
          ],
        },
      ],
    },
  ],
  ['"Hogehoge', { term: [{ term: [{ type: 'name', word: '"Hogehoge' }] }] }],
  ['tag:"fuga', { term: [{ term: [{ type: 'tag', value: '"fuga' }] }] }],
  [
    '"b b" tag:"a a"',
    {
      term: [
        {
          term: [
            { searchType: 'in', type: 'name', word: 'b b' },
            { type: 'tag', value: 'a a' },
          ],
        },
      ],
    },
  ],
  [
    'Hogehoge size: <= 128',
    {
      term: [
        {
          term: [
            { type: 'name', word: 'Hogehoge' },
            { operator: '<=', type: 'size', value: 128 },
          ],
        },
      ],
    },
  ],
  [
    'Hogehoge size:   128',
    {
      term: [
        {
          term: [
            { type: 'name', word: 'Hogehoge' },
            { operator: '==', type: 'size', value: 128 },
          ],
        },
      ],
    },
  ],
  [
    'Hogehoge size: = 128',
    {
      term: [
        {
          term: [
            { type: 'name', word: 'Hogehoge' },
            { operator: '==', type: 'size', value: 128 },
          ],
        },
      ],
    },
  ],
  [
    'Hogehoge size: > 128 OR OR',
    {
      term: [
        {
          term: [
            { type: 'name', word: 'Hogehoge' },
            { operator: '>', type: 'size', value: 128 },
          ],
        },
      ],
    },
  ],
  [
    '/.*?/',
    {
      term: [
        { term: [{ type: 'name', word: { type: 'RegExp', word: '.*?' } }] },
      ],
    },
  ],
  [
    'b a b',
    {
      term: [
        {
          term: [
            { type: 'name', word: 'b' },
            { type: 'name', word: 'a' },
            { ignore: true, type: 'name', word: 'b' },
          ],
        },
      ],
    },
  ],
  [
    'b a OR a b',
    {
      term: [
        {
          term: [
            { type: 'name', word: 'b' },
            { type: 'name', word: 'a' },
          ],
        },
        {
          ignore: true,
          term: [
            { type: 'name', word: 'a' },
            { type: 'name', word: 'b' },
          ],
        },
      ],
    },
  ],
];

describe('#SearchQueryParser', () => {
  test.each(SearchQueryTestCase)("'%s'", (strquery, expected) => {
    const parser = new SearchQueryParser(strquery);
    expect(omitIdFromQuery(parser.query)).toStrictEqual(expected);
  });
});

const SearchQueryBuilderTestCase: [SearchQueryForReduxOmitId, string][] = [
  [{ term: [] }, ''],
  [{ term: [{ term: [{ type: 'name', word: 'Hogehoge' }] }] }, 'Hogehoge'],
  [
    { term: [{ term: [{ type: 'name', word: 'Hogehoge' }] }, { term: [] }] },
    'Hogehoge',
  ],
  [{ term: [{ term: [{ type: 'tag', value: '' }] }] }, 'tag: '],
  [
    {
      term: [
        {
          term: [
            { type: 'name', word: 'Hogehoge' },
            { type: 'mime', word: 'image/png' },
          ],
        },
        {
          term: [
            { type: 'name', word: 'Fugafuga' },
            { type: 'tag', value: '😃' },
          ],
        },
      ],
    },
    'Hogehoge mime: image/png OR Fugafuga tag: 😃',
  ],
  [{ term: [{ term: [{ type: 'name', word: '"Hogehoge' }] }] }, '"Hogehoge'],
  [
    {
      term: [
        {
          term: [
            { searchType: 'in', type: 'name', word: 'b b' },
            { type: 'tag', value: 'a a' },
          ],
        },
      ],
    },
    '"b b" tag: "a a"',
  ],
  [
    {
      term: [
        {
          term: [
            { type: 'name', word: 'Hogehoge' },
            { operator: '<=', type: 'size', value: 128 },
          ],
        },
      ],
    },
    'Hogehoge size: <= 128',
  ],
  [
    {
      term: [
        {
          term: [
            { type: 'name', word: 'Hogehoge' },
            { operator: '==', type: 'size', value: 128 },
          ],
        },
      ],
    },
    'Hogehoge size: 128',
  ],
  [
    {
      term: [
        {
          term: [
            { type: 'name', word: 'Hogehoge' },
            { operator: '>', type: 'size', value: 128 },
          ],
        },
      ],
    },
    'Hogehoge size: > 128',
  ],
  [
    {
      term: [
        { term: [{ type: 'name', word: { type: 'RegExp', word: '.*?' } }] },
      ],
    },
    '/.*?/',
  ],
];

describe('#SearchQueryBuilder', () => {
  test.each(SearchQueryBuilderTestCase)("Build '%s'", (query, expected) => {
    expect(searchQueryBuilder(addEmptyIdToQuery(query))).toEqual(expected);
  });
  test.each(SearchQueryTestCase)("Rebuild '%s'", (strquery, _expected) => {
    const parser = new SearchQueryParser(strquery);
    const builder = searchQueryBuilder(parser.query);
    const parser2 = new SearchQueryParser(builder);
    const rebuilder = searchQueryBuilder(parser2.query);
    expect(rebuilder, `${builder} => ${JSON.stringify(parser2.query)}`).toEqual(
      builder,
    );
  });
});
