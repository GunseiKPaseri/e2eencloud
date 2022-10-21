import { describe, test, expect } from 'vitest';
import {
  buildFileTable,
  createDiff,
  genUUID,
  getAllDependentFile,
  getSafeName,
  isDiffExt,
} from './utils';
import type {
  FileInfoDiffFile,
  FileTable,
} from './file.type';
import {
  genFileInfoFolder,
  genFileInfoFile,
  genFileInfoDiff,
} from './util/testutil';
import { latestVersion } from './fileinfoMigration/fileinfo';

describe('#genUUID', () => {
  test('\'-\'を含まない', () => {
    expect(genUUID().indexOf('-')).toBe(-1);
  });
});

describe('#getSafeName', () => {
  test('安全な文字列に変換される', () => {
    expect(getSafeName([
      'test',
      '\\/:*?<>|',
      'hoge.fuga.piyo',
      'hoge.fuga.piyo',
    ], ['test', 'hoge.fuga.piyo'])).toEqual([
      'test (2)',
      '＼／：＊？＜＞｜',
      'hoge.fuga (2).piyo',
      'hoge.fuga (3).piyo']);
  });
});

describe('#isDiffExt', () => {
  test('異なる拡張子を区別する', () => {
    expect(isDiffExt('hoge.fuga', 'zan.piyo.fuga')).toBeFalsy();
    expect(isDiffExt('hoge.fug', 'zan.piyo.fuga')).toBeTruthy();
    expect(isDiffExt('hoge', 'fuga')).toBeFalsy();
    expect(isDiffExt('hoge.fuga', 'fuga')).toBeTruthy();
  });
});

describe('#createDiff', () => {
  test('正しく差分を作成できる', () => {
    const a = genFileInfoFolder({ id: 'a', parentId: null, tag: [] });
    const b = genFileInfoFile({ id: 'b', parentId: 'a', tag: ['あ'] });
    const c = genFileInfoFile({ id: 'c', parentId: 'a', tag: [] });
    const d = genFileInfoDiff({
      id: 'j', parentId: null, prevId: 'a', diff: { addtag: ['い'] },
    });
    const fileTable: FileTable = {
      // folder
      root: {
        id: 'root',
        type: 'folder',
        name: 'root',
        version: latestVersion,
        createdAt: 0,
        files: ['a'],
        parentId: null,
        history: [],
        tag: [],
        origin: {
          fileKeyBin: [],
          fileInfo: {
            type: 'folder',
            id: 'root',
            name: 'root',
            version: latestVersion,
            parentId: null,
            createdAt: 0,
            tag: [],
          },
          originalVersion: latestVersion,
        },
      },
      a: {
        ...a.fileInfo, type: 'folder', name: 'a', prevId: undefined, files: ['b', 'c'], parentId: 'root', history: ['a'], origin: { fileInfo: a.fileInfo, fileKeyBin: [], originalVersion: latestVersion },
      },
      // file
      b: {
        ...b.fileInfo,
        type: 'file',
        name: 'd',
        expansion: undefined,
        prevId: undefined,
        parentId: 'a',
        nextId: 'd',
        history: ['d', 'b'],
        tag: ['あ', 'い'],
        origin: {
          fileInfo: b.fileInfo,
          fileKeyBin: [],
          encryptedFileIVBin: [],
          originalVersion: latestVersion,
        },
      },
      c: {
        ...c.fileInfo,
        type: 'file',
        name: 'c',
        expansion: undefined,
        prevId: undefined,
        parentId: 'a',
        history: ['i'],
        tag: ['う', 'え'],
        origin: {
          fileInfo: c.fileInfo,
          fileKeyBin: [],
          encryptedFileIVBin: [],
          originalVersion: latestVersion,
        },
      },
      // diff
      d: {
        ...d.fileInfo, type: 'diff', name: 'd', prevId: 'b', parentId: 'a', diff: { addtag: ['い'] }, origin: { fileInfo: d.fileInfo, fileKeyBin: [], originalVersion: latestVersion },
      },
    };
    const testSet:[FileInfoDiffFile, FileInfoDiffFile][] = [
      [
        createDiff({ targetId: 'b', newName: 'x' }, fileTable),
        {
          type: 'diff',
          id: 'PRESET',
          name: 'x',
          version: latestVersion,
          createdAt: 0,
          parentId: 'a',
          prevId: 'd',
          diff: {},
        },
      ],
      [
        createDiff({ targetId: 'b', newName: 'c' }, fileTable),
        {
          type: 'diff',
          id: 'PRESET',
          name: 'c (2)',
          version: latestVersion,
          createdAt: 0,
          parentId: 'a',
          prevId: 'd',
          diff: {},
        },
      ],
      [
        createDiff({ targetId: 'b', newTags: ['あ', 'う', 'う'] }, fileTable),
        {
          type: 'diff',
          id: 'PRESET',
          name: 'd',
          version: latestVersion,
          createdAt: 0,
          parentId: 'a',
          prevId: 'd',
          diff: {
            addtag: ['う'],
            deltag: ['い'],
          },
        },
      ],
      [
        createDiff({ targetId: 'b', newTags: { addtag: ['え', 'お', 'お'], deltag: ['え'] } }, fileTable),
        {
          type: 'diff',
          id: 'PRESET',
          name: 'd',
          version: latestVersion,
          createdAt: 0,
          parentId: 'a',
          prevId: 'd',
          diff: {
            addtag: ['お'],
          },
        },
      ],
      [
        createDiff({ targetId: 'b', newTags: { addtag: ['い'], deltag: ['い'] } }, fileTable),
        {
          type: 'diff',
          id: 'PRESET',
          name: 'd',
          version: latestVersion,
          createdAt: 0,
          parentId: 'a',
          prevId: 'd',
          diff: {},
        },
      ],
    ];
    testSet.forEach((set) => {
      set[1].id = set[0].id;
      set[1].createdAt = set[0].createdAt;
      expect(JSON.parse(JSON.stringify(set[0]))).toEqual(set[1]);
    });
  });
});

describe('#buildFileTable', () => {
  test('正しく構築できる', () => {
    const a = genFileInfoFolder({ id: 'a', parentId: null, tag: [] });
    const b = genFileInfoFile({ id: 'b', parentId: 'a', tag: [] });
    const c = genFileInfoDiff({
      id: 'c', parentId: 'a', prevId: 'b', diff: { addtag: ['あ'] },
    });
    const d = genFileInfoDiff({
      id: 'd', parentId: 'a', prevId: 'c', diff: { addtag: ['い'] },
    });
    const e = genFileInfoFile({
      id: 'e', parentId: 'a', prevId: 'd', tag: ['あ', 'い'],
    });
    const f = genFileInfoFile({
      id: 'f', parentId: 'a', prevId: 'e', tag: ['あ'],
    });
    const g = genFileInfoDiff({
      id: 'g', parentId: 'a', prevId: 'f', diff: { addtag: ['い'] },
    });
    const h = genFileInfoFile({ id: 'h', parentId: 'a', tag: ['い'] });
    const i = genFileInfoFile({ id: 'i', parentId: 'a', tag: [] });
    const j = genFileInfoDiff({
      id: 'j', parentId: null, prevId: 'a', diff: {},
    });
    const k = genFileInfoDiff({
      id: 'k', parentId: 'a', prevId: 'g', diff: { deltag: ['あ'], addtag: ['う', 'え'] },
    });
    const expectFileTable: FileTable = {
      // folder
      root: {
        id: 'root',
        type: 'folder',
        name: 'root',
        version: latestVersion,
        createdAt: 0,
        files: ['a'],
        parentId: null,
        history: [],
        tag: [],
        origin: {
          fileKeyBin: [],
          fileInfo: {
            type: 'folder',
            id: 'root',
            name: 'root',
            createdAt: 0,
            parentId: null,
            version: latestVersion,
            tag: [],
          },
          originalVersion: latestVersion,
        },
      },
      a: {
        ...a.fileInfo, type: 'folder', name: 'j', prevId: undefined, nextId: 'j', files: ['f', 'h', 'i'], parentId: 'root', history: ['j', 'a'], origin: { fileInfo: a.fileInfo, fileKeyBin: [], originalVersion: latestVersion },
      },
      // file(dirobj) 最新の情報が反映される
      f: {
        ...f.fileInfo,
        type: 'file',
        name: 'k',
        expansion: undefined,
        prevId: 'e',
        nextId: 'g',
        parentId: 'a',
        history: ['k', 'g', 'f', 'e', 'd', 'c', 'b'],
        tag: ['う', 'え', 'い'],
        origin: {
          fileInfo: f.fileInfo,
          fileKeyBin: [],
          encryptedFileIVBin: [],
          originalVersion: latestVersion,
        },
      },
      h: {
        ...h.fileInfo,
        type: 'file',
        name: 'h',
        expansion: undefined,
        prevId: undefined,
        parentId: 'a',
        history: ['h'],
        tag: ['い'],
        origin: {
          fileInfo: h.fileInfo,
          fileKeyBin: [],
          encryptedFileIVBin: [],
          originalVersion: latestVersion,
        },
      },
      i: {
        ...i.fileInfo,
        type: 'file',
        name: 'i',
        expansion: undefined,
        prevId: undefined,
        parentId: 'a',
        history: ['i'],
        tag: [],
        origin: {
          fileInfo: i.fileInfo,
          fileKeyBin: [],
          encryptedFileIVBin: [],
          originalVersion: latestVersion,
        },
      },
      // file
      b: {
        ...b.fileInfo,
        type: 'file',
        name: 'b',
        expansion: undefined,
        prevId: undefined,
        nextId: 'c',
        parentId: 'a',
        history: [],
        tag: [],
        origin: {
          fileInfo: b.fileInfo,
          fileKeyBin: [],
          encryptedFileIVBin: [],
          originalVersion: latestVersion,
        },
      },
      e: {
        ...e.fileInfo,
        type: 'file',
        name: 'e',
        expansion: undefined,
        prevId: 'd',
        nextId: 'f',
        parentId: 'a',
        history: [],
        tag: ['あ', 'い'],
        origin: {
          fileInfo: e.fileInfo,
          fileKeyBin: [],
          encryptedFileIVBin: [],
          originalVersion: latestVersion,
        },
      },
      // diff
      c: {
        ...c.fileInfo, type: 'diff', name: 'c', prevId: 'b', nextId: 'd', parentId: 'a', diff: { addtag: ['あ'] }, origin: { fileInfo: c.fileInfo, fileKeyBin: [], originalVersion: latestVersion },
      },
      d: {
        ...d.fileInfo, type: 'diff', name: 'd', prevId: 'c', nextId: 'e', parentId: 'a', diff: { addtag: ['い'] }, origin: { fileInfo: d.fileInfo, fileKeyBin: [], originalVersion: latestVersion },
      },
      g: {
        ...g.fileInfo, type: 'diff', name: 'g', prevId: 'f', nextId: 'k', parentId: 'a', diff: { addtag: ['い'] }, origin: { fileInfo: g.fileInfo, fileKeyBin: [], originalVersion: latestVersion },
      },
      j: {
        ...j.fileInfo, type: 'diff', name: 'j', prevId: 'a', parentId: 'root', diff: {}, origin: { fileInfo: j.fileInfo, fileKeyBin: [], originalVersion: latestVersion },
      },
      k: {
        ...k.fileInfo, type: 'diff', name: 'k', prevId: 'g', parentId: 'a', diff: { addtag: ['う', 'え'], deltag: ['あ'] }, origin: { fileInfo: k.fileInfo, fileKeyBin: [], originalVersion: latestVersion },
      },
    };
    const result = buildFileTable([a, b, c, d, e, f, g, h, i, j, k]);
    // setな要素はソートしておく
    [...Object.values(result.fileTable), ...Object.values(expectFileTable)].forEach((node) => {
      // tag
      if (node.type === 'file') node.tag.sort();
      // children
      if (node.type === 'folder') node.files.sort();
      // addtag deltag
      if (node.type === 'diff') {
        if (node.diff.addtag) node.diff.addtag.sort();
        if (node.diff.deltag) node.diff.deltag.sort();
      }
    });

    // tagtree
    Object.keys(result.tagTree).forEach((props) => {
      result.tagTree[props].sort();
    });

    // いざ実行
    expect(result)
      .toEqual({
        tagTree: {
          う: ['f'],
          い: ['f', 'h'],
          え: ['f'],
        },
        fileTable: expectFileTable,
      });
  });
});

describe('#getAllDependentFile', () => {
  test('削除対象を正しく取得できる', () => {
    const a = genFileInfoFolder({ id: 'a', parentId: null, tag: [] });
    const b = genFileInfoFile({ id: 'b', parentId: 'a', tag: [] });
    const c = genFileInfoDiff({
      id: 'c', parentId: 'a', prevId: 'b', diff: { addtag: ['あ'] },
    });
    const d = genFileInfoDiff({
      id: 'd', parentId: 'a', prevId: 'c', diff: { addtag: ['い'] },
    });
    const e = genFileInfoFile({
      id: 'e', parentId: 'a', prevId: 'd', tag: ['あ', 'い'],
    });
    const f = genFileInfoFile({
      id: 'f', parentId: 'a', prevId: 'e', tag: ['あ'],
    });
    const g = genFileInfoDiff({
      id: 'g', parentId: 'a', prevId: 'f', diff: { addtag: ['い'] },
    });
    const h = genFileInfoFile({ id: 'h', parentId: 'a', tag: ['い'] });
    const i = genFileInfoFile({ id: 'i', parentId: 'a', tag: [] });
    const j = genFileInfoDiff({
      id: 'j', parentId: null, prevId: 'a', diff: {},
    });
    const k = genFileInfoDiff({
      id: 'k', parentId: 'a', prevId: 'g', diff: { deltag: ['あ'], addtag: ['う', 'え'] },
    });
    const { fileTable } = buildFileTable([a, b, c, d, e, f, g, h, i, j, k]);

    const result = getAllDependentFile(fileTable.f, fileTable).sort();

    const expectArray = ['b', 'c', 'd', 'e', 'f', 'g', 'k'];

    // いざ実行
    expect(result)
      .toEqual(expectArray);
  });
});
