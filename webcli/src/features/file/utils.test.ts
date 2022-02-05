import {
  buildFileTable,
  genUUID,
  getSafeName
} from './utils'
import {
  FileCryptoInfo, FileDifference
} from './file.type'

describe('#genUUID', () => {
  test('\'-\'を含まない', () => {
    expect(genUUID().indexOf('-')).toBe(-1)
  })
})

describe('#getSafeName', () => {
  test('安全な文字列に変換される', () => {
    expect(getSafeName([
      '\\/:*?<>|',
      'hoge.fuga.piyo',
      'hoge.fuga.piyo'
    ], ['hoge.fuga.piyo'])).toEqual([
      '＼／：＊？＜＞｜',
      'hoge.fuga (1).piyo',
      'hoge.fuga (2).piyo']
    )
  })
})

describe('#buildFileTable', () => {
  test('正しく構築できる', () => {
    const fileKey: any = null
    const fileKeyRaw: any = null
    const encryptedFileIV: any = null
    const genFileInfo = (props: {
      type: 'file',
      id: string,
      parentId: string | null,
      prevId?: string,
      tag: string[],
    } | {
      type: 'folder',
      id: string,
      parentId: string | null,
      prevId?: string,
    } | {
      type: 'diff',
      id: string,
      parentId: string | null,
      prevId?: string,
      diff?: FileDifference
    }):FileCryptoInfo => {
      switch (props.type) {
        case 'file':
          return {
            fileKey,
            fileInfo: {
              type: props.type,
              id: props.id,
              name: props.id,
              sha256: props.id,
              mime: props.id,
              size: 0,
              parentId: props.parentId,
              prevId: props.prevId,
              tag: props.tag
            },
            fileKeyRaw,
            encryptedFileIV
          }
        case 'diff':
          return {
            fileKey,
            fileInfo: {
              type: props.type,
              id: props.id,
              name: props.id,
              parentId: props.parentId,
              prevId: props.prevId,
              diff: (props.diff as FileDifference)
            },
            fileKeyRaw
          }
        default:
          return {
            fileKey,
            fileInfo: {
              type: props.type,
              id: props.id,
              name: props.id,
              parentId: props.parentId,
              prevId: props.prevId
            },
            fileKeyRaw
          }
      }
    }
    expect(buildFileTable([
      genFileInfo({ type: 'folder', id: 'a', parentId: null }),
      genFileInfo({ type: 'file', id: 'b', parentId: 'a', tag: [] }),
      genFileInfo({ type: 'diff', id: 'c', parentId: 'a', prevId: 'b', diff: { addtag: ['あ'] } }),
      genFileInfo({ type: 'diff', id: 'd', parentId: 'a', prevId: 'c', diff: { addtag: ['い'] } }),
      genFileInfo({ type: 'file', id: 'e', parentId: 'a', prevId: 'd', tag: ['あ', 'い'] }),
      genFileInfo({ type: 'file', id: 'f', parentId: 'a', prevId: 'e', tag: ['あ'] }),
      genFileInfo({ type: 'diff', id: 'g', parentId: 'a', prevId: 'f', diff: { addtag: ['い'] } }),
      genFileInfo({ type: 'file', id: 'h', parentId: 'a', tag: ['い'] }),
      genFileInfo({ type: 'file', id: 'i', parentId: 'a', tag: [] }),
      genFileInfo({ type: 'diff', id: 'j', parentId: null, prevId: 'a', diff: {} }),
      genFileInfo({ type: 'diff', id: 'k', parentId: 'a', prevId: 'g', diff: { deltag: ['あ'], addtag: ['う', 'え'] } })
    ])).toEqual({
      tagTree: {
        う: ['f'],
        い: ['f', 'h'],
        え: ['f']
      },
      fileTable: {
        // folder
        root: { type: 'folder', name: 'root', files: ['a'], parent: null, history: [] },
        a: { type: 'folder', name: 'j', prevId: undefined, nextId: 'j', files: ['f', 'h', 'i'], parent: 'root', history: ['j', 'a'] },
        // file(dirobj) 最新の情報が反映される
        f: { type: 'file', name: 'g', prevId: 'e', nextId: 'g', parent: 'a', history: ['k', 'g', 'f', 'e', 'd', 'c', 'b'], tag: ['う', 'え', 'い'] },
        h: { type: 'file', name: 'h', prevId: undefined, parent: 'a', history: ['h'], tag: ['い'] },
        i: { type: 'file', name: 'i', prevId: undefined, parent: 'a', history: ['i'], tag: [] },
        // file
        b: { type: 'file', name: 'b', prevId: undefined, nextId: 'c', parent: 'a', history: [], tag: [] },
        e: { type: 'file', name: 'e', prevId: 'd', nextId: 'f', parent: 'a', history: [], tag: ['あ', 'い'] },
        // diff
        c: { type: 'diff', name: 'c', prevId: 'b', nextId: 'd', parent: 'a', diff: { addtag: ['あ'] } },
        d: { type: 'diff', name: 'd', prevId: 'c', nextId: 'e', parent: 'a', diff: { addtag: ['い'] } },
        g: { type: 'diff', name: 'g', prevId: 'f', nextId: 'k', parent: 'a', diff: { addtag: ['い'] } },
        j: { type: 'diff', name: 'j', prevId: 'a', parent: 'root', diff: {} },
        k: { type: 'diff', name: 'k', prevId: 'g', parent: 'a', diff: { addtag: ['う', 'え'], deltag: ['あ'] } }
      }
    })
  })
})
