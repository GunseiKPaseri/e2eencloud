import { CaseReducer, createAction, PayloadAction } from "@reduxjs/toolkit"
import { FileInfo, FileNode } from "../file.type"
import { FileState } from "../fileSlice"
import { searchFromTable, SearchQueryParser } from "../util/search"
import { getFileParentsList } from "../utils"

/**
 * activeFileGroupを変更(ディレクトリ)
 * */
export const changeActiveFileGroupDir = createAction<{id: string}>('file/changeActiveFileGroupDir')

export const afterChangeActiveFileGroupDir:
  CaseReducer<FileState, PayloadAction<{id: string}>> = (state, action) => {
  // 指定idのディレクトリをactiveディレクトリにする
  const firstId = action.payload.id
  const activeDir:FileNode<FileInfo> = state.fileTable[firstId]
  if (activeDir.type !== 'folder') throw new Error('指定オブジェクトはactiveDirになれません')
  const parents = getFileParentsList(firstId, state.fileTable)
  state.activeFileGroup = {
    type: 'dir',
    folderId: firstId,
    files: activeDir.files,
    parents
  }
}

/**
 * activeFileGroupを変更(タグ)
 * */
export const changeActiveFileGroupTag = createAction<{tag: string}>('file/changeActiveFileGroupTag')

export const afterChangeActiveFileGroupTag:
  CaseReducer<FileState, PayloadAction<{tag: string}>> = (state, action) => {
  // 指定タグのディレクトリをactiveにする
  state.activeFileGroup = {
    type: 'tag',
    files: state.tagTree[action.payload.tag] ?? [],
    tagName: action.payload.tag
  }
}

/**
 * activeFileGroupを変更(検索)
 * */
export const changeActiveFileGroupSearch = createAction<{queryString: string}>('file/changeActiveFileGroupSearch')

export const afterChangeActiveFileGroupSearch:
   CaseReducer<FileState, PayloadAction<{queryString: string}>> = (state, action) => {
   // 指定タグのディレクトリをactiveにする
   const query = (new SearchQueryParser(action.payload.queryString)).query
   const result = searchFromTable(state.fileTable, query)
   state.activeFileGroup = {
     type: 'search',
     files: result,
     query,
     queryString: action.payload.queryString
   }
 }
 