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
        margin: 0.5,
        padding: 1,
        borderRadius: 1,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: props.disabled ? '#eee' : 'gray',
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
