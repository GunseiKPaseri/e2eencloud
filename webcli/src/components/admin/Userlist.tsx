import { useEffect, useState } from 'react';
import {
  DataGrid, GridActionsCellItem, jaJP,
} from '@mui/x-data-grid';
import type {
  GridRowsProp,
  GridRowParams,
  GridSortItem,
  GridFilterModel,
} from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import { deleteUser, getUserList } from './adminrequest';

const PAGE_SIZE = 12;

function Userlist() {
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [page, setPage] = useState(0);
  const [sortQuery, setSortQuery] = useState<GridSortItem[]>([]);
  const [filterQuery, setFilterQuery] = useState<GridFilterModel>({ items: [] });
  const [rowLength, setRowLength] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [pageReloader, setPageReloader] = useState<symbol>(Symbol('pageload'));

  useEffect(() => {
    let active = true;

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

  return (
    <div style={{ height: 400, width: '100%' }}>
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
            width: 100,
          },
          {
            field: 'max_capacity',
            headerName: '容量',
            type: 'number',
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
      />
    </div>
  );
}

export default Userlist;
