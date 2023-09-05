import React, { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
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
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
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
