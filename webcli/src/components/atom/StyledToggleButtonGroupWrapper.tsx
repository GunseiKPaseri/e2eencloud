import { type ComponentProps } from 'react';
import Paper from '@mui/material/Paper';

export default function StyledToggleButtonGroupWrapper(
  props: ComponentProps<typeof Paper>,
) {
  const { sx, ...propsCore } = props;
  return (
    <Paper
      elevation={0}
      sx={{
        border: (theme) => `1px solid ${theme.palette.divider}`,
        display: 'flex',
        flexWrap: 'wrap',
        ...sx,
      }}
      {...propsCore}
    />
  );
}
