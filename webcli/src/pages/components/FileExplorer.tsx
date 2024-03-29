import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import FileTreeViewer from '~/features/file/components/FileTreeViewer';
import FileList from '~/features/file/components/FileList';
import Viewer from '~/features/file/components/Viewer';
import { DiffTree } from '~/features/file/components/molecule/DiffTree';
import TagButton from '~/features/file/components/atom/TagButton';
import Exclctrl from '~/features/exclctrl/Exclctrl';
import Detail from '~/features/file/components/molecule/Detail';

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
        <Exclctrl />
        <FileTreeViewer />
        <TagButton tag="bin" />
      </Paper>
      <Paper sx={{ overflowY: 'scroll', padding: 1 }}>
        <FileList />
      </Paper>
      <Paper sx={{ overflowY: 'scroll', padding: 1 }}>
        <Viewer />
        <Detail />
        <DiffTree />
      </Paper>
    </Box>
  );
}
