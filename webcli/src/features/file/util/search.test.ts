import type { Infer } from 'lizod';
import { describe, test, expect } from 'vitest';
import { buildFileTable } from '~/features/file/utils';
import { assertType, type IsExact } from '~/utils/testing_types';
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
      parentId: 'a',
      tag: [],
      name: 'b.hoge',
    });
    const c = genFileInfoDiff({
      id: 'c',
      parentId: 'a',
      prevId: 'b',
      diff: { addtag: ['あ'] },
      name: 'b.hoge',
    });
    const d = genFileInfoDiff({
      id: 'd',
      parentId: 'a',
      prevId: 'c',
      diff: { addtag: ['い'] },
      name: 'b.hoge',
    });
    const e = genFileInfoFile({
      id: 'e',
      parentId: 'a',
      prevId: 'd',
      tag: ['あ', 'い'],
      name: 'b.hoge',
    });
    const f = genFileInfoFile({
      id: 'f',
      parentId: 'a',
      prevId: 'e',
      tag: ['あ'],
      name: 'b.hoge',
    });
    const g = genFileInfoDiff({
      id: 'g',
      parentId: 'a',
      prevId: 'f',
      diff: { addtag: ['い'] },
      name: 'b.hoge',
    });
    const h = genFileInfoFile({
      id: 'h',
      parentId: 'a',
      tag: ['う'],
      name: 'h.hoge',
    });
    const i = genFileInfoFile({
      id: 'i',
      parentId: 'a',
      tag: [],
      name: 'i.hoge',
    });
    const j = genFileInfoDiff({
      id: 'j',
      parentId: null,
      prevId: 'i',
      diff: { addtag: ['い'] },
      name: 'がi.fuga',
    });
    const k = genFileInfoDiff({
      id: 'k',
      parentId: 'a',
      prevId: 'g',
      diff: { deltag: ['あ'], addtag: ['う', 'え'] },
      name: 'g.hoge',
    });
    const { fileTable } = buildFileTable([a, b, c, d, e, f, g, h, i, j, k]);
    const resultName = searchFromTable(fileTable, {
      term: [{ term: [{ type: 'name', word: 'g.hoge', id: '' }], id: '' }],
      id: '',
    }).sort();
    expect(resultName).toEqual([['f', [['name', 0, 6]]]]);
    const resultNameReg = searchFromTable(fileTable, {
      term: [{ term: [{ type: 'name', word: /.hoge$/, id: '' }], id: '' }],
      id: '',
    }).sort();
    expect(resultNameReg).toEqual([
      ['f', [['name', 1, 6]]],
      ['h', [['name', 1, 6]]],
    ]);

    const resultTag = searchFromTable(fileTable, {
      term: [{ term: [{ type: 'tag', value: 'い', id: '' }], id: '' }],
      id: '',
    }).sort();
    expect(resultTag).toEqual([
      ['f', []],
      ['i', []],
    ]);

    const resultNameRegAndTag = searchFromTable(fileTable, {
      term: [
        {
          term: [
            { type: 'name', word: /.hoge$/, id: '' },
            { type: 'tag', value: 'い', id: '' },
          ],
          id: '',
        },
      ],
      id: '',
    }).sort();
    expect(resultNameRegAndTag).toEqual([['f', [['name', 1, 6]]]]);
    const resultNameRegOrTag = searchFromTable(fileTable, {
      term: [
        { term: [{ type: 'name', word: /.hoge$/, id: '' }], id: '' },
        { term: [{ type: 'tag', value: 'い', id: '' }], id: '' },
      ],
      id: '',
    }).sort();
    expect(resultNameRegOrTag).toEqual([
      ['f', [['name', 1, 6]]],
      ['h', [['name', 1, 6]]],
      ['i', []],
    ]);
    const resultNameNFKD = searchFromTable(fileTable, {
      term: [{ term: [{ type: 'name', word: 'が', id: '' }], id: '' }],
      id: '',
    }).sort();
    expect(resultNameNFKD).toEqual([['i', [['name', 0, 2]]]]);
    const resultNameUpperCase = searchFromTable(fileTable, {
      term: [{ term: [{ type: 'name', word: 'Ｇ．HOGE', id: '' }], id: '' }],
      id: '',
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
      term: [{ term: [{ type: 'name', word: 'Hogehoge', searchType: 'in' }] }],
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
            { type: 'name', word: 'b b', searchType: 'in' },
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
            { type: 'size', value: 128, operator: '<=' },
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
            { type: 'size', value: 128, operator: '==' },
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
            { type: 'size', value: 128, operator: '==' },
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
            { type: 'size', value: 128, operator: '>' },
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
            { type: 'name', word: 'b', ignore: true },
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
          term: [
            { type: 'name', word: 'a' },
            { type: 'name', word: 'b' },
          ],
          ignore: true,
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
            { type: 'name', word: 'b b', searchType: 'in' },
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
            { type: 'size', value: 128, operator: '<=' },
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
            { type: 'size', value: 128, operator: '==' },
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
            { type: 'size', value: 128, operator: '>' },
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
