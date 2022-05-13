import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import { changeActiveFileGroupSearch } from '../fileSlice';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';

function SearchInput() {
  const dispatch = useAppDispatch();
  const activeFileGroup = useAppSelector((state) => state.file.activeFileGroup);
  return (
    <TextField
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