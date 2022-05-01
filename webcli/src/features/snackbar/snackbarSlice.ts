/* eslint-disable no-param-reassign */
import { SnackbarMessage, VariantType, SnackbarKey } from 'notistack';
import { createAction, createSlice } from '@reduxjs/toolkit';

type NotificationOption = { key?: SnackbarKey, variant?: VariantType, dismissed?: boolean };
type NotificationOptionWithKey = Omit<NotificationOption, 'key'> & { key: SnackbarKey };
type Notification = { message: SnackbarMessage, options?: NotificationOption };
type NotificationWithKey = { message: SnackbarMessage, options: NotificationOptionWithKey };
const initialState: { notifications: NotificationWithKey[] } = { notifications: [] };

export const enqueueSnackbar = createAction<(props: Notification) => { payload: NotificationWithKey }>('snackbar/enqueue', (props) => {
  const payload = {
    message: props.message,
    options: { ...props.options, key: new Date().getTime() + Math.random() },
  };
  return { payload };
});

export const closeSnackbar = createAction<(props: NotificationOption) => { payload: NotificationOptionWithKey }>('snackbar/close', (props) => ({ payload: { ...props, key: new Date().getTime() + Math.random() } }));

export const removeSnackbar = createAction<SnackbarKey>('snackbar/remove');

const snackbarSlice = createSlice({
  name: 'snackbar',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(enqueueSnackbar, (state, { payload }) => {
        state.notifications = [...state.notifications, payload];
      })
      .addCase(closeSnackbar, (state, { payload }) => {
        state.notifications = state.notifications.map((notification) => {
          const shouldDismiss = notification.options.key === payload.key;
          return shouldDismiss
            ? {
              message: notification.message, options: { ...notification.options, dismissed: true },
            }
            : { ...notification };
        });
      })
      .addCase(removeSnackbar, (state, { payload }) => {
        state.notifications = state.notifications.filter((notification) => (
          notification.options.key !== payload
        ));
      });
  },
});

export default snackbarSlice.reducer;
