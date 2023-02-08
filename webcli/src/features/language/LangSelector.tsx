import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { changeLanguage } from './languageSlice';
import { langSet } from './languageState';

const native = false;

export default function LangSelector() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const language = useAppSelector((store) => store.language.language);
  const handleChange = (event: SelectChangeEvent) => {
    dispatch(changeLanguage(event.target.value as keyof typeof langSet));
  };
  return (
    <Select
      native={native}
      color="primary"
      value={language}
      onChange={handleChange}
    >
      {
        (Object.entries(langSet) as [keyof typeof langSet, typeof langSet[keyof typeof langSet]][])
          .map(([code, name]) => (
            native
              ? <option key={code} value={code}>{`${name} - ${t(`language.${code}`, '')}`}</option>
              : <MenuItem key={code} value={code}>{`${name} - ${t(`language.${code}`, '')}`}</MenuItem>
          ))
      }
    </Select>
  );
}
