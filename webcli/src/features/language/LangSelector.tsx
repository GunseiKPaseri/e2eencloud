import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { changeLanguage, langSet } from './languageSlice';

export default function LangSelector() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { language } = useAppSelector((store) => store.language);
  const handleChange = (event: SelectChangeEvent) => {
    dispatch(changeLanguage(event.target.value as keyof typeof langSet));
  };
  return (
    <Select
      color="primary"
      value={language}
      label="Age"
      onChange={handleChange}
    >
      {Object.entries(langSet).map(([code, name]) => (
        <MenuItem key={code} value={code}>{`${name} - ${t(`language.${code}`, '')}`}</MenuItem>
      ))}
    </Select>
  );
}
