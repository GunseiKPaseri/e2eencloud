import React from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import MuiAppBar, {
  type AppBarProps as MuiAppBarProps,
} from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Toolbar from '@mui/material/Toolbar';
import { styled } from '@mui/material/styles';
import { SIDEBAR_WIDTH } from '~/const/const';
import { useAppSelector } from '~/lib/react-redux';
import LangSelector from '~/features/language/LangSelector';
import { type ProgressState } from '~/features/progress/progressSlice';
import UserIcon from './UserIcon';

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  transition: theme.transitions.create(['width', 'margin'], {
    duration: theme.transitions.duration.leavingScreen,
    easing: theme.transitions.easing.sharp,
  }),
  zIndex: theme.zIndex.drawer + 1,
  ...(open && {
    marginLeft: SIDEBAR_WIDTH,
    transition: theme.transitions.create(['width', 'margin'], {
      duration: theme.transitions.duration.enteringScreen,
      easing: theme.transitions.easing.sharp,
    }),
    width: `calc(100% - ${SIDEBAR_WIDTH}px)`,
  }),
}));

export default function HeadAppBar({
  isSidebarOpen,
  onSidebarToggle,
}: {
  isSidebarOpen: boolean;
  onSidebarToggle: () => void;
}) {
  const { progress } = useAppSelector<ProgressState>((state) => state.progress);
  return (
    <AppBar position='fixed' open={isSidebarOpen}>
      <>
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            <IconButton
              size='large'
              edge='start'
              color='inherit'
              aria-label='menu'
              sx={{ mr: 2 }}
              onClick={onSidebarToggle}
            >
              <MenuIcon />
            </IconButton>
          </Box>
          <Box sx={{ flexGrow: 0 }}>
            <LangSelector />
            <UserIcon />
          </Box>
        </Toolbar>
        {progress && (
          <LinearProgress
            variant='buffer'
            value={progress.real * 100}
            valueBuffer={progress.buffer * 100}
          />
        )}
      </>
    </AppBar>
  );
}
