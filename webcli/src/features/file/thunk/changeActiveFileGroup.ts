import type { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { createAction } from '@reduxjs/toolkit';
import type { FileInfo, FileNode } from '~/features/file/file.type';
import type { FileState } from '~/features/file/fileSlice';
import {
  exchangeSearchQuery,
  exchangeSearchQueryForRedux,
  hasSearchQueryHasError,
  isSearchQueryChanged,
  searchFromTable,
  searchQueryBuilder,
  searchQueryNormalizer,
  SearchQueryParser,
} from '~/features/file/util/search';
import { getFileParentsList } from '~/features/file/utils';
import type { SearchQueryForRedux } from '../util/search.type';

/**
 * activeFileGroupを変更(ディレクトリ)
 * */
export const changeActiveFileGroupDir = createAction<{ id: string }>(
  'file/changeActiveFileGroupDir',
);

export const afterChangeActiveFileGroupDir: CaseReducer<
  FileState,
  PayloadAction<{ id: string }>
> = (state, action) => {
  // 指定idのディレクトリをactiveディレクトリにする
  const firstId = action.payload.id;
  const activeDir: FileNode<FileInfo> = state.fileTable[firstId];
  if (activeDir.type !== 'folder')
    throw new Error('指定オブジェクトはactiveDirになれません');
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
export const changeActiveFileGroupTag = createAction<{ tag: string }>(
  'file/changeActiveFileGroupTag',
);

export const afterChangeActiveFileGroupTag: CaseReducer<
  FileState,
  PayloadAction<{ tag: string }>
> = (state, action) => {
  // 指定タグのディレクトリをactiveにする
  state.activeFileGroup = {
    type: 'tag',
    files: state.tagTree[action.payload.tag] ?? [],
    selecting: [],
    tagName: action.payload.tag,
  };
};

type CreateActiveFileGroupSearch =
  | {
      queryString: string;
    }
  | {
      query: SearchQueryForRedux;
    };
/**
 * activeFileGroupを変更(検索)
 * refresh: クエリ文字列を再生成する
 * */
export const changeActiveFileGroupSearch =
  createAction<CreateActiveFileGroupSearch>('file/changeActiveFileGroupSearch');

export const afterChangeActiveFileGroupSearch: CaseReducer<
  FileState,
  PayloadAction<CreateActiveFileGroupSearch>
> = (state, action) => {
  const { queryString, query } =
    'query' in action.payload
      ? ((query: SearchQueryForRedux) => {
          const normalizeQuery = searchQueryNormalizer(query);
          return {
            query: normalizeQuery,
            queryString: searchQueryBuilder(normalizeQuery),
          };
        })(action.payload.query)
      : {
          query: exchangeSearchQueryForRedux(
            new SearchQueryParser(action.payload.queryString).query,
          ),
          queryString: action.payload.queryString,
        };
  // 何も入力されていなかったらディレクトリに復元
  if (query.term.length === 0) {
    state.activeFileGroup =
      state.activeFileGroup?.type !== 'search'
        ? state.activeFileGroup
        : state.activeFileGroup.preGroup;
    return;
  }

  // クエリが更新されていたら検索結果を更新
  const exfiles =
    state.activeFileGroup?.type !== 'search' ||
    isSearchQueryChanged(state.activeFileGroup.query, query)
      ? searchFromTable(state.fileTable, exchangeSearchQuery(query))
      : state.activeFileGroup.exfiles;

  const preGroup =
    state.activeFileGroup?.type !== 'search'
      ? state.activeFileGroup
      : state.activeFileGroup.preGroup;
  state.activeFileGroup = {
    type: 'search',
    files: exfiles.map((x) => x[0]),
    selecting: state.activeFileGroup?.selecting ?? [],
    exfiles,
    query,
    queryString,
    queryHasError: hasSearchQueryHasError(query),
    preGroup,
  };
};

/**
 * 選択しているファイル・フォルダを更新
 */
export const changeSelection = createAction<{ selection: string[] }>(
  'file/changeSelection',
);

export const afterChangeSelection: CaseReducer<
  FileState,
  PayloadAction<{ selection: string[] }>
> = (state, action) => {
  if (state.activeFileGroup) {
    state.activeFileGroup = {
      ...state.activeFileGroup,
      selecting: action.payload.selection,
    };
  }
};
