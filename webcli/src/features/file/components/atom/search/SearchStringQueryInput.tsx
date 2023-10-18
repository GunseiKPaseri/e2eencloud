import { SvgIcon } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { VscRegex } from 'react-icons/vsc';

type SearchStringQueryInputProps = {
  value: string | { type: 'RegExp'; word: string };
  onChange: (word: string | { type: 'RegExp'; word: string }) => void;
  error: boolean;
};

function SearchStringQueryInput(props: SearchStringQueryInputProps) {
  const [value, regex] =
    typeof props.value === 'string'
      ? [props.value, false]
      : [props.value.word, true];
  const newChange = (word: string, regexp: boolean) => {
    if (regexp) {
      props.onChange({ type: 'RegExp', word });
    } else {
      props.onChange(word);
    }
  };
  return (
    <TextField
      sx={{ m: 1, width: '25ch' }}
      label='値'
      type='text'
      value={value}
      error={props.error}
      onChange={(e) => newChange(e.target.value, regex)}
      InputProps={{
        endAdornment: (
          <InputAdornment position='end'>
            <IconButton
              aria-label='toggle regex mode'
              onClick={() => newChange(value, !regex)}
              color={regex ? 'secondary' : 'default'}
            >
              <SvgIcon>
                <VscRegex />
              </SvgIcon>
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
}

export default SearchStringQueryInput;
