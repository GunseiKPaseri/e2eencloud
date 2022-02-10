import {
  buildFileTable,
  createDiff,
  genUUID,
  getSafeName,
  isDiffExt
} from './utils'
import {
  FileCryptoInfoWithBin,
  FileDifference,
  FileInfoDiffFile,
  FileInfoFolder,
  FileTable
} from './file.type'

const fileKeyBin: number[] = []
const encryptedFileIVBin: number[] = []
const genFileInfoFile = (props: {
  id: string,
  parentId: string | null,
  prevId?: string,
  createdAt?: number
  tag: string[],
}): FileCryptoInfoWithBin => ({
  fileKeyBin,
  fileInfo: {
    type: 'file',
    id: props.id,
    name: props.id,
    createdAt: props.createdAt ?? 0,
    sha256: props.id,
    mime: props.id,
    size: 0,
    parentId: props.parentId,
    prevId: props.prevId,
    tag: props.tag
  },
  encryptedFileIVBin
})

const genFileInfoFolder = (props: {
  id: string,
  parentId: string | null,
  createdAt?: number,
  prevId?: string,
}): {
  fileInfo: FileInfoFolder,
  fileKeyBin: number[]
} => ({
  fileKeyBin,
  fileInfo: {
    type: 'folder',
    id: props.id,
    name: props.id,
    createdAt: props.createdAt ?? 0,
    parentId: props.parentId,
    prevId: props.prevId
  }
})
const genFileInfoDiff = (props: {
  id: string,
  parentId: string | null,
  createdAt?: number,
  prevId?: string,
  diff?: FileDifference
}): {
  fileKeyBin: number[],
  fileInfo: FileInfoDiffFile,
} => ({
  fileKeyBin,
  fileInfo: {
    type: 'diff',
    id: props.id,
    name: props.id,
    createdAt: props.createdAt ?? 0,
    parentId: props.parentId,
    prevId: props.prevId,
    diff: props.diff ?? {}
  }
})

describe('#genUUID', () => {
  test('\'-\'を含まない', () => {
    expect(genUUID().indexOf('-')).toBe(-1)
  })
})

describe('#getSafeName', () => {
  test('安全な文字列に変換される', () => {
    expect(getSafeName([
      'test',
      '\\/:*?<>|',
      'hoge.fuga.piyo',
      'hoge.fuga.piyo'
    ], ['test', 'hoge.fuga.piyo'])).toEqual([
      'test (2)',
      '＼／：＊？＜＞｜',
      'hoge.fuga (2).piyo',
      'hoge.fuga (3).piyo']
    )
  })
})

describe('#isDiffExt', () => {
  test('異なる拡張子を区別する', () => {
    expect(isDiffExt('hoge.fuga', 'zan.piyo.fuga')).toBeFalsy()
    expect(isDiffExt('hoge.fug', 'zan.piyo.fuga')).toBeTruthy()
    expect(isDiffExt('hoge', 'fuga')).toBeFalsy()
    expect(isDiffExt('hoge.fuga', 'fuga')).toBeTruthy()
  })
})

describe('#createDiff', () => {
  test('正しく差分を作成できる', () => {
    const a = genFileInfoFolder({ id: 'a', parentId: null })
    const b = genFileInfoFile({ id: 'b', parentId: 'a', tag: ['あ'] })
    const c = genFileInfoFile({ id: 'c', parentId: 'a', tag: [] })
    const d = genFileInfoDiff({ id: 'j', parentId: null, prevId: 'a', diff: { addtag: ['い'] } })
    const fileTable: FileTable = {
      // folder
      root: {
        id: 'root',
        type: 'folder',
        name: 'root',
        createdAt: 0,
        files: ['a'],
        parentId: null,
        history: [],
        originalFileInfo: {
          type: 'folder',
          id: 'root',
          name: 'root',
          parentId: null,
          createdAt: 0
        },
        fileKeyBin: []
      },
      a: { ...a.fileInfo, fileKeyBin: [], type: 'folder', name: 'a', prevId: undefined, files: ['b', 'c'], parentId: 'root', history: ['a'], originalFileInfo: a.fileInfo },
      // file
      b: { ...b.fileInfo, fileKeyBin: [], type: 'file', name: 'd', prevId: undefined, parentId: 'a', nextId: 'd', history: ['d', 'b'], tag: ['あ', 'い'], originalFileInfo: b.fileInfo, encryptedFileIVBin: [] },
      c: { ...c.fileInfo, fileKeyBin: [], type: 'file', name: 'c', prevId: undefined, parentId: 'a', history: ['i'], tag: ['う', 'え'], originalFileInfo: c.fileInfo, encryptedFileIVBin: [] },
      // diff
      d: { ...d.fileInfo, fileKeyBin: [], type: 'diff', name: 'd', prevId: 'b', parentId: 'a', diff: { addtag: ['い'] }, originalFileInfo: d.fileInfo }
    }
    const testSet:[FileInfoDiffFile, FileInfoDiffFile][] = [
      [
        createDiff({ targetId: 'b', newName: 'x' }, fileTable),
        {
          type: 'diff',
          id: 'PRESET',
          name: 'x',
          createdAt: 0,
          parentId: 'a',
          prevId: 'd',
          diff: {}
        }
      ],
      [
        createDiff({ targetId: 'b', newName: 'c' }, fileTable),
        {
          type: 'diff',
          id: 'PRESET',
          name: 'c (2)',
          createdAt: 0,
          parentId: 'a',
          prevId: 'd',
          diff: {}
        }
      ],
      [
        createDiff({ targetId: 'b', newTags: ['あ', 'う'] }, fileTable),
        {
          type: 'diff',
          id: 'PRESET',
          name: 'd',
          createdAt: 0,
          parentId: 'a',
          prevId: 'd',
          diff: {
            addtag: ['う'],
            deltag: ['い']
          }
        }
      ]
    ]
    for (const set of testSet) {
      set[1].id = set[0].id
      set[1].createdAt = set[0].createdAt
      expect(set[0]).toEqual(set[1])
    }
  })
})

describe('#buildFileTable', () => {
  test('正しく構築できる', () => {
    const a = genFileInfoFolder({ id: 'a', parentId: null })
    const b = genFileInfoFile({ id: 'b', parentId: 'a', tag: [] })
    const c = genFileInfoDiff({ id: 'c', parentId: 'a', prevId: 'b', diff: { addtag: ['あ'] } })
    const d = genFileInfoDiff({ id: 'd', parentId: 'a', prevId: 'c', diff: { addtag: ['い'] } })
    const e = genFileInfoFile({ id: 'e', parentId: 'a', prevId: 'd', tag: ['あ', 'い'] })
    const f = genFileInfoFile({ id: 'f', parentId: 'a', prevId: 'e', tag: ['あ'] })
    const g = genFileInfoDiff({ id: 'g', parentId: 'a', prevId: 'f', diff: { addtag: ['い'] } })
    const h = genFileInfoFile({ id: 'h', parentId: 'a', tag: ['い'] })
    const i = genFileInfoFile({ id: 'i', parentId: 'a', tag: [] })
    const j = genFileInfoDiff({ id: 'j', parentId: null, prevId: 'a', diff: {} })
    const k = genFileInfoDiff({ id: 'k', parentId: 'a', prevId: 'g', diff: { deltag: ['あ'], addtag: ['う', 'え'] } })
    const expectFileTable: FileTable = {
      // folder
      root: {
        id: 'root',
        type: 'folder',
        name: 'root',
        createdAt: 0,
        files: ['a'],
        parentId: null,
        history: [],
        fileKeyBin: [],
        originalFileInfo: {
          type: 'folder',
          id: 'root',
          name: 'root',
          createdAt: 0,
          parentId: null
        }
      },
      a: { ...a.fileInfo, fileKeyBin: [], type: 'folder', name: 'j', prevId: undefined, nextId: 'j', files: ['f', 'h', 'i'], parentId: 'root', history: ['j', 'a'], originalFileInfo: a.fileInfo },
      // file(dirobj) 最新の情報が反映される
      f: { ...f.fileInfo, fileKeyBin: [], type: 'file', name: 'k', prevId: 'e', nextId: 'g', parentId: 'a', history: ['k', 'g', 'f', 'e', 'd', 'c', 'b'], tag: ['う', 'え', 'い'], originalFileInfo: f.fileInfo, encryptedFileIVBin },
      h: { ...h.fileInfo, fileKeyBin: [], type: 'file', name: 'h', prevId: undefined, parentId: 'a', history: ['h'], tag: ['い'], originalFileInfo: h.fileInfo, encryptedFileIVBin },
      i: { ...i.fileInfo, fileKeyBin: [], type: 'file', name: 'i', prevId: undefined, parentId: 'a', history: ['i'], tag: [], originalFileInfo: i.fileInfo, encryptedFileIVBin },
      // file
      b: { ...b.fileInfo, fileKeyBin: [], type: 'file', name: 'b', prevId: undefined, nextId: 'c', parentId: 'a', history: [], tag: [], originalFileInfo: b.fileInfo, encryptedFileIVBin },
      e: { ...e.fileInfo, fileKeyBin: [], type: 'file', name: 'e', prevId: 'd', nextId: 'f', parentId: 'a', history: [], tag: ['あ', 'い'], originalFileInfo: e.fileInfo, encryptedFileIVBin },
      // diff
      c: { ...c.fileInfo, fileKeyBin: [], type: 'diff', name: 'c', prevId: 'b', nextId: 'd', parentId: 'a', diff: { addtag: ['あ'] }, originalFileInfo: c.fileInfo },
      d: { ...d.fileInfo, fileKeyBin: [], type: 'diff', name: 'd', prevId: 'c', nextId: 'e', parentId: 'a', diff: { addtag: ['い'] }, originalFileInfo: d.fileInfo },
      g: { ...g.fileInfo, fileKeyBin: [], type: 'diff', name: 'g', prevId: 'f', nextId: 'k', parentId: 'a', diff: { addtag: ['い'] }, originalFileInfo: g.fileInfo },
      j: { ...j.fileInfo, fileKeyBin: [], type: 'diff', name: 'j', prevId: 'a', parentId: 'root', diff: {}, originalFileInfo: j.fileInfo },
      k: { ...k.fileInfo, fileKeyBin: [], type: 'diff', name: 'k', prevId: 'g', parentId: 'a', diff: { addtag: ['う', 'え'], deltag: ['あ'] }, originalFileInfo: k.fileInfo }
    }
    const result = buildFileTable([a, b, c, d, e, f, g, h, i, j, k])
    // setな要素はソートしておく
    for (const node of [...Object.values(result.fileTable), ...Object.values(expectFileTable)]) {
      // tag
      if (node.type === 'file') node.tag.sort()
      // children
      if (node.type === 'folder') node.files.sort()
      // addtag deltag
      if (node.type === 'diff') {
        if (node.diff.addtag) node.diff.addtag.sort()
        if (node.diff.deltag) node.diff.deltag.sort()
      }
    }
    // tagtree
    for (const props in result.tagTree) {
      result.tagTree[props].sort()
    }

    // いざ実行
    expect(result)
      .toEqual({
        tagTree: {
          う: ['f'],
          い: ['f', 'h'],
          え: ['f']
        },
        fileTable: expectFileTable
      })
  })
})
