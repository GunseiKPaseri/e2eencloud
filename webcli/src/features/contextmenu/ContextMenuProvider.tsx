import type { ReactNode } from 'react';
import ContextMenu from './atom/ContextMenu';

export default function ContextMenuProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      {children}
      <ContextMenu />
    </>
  );
}
