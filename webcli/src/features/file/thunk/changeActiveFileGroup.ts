import type { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { createAction } from '@reduxjs/toolkit';
import type { FileInfo, FileNode } from '../file.type';
import type { FileState } from '../fileSlice';
import { searchFromTable, SearchQueryParser } from '../util/search';
import { getFileParentsList } from '../utils';

/**
 * activeFileGroupを変更(ディレクトリ)
 * */
export const changeActiveFileGroupDir = createAction<{ id: string }>('file/changeActiveFileGroupDir');

export const afterChangeActiveFileGroupDir:
CaseReducer<FileState, PayloadAction<{ id: string }>> = (state, action) => {
  // 指定idのディレクトリをactiveディレクトリにする
  const firstId = action.payload.id;
  const activeDir:FileNode<FileInfo> = state.fileTable[firstId];
  if (activeDir.type !== 'folder') throw new Error('指定オブジェクトはactiveDirになれません');
  const parents = getFileParentsList(firstId, state.fileTable);
  state.activeFileGroup = {
    type: 'dir',
    folderId: firstId,
    files: activeDir.files,
    selecting: [],
    parents,
  };
};

/**
 * activeFileGroupを変更(タグ)
 * */
export const changeActiveFileGroupTag = createAction<{ tag: string }>('file/changeActiveFileGroupTag');

export const afterChangeActiveFileGroupTag:
CaseReducer<FileState, PayloadAction<{ tag: string }>> = (state, action) => {
  // 指定タグのディレクトリをactiveにする
  state.activeFileGroup = {
    type: 'tag',
    files: state.tagTree[action.payload.tag] ?? [],
    selecting: [],
    tagName: action.payload.tag,
  };
};

/**
 * activeFileGroupを変更(検索)
 * */
export const changeActiveFileGroupSearch = createAction<{ queryString: string }>('file/changeActiveFileGroupSearch');

export const afterChangeActiveFileGroupSearch:
CaseReducer<FileState, PayloadAction<{ queryString: string }>> = (state, action) => {
  // 指定タグのディレクトリをactiveにする
  const { query } = new SearchQueryParser(action.payload.queryString);
  const result = searchFromTable(state.fileTable, query);
  state.activeFileGroup = {
    type: 'search',
    files: result.map((x) => x[0]),
    selecting: state.activeFileGroup?.selecting ?? [],
    exfiles: result,
    query,
    queryString: action.payload.queryString,
  };
};

/**
 * 選択しているファイル・フォルダを更新
 */
export const changeSelection = createAction<{ selection: string[] }>('file/changeSelection');

export const afterChangeSelection:
CaseReducer<FileState, PayloadAction<{ selection: string[] }>> = (state, action) => {
  if (state.activeFileGroup) {
    state.activeFileGroup = { ...state.activeFileGroup, selecting: action.payload.selection };
  }
};
