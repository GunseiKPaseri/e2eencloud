import Menu from '@mui/material/Menu';
import { useAppDispatch, useAppSelector } from '~/lib/react-redux';
import { closeContextmenu } from '../contextmenuSlice';

export default function ContextMenuWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const menuState = useAppSelector((store) => store.contextmenu.menuState);
  const dispatch = useAppDispatch();
  const handleClose = () => dispatch(closeContextmenu());
  return (
    <Menu
      open={!!menuState}
      onClose={handleClose}
      anchorReference='anchorPosition'
      anchorPosition={menuState?.anchor}
    >
      {children}
    </Menu>
  );
}
