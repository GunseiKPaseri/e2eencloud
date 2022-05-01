import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { WritableDraft } from 'immer/dist/internal';
import { FileInfoFile, FileNode } from '../file/file.type';

export type ContextMenuState = {
  menuState: {
    anchor: { left: number, top: number },
    menu: {
      type: 'filelistitemfile',
      targetFile: FileNode<FileInfoFile>,
      isDir?: boolean,
      selected?: boolean,
    }
  } | null
};

const initialState: ContextMenuState = { menuState: null };

export const contextmenuSlice = createSlice({
  name: 'contextmenu',
  initialState,
  reducers: {
    openContextmenu: (state: WritableDraft<ContextMenuState>, action: PayloadAction<Exclude<ContextMenuState['menuState'], null>>) => {
      state.menuState = { ...action.payload };
      // console.log(state);
    },
    closeContextmenu: (state: WritableDraft<ContextMenuState>) => {
      state.menuState = null;
    },
  },
});

export default contextmenuSlice.reducer;

export const { openContextmenu, closeContextmenu } = contextmenuSlice.actions;
