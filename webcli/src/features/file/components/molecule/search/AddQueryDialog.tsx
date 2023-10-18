import { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog, { type DialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { isRegExpText } from '~/features/file/util/search';
import {
  searchQuerySetTypeValidator,
  type SearchQuerySetForRedux,
} from '~/features/file/util/search.type';
import NumberSearchOperatorSelector from '../../atom/search/NumberSearchOperatorSelector';
import SearchStringQueryInput from '../../atom/search/SearchStringQueryInput';

const nullQuerySet = {
  dir: { dirid: '', id: '', ignore: false, searchSubDir: false, type: 'dir' },
  mime: { id: '', ignore: false, type: 'mime', word: '' },
  name: { id: '', ignore: false, type: 'name', word: '' },
  size: { id: '', ignore: false, operator: '>', type: 'size', value: 1000 },
  tag: { id: '', ignore: false, type: 'tag', value: '' },
} as const satisfies Record<
  SearchQuerySetForRedux['type'],
  SearchQuerySetForRedux
>;

function AddQueryDialog(props: {
  onAddQuery: (query: SearchQuerySetForRedux) => void;
  open: boolean;
  onClose: DialogProps['onClose'];
}) {
  const { onAddQuery, open, onClose } = props;
  const [querySet, setQuerySet] = useState<SearchQuerySetForRedux>(
    nullQuerySet.name,
  );
  const error =
    (querySet.type === 'name' || querySet.type === 'mime') &&
    typeof querySet.word === 'object' &&
    querySet.word.type === 'RegExp' &&
    !isRegExpText(querySet.word.word);
  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle>新しいクエリの追加</DialogTitle>
      <DialogContent>
        <Select
          value={querySet.type}
          onChange={(e: SelectChangeEvent) =>
            searchQuerySetTypeValidator(e.target.value) &&
            setQuerySet(nullQuerySet[e.target.value])
          }
        >
          <MenuItem value={'name'}>ファイル名</MenuItem>
          <MenuItem value={'mime'}>MIMEタイプ</MenuItem>
          <MenuItem value={'tag'}>タグ</MenuItem>
          <MenuItem value={'size'}>ファイルサイズ</MenuItem>
        </Select>
        <>：</>
        {querySet.type === 'name' || querySet.type === 'mime' ? (
          <SearchStringQueryInput
            value={querySet.word}
            onChange={(word) => setQuerySet({ ...querySet, word })}
            error={error}
          />
        ) : querySet.type === 'size' ? (
          <>
            <NumberSearchOperatorSelector
              value={querySet.operator}
              onChange={(operator) => setQuerySet({ ...querySet, operator })}
            />
            <TextField
              variant='standard'
              label='値'
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              value={querySet.value}
              onChange={(e) => {
                try {
                  const value = Number(e.target.value);
                  if (!Number.isNaN(value) && value > 0)
                    setQuerySet({ ...querySet, value });
                } catch {
                  //
                }
              }}
            />
          </>
        ) : querySet.type === 'tag' ? (
          // TODO
          <>tag input</>
        ) : (
          <></>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            onAddQuery(querySet);
            setQuerySet(nullQuerySet[querySet.type]);
            onClose && onClose({}, 'backdropClick');
          }}
          disabled={error}
        >
          追加
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddQueryDialog;
