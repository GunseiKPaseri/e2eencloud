import type { ReactNode } from "react";
import Chip from "@mui/material/Chip";

export type QueryKeyWordChipProps = {
  label: ReactNode
  onDelete: ()=>void
  ignore: boolean
  isDragging: boolean
  overlay?: boolean
}

function QueryKeyWordChip(props: QueryKeyWordChipProps) {
  const { label, onDelete, ignore, isDragging, overlay } = props;
  return (
    <Chip
      size='small'
      variant='outlined'
      label={label}
      onDelete={onDelete}
      sx={{
        backgroundColor: 'white',
        cursor: isDragging ? 'grabbing' : 'grab',
        borderColor: ignore ? '#eee' : '',
        color: ignore ? 'text.disabled' : '',
        opacity: overlay ? 0 : 1
      }}
    />
  )
}

export default QueryKeyWordChip;