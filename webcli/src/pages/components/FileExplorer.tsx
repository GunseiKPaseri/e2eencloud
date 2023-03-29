import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Login from '~/features/auth/components/login/Login';
import FileTreeViewer from '~/features/file/components/FileTreeViewer';
import FileList from '~/features/file/components/FileList/FileList';
import Viewer from '~/features/file/components/Viewer';
import { AddFolder } from '~/features/file/components/AddFolder';
import { DiffTree } from '~/features/file/components/DiffTree';
import TagButton from '~/features/file/components/TagButton';

export default function FileExplorer() {
  return (
    <Box sx={{
      display: 'grid',
      gridAutoFlow: 'column',
      alignItems: 'stretch',
      gridTemplateColumns: '300px 1fr',
      gridTemplateRows: '1fr 1fr',
      padding: 1,
      gridGap: (theme) => theme.spacing(1),
      height: '100%',
    }}
    >
      <Paper sx={{ overflow: 'scroll', gridRow: '1/3', padding: 1 }}>
        <FileTreeViewer />
        <TagButton tag="bin" />
        <Login />
      </Paper>
      <Paper sx={{ overflowY: 'scroll', padding: 1 }}>
        <AddFolder />
        <FileList />
      </Paper>
      <Paper sx={{ overflowY: 'scroll', padding: 1 }}>
        <Viewer />
        <DiffTree />
      </Paper>
    </Box>
  );
}