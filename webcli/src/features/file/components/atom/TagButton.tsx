import { type ReactElement } from 'react';
import React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import Chip from '@mui/material/Chip';
import { useAppDispatch } from '~/lib/react-redux';
import { changeActiveFileGroupTag } from '~/features/file/fileSlice';

const TAGICON: Record<
  string,
  { icon: ReactElement; text: string } | undefined
> = {
  bin: { icon: <DeleteIcon />, text: 'ゴミ箱' },
};

function TagButton({ tag }: { tag: string }) {
  const dispatch = useAppDispatch();
  const handleSelectTag: React.MouseEventHandler<HTMLDivElement> = () => {
    dispatch(changeActiveFileGroupTag({ tag }));
  };
  const extag = TAGICON[tag];
  if (extag) {
    return (
      <Chip
        sx={{ marginRight: 1 }}
        label={extag.text}
        icon={extag.icon}
        variant='outlined'
        onClick={handleSelectTag}
      />
    );
  }
  return (
    <Chip
      sx={{ marginRight: 1 }}
      label={tag}
      variant='outlined'
      onClick={handleSelectTag}
    />
  );
}

export default TagButton;
