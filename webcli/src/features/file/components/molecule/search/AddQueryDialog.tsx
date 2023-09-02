import { useState } from "react";
import Dialog, { type DialogProps } from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

import { searchQuerySetTypeValidator, type SearchQuerySetForRedux } from "~/features/file/util/search.type";
import { isRegExpText } from "~/features/file/util/search";
import NumberSearchOperatorSelector from "../../atom/search/NumberSearchOperatorSelector";
import SearchStringQueryInput from "../../atom/search/SearchStringQueryInput";

const nullQuerySet = {
  'name': {type: 'name', word: '', ignore: false, id: ''},
  'mime': {type: 'mime', word: '', ignore: false, id: ''},
  'size': {type: 'size', value: 1000, operator: '>', ignore: false, id: ''},
  'tag': {type: 'tag', value: '', ignore: false, id: ''},
  'dir': {type: 'dir', dirid: '', searchSubDir: false, ignore: false, id: ''},
} as const satisfies Record<SearchQuerySetForRedux['type'], SearchQuerySetForRedux>;

function AddQueryDialog(props: {onAddQuery: (query: SearchQuerySetForRedux) => void, open: boolean, onClose: DialogProps['onClose']}) {
  const {onAddQuery, open, onClose} = props;
  const [querySet, setQuerySet] = useState<SearchQuerySetForRedux>(nullQuerySet.name)
  const error = ((querySet.type === 'name' || querySet.type === 'mime') && typeof querySet.word === 'object' && querySet.word.type === 'RegExp' && !isRegExpText(querySet.word.word))
  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle>新しいクエリの追加</DialogTitle>
      <DialogContent>
        <Select
          value={querySet.type}
          onChange={(e: SelectChangeEvent)=> searchQuerySetTypeValidator(e.target.value) && setQuerySet(nullQuerySet[e.target.value])}
        >
          <MenuItem value={'name'}>ファイル名</MenuItem>
          <MenuItem value={'mime'}>MIMEタイプ</MenuItem>
          <MenuItem value={'tag'}>タグ</MenuItem>
          <MenuItem value={'size'}>ファイルサイズ</MenuItem>
        </Select><>：</>{
          (querySet.type === 'name' || querySet.type === 'mime' ? <SearchStringQueryInput value={querySet.word} onChange={(word) => setQuerySet({...querySet, word})} error={error} />
          : querySet.type=== 'size' ? <>
            <NumberSearchOperatorSelector value={querySet.operator} onChange={(operator) => setQuerySet({...querySet, operator})} />
            <TextField variant="standard" label='値' inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} value={querySet.value} onChange={(e) => {
              try{
                const value = Number(e.target.value)
                if(!isNaN(value) && value > 0)setQuerySet({...querySet, value})
              }catch(_){
                //
              }
            }} />
          </>
          : querySet.type === 'tag' ? <></>
          : <></>)
        }
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            onAddQuery(querySet)
            setQuerySet(nullQuerySet[querySet.type])
            onClose && onClose({}, 'backdropClick')
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
