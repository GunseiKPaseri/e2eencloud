import {
  genFileInfoFolder,
  genFileInfoFile,
  genFileInfoDiff,
} from './testutil';

import {
  highlightMark,
  searchFromTable, SearchQueryParser,
} from './search';

import {
  SearchQuery,
} from './search.type';

import { buildFileTable } from '../utils';

describe('#highlightMark', () => {
  test('正しくハイライトできる', () => {
    expect(highlightMark('abcdefghijklmnopqrstu', 'name', [['name', 3, 8], ['mime', 10, 15]])).toBe('abc<mark>defgh</mark>ijklmnopqrstu');
    expect(highlightMark('abcdefghijklmnopqrstu', 'name', [['name', 3, 8], ['name', 6, 10]])).toBe('abc<mark>defghij</mark>klmnopqrstu');
    expect(highlightMark('abcdefghijklmnopqrstu', 'name', [['name', 3, 8], ['name', 8, 10]])).toBe('abc<mark>defgh</mark><mark>ij</mark>klmnopqrstu');
    expect(highlightMark('abcdefghijklmnopqrstu', 'name', [['name', 3, 8], ['name', 10, 15]])).toBe('abc<mark>defgh</mark>ij<mark>klmno</mark>pqrstu');
  });
});

describe('#searchFromTable', () => {
  test('正しく取得できる', () => {
    const a = genFileInfoFolder({ id: 'a', parentId: null });
    const b = genFileInfoFile({
      id: 'b', parentId: 'a', tag: [], name: 'b.hoge',
    });
    const c = genFileInfoDiff({
      id: 'c', parentId: 'a', prevId: 'b', diff: { addtag: ['あ'] }, name: 'b.hoge',
    });
    const d = genFileInfoDiff({
      id: 'd', parentId: 'a', prevId: 'c', diff: { addtag: ['い'] }, name: 'b.hoge',
    });
    const e = genFileInfoFile({
      id: 'e', parentId: 'a', prevId: 'd', tag: ['あ', 'い'], name: 'b.hoge',
    });
    const f = genFileInfoFile({
      id: 'f', parentId: 'a', prevId: 'e', tag: ['あ'], name: 'b.hoge',
    });
    const g = genFileInfoDiff({
      id: 'g', parentId: 'a', prevId: 'f', diff: { addtag: ['い'] }, name: 'b.hoge',
    });
    const h = genFileInfoFile({
      id: 'h', parentId: 'a', tag: ['う'], name: 'h.hoge',
    });
    const i = genFileInfoFile({
      id: 'i', parentId: 'a', tag: [], name: 'i.hoge',
    });
    const j = genFileInfoDiff({
      id: 'j', parentId: null, prevId: 'i', diff: { addtag: ['い'] }, name: 'がi.fuga',
    });
    const k = genFileInfoDiff({
      id: 'k', parentId: 'a', prevId: 'g', diff: { deltag: ['あ'], addtag: ['う', 'え'] }, name: 'g.hoge',
    });
    const { fileTable } = buildFileTable([a, b, c, d, e, f, g, h, i, j, k]);
    const resultName = searchFromTable(fileTable, [[{ type: 'name', word: 'g.hoge' }]]).sort();
    expect(resultName).toEqual([['f', [['name', 0, 6]]]]);
    const resultNameReg = searchFromTable(fileTable, [[{ type: 'name', word: /.hoge$/ }]]).sort();
    expect(resultNameReg).toEqual([['f', [['name', 1, 6]]], ['h', [['name', 1, 6]]]]);

    const resultTag = searchFromTable(fileTable, [[{ type: 'tag', value: 'い' }]]).sort();
    expect(resultTag).toEqual([['f', []], ['i', []]]);

    const resultNameRegAndTag = searchFromTable(fileTable, [[{ type: 'name', word: /.hoge$/ }, { type: 'tag', value: 'い' }]]).sort();
    expect(resultNameRegAndTag).toEqual([['f', [['name', 1, 6]]]]);
    const resultNameRegOrTag = searchFromTable(fileTable, [[{ type: 'name', word: /.hoge$/ }], [{ type: 'tag', value: 'い' }]]).sort();
    expect(resultNameRegOrTag).toEqual([['f', [['name', 1, 6]]], ['h', [['name', 1, 6]]], ['i', []]]);
    const resultNameNFKD = searchFromTable(fileTable, [[{ type: 'name', word: 'が' }]]).sort();
    expect(resultNameNFKD).toEqual([['i', [['name', 0, 2]]]]);
    const resultNameUpperCase = searchFromTable(fileTable, [[{ type: 'name', word: 'Ｇ．HOGE' }]]).sort();
    expect(resultNameUpperCase).toEqual([['f', [['name', 0, 6]]]]);
  });
});

const SearchQueryTestCase: [string, SearchQuery][] = [
  ['Hogehoge', [[{ type: 'name', word: 'Hogehoge' }]]],
  ['tag:', [[{ type: 'tag', value: '' }]]],
  ['Hogehoge mime: image/png　OR Fugafuga tag:😃', [[{ type: 'name', word: 'Hogehoge' }, { type: 'mime', word: 'image/png' }], [{ type: 'name', word: 'Fugafuga' }, { type: 'tag', value: '😃' }]]],
  ['"Hogehoge', [[{ type: 'name', word: '"Hogehoge' }]]],
  ['"b b" tag:"a a"', [[{ type: 'name', word: 'b b', searchType: 'in' }, { type: 'tag', value: '"a a"' }]]],
  ['Hogehoge size: <= 128', [[{ type: 'name', word: 'Hogehoge' }, { type: 'size', value: 128, operator: '<=' }]]],
  ['Hogehoge size:   128', [[{ type: 'name', word: 'Hogehoge' }, { type: 'size', value: 128, operator: '==' }]]],
  ['Hogehoge size: = 128', [[{ type: 'name', word: 'Hogehoge' }, { type: 'size', value: 128, operator: '==' }]]],
  ['Hogehoge size: > 128 OR OR', [[{ type: 'name', word: 'Hogehoge' }, { type: 'size', value: 128, operator: '>' }]]],
];

describe('#SearchQueryParser', () => {
  test.each(SearchQueryTestCase)('\'%s\'', (strquery, expected) => {
    const parser = new SearchQueryParser(strquery);
    expect(parser.query).toEqual(expected);
  });
});
