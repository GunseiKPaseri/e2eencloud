import {
  useCallback, useEffect, useRef, useState,
} from 'react';
import {
  DataGrid,
  jaJP,
  GridActionsCellItem,
} from '@mui/x-data-grid';
import type {
  GridRowsProp, GridRowParams, GridValueFormatterParams,
  GridSortItem,
  GridFilterModel,
  GridRowModel,
} from '@mui/x-data-grid';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import DeleteIcon from '@mui/icons-material/Delete';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { addMonths } from 'date-fns';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import DialogActions from '@mui/material/DialogActions';
import { enqueueSnackbar } from '../../features/snackbar/snackbarSlice';
import { useAppDispatch } from '../../app/hooks';
import { appLocation } from '../../features/componentutils';
import {
  addHock, deleteHook, editHook, explainHook, getHookList,
} from './hookrequest';

const PAGE_SIZE = 5;

type HookDataGridRowModel = GridRowModel<{
  id: number;
  name: string;
  data: string;
  created_at: Date;
  expired_at: Date | null;
}>;

const computeMutation = (newRow: HookDataGridRowModel, oldRow: HookDataGridRowModel) => {
  if (newRow.name !== oldRow.name) {
    return `フック名：${oldRow.name} => ${newRow.name}`;
  } if ((
    (newRow.expired_at === null || oldRow.expired_at === null)
    && (newRow.expired_at !== oldRow.expired_at)
  ) || (
    newRow.expired_at !== null
    && oldRow.expired_at !== null
    && newRow.expired_at.valueOf() !== oldRow.expired_at.valueOf()
  )) {
    return `有効期限：${
      oldRow.expired_at
        ? oldRow.expired_at.toString()
        : 'なし'
    } => ${
      newRow.expired_at
        ? newRow.expired_at.toString()
        : 'なし'
    }`;
  }
  return null;
};

function HookList() {
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [page, setPage] = useState(0);
  const [sortQuery, setSortQuery] = useState<GridSortItem[]>([]);
  const [filterQuery, setFilterQuery] = useState<GridFilterModel>({ items: [] });
  const [rowLength, setRowLength] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [pageReloader, setPageReloader] = useState<symbol>(Symbol('pageload'));
  const [promiseArguments, setPromiseArguments] = useState<
  {
    resolve:(x: HookDataGridRowModel) => void,
    reject: (x: HookDataGridRowModel) => void,
    newRow: HookDataGridRowModel,
    oldRow: HookDataGridRowModel
  } | null>(null);

  const dispatch = useAppDispatch();
  const noButtonRef = useRef<HTMLButtonElement>(null);

  const [name, setName] = useState('');
  const [expiredAt, setExpiredAt] = useState<Date | null>(addMonths(new Date(Date.now()), 6));

  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      const hooklist = await getHookList(page * PAGE_SIZE, PAGE_SIZE, sortQuery, filterQuery);
      const newRows:GridRowsProp = hooklist.hooks.map((x) => (
        {
          ...x,
          data: explainHook(x.data),
          created_at: new Date(x.created_at),
          expired_at: x.expired_at === null ? null : new Date(x.expired_at),
        }
      ));

      if (!active) {
        return;
      }

      setRowLength(hooklist.number_of_hook);
      setRows(newRows);
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [page, sortQuery, filterQuery, pageReloader]);

  const processRowUpdate = useCallback(
    (newRow: HookDataGridRowModel, oldRow: HookDataGridRowModel) => (
      new Promise<HookDataGridRowModel>((resolve, reject) => {
        const mutation = computeMutation(newRow, oldRow);
        if (mutation) {
          // Save the arguments to resolve or reject the promise later
          setPromiseArguments({
            resolve,
            reject,
            newRow,
            oldRow,
          });
        } else {
          resolve(oldRow); // Nothing was changed
        }
      })),
    [],
  );

  const handleNo = () => {
    if (!promiseArguments) return;
    const { oldRow, resolve } = promiseArguments;
    resolve(oldRow); // Resolve with the old row to not update the internal state
    setPromiseArguments(null);
  };

  const handleYes = async () => {
    if (!promiseArguments) return;
    const {
      newRow,
      oldRow,
      resolve,
    } = promiseArguments;

    try {
      // Make the HTTP request to save in the backend
      const response = await editHook(oldRow, newRow);
      dispatch(enqueueSnackbar({ message: '正常に変更を反映しました', options: { variant: 'success' } }));
      resolve({ ...oldRow, ...response });
      setPromiseArguments(null);
      setPageReloader(Symbol('reload'));
    } catch (error) {
      dispatch(enqueueSnackbar({ message: '反映に失敗しました', options: { variant: 'error' } }));
      resolve(oldRow);
      setPromiseArguments(null);
    }
  };

  const handleEntered = () => {
    // The `autoFocus` is not used because, if used, the same Enter that saves
    // the cell triggers "No". Instead, we manually focus the "No" button once
    // the dialog is fully open.
    // noButtonRef.current?.focus();
  };

  const renderConfirmDialog = () => {
    if (!promiseArguments) {
      return <></>;
    }

    const { newRow, oldRow } = promiseArguments;
    const mutation = computeMutation(newRow, oldRow);
    if (!mutation) return <></>;

    return (
      <Dialog
        maxWidth="xs"
        TransitionProps={{ onEntered: handleEntered }}
        open={!!promiseArguments}
      >
        <DialogTitle>以下の内容で変更しますか？</DialogTitle>
        <DialogContent dividers>
          <Typography>{mutation}</Typography>
        </DialogContent>
        <DialogActions>
          <Button ref={noButtonRef} onClick={handleNo}>
            キャンセル
          </Button>
          <Button onClick={handleYes}>編集</Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <>
      <TextField
        label="Hook名"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
        }}
      />
      <DateTimePicker
        renderInput={(props) => <TextField {...props} />}
        label="有効期限"
        value={expiredAt}
        onChange={(newExpiredAt) => {
          setExpiredAt(newExpiredAt);
        }}
      />
      <Button
        variant="outlined"
        onClick={async () => {
          await addHock(name, { method: 'USER_DELETE' }, expiredAt);
          setPageReloader(Symbol('reload'));
        }}
      >
        追加
      </Button>
      <div style={{ height: 300, width: '100%' }}>
        {renderConfirmDialog()}
        <DataGrid
          localeText={jaJP.components.MuiDataGrid.defaultProps.localeText}
          rows={rows}
          columns={[
            {
              field: 'id',
              headerName: 'url',
              width: 500,
              valueFormatter: (params: GridValueFormatterParams<string>) => `${appLocation}/api/hook/${params.value}`,
            },
            {
              field: 'name',
              headerName: '名前',
              width: 200,
              editable: true,
            },
            {
              field: 'data',
              headerName: '種別',
              width: 100,
            },
            {
              field: 'created_at',
              headerName: '作成日',
              type: 'dateTime',
              width: 170,
            },
            {
              field: 'expired_at',
              headerName: '有効期限',
              type: 'dateTime',
              editable: true,
              width: 170,
            },
            {
              field: 'actions',
              type: 'actions',
              // eslint-disable-next-line react/no-unstable-nested-components
              getActions: (params: GridRowParams) => ([
                <GridActionsCellItem
                  icon={<DeleteIcon />}
                  label="削除"
                  onClick={() => {
                    deleteHook(params.id as string);
                    setPageReloader(Symbol('reload'));
                  }}
                />,
              ]),
            },
          ]}
          pagination
          pageSize={PAGE_SIZE}
          rowsPerPageOptions={[PAGE_SIZE]}
          rowCount={rowLength}
          rowHeight={25}
          paginationMode="server"
          onPageChange={(newPage) => setPage(newPage)}
          sortingMode="server"
          onSortModelChange={(model) => {
            setSortQuery([...model]);
          }}
          filterMode="server"
          onFilterModelChange={(model) => {
            setFilterQuery(model);
          }}
          page={page}
          loading={loading}
          processRowUpdate={processRowUpdate}
          experimentalFeatures={{ newEditingApi: true }}
        />
      </div>
    </>
  );
}

export default HookList;
