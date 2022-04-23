
import Paper from '@mui/material/Paper'
import { useTheme } from '@mui/material/styles'
import { Login } from '../../features/auth/login'
import { FileTreeViewer } from '../../features/file/fileTreeViewer'
import { FileList } from '../../features/file/FileList/FileList'
import { Viewer } from '../../features/file/Viewer'
import { AddFolder } from '../../features/file/AddFolder'
import { DiffTree } from '../../features/file/DiffTree'
import { TagButton } from '../../features/file/TagButton'
import { StorageInfo } from '../../features/file/StorageInfo'

export const FileExplorer = () => {
  const theme = useTheme()
  return ( 
    <div style={{
      display: 'grid',
      gridAutoFlow: 'column',
      alignItems: 'stretch',
      gridTemplateColumns: '300px 1fr',
      gridTemplateRows: '1fr 1fr',
      padding: theme.spacing(1),
      gridGap: theme.spacing(1),
      height: `calc(100vh - ${theme.spacing(8)})`
    }}>
      <Paper sx={{ overflow: 'scroll', gridRow: '1/3', padding: 1 }}>
      <StorageInfo />
        <FileTreeViewer />
        <TagButton tag='bin' />
        <Login />
      </Paper>
      <Paper sx={{ overflowY: 'scroll', padding: 1}}>
        <AddFolder />
        <FileList />
      </Paper>
      <Paper sx={{ overflowY: 'scroll', padding: 1}}>
        <Viewer />
        <DiffTree />
      </Paper>
    </div>
  )
}