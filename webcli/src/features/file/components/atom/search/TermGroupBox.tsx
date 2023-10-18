import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

type TermGroupBoxProps = {
  disabled: boolean;
  header: ReactNode;
  children: ReactNode;
  addButton: ReactNode;
};
function TermGroupBox(props: TermGroupBoxProps) {
  return (
    <Box
      sx={{
        borderColor: props.disabled ? '#eee' : 'gray',
        borderRadius: 1,
        borderStyle: 'solid',
        borderWidth: 1,
        margin: 0.5,
        padding: 1,
      }}
    >
      <Typography
        color={props.disabled ? 'text.disabled' : 'text.primary'}
        gutterBottom
      >
        {props.header}
      </Typography>
      <div>{props.children}</div>
      {props.addButton}
    </Box>
  );
}

export default TermGroupBox;
