import Box from '@mui/material/Box'
import { useAppSelector } from '../../app/hooks'
import { FileInfo, FileInfoFile, FileNode } from './file.type'
import { FileState } from './fileSlice'
import { Renamer } from './Renamer'
import { TagSetter } from './TagSetter'
import DownloadIcon from '@mui/icons-material/Download';
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Tooltip from '@mui/material/Tooltip'

import { assertFileNodeFile, assertFileNodeFileORUndefined } from './filetypeAssert'
import ImageList from '@mui/material/ImageList'
import ImageListItem from '@mui/material/ImageListItem'
import ImageListItemBar from '@mui/material/ImageListItemBar'

export const Viewer = () => {
  const fileState = useAppSelector<FileState>((store) => store.file)
  const activeFile = fileState.activeFile
  const activeNode = activeFile ? fileState.fileTable[activeFile.fileId] : undefined
  assertFileNodeFileORUndefined(activeNode)
  return (<>{
    activeNode && activeFile
      ? <>
          <TagSetter />
          <Renamer id={activeNode.id} name={activeNode.name} />
          <Box>
            <Tooltip title="ダウンロード">
              <Link href={activeFile.link} download={activeNode.name}>
                <IconButton><DownloadIcon/></IconButton>
              </Link>
            </Tooltip>
          </Box>
          {activeNode.mime.indexOf('image/') === 0 ? <img width='100%' src={activeFile.link} /> : <></>}
          
          <ImageList rowHeight={164} sx={{
            gridAutoFlow: "column",
            gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr)) !important",
            gridAutoColumns: "minmax(160px, 1fr)"
          }}>
            {activeFile.similarFiles.map((x) => {
              const target = fileState.fileTable[x]
              assertFileNodeFile(target)
              
              return (
                <ImageListItem key={x}>
                {/*<ImageListItem key={x} onDoubleClick={target.type === 'file' ? (e) => props.onSelectFile(target.id) : (e) => props.onSelectFolder(target.id)}>*/}
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
        </>
      : <></>
  }
  </>)
}
