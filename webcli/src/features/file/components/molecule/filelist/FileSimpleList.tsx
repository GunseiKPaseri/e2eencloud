import React, { useCallback } from 'react';

import Avatar from '@mui/material/Avatar';
import type { ListProps } from '@mui/material/List';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import type { Theme } from '@mui/material/styles';
import type { SystemStyleObject } from '@mui/system/styleFunctionSx';

import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import FolderIcon from '@mui/icons-material/Folder';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { useDrop, useDrag, DragPreviewImage } from 'react-dnd';
import { Badge } from '@mui/material';
import PngIcon from '~/components/atom/PngIcon';
import { useAppSelector, useAppDispatch } from '~/lib/react-redux';
import { openContextmenu } from '~/features/contextmenu/contextmenuSlice';
import { genUseDropReturn, genUseDragReturn } from '~/features/file/components/dnd';

import type { FileNode, FileInfoFile, FileInfoFolder } from '~/features/file/file.type';
import type { FileState } from '~/features/file/fileSlice';
import { assertNonFileNodeDiff } from '~/features/file/filetypeAssert';
import type { Highlight } from '~/features/file/util/search.type';
import SearchHighLight from '../../atom/SearchHighLight';

function FileListListFolder(
  { selected, targetFolder, onSelectFolder }: {
    selected: boolean,
    targetFolder: FileNode<FileInfoFolder>,
    onSelectFolder: (id: string)=>void
  },
) {
  const dispatch = useAppDispatch();

  const handleContextMenu: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    dispatch(openContextmenu({ anchor: { left: event.clientX, top: event.clientY }, menu: { type: 'filelistitem', target: targetFolder, selected } }));
  };

  const drag = useDrag(() => genUseDragReturn(targetFolder.id))[1];

  const [{ canDrop, isOver }, drop] = useDrop(() => (
    genUseDropReturn(targetFolder.id, dispatch)
  ), [targetFolder.id]);

  const attachRef: ((instance: HTMLDivElement | null) => void) = (el) => {
    drag(el);
    drop(el);
  };

  const customSX = useCallback<((theme: Theme) => SystemStyleObject<Theme>)>((theme) => ({
    boxSizing: 'border-box',
    border: 3,
    borderStyle: 'dashed',
    transitionDuration: '0.2s',
    ...(isOver && canDrop ? { borderColor: theme.palette.info.light } : { borderColor: 'rgba(0,0,0,0)' }),
  }), [isOver, canDrop]);

  return (
    <ListItem
      ref={attachRef}
      button
      onContextMenu={handleContextMenu}
      onDoubleClick={() => onSelectFolder(targetFolder.id)}
      sx={customSX}
    >
      <ListItemAvatar>
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          invisible={!selected}
          badgeContent={
            <CheckCircleIcon color="info" />
          }
        >
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            invisible={!targetFolder.tag.includes('bin')}
            badgeContent={
              <DeleteIcon />
            }
          >
            <Avatar>
              <FolderIcon />
            </Avatar>
          </Badge>
        </Badge>
      </ListItemAvatar>
      <ListItemText
        primary={targetFolder.name}
      />
    </ListItem>
  );
}

function FileListListFile({
  targetFile, onSelectFile, mark, selected,
}: {
  selected: boolean,
  targetFile: FileNode<FileInfoFile>,
  onSelectFile: (id: string)=>void,
  mark?: Highlight[]
}) {
  const [{ isDragging }, drag, dragPreview] = useDrag(() => genUseDragReturn(targetFile.id));
  const dispatch = useAppDispatch();

  const handleContextMenu: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    dispatch(openContextmenu({ anchor: { left: event.clientX, top: event.clientY }, menu: { type: 'filelistitem', target: targetFile, selected } }));
  };

  return (
    <>
      {
        targetFile.previewURL
          && <DragPreviewImage connect={dragPreview} src={targetFile.previewURL} />
      }
      <div ref={drag}>
        <ListItem
          button
          onContextMenu={handleContextMenu}
          onDoubleClick={() => onSelectFile(targetFile.id)}
          style={{ opacity: isDragging ? 0.5 : 1 }}
        >
          <ListItemAvatar>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
              invisible={!selected}
              badgeContent={
                <CheckCircleIcon color="info" />
              }
            >
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                invisible={!targetFile.tag.includes('bin')}
                badgeContent={
                  <DeleteIcon />
                }
              >
                <Avatar>
                  {
                    targetFile.previewURL
                      ? <PngIcon src={targetFile.previewURL} />
                      : <InsertDriveFileIcon />
                  }
                </Avatar>
              </Badge>
            </Badge>
          </ListItemAvatar>
          <ListItemText
            primary={<SearchHighLight value={targetFile.name} search={mark ? { target: 'name', mark } : undefined} />}
          />
        </ListItem>
      </div>
    </>
  );
}

function FileSimpleList(
  props: ListProps & {
    nodeRef: ListProps['ref'],
    onSelectFolder: (id:string) => void,
    onSelectFile: (id: string) => void },
) {
  const { fileTable, activeFileGroup } = useAppSelector<FileState>((state) => state.file);
  const {
    nodeRef, onSelectFile, onSelectFolder, ...listprops
  } = props;
  if (!activeFileGroup) return null;

  const selecting = new Set(activeFileGroup.selecting);

  return (
    <List ref={nodeRef} {...listprops}>
      {
        activeFileGroup.type === 'search'
          ? activeFileGroup.exfiles.map((x) => {
            const target = fileTable[x[0]];
            assertNonFileNodeDiff(target);
            const selected = selecting.has(target.id);
            if (target.type === 'folder') {
              return (
                <FileListListFolder
                  selected={selected}
                  key={target.id}
                  targetFolder={target}
                  onSelectFolder={onSelectFolder}
                />
              );
            }
            return (
              <FileListListFile
                selected={selected}
                key={target.id}
                targetFile={target}
                onSelectFile={onSelectFile}
                mark={x[1]}
              />
            );
          })
          : activeFileGroup.files.map((x) => {
            const target = fileTable[x];
            assertNonFileNodeDiff(target);
            const selected = selecting.has(target.id);
            if (target.type === 'folder') {
              return (
                <FileListListFolder
                  selected={selected}
                  key={target.id}
                  targetFolder={target}
                  onSelectFolder={onSelectFolder}
                />
              );
            }
            return (
              <FileListListFile
                selected={selected}
                key={target.id}
                targetFile={target}
                onSelectFile={onSelectFile}
              />
            );
          })
      }
    </List>
  );
}

export default FileSimpleList;
