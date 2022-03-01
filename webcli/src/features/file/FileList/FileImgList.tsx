import { ImageListItemBar } from "@mui/material"
import ImageList from "@mui/material/ImageList"
import ImageListItem from "@mui/material/ImageListItem"
import Skeleton from "@mui/material/Skeleton"
import { SxProps, Theme } from '@mui/material/styles';
import { useAppSelector } from "../../../app/hooks"
import { FileState } from "../fileSlice"
import { assertNonFileNodeDiff } from "../filetypeAssert"

export const FileImgList = (props: {sx: SxProps<Theme>, onSelectFolder: (id:string) => void, onSelectFile: (id: string) => void}) => {
  const { fileTable, activeFileGroup } = useAppSelector<FileState>(state => state.file)

  return ( activeFileGroup
    ? <ImageList sx={props.sx} cols={3} rowHeight={164} variant="masonry">
        {activeFileGroup.files.map((x) => {
          const target = fileTable[x]
          assertNonFileNodeDiff(target)
          
          return (
            <ImageListItem key={x} onDoubleClick={target.type === 'file' ? (e) => props.onSelectFile(target.id) : (e) => props.onSelectFolder(target.id)}>
              {
                target.type === 'file' && target.mime.indexOf('image/') === 0 && target.blobURL
                  ? <img
                      src={target.blobURL}
                      alt={target.name}
                      loading="lazy"
                    />
                  : <img alt={target.name} />
              }
              <ImageListItemBar
                position="top"
                title={target.name}
                sx={{
                  background: 
                    'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, ' +
                    'rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
                }} />
            </ImageListItem>
          )
        })}
      </ImageList>
    : <></>
  )
}