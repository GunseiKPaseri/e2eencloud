import type {
  GridValueFormatterParams,
  GridRowModel,
} from '@mui/x-data-grid';
import TextField from '@mui/material/TextField';
import { DateTimePicker } from '@mui/x-date-pickers';
import Button from '@mui/material/Button';
import { useState } from 'react';
import addMonths from 'date-fns/addMonths';
import type { ComputeMutation } from '../assets/EditableDataGrid';

import { enqueueSnackbar } from '../../features/snackbar/snackbarSlice';
import { useAppDispatch } from '../../app/hooks';
import { appLocation } from '../../const';
import {
  addHock,
  deleteHook, editHook, getHookList,
} from './hookrequest';
import EditableDataGrid from '../assets/EditableDataGrid';

const PAGE_SIZE = 10;

export type HookDataGridRowModel = GridRowModel<{
  id: string;
  name: string;
  data: string;
  created_at: Date;
  expired_at: Date | null;
}>;

const computeMutation: ComputeMutation<HookDataGridRowModel> = ({ newRow, oldRow }) => {
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
  const dispatch = useAppDispatch();
  const [name, setName] = useState('');
  const [expiredAt, setExpiredAt] = useState<Date | null>(addMonths(new Date(Date.now()), 6));
  const [pageReloader, setPageReloader] = useState<symbol>(Symbol('pageload'));
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
      <EditableDataGrid <HookDataGridRowModel>
        computeMutation={computeMutation}
        getName={(params) => (params.row.name === '' ? '<無名のHook>' : params.row.name)}
        columns={[
          {
            field: 'id',
            headerName: 'url',
            width: 600,
            valueFormatter: (params: GridValueFormatterParams<string>) => (
              `${appLocation}/api/hook/${params.value}`
            ),
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
        ]}
        parentHeight={400}
        pageSize={PAGE_SIZE}
        rowsPerPageOptions={[PAGE_SIZE]}
        getList={getHookList}
        editItem={editHook}
        onDelete={async (params) => {
          await deleteHook(params.row.id);
          dispatch(enqueueSnackbar({ message: '削除しました', options: { variant: 'success' } }));
        }}
        onEditSuccess={() => {
          dispatch(enqueueSnackbar({ message: '正常に変更を反映しました', options: { variant: 'success' } }));
        }}
        onEditFailure={() => {
          dispatch(enqueueSnackbar({ message: '反映に失敗しました', options: { variant: 'error' } }));
        }}
        reloader={pageReloader}
      />
    </>
  );
}

export default HookList;
