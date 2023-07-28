import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import { useAppDispatch, useAppSelector } from '~/lib/react-redux';
import { changeActiveFileGroupSearch } from '~/features/file/fileSlice';
import type { SxProps, Theme } from '@mui/material';

function SearchInput(props: {sx?: SxProps<Theme>}) {
  const dispatch = useAppDispatch();
  const activeFileGroup = useAppSelector((state) => state.file.activeFileGroup);
  return (
    <TextField
      sx={props.sx}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
      value={activeFileGroup && activeFileGroup.type === 'search' ? activeFileGroup.queryString : ''}
      variant="standard"
      onChange={(e) => {
        dispatch(changeActiveFileGroupSearch({ queryString: e.target.value }));
      }}
    />
  );
}

export default SearchInput;
