import React from 'react';
import { ExhaustiveError } from '~/utils/assert';
import type { Awaitable } from 'vitest';
import type { AppDispatch } from '~/store/store';
import { useAppDispatch, useAppSelector } from '~/lib/react-redux';
import { closeContextmenu } from './contextmenuSlice';
import MenuFileListItem from './menu/MenuFileListItem';

const genHandleContextMenu = (dispatch: AppDispatch) => (
  (onClick:
  (event: React.MouseEvent<HTMLLIElement, MouseEvent>) => Awaitable<void>) => (
    async (event: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
      await onClick(event);
      dispatch(closeContextmenu());
    }
  )
);

export default function ContextMenu() {
  const dispatch = useAppDispatch();
  const menuState = useAppSelector((store) => store.contextmenu.menuState);
  if (menuState === null) return <></>;
  switch (menuState.menu.type) {
    case 'filelistitem':
      return (
        <MenuFileListItem
          menu={menuState.menu}
          genHandleContextMenu={genHandleContextMenu(dispatch)}
        />
      );
    default:
      throw new ExhaustiveError(menuState.menu.type);
  }
}
