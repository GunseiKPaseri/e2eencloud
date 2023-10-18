import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { useAppSelector } from '~/lib/react-redux';
import Exclctrl from '~/features/exclctrl/Exclctrl';
import FileList from '~/features/file/components/FileList';
import FileTreeViewer from '~/features/file/components/FileTreeViewer';
import Viewer from '~/features/file/components/Viewer';
import TagButton from '~/features/file/components/atom/TagButton';
import Detail from '~/features/file/components/molecule/Detail';
import { DiffTree } from '~/features/file/components/molecule/DiffTree';

export default function FileExplorer() {
  const activeFile = useAppSelector((store) => store.file.activeFile);
  return (
    <Box
      sx={{
        alignItems: 'stretch',
        display: 'grid',
        gridAutoFlow: 'column',
        gridGap: (theme) => theme.spacing(1),
        gridTemplateColumns: '300px 1fr',
        gridTemplateRows: '1fr 1fr',
        height: '100%',
        padding: 1,
      }}
    >
      <Paper sx={{ gridRow: '1/3', overflow: 'scroll', padding: 1 }}>
        <Exclctrl />
        <FileTreeViewer />
        <TagButton tag='bin' />
      </Paper>
      {activeFile === null ? (
        <>
          <Paper sx={{ gridRow: '1/3', overflowY: 'scroll', padding: 1 }}>
            <FileList />
          </Paper>
        </>
      ) : (
        <>
          <Paper sx={{ overflowY: 'scroll', padding: 1 }}>
            <FileList />
          </Paper>
          <Paper sx={{ overflowY: 'scroll', padding: 1 }}>
            <Viewer />
            <Detail />
            <DiffTree />
          </Paper>
        </>
      )}
    </Box>
  );
}
