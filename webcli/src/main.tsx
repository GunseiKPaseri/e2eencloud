import { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import CssBaseline from '@mui/material/CssBaseline';
import ContextMenuProvider from '~/features/contextmenu/ContextMenuProvider';
import Notifier from '~/features/snackbar/Notifier';
import AppFallback from '~/pages/AppFallback';
import AppRouter from '~/pages/AppRouter';
import ComposedProvider from '~/pages/ComposedProvider';
import './index.css';

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
