import Select, { type SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

import { numberSearchTypeValidator, type NumberSearchType } from "../../../util/search.type";

function NumberSearchOperatorSelector(props: {value: NumberSearchType, onChange: (operator: NumberSearchType) => void}){
  return (
    <Select
      value={props.value}
      onChange={(e: SelectChangeEvent)=> numberSearchTypeValidator(e.target.value) && props.onChange(e.target.value)}
    >
      <MenuItem value={'=='}>=</MenuItem>
      <MenuItem value={'>='}>≧</MenuItem>
      <MenuItem value={'<='}>≦</MenuItem>
      <MenuItem value={'>'}>＞</MenuItem>
      <MenuItem value={'<'}>＜</MenuItem>
    </Select>
  );
}

export default NumberSearchOperatorSelector;