import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import type { FilterOptionsState } from '@mui/material/useAutocomplete';
import { useAppSelector, useAppDispatch } from '../../app/hooks';

import type { FileState } from './fileSlice';
import { createDiffAsync } from './fileSlice';
import { assertFileNodeFile } from './filetypeAssert';

const filter = createFilterOptions();

function TagSetter() {
  const { activeFile, fileTable, tagTree } = useAppSelector<FileState>((state) => state.file);
  const dispatch = useAppDispatch();
  if (!activeFile) return null;

  const allTags: (string | { addition: string })[] = Object.keys(tagTree);

  const targetNode = fileTable[activeFile.fileId];
  assertFileNodeFile(targetNode);

  return (
    <Autocomplete
      multiple
      options={allTags}
      getOptionLabel={(option) => (typeof option === 'string' ? option : `"${option.addition}"を追加`)}
      value={targetNode.tag}
      filterSelectedOptions
      renderInput={(params) => (
        <TextField
          {...params}
          label="タグ"
          placeholder="追加タグ"
        />
      )}
      onChange={(_event, newTagItems) => {
        const newTags = newTagItems.map((x) => (typeof x === 'string' ? x : x.addition));
        // console.log(newTags);
        dispatch(createDiffAsync({ targetId: targetNode.id, newTags }));
      }}
      filterOptions={(options, params) => {
        const filtered = filter(
          options,
          params as FilterOptionsState<unknown>,
        ) as (string | { addition: string })[];
        if (params.inputValue !== '' && !filtered.includes(params.inputValue)) {
          filtered.push({ addition: params.inputValue });
        }
        return filtered;
      }}
    />
  );
}

export default TagSetter;
