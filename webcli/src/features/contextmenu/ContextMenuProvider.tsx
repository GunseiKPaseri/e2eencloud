import ContextMenu from './atom/ContextMenu';

export default function ContextMenuProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ContextMenu />
    </>
  );
}
