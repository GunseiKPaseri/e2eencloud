import React, { useCallback, useState } from 'react'
import Chip from '@mui/material/Chip'
import { emphasize, styled } from '@mui/material/styles'
import Menu from '@mui/material/Menu'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

export const StyledBreadcrumb = styled(Chip)(({ theme }) => {
  const backgroundColor =
    theme.palette.mode === 'light'
      ? theme.palette.grey[100]
      : theme.palette.grey[800]
  return {
    backgroundColor,
    height: theme.spacing(3),
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightRegular,
    '&:hover, &:focus': {
      backgroundColor: emphasize(backgroundColor, 0.06)
    },
    '&:active': {
      boxShadow: theme.shadows[1],
      backgroundColor: emphasize(backgroundColor, 0.12)
    }
  }
})

export const StyledBreadcrumbWithMenu = (props: React.ComponentProps<typeof Chip> & {menuItems: JSX.Element[], innerRef?: ((instance: HTMLDivElement | null) => void) | React.RefObject<HTMLDivElement>}) => {
  const { menuItems, innerRef, ...chipprops } = props
  const [anchorMenuEl, setAnchorMenuEl] = useState<HTMLButtonElement|undefined>(undefined)

  const handleMenu: React.MouseEventHandler<HTMLButtonElement> = useCallback((event) => {
    setAnchorMenuEl(event.currentTarget)
  }, [])

  const handleClose: React.MouseEventHandler<HTMLElement> = useCallback((event) => {
    setAnchorMenuEl(undefined)
  }, [])

  return (<>
    <StyledBreadcrumb ref={innerRef} {...chipprops} deleteIcon={menuItems.length > 0 ? <ExpandMoreIcon /> : <></>} onDelete={handleMenu}/>
    { anchorMenuEl
      ? <Menu
          id="menu-appbar"
          anchorEl={anchorMenuEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
          keepMounted
          open={Boolean(anchorMenuEl)}
          onClose={handleClose}
          onClick={handleClose}
        >
          {menuItems}
        </Menu>
      : <></>
    }
  </>)
}
