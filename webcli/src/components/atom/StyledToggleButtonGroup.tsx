import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { styled } from '@mui/material/styles';

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  '& .MuiToggleButtonGroup-grouped': {
    '&.Mui-disabled': {
      border: 0,
    },
    '&:first-of-type': {
      borderRadius: theme.shape.borderRadius,
    },
    '&:not(:first-of-type)': {
      borderRadius: theme.shape.borderRadius,
    },
    border: 0,
    margin: theme.spacing(0.5),
  },
}));

export default StyledToggleButtonGroup;
