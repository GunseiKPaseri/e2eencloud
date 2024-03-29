import type {
  GridRowModel,
} from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';

import { useAppDispatch } from '~/lib/react-redux';
import { enqueueSnackbar } from '~/features/snackbar/snackbarSlice';
import EditableDataGrid from '~/components/molecule/EditableDataGrid';
import type { ComputeMutation } from '~/components/molecule/EditableDataGrid';
import { deleteUser, editUser, getUserList } from './adminrequest';

export type UserDataGridRowModel = GridRowModel<{
  id: number;
  email: string;
  multi_factor_authentication: boolean;
  max_capacity: number;
  file_usage: number;
  role: 'ADMIN' | 'USER';
}>;

const computeMutation: ComputeMutation<UserDataGridRowModel> = ({ newRow, oldRow, t }) => {
  if (newRow.max_capacity !== oldRow.max_capacity) {
    return `${t('admin.capacity', '容量')}：${oldRow.max_capacity}=>${newRow.max_capacity} (${(oldRow.max_capacity > newRow.max_capacity ? `-${oldRow.max_capacity - newRow.max_capacity}` : `+${newRow.max_capacity - oldRow.max_capacity}`)})`;
  } if (newRow.multi_factor_authentication !== oldRow.multi_factor_authentication) {
    return `${t('auth.multifactorauth', '多要素認証')}：${newRow.multi_factor_authentication ? t('admin.on', 'オン') : t('admin.off', 'オフ')}`;
  }
  return null;
};

function UserList() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  return (
    <EditableDataGrid <UserDataGridRowModel>
      computeMutation={computeMutation}
      getName={(params) => params.row.email}
      initialState={{
        columns: {
          columnVisibilityModel: {
            id: false,
          },
        },
      }}
      columns={[
        { field: 'id' },
        { field: 'email', headerName: t('auth.login', 'ログイン'), width: 200 },
        {
          field: 'multi_factor_authentication',
          headerName: t('auth.multifactorauth', '多要素認証'),
          type: 'boolean',
          editable: true,
          width: 100,
        },
        {
          field: 'max_capacity',
          headerName: t('admin.capacity', '容量'),
          type: 'number',
          editable: true,
          width: 120,
        },
        {
          field: 'file_usage',
          headerName: t('admin.usage', '使用量'),
          type: 'number',
          width: 120,
        },
        {
          field: 'role',
          headerName: t('admin.authority', '権限'),
          type: 'singleSelect',
          valueOptions: ['ADMIN', 'USER'],
          width: 120,
        },
      ]}
      parentHeight={400}
      getList={getUserList}
      editItem={editUser}
      onDelete={async (params) => {
        await deleteUser(params.row.id);
      }}
      onEditSuccess={() => {
        dispatch(enqueueSnackbar({ message: t('admin.ChangeSuccessful', '変更が正常に反映されました'), options: { variant: 'success' } }));
      }}
      onEditFailure={() => {
        dispatch(enqueueSnackbar({ message: t('admin.ChangeFailed', '反映に失敗しました'), options: { variant: 'error' } }));
      }}
    />
  );
}

export default UserList;
