import type { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { createAction } from '@reduxjs/toolkit';
import { getFileParentsList } from '~/features/file/utils';
import type { FileState } from '~/features/file/fileSlice';
import type { FileInfo, FileNode } from '~/features/file/file.type';
import { exchangeSearchQueryForRedux, hasSearchQueryHasError, searchFromTable, SearchQueryParser } from '~/features/file/util/search';

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
  if (query.length === 0) {
    state.activeFileGroup = (state.activeFileGroup?.type !== 'search' ?  state.activeFileGroup : state.activeFileGroup.preGroup)
    return
  }
  const result = searchFromTable(state.fileTable, query);
  const preGroup = (state.activeFileGroup?.type !== 'search' ?  state.activeFileGroup : state.activeFileGroup.preGroup)
  state.activeFileGroup = {
    type: 'search',
    files: result.map((x) => x[0]),
    selecting: state.activeFileGroup?.selecting ?? [],
    exfiles: result,
    query: exchangeSearchQueryForRedux(query),
    queryString: action.payload.queryString,
    queryHasError: hasSearchQueryHasError(query),
    preGroup,
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
