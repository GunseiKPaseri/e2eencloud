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
  DataGridProps,
  GridRowParams,
  GridRowsProp,
  GridSortItem,
  GridValidRowModel,
  GridFilterModel,
} from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { Typography } from '@mui/material';

type GetListJSON<T> = {
  total_number: number;
  items: T[];
};

function EditableDataGrid<T extends GridValidRowModel>(
  props: Omit<DataGridProps<T>, 'rows'> & {
    computeMutation: (newRow: T, oldRow: T) => string | null;
    getList: (props:{
      offset: number,
      limit: number,
      sortQuery: GridSortItem[],
      filterQuery: GridFilterModel,
    }) => Promise<GetListJSON<T>>;
    editItem: (targetItem: T, edited: Partial<T>) => Promise<T>;
    onEditSuccess: () => void;
    onEditFailure: () => void;
    onDelete: (props: GridRowParams<T>) => void;
    parentHeight: number,
    reloader?: symbol,
  },
) {
  const {
    computeMutation,
    getList,
    editItem,
    onDelete,
    onEditSuccess,
    onEditFailure,
    parentHeight,
    columns,
    reloader,
    ...originProps
  } = props;
  const pageSize = originProps.pageSize ?? 100;
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [page, setPage] = useState(0);
  const [sortQuery, setSortQuery] = useState<GridSortItem[]>([]);
  const [filterQuery, setFilterQuery] = useState<GridFilterModel>({ items: [] });
  const [rowLength, setRowLength] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [pageReloader, setPageReloader] = useState<symbol>(Symbol('pageload'));
  const [promiseArguments, setPromiseArguments] = useState<
  {
    resolve:(x: T) => void,
    reject: (x: T) => void,
    newRow: T,
    oldRow: T
  } | null>(null);

  const noButtonRef = useRef<HTMLButtonElement>(null);

  // get collect information
  useEffect(() => {
    let active = true;

    // GET USER TABLE
    (async () => {
      setLoading(true);
      const list = await getList({
        offset: page * pageSize,
        limit: pageSize,
        sortQuery,
        filterQuery,
      });
      const newRows:GridRowsProp = list.items;

      if (!active) {
        return;
      }

      setRowLength(list.total_number);
      setRows(newRows);
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [page, sortQuery, filterQuery, pageReloader, reloader]);

  const processRowUpdate = useCallback(
    (newRow: T, oldRow: T) => (
      new Promise<T>((resolve, reject) => {
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
      const response = await editItem(oldRow, newRow);
      onEditSuccess();
      resolve({ ...oldRow, ...response });
      setPromiseArguments(null);
      setPageReloader(Symbol('reload'));
    } catch (error) {
      onEditFailure();
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

  const columnsWithAction = [
    ...columns,
    {
      field: 'actions',
      type: 'actions',
      // eslint-disable-next-line react/no-unstable-nested-components
      getActions: (params: GridRowParams<T>) => ([
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="削除"
          onClick={() => {
            onDelete(params);
            setPageReloader(Symbol('reload'));
          }}
        />,
      ]),
    },
  ];

  return (
    <div style={{ height: parentHeight, width: '100%' }}>
      {renderConfirmDialog()}
      <DataGrid
        {...props}
        columns={columnsWithAction}
        localeText={jaJP.components.MuiDataGrid.defaultProps.localeText}
        rowHeight={25}
        pagination
        rows={rows}
        rowCount={rowLength}
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

export default EditableDataGrid;
