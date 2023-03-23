import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import * as MUIDataGridLocales from '@mui/x-data-grid/locales';
import { LocalizationProvider } from '@mui/x-date-pickers';
import * as MUIDateLocales from '@mui/x-date-pickers/locales';
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import * as MUILocales from '@mui/material/locale';
import * as dateFnsLocale from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

import { useAppSelector } from '../lib/react-redux';

function ThemeWithLocalizeProvider({ children }: {
  children: ReactNode
}) {
  const locale = useAppSelector((store) => store.language.language);
  const { t } = useTranslation();

  const theme = {};

  const themeWithLocale = useMemo(() => createTheme(
    theme,
    MUILocales[locale],
    MUIDateLocales[locale],
    MUIDataGridLocales[locale],
  ), [locale, theme]);

  const x = dateFnsLocale[t('conf.dateFnsLocale', 'ja')];

  return (
    <ThemeProvider theme={themeWithLocale}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={x}>
        {children}
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default ThemeWithLocalizeProvider;
