import React, { type ReactNode, useCallback, useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import { emphasize, styled } from '@mui/material/styles';

export const StyledBreadcrumb = styled(Chip)(({ theme }) => {
  const backgroundColor =
    theme.palette.mode === 'light'
      ? theme.palette.grey[100]
      : theme.palette.grey[800];
  return {
    '&:active': {
      backgroundColor: emphasize(backgroundColor, 0.12),
      boxShadow: theme.shadows[1],
    },
    '&:hover, &:focus': {
      backgroundColor: emphasize(backgroundColor, 0.06),
    },
    backgroundColor,
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightRegular,
    height: theme.spacing(3),
  };
});

export function StyledBreadcrumbWithMenu(
  props: React.ComponentProps<typeof Chip> & {
    menuItems: ReactNode[];
    innerRef?:
      | ((instance: HTMLDivElement | null) => void)
      | React.RefObject<HTMLDivElement>;
  },
) {
  const { menuItems, innerRef, ...chipprops } = props;
  const [anchorMenuEl, setAnchorMenuEl] = useState<
    HTMLButtonElement | undefined
  >(undefined);

  const handleMenu: React.MouseEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      setAnchorMenuEl(event.currentTarget);
    },
    [],
  );

  const handleClose: React.MouseEventHandler<HTMLElement> = useCallback(() => {
    setAnchorMenuEl(undefined);
  }, []);

  return (
    <>
      <StyledBreadcrumb
        ref={innerRef}
        {...chipprops}
        deleteIcon={menuItems.length > 0 ? <ExpandMoreIcon /> : <></>}
        onDelete={handleMenu}
      />
      {anchorMenuEl ? (
        <Menu
          id='menu-appbar'
          anchorEl={anchorMenuEl}
          anchorOrigin={{
            horizontal: 'right',
            vertical: 'bottom',
          }}
          transformOrigin={{
            horizontal: 'right',
            vertical: 'top',
          }}
          keepMounted
          open={Boolean(anchorMenuEl)}
          onClose={handleClose}
          onClick={handleClose}
        >
          {menuItems}
        </Menu>
      ) : (
        <></>
      )}
    </>
  );
}
