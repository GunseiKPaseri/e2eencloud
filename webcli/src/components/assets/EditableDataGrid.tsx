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
import { Tooltip, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { Namespace, TFunction } from 'i18next';

type GetListJSON<T> = {
  total_number: number;
  items: T[];
};

export type ComputeMutation<T extends GridValidRowModel, N extends Namespace<'translations'> = 'translations', TKPrefix = undefined>
  = (params: { newRow: T, oldRow: T, t: TFunction<N, TKPrefix> }) => string | null;

function EditableDataGrid<T extends GridValidRowModel>(
  props: Omit<DataGridProps<T>, 'rows'> & {
    computeMutation: ComputeMutation<T>;
    getName: (params: GridRowParams<T>) => string,
    getList: (props:{
      offset: number,
      limit: number,
      sortQuery: GridSortItem[],
      filterQuery: GridFilterModel,
    }) => Promise<GetListJSON<T>>;
    editItem?: (targetItem: T, edited: Partial<T>) => Promise<T>;
    onEditSuccess?: () => void;
    onEditFailure?: () => void;
    onDelete: (props: GridRowParams<T>) => void;
    parentHeight: number,
    reloader?: symbol,
  },
) {
  const {
    computeMutation,
    getName,
    getList,
    editItem,
    onDelete,
    onEditSuccess = () => undefined,
    onEditFailure = () => undefined,
    parentHeight,
    columns,
    reloader,
    ...originProps
  } = props;
  const pageSize = originProps.pageSize ?? 100;
  const { t } = useTranslation();
  const [rows, setRows] = useState<GridRowsProp<T>>([]);
  const [page, setPage] = useState(0);
  const [sortQuery, setSortQuery] = useState<GridSortItem[]>([]);
  const [filterQuery, setFilterQuery] = useState<GridFilterModel>({ items: [] });
  const [rowLength, setRowLength] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [pageReloader, setPageReloader] = useState<symbol>(Symbol('pageload'));
  const [editConfirmPromiseArguments, setEditConfirmPromiseArguments] = useState<
  {
    resolve:(x: T) => void,
    reject: (x: T) => void,
    newRow: T,
    oldRow: T
  } | null>(null);
  const [deleteConfirmArguments, setDeleteConfirmArguments] = useState<
  {
    params: GridRowParams<T>,
  } | null>(null);

  const noButtonRef = useRef<HTMLButtonElement>(null);

  // get collect information
  useEffect(() => {
    let active = true;

    // GET USER TABLE
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      setLoading(true);
      const list = await getList({
        offset: page * pageSize,
        limit: pageSize,
        sortQuery,
        filterQuery,
      });
      const newRows:GridRowsProp<T> = list.items;

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
        const mutation = computeMutation({ newRow, oldRow, t });
        if (mutation) {
          // Save the arguments to resolve or reject the promise later
          setEditConfirmPromiseArguments({
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

  const handleEditConfirmNo = () => {
    if (!editConfirmPromiseArguments) return;
    const { oldRow, resolve } = editConfirmPromiseArguments;
    resolve(oldRow); // Resolve with the old row to not update the internal state
    setEditConfirmPromiseArguments(null);
  };

  const handleEditConfirmYes = editItem ? async () => {
    if (!editConfirmPromiseArguments) return;
    const {
      newRow,
      oldRow,
      resolve,
    } = editConfirmPromiseArguments;

    try {
      // Make the HTTP request to save in the backend
      const response = await editItem(oldRow, newRow);
      onEditSuccess();
      resolve({ ...oldRow, ...response });
      setEditConfirmPromiseArguments(null);
      setPageReloader(Symbol('reload'));
    } catch (error) {
      onEditFailure();
      resolve(oldRow);
      setEditConfirmPromiseArguments(null);
    }
  } : () => Promise.resolve();

  const handleEditConfirmEntered = () => {
    // The `autoFocus` is not used because, if used, the same Enter that saves
    // the cell triggers "No". Instead, we manually focus the "No" button once
    // the dialog is fully open.
    // noButtonRef.current?.focus();
  };

  const renderEditConfirmDialog = () => {
    if (!editConfirmPromiseArguments) {
      return <></>;
    }

    const { newRow, oldRow } = editConfirmPromiseArguments;
    const mutation = computeMutation({ newRow, oldRow, t });
    if (!mutation) return <></>;

    return (
      <Dialog
        maxWidth="xs"
        TransitionProps={{ onEntered: handleEditConfirmEntered }}
        open={!!editConfirmPromiseArguments}
      >
        <DialogTitle>以下の内容で変更しますか？</DialogTitle>
        <DialogContent dividers>
          <Typography>{mutation}</Typography>
        </DialogContent>
        <DialogActions>
          <Button ref={noButtonRef} onClick={handleEditConfirmNo}>
            {t('admin.cancel', 'キャンセル')}
          </Button>
          <Button onClick={handleEditConfirmYes}>{t('auth.edit', '編集')}</Button>
        </DialogActions>
      </Dialog>
    );
  };

  const handleDeleteConfirmNo = () => {
    if (!deleteConfirmArguments) return;
    setDeleteConfirmArguments(null);
  };

  const handleDeleteConfirmYes = () => {
    if (!deleteConfirmArguments) return;
    const {
      params,
    } = deleteConfirmArguments;

    onDelete(params);
    setPageReloader(Symbol('reload'));
    setDeleteConfirmArguments(null);
  };

  const renderDeleteConfirmDialog = () => {
    if (!deleteConfirmArguments) {
      return <></>;
    }
    const { params } = deleteConfirmArguments;

    return (
      <Dialog
        maxWidth="xs"
        open={!!deleteConfirmArguments}
      >
        <DialogTitle>以下の要素を削除しますか</DialogTitle>
        <DialogContent dividers>
          <Typography>{getName(params)}</Typography>
        </DialogContent>
        <DialogActions>
          <Button ref={noButtonRef} onClick={handleDeleteConfirmNo}>
            {t('admin.cancel', 'キャンセル')}
          </Button>
          <Button onClick={handleDeleteConfirmYes} color="error">{t('auth.delete', '削除')}</Button>
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
        <Tooltip title="削除">
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="削除"
            onClick={() => {
              setDeleteConfirmArguments({ params });
            }}
          />
        </Tooltip>,
      ]),
    },
  ];

  return (
    <div style={{ height: parentHeight, width: '100%' }}>
      {renderEditConfirmDialog()}
      {renderDeleteConfirmDialog()}
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
