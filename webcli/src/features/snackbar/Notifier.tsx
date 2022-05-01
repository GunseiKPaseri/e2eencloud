import { useEffect } from 'react';

import { useSnackbar, SnackbarKey } from 'notistack';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { removeSnackbar } from './snackbarSlice';

let displayed: SnackbarKey[] = [];

function Notifier() {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((store) => store.snackbar.notifications);

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const storeDisplayed = (id: SnackbarKey) => {
    displayed = [...displayed, id];
  };

  const removeDisplayed = (id: SnackbarKey) => {
    displayed = [...displayed.filter((key) => id !== key)];
  };

  useEffect(() => {
    notifications.forEach(({ message, options }) => {
      if (options.dismissed) {
        closeSnackbar(options.key);
        return;
      }
      if (displayed.includes(options.key)) return;
      enqueueSnackbar(message, {
        ...options,
        onExited: (e, myKey) => {
          removeDisplayed(myKey);
          dispatch(removeSnackbar(myKey));
        },
      });
      storeDisplayed(options.key);
    });
  }, [notifications, closeSnackbar, enqueueSnackbar, dispatch, displayed]);
  return null;
}

export default Notifier;
