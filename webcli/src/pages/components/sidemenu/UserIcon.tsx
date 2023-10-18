import React, { useId, useState } from 'react';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '~/lib/react-redux';
import { logoutAsync, type AuthState } from '~/features/auth/authSlice';

export default function UserIcon() {
  const menuAppberId = useId();
  const selector = useAppSelector<AuthState>((state) => state.auth);
  const dispatch = useAppDispatch();
  const [anchorMenuEl, setAnchorMenuEl] = useState<
    HTMLButtonElement | undefined
  >(undefined);

  const handleMenu: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    setAnchorMenuEl(event.currentTarget);
  };

  const handleClose: React.MouseEventHandler<HTMLButtonElement> = () => {
    setAnchorMenuEl(undefined);
  };

  const handleLogout: React.MouseEventHandler<HTMLAnchorElement> = async () => {
    await dispatch(logoutAsync());
    setAnchorMenuEl(undefined);
  };

  return selector.user ? (
    <>
      <IconButton
        size='large'
        title='現在のユーザ'
        aria-label='現在のユーザ'
        aria-controls={menuAppberId}
        aria-haspopup='true'
        onClick={handleMenu}
        color='inherit'
      >
        <AccountCircleIcon />
      </IconButton>
      <Menu
        id={menuAppberId}
        anchorEl={anchorMenuEl}
        anchorOrigin={{
          horizontal: 'right',
          vertical: 'bottom',
        }}
        transformOrigin={{
          horizontal: 'right',
          vertical: 'top',
        }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              '& .MuiAvatar-root': {
                height: 32,
                ml: -0.5,
                mr: 1,
                width: 32,
              },
              '&:before': {
                bgcolor: 'background.paper',
                content: '""',
                display: 'block',
                height: 10,
                position: 'absolute',
                right: 14,
                top: 0,
                transform: 'translateY(-50%) rotate(45deg)',
                width: 10,
                zIndex: 0,
              },
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              overflow: 'visible',
            },
          },
        }}
        keepMounted
        open={Boolean(anchorMenuEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={handleLogout} href=''>
          ログアウト
        </MenuItem>
      </Menu>
    </>
  ) : (
    <>
      <Button color='inherit' component={Link} to='/signup'>
        登録
      </Button>
      <Button color='inherit' component={Link} to='/login'>
        ログイン
      </Button>
    </>
  );
}
