import {
  buildFileTable,
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

describe('#buildFileTable', () => {
  test('正しく構築できる', () => {
    const fileKey: any = null
    const fileKeyRaw: any = null
    const encryptedFileIV: any = null
    const genFileInfoFile = (props: {
      id: string,
      parentId: string | null,
      prevId?: string,
      tag: string[],
    }): FileCryptoInfoWithBin => ({
      fileKey,
      fileInfo: {
        type: 'file',
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
    })

    const genFileInfoFolder = (props: {
      id: string,
      parentId: string | null,
      prevId?: string,
    }): {
      fileKey: CryptoKey,
      fileInfo: FileInfoFolder,
      fileKeyRaw: Uint8Array
    } => ({
      fileKey,
      fileInfo: {
        type: 'folder',
        id: props.id,
        name: props.id,
        parentId: props.parentId,
        prevId: props.prevId
      },
      fileKeyRaw
    })

    const genFileInfoDiff = (props: {
      id: string,
      parentId: string | null,
      prevId?: string,
      diff?: FileDifference
    }): {
      fileKey: CryptoKey,
      fileInfo: FileInfoDiffFile,
      fileKeyRaw: Uint8Array
    } => ({
      fileKey,
      fileInfo: {
        type: 'diff',
        id: props.id,
        name: props.id,
        parentId: props.parentId,
        prevId: props.prevId,
        diff: (props.diff as FileDifference)
      },
      fileKeyRaw
    })

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
        files: ['a'],
        parentId: null,
        history: [],
        originalFileInfo: {
          type: 'folder',
          id: 'root',
          name: 'root',
          parentId: null
        }
      },
      a: { ...a.fileInfo, type: 'folder', name: 'j', prevId: undefined, nextId: 'j', files: ['f', 'h', 'i'], parentId: 'root', history: ['j', 'a'], originalFileInfo: a.fileInfo },
      // file(dirobj) 最新の情報が反映される
      f: { ...f.fileInfo, type: 'file', name: 'g', prevId: 'e', nextId: 'g', parentId: 'a', history: ['k', 'g', 'f', 'e', 'd', 'c', 'b'], tag: ['う', 'え', 'い'], originalFileInfo: f.fileInfo },
      h: { ...h.fileInfo, type: 'file', name: 'h', prevId: undefined, parentId: 'a', history: ['h'], tag: ['い'], originalFileInfo: h.fileInfo },
      i: { ...i.fileInfo, type: 'file', name: 'i', prevId: undefined, parentId: 'a', history: ['i'], tag: [], originalFileInfo: i.fileInfo },
      // file
      b: { ...b.fileInfo, type: 'file', name: 'b', prevId: undefined, nextId: 'c', parentId: 'a', history: [], tag: [], originalFileInfo: b.fileInfo },
      e: { ...e.fileInfo, type: 'file', name: 'e', prevId: 'd', nextId: 'f', parentId: 'a', history: [], tag: ['あ', 'い'], originalFileInfo: e.fileInfo },
      // diff
      c: { ...c.fileInfo, type: 'diff', name: 'c', prevId: 'b', nextId: 'd', parentId: 'a', diff: { addtag: ['あ'] }, originalFileInfo: c.fileInfo },
      d: { ...d.fileInfo, type: 'diff', name: 'd', prevId: 'c', nextId: 'e', parentId: 'a', diff: { addtag: ['い'] }, originalFileInfo: d.fileInfo },
      g: { ...g.fileInfo, type: 'diff', name: 'g', prevId: 'f', nextId: 'k', parentId: 'a', diff: { addtag: ['い'] }, originalFileInfo: g.fileInfo },
      j: { ...j.fileInfo, type: 'diff', name: 'j', prevId: 'a', parentId: 'root', diff: {}, originalFileInfo: j.fileInfo },
      k: { ...k.fileInfo, type: 'diff', name: 'k', prevId: 'g', parentId: 'a', diff: { addtag: ['う', 'え'], deltag: ['あ'] }, originalFileInfo: k.fileInfo }
    }
    expect(buildFileTable([a, b, c, d, e, f, g, h, i, j, k]))
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
