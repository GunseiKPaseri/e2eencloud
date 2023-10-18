import React, { useCallback, useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderIcon from '@mui/icons-material/Folder';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ViewComfyIcon from '@mui/icons-material/ViewComfy';
import ViewHeadlineIcon from '@mui/icons-material/ViewHeadline';
import ViewListIcon from '@mui/icons-material/ViewList';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import ToggleButton from '@mui/material/ToggleButton';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import type { Theme } from '@mui/material/styles';
import type { SystemStyleObject } from '@mui/system/styleFunctionSx';
import { useDrop } from 'react-dnd';
import { useAppDispatch, useAppSelector } from '~/lib/react-redux';
import {
  StyledBreadcrumb,
  StyledBreadcrumbWithMenu,
} from '~/components/atom/StyledBreadcrumb';
import StyledToggleButtonGroup from '~/components/atom/StyledToggleButtonGroup';
import StyledToggleButtonGroupWrapper from '~/components/atom/StyledToggleButtonGroupWrapper';
import { openContextmenu } from '~/features/contextmenu/contextmenuSlice';
import TagButton from '~/features/file/components/atom/TagButton';
import { genUseDropReturn } from '~/features/file/components/dnd';
import SearchInput from '~/features/file/components/molecule/search/SearchInput';
import type { FileNode, FileInfoFolder } from '~/features/file/file.type';
import type { FileState } from '~/features/file/fileSlice';
import {
  changeActiveFileGroupDir,
  fileDeleteAsync,
  filedownloadAsync,
} from '~/features/file/fileSlice';
import { assertFileNodeFolder } from '~/features/file/filetypeAssert';
import FileGrid from './molecule/filelist/FileGrid';
import FileImgList from './molecule/filelist/FileImgList';
import FileSimpleList from './molecule/filelist/FileSimpleList';
import DirGroupFileListToolbarButton from './molecule/toolbar/DirGroupFileListToolbarButton';

function DIRBreadcrumb(props: { target: FileNode<FileInfoFolder> }) {
  const { target } = props;
  const dispatch = useAppDispatch();
  const fileTable = useAppSelector((state) => state.file.fileTable);

  const [{ canDrop, isOver }, drop] = useDrop(
    () => genUseDropReturn(dispatch, target.id),
    [target.id],
  );

  const customSX = useCallback<(theme: Theme) => SystemStyleObject<Theme>>(
    (theme) => ({
      border: 3,
      borderStyle: 'dashed',
      boxSizing: 'border-box',
      transitionDuration: '0.2s',
      ...(isOver && canDrop
        ? { borderColor: theme.palette.info.light }
        : { borderColor: 'rgba(0,0,0,0)' }),
    }),
    [isOver, canDrop],
  );

  const handleContextMenu: React.MouseEventHandler<HTMLDivElement> = (
    event,
  ) => {
    event.preventDefault();
    dispatch(
      openContextmenu({
        anchor: { left: event.clientX, top: event.clientY },
        menu: { selected: false, target, type: 'filelistitem' },
      }),
    );
  };

  return (
    <StyledBreadcrumbWithMenu
      innerRef={drop}
      sx={customSX}
      label={target.name}
      onContextMenu={handleContextMenu}
      onClick={() => {
        dispatch(changeActiveFileGroupDir({ id: target.id }));
      }}
      menuItems={target.files
        .filter((x) => fileTable[x].type === 'folder')
        .map((x) => {
          const subdir = fileTable[x];
          assertFileNodeFolder(subdir);
          return (
            <MenuItem
              key={x}
              onClick={() => {
                dispatch(changeActiveFileGroupDir({ id: x }));
              }}
            >
              <ListItemIcon>
                <FolderIcon />
              </ListItemIcon>
              <ListItemText>{subdir.name}</ListItemText>
            </MenuItem>
          );
        })}
    />
  );
}

function FileList() {
  const [viewStyle, setViewStyle] = useState<'list' | 'detaillist' | 'pic'>(
    'list',
  );

  const { fileTable, activeFileGroup } = useAppSelector<FileState>(
    (state) => state.file,
  );
  const dispatch = useAppDispatch();

  const onSelectFolder = useCallback((id: string) => {
    dispatch(changeActiveFileGroupDir({ id }));
  }, []);

  const onSelectFile = useCallback((fileId: string) => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    dispatch(filedownloadAsync({ active: true, fileId }));
  }, []);

  const [{ canDrop, isOver }, drop] = useDrop(
    () =>
      genUseDropReturn(
        dispatch,
        activeFileGroup?.type === 'dir' ? activeFileGroup.parents.at(-1) : null,
      ),
    [activeFileGroup],
  );

  const customSX = useCallback<(theme: Theme) => SystemStyleObject<Theme>>(
    (theme) => ({
      border: 3,
      borderStyle: 'dashed',
      boxSizing: 'border-box',
      transitionDuration: '0.2s',
      ...(isOver && canDrop
        ? { borderColor: theme.palette.info.light }
        : { borderColor: 'rgba(0,0,0,0)' }),
    }),
    [isOver, canDrop],
  );

  const handleDeleteClick = () => {
    if (!activeFileGroup) return;
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    dispatch(fileDeleteAsync({ targetIds: activeFileGroup.files }));
  };

  return (
    <>
      <Toolbar>
        <StyledToggleButtonGroupWrapper>
          <StyledToggleButtonGroup
            size='small'
            value={viewStyle}
            exclusive
            onChange={(
              _: unknown,
              nextView: React.SetStateAction<'list' | 'detaillist' | 'pic'>,
            ) => setViewStyle(nextView)}
          >
            <ToggleButton value='list'>
              <Tooltip title='一覧'>
                <ViewListIcon />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value='detaillist'>
              <Tooltip title='詳細'>
                <ViewHeadlineIcon />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value='pic'>
              <Tooltip title='画像タイル'>
                <ViewComfyIcon />
              </Tooltip>
            </ToggleButton>
          </StyledToggleButtonGroup>
          {activeFileGroup && activeFileGroup.type === 'dir' && (
            <>
              <Divider
                flexItem
                orientation='vertical'
                sx={{ mx: 0.5, my: 1 }}
              />
              <DirGroupFileListToolbarButton />
            </>
          )}
          {activeFileGroup &&
            activeFileGroup.type === 'tag' &&
            activeFileGroup.tagName === 'bin' && (
              <>
                <Divider
                  flexItem
                  orientation='vertical'
                  sx={{ mx: 0.5, my: 1 }}
                />
                <StyledToggleButtonGroup size='small'>
                  <Tooltip title='完全削除'>
                    <ToggleButton value='' onClick={handleDeleteClick}>
                      <DeleteIcon />
                    </ToggleButton>
                  </Tooltip>
                </StyledToggleButtonGroup>
              </>
            )}
        </StyledToggleButtonGroupWrapper>

        <SearchInput sx={{ marginLeft: 1 }} />
      </Toolbar>
      {activeFileGroup && (
        <Breadcrumbs maxItems={3} aria-label='パンくずリスト'>
          {activeFileGroup.type === 'dir'
            ? [
                <StyledBreadcrumb
                  key='dir'
                  icon={<FolderIcon fontSize='small' />}
                  label='ディレクトリ'
                />,
                ...activeFileGroup.parents.map((x) => {
                  const target = fileTable[x];
                  assertFileNodeFolder(target);
                  return <DIRBreadcrumb key={target.id} target={target} />;
                }),
              ]
            : activeFileGroup.type === 'tag'
            ? [
                <StyledBreadcrumb
                  key='tag'
                  icon={<LocalOfferIcon fontSize='small' />}
                  label='タグ'
                />,
                <TagButton key='tag_' tag={activeFileGroup.tagName} />,
              ]
            : []}
        </Breadcrumbs>
      )}
      {viewStyle === 'list' ? (
        <FileSimpleList
          sx={customSX}
          nodeRef={drop}
          onSelectFile={onSelectFile}
          onSelectFolder={onSelectFolder}
        />
      ) : viewStyle === 'detaillist' ? (
        <FileGrid
          sx={customSX}
          nodeRef={drop}
          onSelectFile={onSelectFile}
          onSelectFolder={onSelectFolder}
        />
      ) : (
        <FileImgList
          sx={customSX}
          onSelectFile={onSelectFile}
          onSelectFolder={onSelectFolder}
        />
      )}
    </>
  );
}

export default FileList;
