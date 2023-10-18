import { useMemo } from 'react';
import type { ReactNode } from 'react';
import {
  jaJP as MUILocalejaJP,
  zhCN as MUILocalezhCN,
  enUS as MUILocaleenUS,
} from '@mui/material/locale';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  jaJP as MUIDataGridLocalejaJP,
  zhCN as MUIDataGridLocalezhCN,
  enUS as MUIDataGridLocaleenUS,
} from '@mui/x-data-grid/locales';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  jaJP as MUIDateLocalejaJP,
  zhCN as MUIDateLocalezhCN,
  enUS as MUIDateLocaleenUS,
} from '@mui/x-date-pickers/locales';
import {
  ja as dateFnsLocalejaJP,
  zhCN as dateFnsLocalezhCN,
  enUS as dateFnsLocaleenUS,
} from 'date-fns/locale';
import { useAppSelector } from '~/lib/react-redux';
import type { LanguageState } from '~/features/language/languageState';

const MUILocales = {
  enUS: MUILocaleenUS,
  jaJP: MUILocalejaJP,
  zhCN: MUILocalezhCN,
} as const satisfies Record<LanguageState['language'], typeof MUILocalejaJP>;

const dateFnsLocale = {
  enUS: dateFnsLocaleenUS,
  jaJP: dateFnsLocalejaJP,
  zhCN: dateFnsLocalezhCN,
} as const satisfies Record<
  LanguageState['language'],
  typeof dateFnsLocalejaJP
>;

const MUIDateLocales = {
  enUS: MUIDateLocaleenUS,
  jaJP: MUIDateLocalejaJP,
  zhCN: MUIDateLocalezhCN,
} as const satisfies Record<
  LanguageState['language'],
  typeof MUIDateLocalejaJP
>;

const MUIDataGridLocales = {
  enUS: MUIDataGridLocaleenUS,
  jaJP: MUIDataGridLocalejaJP,
  zhCN: MUIDataGridLocalezhCN,
} as const satisfies Record<
  LanguageState['language'],
  typeof MUIDataGridLocalejaJP
>;

function ThemeWithLocalizeProvider({ children }: { children: ReactNode }) {
  const locale = useAppSelector((store) => store.language.language);

  const theme = {};

  const themeWithLocale = useMemo(
    () =>
      createTheme(
        theme,
        MUILocales[locale],
        MUIDateLocales[locale],
        MUIDataGridLocales[locale],
      ),
    [locale, theme],
  );

  return (
    <ThemeProvider theme={themeWithLocale}>
      <LocalizationProvider
        dateAdapter={AdapterDateFns}
        adapterLocale={dateFnsLocale[locale]}
      >
        {children}
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default ThemeWithLocalizeProvider;
