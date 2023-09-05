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
        display: 'flex',
        border: (theme) => `1px solid ${theme.palette.divider}`,
        flexWrap: 'wrap',
        ...sx,
      }}
      {...propsCore}
    />
  );
}
