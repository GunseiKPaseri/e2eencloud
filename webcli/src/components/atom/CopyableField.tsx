import { useState } from 'react';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput, {
  type OutlinedInputProps,
} from '@mui/material/OutlinedInput';
import Tooltip from '@mui/material/Tooltip';

export default function CopyableField(props: OutlinedInputProps) {
  const { value, ...propsOrigin } = props;
  const [openTip, setOpenTip] = useState<boolean>(false);

  const handleClickButton = async () => {
    await navigator.clipboard.writeText(value as string);
    setOpenTip(true);
  };
  const handleCloseTip = () => {
    setOpenTip(false);
  };

  return (
    <FormControl variant='outlined'>
      <OutlinedInput
        {...propsOrigin}
        type='text'
        value={value}
        endAdornment={
          <InputAdornment position='end'>
            <Tooltip
              arrow
              open={openTip}
              onClose={handleCloseTip}
              disableHoverListener
              placement='top'
              title='Copied!'
            >
              <IconButton disabled={value === ''} onClick={handleClickButton}>
                <AssignmentIcon />
              </IconButton>
            </Tooltip>
          </InputAdornment>
        }
      />
    </FormControl>
  );
}
