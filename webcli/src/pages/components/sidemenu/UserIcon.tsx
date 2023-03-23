import React, { useState } from 'react';

import { Link } from 'react-router-dom';

import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { logoutAsync, type AuthState } from '../../../features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '../../../lib/react-redux';

export default function UserIcon() {
  const selector = useAppSelector<AuthState>((state) => state.auth);
  const dispatch = useAppDispatch();
  const [anchorMenuEl, setAnchorMenuEl] = useState<HTMLButtonElement | undefined>(undefined);

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

  return (
    selector.user
      ? (
        <>
          <IconButton
            size="large"
            aria-label="現在のユーザ"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <AccountCircleIcon />
          </IconButton>
          { anchorMenuEl
            ? (
              <Menu
                id="menu-appbar"
                anchorEl={anchorMenuEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                open={Boolean(anchorMenuEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleLogout} href="">ログアウト</MenuItem>
              </Menu>
            )
            : <></>}
        </>
      )
      : (
        <>
          <Button color="inherit" component={Link} to="/signup">登録</Button>
          <Button color="inherit" component={Link} to="/login">ログイン</Button>
        </>
      )
  );
}
