import React, { useState, useEffect } from 'react'

import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { useSnackbar, SnackbarKey } from 'notistack'
import { removeSnackbar } from './snackbarSlice'

export const Notifier = () => {
  const [displayed, setDisplayed] = useState<SnackbarKey[]>([])
  const dispatch = useAppDispatch()
  const snackbar = useAppSelector(store => store.snackbar)

  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  const storeDisplayed = (id: SnackbarKey) => {
    setDisplayed([...displayed, id])
  }

  const removeDisplayed = (id: SnackbarKey) => {
    setDisplayed([...displayed.filter(key => id !== key)])
  }

  useEffect(() => {
    snackbar.notifications.forEach(({ message, options }) => {
      enqueueSnackbar(message, {
        ...options,
        onExited: (e, myKey) => {
          dispatch(removeSnackbar(myKey))
          removeDisplayed(myKey)
        }
      })
      storeDisplayed(options.key)
    })

  }, [snackbar, closeSnackbar, enqueueSnackbar, dispatch])
  return null
}

