import { useEffect, useState } from 'react';
import {
  DataGrid,
  jaJP,
  GridActionsCellItem,
} from '@mui/x-data-grid';
import type { GridRowsProp, GridRowParams, GridValueFormatterParams } from '@mui/x-data-grid';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import DeleteIcon from '@mui/icons-material/Delete';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { addMonths } from 'date-fns';

import {
  addHock, deleteHook, explainHook, getHookList,
} from './hookrequest';
import { appLocation } from '../../features/componentutils';

const PAGE_SIZE = 5;

function HookList() {
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [page, setPage] = useState(0);
  const [rowLength, setRowLength] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [pageReloader, setPageReloader] = useState<symbol>(Symbol('pageload'));

  const [name, setName] = useState('');
  const [expiredAt, setExpiredAt] = useState<Date | null>(addMonths(new Date(Date.now()), 6));

  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      const hooklist = await getHookList(page * PAGE_SIZE, PAGE_SIZE);
      const newRows:GridRowsProp = hooklist.hooks.map((x) => (
        {
          ...x,
          data: explainHook(x.data),
          created_at: new Date(x.created_at),
          expired_at: new Date(x.expired_at),
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
  }, [page, pageReloader]);

  return (
    <div style={{ height: 400, width: '100%' }}>
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
      </>
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
          { field: 'name', headerName: '名前', width: 200 },
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
        page={page}
        loading={loading}
      />
    </div>
  );
}

export default HookList;
