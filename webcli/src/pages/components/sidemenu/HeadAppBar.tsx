import React from 'react';

import { styled } from '@mui/material/styles';
import MuiAppBar, { type AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';

import MenuIcon from '@mui/icons-material/Menu';
import { useAppSelector } from '~/lib/react-redux';

import { type ProgressState } from '~/features/progress/progressSlice';

import { SIDEBAR_WIDTH } from '~/const/const';
import LangSelector from '~/features/language/LangSelector';
import UserIcon from './UserIcon';

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: SIDEBAR_WIDTH,
    width: `calc(100% - ${SIDEBAR_WIDTH}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

export default function HeadAppBar(
  { isSidebarOpen, onSidebarToggle }: { isSidebarOpen: boolean, onSidebarToggle: () => void },
) {
  const { progress } = useAppSelector<ProgressState>((state) => state.progress);
  return (
    <AppBar position="fixed" open={isSidebarOpen}>
      <>
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
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
        {(
            progress
              && (
                <LinearProgress
                  variant="buffer"
                  value={progress.real * 100}
                  valueBuffer={progress.buffer * 100}
                />
              )
          )}
      </>
    </AppBar>
  );
}
