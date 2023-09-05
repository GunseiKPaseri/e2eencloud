import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import { glayPicture } from '~/const/const';
import { useAppDispatch, useAppSelector } from '~/lib/react-redux';
import { openContextmenu } from '~/features/contextmenu/contextmenuSlice';
import type { FileState } from '~/features/file/fileSlice';
import { filedownloadAsync } from '~/features/file/fileSlice';
import {
  assertFileNodeFile,
  assertFileNodeFileORUndefined,
} from '~/features/file/filetypeAssert';
import TagField from './molecule/TagField';
import FilePreviewToolbar from './molecule/toolbar/FilePreviewToolbar';

function Viewer() {
  const fileState = useAppSelector<FileState>((store) => store.file);
  const dispatch = useAppDispatch();
  const { activeFile } = fileState;
  const activeNode = activeFile
    ? fileState.fileTable[activeFile.fileId]
    : undefined;
  assertFileNodeFileORUndefined(activeNode);
  return activeNode && activeFile ? (
    <>
      <TagField />
      <FilePreviewToolbar />
      {activeNode.mime.startsWith('image/') && (
        <img alt={activeNode.name} width='100%' src={activeFile.link} />
      )}

      <ImageList
        rowHeight={164}
        sx={{
          gridAutoFlow: 'column',
          gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr)) !important',
          gridAutoColumns: 'minmax(160px, 1fr)',
        }}
      >
        {activeFile.similarFiles.map((x) => {
          const target = fileState.fileTable[x];
          assertFileNodeFile(target);

          return (
            <ImageListItem
              key={x}
              onDoubleClick={() =>
                dispatch(filedownloadAsync({ fileId: target.id, active: true }))
              }
              onContextMenu={(event) => {
                event.preventDefault();
                if (target.type !== 'file') return;
                dispatch(
                  openContextmenu({
                    anchor: { left: event.clientX, top: event.clientY },
                    menu: { type: 'filelistitem', target, isInDir: false },
                  }),
                );
              }}
            >
              {/*
                    <ImageListItem key={x} onDoubleClick={target.type === 'file'
                      ? (e) => props.onSelectFile(target.id)
                      : (e) => props.onSelectFolder(target.id)}
                    />
                  */}
              {target.type === 'file' &&
              target.mime.startsWith('image/') &&
              target.blobURL ? (
                <img src={target.blobURL} alt={target.name} loading='lazy' />
              ) : (
                <img alt={target.name} src={glayPicture} />
              )}
              <ImageListItemBar
                position='top'
                title={target.name}
                sx={{
                  background:
                    'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, ' +
                    'rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
                }}
              />
            </ImageListItem>
          );
        })}
      </ImageList>
    </>
  ) : (
    <></>
  );
}

export default Viewer;
