import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';
import Login from '../../features/auth/Login';
import FileTreeViewer from '../../features/file/components/FileTreeViewer';
import FileList from '../../features/file/components/FileList/FileList';
import Viewer from '../../features/file/components/Viewer';
import { AddFolder } from '../../features/file/components/AddFolder';
import { DiffTree } from '../../features/file/components/DiffTree';
import TagButton from '../../features/file/components/TagButton';
import StorageInfo from '../../features/file/components/StorageInfo';
import Userlist from '../admin/Userlist';
import { useAppSelector } from '../../app/hooks';

export default function FileExplorer() {
  const theme = useTheme();
  const user = useAppSelector((state) => state.auth.user);
  return (
    <div style={{
      display: 'grid',
      gridAutoFlow: 'column',
      alignItems: 'stretch',
      gridTemplateColumns: '300px 1fr',
      gridTemplateRows: '1fr 1fr',
      padding: theme.spacing(1),
      gridGap: theme.spacing(1),
      height: `calc(100vh - ${theme.spacing(8)})`,
    }}
    >
      <Paper sx={{ overflow: 'scroll', gridRow: '1/3', padding: 1 }}>
        <StorageInfo />
        <FileTreeViewer />
        <TagButton tag="bin" />
        <Login />
        {user?.authority === 'ADMIN' && <Userlist />}
      </Paper>
      <Paper sx={{ overflowY: 'scroll', padding: 1 }}>
        <AddFolder />
        <FileList />
      </Paper>
      <Paper sx={{ overflowY: 'scroll', padding: 1 }}>
        <Viewer />
        <DiffTree />
      </Paper>
    </div>
  );
}
