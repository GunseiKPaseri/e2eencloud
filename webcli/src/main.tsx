import { Suspense } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { createRoot } from 'react-dom/client';
import ContextMenuProvider from '~/features/contextmenu/ContextMenuProvider';
import Notifier from '~/features/snackbar/Notifier';
import AppFallback from '~/pages/AppFallback';
import AppRouter from '~/pages/AppRouter';
import ComposedProvider from '~/pages/ComposedProvider';
import './index.css';

const rootElement = document.querySelector('#root');

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
