import {
  genFileInfoFolder,
  genFileInfoFile,
  genFileInfoDiff
} from './testutil'

import {
  searchFromTable, SearchQuery, SearchQueryParser
} from './search'
import { buildFileTable } from '../utils'

describe('#searchFromTable', () => {
  test('正しく取得できる', () => {
    const a = genFileInfoFolder({ id: 'a', parentId: null })
    const b = genFileInfoFile({ id: 'b', parentId: 'a', tag: [], name: 'b.hoge'})
    const c = genFileInfoDiff({ id: 'c', parentId: 'a', prevId: 'b', diff: { addtag: ['あ'] }, name: 'b.hoge'})
    const d = genFileInfoDiff({ id: 'd', parentId: 'a', prevId: 'c', diff: { addtag: ['い'] }, name: 'b.hoge'})
    const e = genFileInfoFile({ id: 'e', parentId: 'a', prevId: 'd', tag: ['あ', 'い'], name: 'b.hoge'})
    const f = genFileInfoFile({ id: 'f', parentId: 'a', prevId: 'e', tag: ['あ'], name: 'b.hoge'})
    const g = genFileInfoDiff({ id: 'g', parentId: 'a', prevId: 'f', diff: { addtag: ['い'] }, name: 'b.hoge'})
    const h = genFileInfoFile({ id: 'h', parentId: 'a', tag: ['い'], name: 'h.hoge'})
    const i = genFileInfoFile({ id: 'i', parentId: 'a', tag: [], name: 'i.hoge'})
    const j = genFileInfoDiff({ id: 'j', parentId: null, prevId: 'a', diff: {}, name: 'i.fuga'})
    const k = genFileInfoDiff({ id: 'k', parentId: 'a', prevId: 'g', diff: { deltag: ['あ'], addtag: ['う', 'え'] }, name: 'g.hoge'})
    const {fileTable} = buildFileTable([a, b, c, d, e, f, g, h, i, j, k])
    const result1 = searchFromTable(fileTable, [[{type: 'name', word: 'g.hoge'}]]).sort()
    expect(result1).toEqual(['f'])
    const result2 = searchFromTable(fileTable, [[{type: 'name', word: new RegExp('.hoge$')}]]).sort()
    expect(result2).toEqual(['f', 'h', 'i'])
    const result3 = searchFromTable(fileTable, [[{type: 'name', word: new RegExp('.hoge$')}, {type: 'tag', value: 'い'}]]).sort()
    expect(result3).toEqual(['f', 'h'])
    const result4 = searchFromTable(fileTable, [[{type: 'name', word: new RegExp('.hoge$')}], [{type: 'tag', value: 'い'}]]).sort()
    expect(result4).toEqual(['f', 'h', 'i'])
  })
})

const SearchQueryTestCase: [string, SearchQuery][] = [
  ['Hogehoge', [[{type: 'name', word:'Hogehoge'}]]],
  ['tag:', [[{type: 'tag', value:''}]]],
  ['Hogehoge mime: image/png　OR Fugafuga tag:😃', [[{type: 'name', word:'Hogehoge'}, {type: 'mime', word:'image/png'}], [{type: 'name', word:'Fugafuga'}, {type: 'tag', value: '😃'}]]],
  ['Hogehoge size: <= 128', [[{type: 'name', word:'Hogehoge'}, {type: 'size', value: 128, operator: '<='}]]],
  ['Hogehoge size:   128', [[{type: 'name', word:'Hogehoge'}, {type: 'size', value: 128, operator: '=='}]]],
  ['Hogehoge size: = 128', [[{type: 'name', word:'Hogehoge'}, {type: 'size', value: 128, operator: '=='}]]],
  ['Hogehoge size: > 128 OR OR', [[{type: 'name', word:'Hogehoge'}, {type: 'size', value: 128, operator: '>'}]]],
]

describe('#SearchQueryParser', () => {
  test.each(SearchQueryTestCase)('\'%s\'', (strquery, expected) =>{
    const parser = new SearchQueryParser(strquery)
    expect(parser.query).toEqual(expected)
  })
})
