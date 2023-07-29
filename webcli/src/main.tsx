import { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import CssBaseline from '@mui/material/CssBaseline';

import './index.css';

import Notifier from '~/features/snackbar/Notifier';

import ContextMenuProvider from '~/features/contextmenu/ContextMenuProvider';
import ComposedProvider from '~/pages/ComposedProvider';
import AppFallback from '~/pages/AppFallback';
import AppRouter from '~/pages/AppRouter';

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = createRoot(rootElement);

  root.render(
    <ComposedProvider>
      <CssBaseline />
      <Suspense fallback={<AppFallback />}>
        <Notifier />
        <ContextMenuProvider>
          <AppRouter />
        </ContextMenuProvider>
      </Suspense>
    </ComposedProvider>,
  );
}
