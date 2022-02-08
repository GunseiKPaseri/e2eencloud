import React from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/DeleteOutlined'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Close'

import {
  GridRowsProp,
  useGridApiRef,
  DataGrid,
  DataGridProps,
  GridApiRef,
  GridColumns,
  GridRowParams,
  MuiEvent,
  GridToolbarContainer,
  GridActionsCellItem,
  GridEventListener,
  GridEvents,
  GridRowId
} from '@mui/x-data-grid'

export const EditableDataGrid = (props: Omit<DataGridProps, 'apiRef' | 'editMode' | 'onRowEditStart' | 'onRowEditStop' | 'onCellFocusOut'>) => {
  const { columns, ...other } = props

  const apiRef = useGridApiRef()

  const handleRowEditStart = (
    params: GridRowParams,
    event: MuiEvent<React.SyntheticEvent>
  ) => {
    event.defaultMuiPrevented = true
  }

  const handleRowEditStop: GridEventListener<GridEvents.rowEditStop> = (
    params,
    event
  ) => {
    event.defaultMuiPrevented = true
  }

  const handleCellFocusOut: GridEventListener<GridEvents.cellFocusOut> = (
    params,
    event
  ) => {
    event.defaultMuiPrevented = true
  }

  const handleEditClick: ((id: GridRowId) => React.MouseEventHandler<HTMLButtonElement>) = (id) => (event) => {
    event.stopPropagation()
    apiRef.current.setRowMode(id, 'edit')
  }

  const handleSaveClick: ((id: GridRowId) => React.MouseEventHandler<HTMLButtonElement>) = (id) => async (event) => {
    event.stopPropagation()
    // Wait for the validation to run
    const isValid = await apiRef.current.commitRowChange(id)
    if (isValid) {
      apiRef.current.setRowMode(id, 'view')
      const row = apiRef.current.getRow(id)
      apiRef.current.updateRows([{ ...row, isNew: false }])
    }
  }

  const handleDeleteClick: ((id: GridRowId) => React.MouseEventHandler<HTMLButtonElement>) = (id) => (event) => {
    event.stopPropagation()
    apiRef.current.updateRows([{ id, _action: 'delete' }])
  }

  const handleCancelClick: ((id: GridRowId) => React.MouseEventHandler<HTMLButtonElement>) = (id) => (event) => {
    event.stopPropagation()
    apiRef.current.setRowMode(id, 'view')

    const row = apiRef.current.getRow(id)
    if (row!.isNew) {
      apiRef.current.updateRows([{ id, _action: 'delete' }])
    }
  }

  const customColumns: GridColumns = [...columns,
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = apiRef.current.getRowMode(id) === 'edit'

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              key='0'
              icon={<SaveIcon />}
              label="Save"
              onClick={handleSaveClick(id)}
              color="primary"
            />,
            <GridActionsCellItem
              key='1'
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />
          ]
        }

        return [
          <GridActionsCellItem
            key='0'
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            key='1'
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />
        ]
      }
    }]

  return (
    <DataGrid
      editMode='row'
      columns={customColumns}
      onRowEditStart={handleRowEditStart}
      onRowEditStop={handleRowEditStop}
      onCellFocusOut={handleCellFocusOut}
      {...other}
    />
  )
}
