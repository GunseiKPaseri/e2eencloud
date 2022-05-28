import {
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import {
  DataGrid, GridActionsCellItem, jaJP,
} from '@mui/x-data-grid';
import type {
  GridRowModel,
  GridRowsProp,
  GridRowParams,
  GridSortItem,
  GridFilterModel,
} from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { Typography } from '@mui/material';
import { deleteUser, editUser, getUserList } from './adminrequest';
import { useAppDispatch } from '../../app/hooks';
import { enqueueSnackbar } from '../../features/snackbar/snackbarSlice';

const PAGE_SIZE = 12;

type UserDataGridRowModel = GridRowModel<{
  id: number;
  email: string;
  two_factor_authentication: boolean;
  max_capacity: number;
  file_usage: number;
  authority: string | null;
}>;

const computeMutation = (newRow: UserDataGridRowModel, oldRow: UserDataGridRowModel) => {
  if (newRow.max_capacity !== oldRow.max_capacity) {
    return `容量：${oldRow.max_capacity}=>${newRow.max_capacity} (${(oldRow.max_capacity > newRow.max_capacity ? `-${oldRow.max_capacity - newRow.max_capacity}` : `+${newRow.max_capacity - oldRow.max_capacity}`)})`;
  } if (newRow.two_factor_authentication !== oldRow.two_factor_authentication) {
    return `二段階認証：${newRow.two_factor_authentication ? 'オン' : 'オフ'}`;
  }
  return null;
};

function Userlist() {
  const dispatch = useAppDispatch();
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [page, setPage] = useState(0);
  const [sortQuery, setSortQuery] = useState<GridSortItem[]>([]);
  const [filterQuery, setFilterQuery] = useState<GridFilterModel>({ items: [] });
  const [rowLength, setRowLength] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [pageReloader, setPageReloader] = useState<symbol>(Symbol('pageload'));
  const [promiseArguments, setPromiseArguments] = useState<
  {
    resolve:(x: UserDataGridRowModel) => void,
    reject: (x: UserDataGridRowModel) => void,
    newRow: UserDataGridRowModel,
    oldRow: UserDataGridRowModel
  } | null>(null);

  const noButtonRef = useRef<HTMLButtonElement>(null);

  // get collect information
  useEffect(() => {
    let active = true;

    // GET USER TABLE
    (async () => {
      setLoading(true);
      const userlist = await getUserList(page * PAGE_SIZE, PAGE_SIZE, sortQuery, filterQuery);
      const newRows:GridRowsProp = userlist.users;

      if (!active) {
        return;
      }

      setRowLength(userlist.number_of_user);
      setRows(newRows);
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [page, sortQuery, filterQuery, pageReloader]);

  const processRowUpdate = useCallback(
    (newRow: UserDataGridRowModel, oldRow: UserDataGridRowModel) => (
      new Promise<UserDataGridRowModel>((resolve, reject) => {
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
      const response = await editUser(oldRow, newRow);
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
    <div style={{ height: 400, width: '100%' }}>
      {renderConfirmDialog()}
      <DataGrid
        localeText={jaJP.components.MuiDataGrid.defaultProps.localeText}
        rows={rows}
        columns={[
          { field: 'id', hide: true },
          { field: 'email', headerName: 'メールアドレス', width: 200 },
          {
            field: 'two_factor_authentication',
            headerName: '2段階認証',
            type: 'boolean',
            editable: true,
            width: 100,
          },
          {
            field: 'max_capacity',
            headerName: '容量',
            type: 'number',
            editable: true,
            width: 120,
          },
          {
            field: 'file_usage',
            headerName: '使用量',
            type: 'number',
            width: 120,
          },
          {
            field: 'authority',
            headerName: '権限',
            width: 120,
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
                  deleteUser(params.id as number);
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
  );
}

export default Userlist;
