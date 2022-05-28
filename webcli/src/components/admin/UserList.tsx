import type {
  GridRowModel,
} from '@mui/x-data-grid';
import { deleteUser, editUser, getUserList } from './adminrequest';
import { useAppDispatch } from '../../app/hooks';
import { enqueueSnackbar } from '../../features/snackbar/snackbarSlice';
import EditableDataGrid from '../assets/EditableDataGrid';

const PAGE_SIZE = 10;

export type UserDataGridRowModel = GridRowModel<{
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

function UserList() {
  const dispatch = useAppDispatch();
  return (
    <EditableDataGrid <UserDataGridRowModel>
      computeMutation={computeMutation}
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
      ]}
      parentHeight={400}
      pageSize={PAGE_SIZE}
      rowsPerPageOptions={[PAGE_SIZE]}
      getList={getUserList}
      editItem={editUser}
      onDelete={(params) => {
        deleteUser(params.row.id);
      }}
      onEditSuccess={() => {
        dispatch(enqueueSnackbar({ message: '正常に変更を反映しました', options: { variant: 'success' } }));
      }}
      onEditFailure={() => {
        dispatch(enqueueSnackbar({ message: '反映に失敗しました', options: { variant: 'error' } }));
      }}
    />
  );
}

export default UserList;
