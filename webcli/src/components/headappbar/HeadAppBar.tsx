import React from 'react'

import { styled } from '@mui/material/styles'
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'

import { useAppSelector } from '../../app/hooks'

import { ProgressState } from '../../features/progress/progressSlice'

import MenuIcon from '@mui/icons-material/Menu'

import { UserIcon } from './UserIcon'

import { drawerWidth } from '../../util'

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open'
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  })
}))

export const HeadAppBar = (props: {open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>>}) => {
  const selector = useAppSelector<ProgressState>((state) => state.progress)
  return (
      <AppBar position="fixed" open={props.open}>
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
              onClick={() => props.setOpen(!props.open)}
            >
              <MenuIcon />
            </IconButton>
          </Box>
          <Box sx={{ flexGrow: 0 }}>
            <UserIcon />
          </Box>
        </Toolbar>
        {(
          selector.progress
            ? <LinearProgress
                variant="buffer"
                value={selector.progress.real * 100}
                valueBuffer={selector.progress.buffer * 100} />
            : <></>
        )}
      </AppBar>
  )
}
