import { ImageListItemBar } from '@mui/material';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import { SxProps, Theme } from '@mui/material/styles';
import { openContextmenu } from '../../contextmenu/contextmenuSlice';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import type { FileState } from '../fileSlice';
import { assertNonFileNodeDiff } from '../filetypeAssert';

function FileImgList({ sx, onSelectFile, onSelectFolder }: {
  sx: SxProps<Theme>,
  onSelectFolder: (id:string) => void,
  onSelectFile: (id: string) => void,
}) {
  const { fileTable, activeFileGroup } = useAppSelector<FileState>((state) => state.file);
  const dispatch = useAppDispatch();

  return (activeFileGroup
    && (
      <ImageList sx={sx} cols={3} rowHeight={164} variant="masonry">
        {activeFileGroup.files.map((x) => {
          const target = fileTable[x];
          assertNonFileNodeDiff(target);

          return (
            <ImageListItem
              key={x}
              onDoubleClick={target.type === 'file' ? () => onSelectFile(target.id) : () => onSelectFolder(target.id)}
              onContextMenu={(event) => {
                event.preventDefault();
                if (target.type !== 'file') return;
                dispatch(openContextmenu({ anchor: { left: event.clientX, top: event.clientY }, menu: { type: 'filelistitemfile', targetFile: target } }));
              }}
            >
              {
                target.type === 'file' && target.mime.indexOf('image/') === 0 && target.blobURL
                  ? (
                    <img
                      src={target.blobURL}
                      alt={target.name}
                      loading="lazy"
                    />
                  )
                  : <img alt={target.name} />
              }
              <ImageListItemBar
                position="top"
                title={target.name}
                sx={{
                  background:
                    'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, '
                    + 'rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
                }}
              />
            </ImageListItem>
          );
        })}
      </ImageList>
    )
  );
}

export default FileImgList;
