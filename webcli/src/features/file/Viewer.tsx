import Box from '@mui/material/Box'
import { useAppSelector } from '../../app/hooks'
import { FileNode, FileNodeFile } from './file.type'
import { FileState } from './fileSlice'
import { Renamer } from './Renamer'
import { TagSetter } from './TagSetter'
import DownloadIcon from '@mui/icons-material/Download';
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Tooltip from '@mui/material/Tooltip'

/**
 * 要素がFileNodeFile | undefinedであると確信
 * @param fileNode FileNodeFile | undefined
 */
export const assertFileNodeFileORUndefined:
  (fileNode:FileNode | undefined) => asserts fileNode is FileNodeFile | undefined =
  (fileNode) => {
    if ((fileNode !== undefined) && (!fileNode || fileNode.type !== 'file')) {
      throw new Error(`${fileNode} is not File Object and undefined!!`)
    }
  }

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
        </>
      : <></>
  }
  </>)
}
