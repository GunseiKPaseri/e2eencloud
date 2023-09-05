import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import MuiDrawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import { styled } from '@mui/material/styles';
import { SIDEBAR_WIDTH } from '~/const/const';
import { useAppSelector } from '~/lib/react-redux';
import HeadAppBar from './HeadAppBar';

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  '& .MuiDrawer-paper': {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: SIDEBAR_WIDTH,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: 'border-box',
    ...(!open && {
      overflowX: 'hidden',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up('sm')]: {
        width: theme.spacing(9),
      },
    }),
  },
}));

function ListItem(props: {
  icon: JSX.Element;
  text: string;
  onClick: () => void;
  buttonRight?: JSX.Element;
  pl?: number;
}) {
  const { pl, text, icon, onClick, buttonRight } = props;
  return (
    <ListItemButton sx={{ pl }} onClick={onClick}>
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={text} />
      {buttonRight}
    </ListItemButton>
  );
}

export default function SideMenu() {
  const user = useAppSelector((state) => state.auth.user);
  const [open, setOpen] = useState(false);
  const [configureOpen, setConfigureOpen] = useState(false);
  const handleConfigureOpen = () => {
    if (!open) setOpen(true);
    setConfigureOpen(!configureOpen);
  };
  const toggleDrawer = () => {
    if (open) setConfigureOpen(false);
    setOpen(!open);
  };
  const navigate = useNavigate();
  return (
    <>
      <HeadAppBar isSidebarOpen={open} onSidebarToggle={toggleDrawer} />
      <Drawer variant='permanent' open={open}>
        <Toolbar
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            px: [1],
          }}
        >
          <IconButton onClick={toggleDrawer}>
            <ChevronLeftIcon />
          </IconButton>
        </Toolbar>
        <Divider />
        <List>
          <ListItem
            text='ホーム'
            onClick={() => navigate('/')}
            icon={<HomeIcon />}
          />
          <ListItem
            text='設定'
            onClick={handleConfigureOpen}
            icon={<SettingsIcon />}
            buttonRight={
              configureOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />
            }
          />
          <Collapse in={configureOpen} timeout='auto' unmountOnExit>
            <ListItem
              text='認証'
              onClick={() => navigate('/configure/auth')}
              icon={<SettingsIcon />}
              pl={4}
            />
            <ListItem
              text='API'
              onClick={() => navigate('/configure/api')}
              icon={<SettingsIcon />}
              pl={4}
            />
            {user && user.authority === 'ADMIN' && (
              <ListItem
                text='管理'
                onClick={() => navigate('/configure/admin')}
                icon={<SettingsIcon />}
                pl={4}
              />
            )}
          </Collapse>
        </List>
      </Drawer>
    </>
  );
}
