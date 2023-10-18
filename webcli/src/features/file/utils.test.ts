import { describe, test, expect } from 'vitest';
import type { FileInfoDiffFile, FileTable } from './file.type';
import { latestVersion } from './fileinfoMigration/fileinfo';
import {
  genFileInfoFolder,
  genFileInfoFile,
  genFileInfoDiff,
} from './util/testutil';
import {
  buildFileTable,
  createDiff,
  genUUID,
  getAllDependentFile,
  getSafeName,
  isDiffExt,
} from './utils';

describe('#genUUID', () => {
  test("'-'を含まない", () => {
    expect(genUUID().indexOf('-')).toBe(-1);
  });
});

describe('#getSafeName', () => {
  test('安全な文字列に変換される', () => {
    expect(
      getSafeName(
        ['test', '\\/:*?<>|', 'hoge.fuga.piyo', 'hoge.fuga.piyo'],
        ['test', 'hoge.fuga.piyo'],
      ),
    ).toEqual([
      'test (2)',
      '＼／：＊？＜＞｜',
      'hoge.fuga (2).piyo',
      'hoge.fuga (3).piyo',
    ]);
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
      diff: { addtag: ['い'] },
      id: 'j',
      parentId: null,
      prevId: 'a',
    });
    const fileTable: FileTable = {
      a: {
        ...a.fileInfo,
        files: ['b', 'c'],
        history: ['a'],
        name: 'a',
        origin: {
          fileInfo: a.fileInfo,
          fileKeyBin: [],
          originalVersion: latestVersion,
        },
        parentId: 'root',
        prevId: undefined,
        type: 'folder',
      },
      // file
      b: {
        ...b.fileInfo,
        expansion: undefined,
        history: ['d', 'b'],
        name: 'd',
        nextId: 'd',
        origin: {
          encryptedFileIVBin: [],
          fileInfo: b.fileInfo,
          fileKeyBin: [],
          originalVersion: latestVersion,
        },
        parentId: 'a',
        prevId: undefined,
        tag: ['あ', 'い'],
        type: 'file',
      },
      c: {
        ...c.fileInfo,
        expansion: undefined,
        history: ['i'],
        name: 'c',
        origin: {
          encryptedFileIVBin: [],
          fileInfo: c.fileInfo,
          fileKeyBin: [],
          originalVersion: latestVersion,
        },
        parentId: 'a',
        prevId: undefined,
        tag: ['う', 'え'],
        type: 'file',
      },
      // diff
      d: {
        ...d.fileInfo,
        diff: { addtag: ['い'] },
        name: 'd',
        origin: {
          fileInfo: d.fileInfo,
          fileKeyBin: [],
          originalVersion: latestVersion,
        },
        parentId: 'a',
        prevId: 'b',
        type: 'diff',
      },
      // folder
      root: {
        createdAt: 0,
        files: ['a'],
        history: [],
        id: 'root',
        name: 'root',
        origin: {
          fileInfo: {
            createdAt: 0,
            id: 'root',
            name: 'root',
            parentId: null,
            tag: [],
            type: 'folder',
            version: latestVersion,
          },
          fileKeyBin: [],
          originalVersion: latestVersion,
        },
        parentId: null,
        tag: [],
        type: 'folder',
        version: latestVersion,
      },
    };
    const testSet: [FileInfoDiffFile, FileInfoDiffFile][] = [
      [
        createDiff({ newName: 'x', targetId: 'b' }, fileTable),
        {
          createdAt: 0,
          diff: {},
          id: 'PRESET',
          name: 'x',
          parentId: 'a',
          prevId: 'd',
          type: 'diff',
          version: latestVersion,
        },
      ],
      [
        createDiff({ newName: 'c', targetId: 'b' }, fileTable),
        {
          createdAt: 0,
          diff: {},
          id: 'PRESET',
          name: 'c (2)',
          parentId: 'a',
          prevId: 'd',
          type: 'diff',
          version: latestVersion,
        },
      ],
      [
        createDiff({ newTags: ['あ', 'う', 'う'], targetId: 'b' }, fileTable),
        {
          createdAt: 0,
          diff: {
            addtag: ['う'],
            deltag: ['い'],
          },
          id: 'PRESET',
          name: 'd',
          parentId: 'a',
          prevId: 'd',
          type: 'diff',
          version: latestVersion,
        },
      ],
      [
        createDiff(
          {
            newTags: { addtag: ['え', 'お', 'お'], deltag: ['え'] },
            targetId: 'b',
          },
          fileTable,
        ),
        {
          createdAt: 0,
          diff: {
            addtag: ['お'],
          },
          id: 'PRESET',
          name: 'd',
          parentId: 'a',
          prevId: 'd',
          type: 'diff',
          version: latestVersion,
        },
      ],
      [
        createDiff(
          { newTags: { addtag: ['い'], deltag: ['い'] }, targetId: 'b' },
          fileTable,
        ),
        {
          createdAt: 0,
          diff: {},
          id: 'PRESET',
          name: 'd',
          parentId: 'a',
          prevId: 'd',
          type: 'diff',
          version: latestVersion,
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
      diff: { addtag: ['あ'] },
      id: 'c',
      parentId: 'a',
      prevId: 'b',
    });
    const d = genFileInfoDiff({
      diff: { addtag: ['い'] },
      id: 'd',
      parentId: 'a',
      prevId: 'c',
    });
    const e = genFileInfoFile({
      id: 'e',
      parentId: 'a',
      prevId: 'd',
      tag: ['あ', 'い'],
    });
    const f = genFileInfoFile({
      id: 'f',
      parentId: 'a',
      prevId: 'e',
      tag: ['あ'],
    });
    const g = genFileInfoDiff({
      diff: { addtag: ['い'] },
      id: 'g',
      parentId: 'a',
      prevId: 'f',
    });
    const h = genFileInfoFile({ id: 'h', parentId: 'a', tag: ['い'] });
    const i = genFileInfoFile({ id: 'i', parentId: 'a', tag: [] });
    const j = genFileInfoDiff({
      diff: {},
      id: 'j',
      parentId: null,
      prevId: 'a',
    });
    const k = genFileInfoDiff({
      diff: { addtag: ['う', 'え'], deltag: ['あ'] },
      id: 'k',
      parentId: 'a',
      prevId: 'g',
    });
    const expectFileTable: FileTable = {
      a: {
        ...a.fileInfo,
        files: ['f', 'h', 'i'],
        history: ['j', 'a'],
        name: 'j',
        nextId: 'j',
        origin: {
          fileInfo: a.fileInfo,
          fileKeyBin: [],
          originalVersion: latestVersion,
        },
        parentId: 'root',
        prevId: undefined,
        type: 'folder',
      },
      // file
      b: {
        ...b.fileInfo,
        expansion: undefined,
        history: [],
        name: 'b',
        nextId: 'c',
        origin: {
          encryptedFileIVBin: [],
          fileInfo: b.fileInfo,
          fileKeyBin: [],
          originalVersion: latestVersion,
        },
        parentId: 'a',
        prevId: undefined,
        tag: [],
        type: 'file',
      },
      // diff
      c: {
        ...c.fileInfo,
        diff: { addtag: ['あ'] },
        name: 'c',
        nextId: 'd',
        origin: {
          fileInfo: c.fileInfo,
          fileKeyBin: [],
          originalVersion: latestVersion,
        },
        parentId: 'a',
        prevId: 'b',
        type: 'diff',
      },
      d: {
        ...d.fileInfo,
        diff: { addtag: ['い'] },
        name: 'd',
        nextId: 'e',
        origin: {
          fileInfo: d.fileInfo,
          fileKeyBin: [],
          originalVersion: latestVersion,
        },
        parentId: 'a',
        prevId: 'c',
        type: 'diff',
      },
      e: {
        ...e.fileInfo,
        expansion: undefined,
        history: [],
        name: 'e',
        nextId: 'f',
        origin: {
          encryptedFileIVBin: [],
          fileInfo: e.fileInfo,
          fileKeyBin: [],
          originalVersion: latestVersion,
        },
        parentId: 'a',
        prevId: 'd',
        tag: ['あ', 'い'],
        type: 'file',
      },
      // file(dirobj) 最新の情報が反映される
      f: {
        ...f.fileInfo,
        expansion: undefined,
        history: ['k', 'g', 'f', 'e', 'd', 'c', 'b'],
        name: 'k',
        nextId: 'g',
        origin: {
          encryptedFileIVBin: [],
          fileInfo: f.fileInfo,
          fileKeyBin: [],
          originalVersion: latestVersion,
        },
        parentId: 'a',
        prevId: 'e',
        tag: ['う', 'え', 'い'],
        type: 'file',
      },
      g: {
        ...g.fileInfo,
        diff: { addtag: ['い'] },
        name: 'g',
        nextId: 'k',
        origin: {
          fileInfo: g.fileInfo,
          fileKeyBin: [],
          originalVersion: latestVersion,
        },
        parentId: 'a',
        prevId: 'f',
        type: 'diff',
      },
      h: {
        ...h.fileInfo,
        expansion: undefined,
        history: ['h'],
        name: 'h',
        origin: {
          encryptedFileIVBin: [],
          fileInfo: h.fileInfo,
          fileKeyBin: [],
          originalVersion: latestVersion,
        },
        parentId: 'a',
        prevId: undefined,
        tag: ['い'],
        type: 'file',
      },
      i: {
        ...i.fileInfo,
        expansion: undefined,
        history: ['i'],
        name: 'i',
        origin: {
          encryptedFileIVBin: [],
          fileInfo: i.fileInfo,
          fileKeyBin: [],
          originalVersion: latestVersion,
        },
        parentId: 'a',
        prevId: undefined,
        tag: [],
        type: 'file',
      },
      j: {
        ...j.fileInfo,
        diff: {},
        name: 'j',
        origin: {
          fileInfo: j.fileInfo,
          fileKeyBin: [],
          originalVersion: latestVersion,
        },
        parentId: 'root',
        prevId: 'a',
        type: 'diff',
      },
      k: {
        ...k.fileInfo,
        diff: { addtag: ['う', 'え'], deltag: ['あ'] },
        name: 'k',
        origin: {
          fileInfo: k.fileInfo,
          fileKeyBin: [],
          originalVersion: latestVersion,
        },
        parentId: 'a',
        prevId: 'g',
        type: 'diff',
      },
      // folder
      root: {
        createdAt: 0,
        files: ['a'],
        history: [],
        id: 'root',
        name: 'root',
        origin: {
          fileInfo: {
            createdAt: 0,
            id: 'root',
            name: 'root',
            parentId: null,
            tag: [],
            type: 'folder',
            version: latestVersion,
          },
          fileKeyBin: [],
          originalVersion: latestVersion,
        },
        parentId: null,
        tag: [],
        type: 'folder',
        version: latestVersion,
      },
    };
    const result = buildFileTable([a, b, c, d, e, f, g, h, i, j, k]);
    // setな要素はソートしておく
    [
      ...Object.values(result.fileTable),
      ...Object.values(expectFileTable),
    ].forEach((node) => {
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
    expect(result).toEqual({
      fileTable: expectFileTable,
      tagTree: {
        い: ['f', 'h'],
        う: ['f'],
        え: ['f'],
      },
    });
  });
});

describe('#getAllDependentFile', () => {
  test('削除対象を正しく取得できる', () => {
    const a = genFileInfoFolder({ id: 'a', parentId: null, tag: [] });
    const b = genFileInfoFile({ id: 'b', parentId: 'a', tag: [] });
    const c = genFileInfoDiff({
      diff: { addtag: ['あ'] },
      id: 'c',
      parentId: 'a',
      prevId: 'b',
    });
    const d = genFileInfoDiff({
      diff: { addtag: ['い'] },
      id: 'd',
      parentId: 'a',
      prevId: 'c',
    });
    const e = genFileInfoFile({
      id: 'e',
      parentId: 'a',
      prevId: 'd',
      tag: ['あ', 'い'],
    });
    const f = genFileInfoFile({
      id: 'f',
      parentId: 'a',
      prevId: 'e',
      tag: ['あ'],
    });
    const g = genFileInfoDiff({
      diff: { addtag: ['い'] },
      id: 'g',
      parentId: 'a',
      prevId: 'f',
    });
    const h = genFileInfoFile({ id: 'h', parentId: 'a', tag: ['い'] });
    const i = genFileInfoFile({ id: 'i', parentId: 'a', tag: [] });
    const j = genFileInfoDiff({
      diff: {},
      id: 'j',
      parentId: null,
      prevId: 'a',
    });
    const k = genFileInfoDiff({
      diff: { addtag: ['う', 'え'], deltag: ['あ'] },
      id: 'k',
      parentId: 'a',
      prevId: 'g',
    });
    const { fileTable } = buildFileTable([a, b, c, d, e, f, g, h, i, j, k]);

    const result = getAllDependentFile(fileTable.f, fileTable).sort();

    const expectArray = ['b', 'c', 'd', 'e', 'f', 'g', 'k'];

    // いざ実行
    expect(result).toEqual(expectArray);
  });
});
