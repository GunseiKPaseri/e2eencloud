import type React from 'react';

export const downloadLocal = ({
  uri,
  fileName,
}: {
  uri: string;
  fileName: string;
}) => {
  // Download
  const a = document.createElement('a');
  a.href = uri;
  a.download = fileName;
  document.body.append(a);

  a.click();
  a.remove();
};

export type ContextMenuProps<T extends { type: string }> = {
  menu: T;
  genHandleContextMenu: (
    onClick: () => void,
  ) => (event: React.MouseEvent<HTMLLIElement, MouseEvent>) => void;
};
