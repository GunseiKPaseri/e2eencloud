import type {
  GridFilterModel,
  GridRowModel, GridSortItem,
} from '@mui/x-data-grid';
import type { AxiosResponse } from 'axios';
import { appLocation, axiosWithSession } from '../../componentutils';
import EditableDataGrid, { type ComputeMutation } from '../../../components/assets/EditableDataGrid';

type GetMFAListJSONRow = {
  number_of_mfa: number;
  mfa: {
    id: string;
    type: 'EMAIL' | 'FIDO2' | 'TOTP'
    available: boolean;
  }[]
};

const PAGE_SIZE = 10;

export type MFADataGridRowModel = GridRowModel<{
  id: string;
  type: string;
  available: boolean;
}>;

const getMFAList = async (props: {
  offset: number,
  limit: number,
  sortQuery: GridSortItem[],
  filterQuery: GridFilterModel,
}) => {
  const result = await axiosWithSession.get<
  Record<string, never>,
  AxiosResponse<GetMFAListJSONRow>,
  { offset: number, limit: number, orderby?: string, order?: GridSortItem['sort'] }>(
    `${appLocation}/api/my/mfa`,
    {
      params: {
        offset: props.offset,
        limit: props.limit,
        orderby: props.sortQuery[0]?.field,
        order: props.sortQuery[0]?.sort,
        q: JSON.stringify(props.filterQuery),
      },
    },
  );
  return {
    total_number: result.data.number_of_mfa,
    items: result.data.mfa,
  };
};

const editMFA = async (
  targetMFA: MFADataGridRowModel,
  edited: Partial<MFADataGridRowModel>,
) => {
  await axiosWithSession.patch(`${appLocation}/api/my/mfa/${targetMFA.id}`, { available: edited.available });
  return {
    ...targetMFA,
    available: edited.available ?? false,
  };
};

const deleteMFA = async (id: string) => {
  const result = await axiosWithSession.get<
  Record<string, never>,
  AxiosResponse<GetMFAListJSONRow>,
  { offset: number, limit: number, orderby?: string, order?: GridSortItem['sort'] }>(
    `${appLocation}/api/my/mfa/${id}`,
    {
      method: 'delete',
    },
  );
  return result;
};

const computeMutation: ComputeMutation<MFADataGridRowModel> = ({ newRow, oldRow, t }) => {
  if (newRow.available !== oldRow.available) {
    return `${t('auth.multifactorauth', '多要素認証')}：${newRow.available ? t('admin.on', 'オン') : t('admin.off', 'オフ')}`;
  }
  return null;
};

function MFAList() {
  return (
    <EditableDataGrid <MFADataGridRowModel>
      computeMutation={computeMutation}
      getName={(params) => `${params.row.id}`}
      columns={[
        { field: 'id', minWidth: 300 },
        { field: 'type', type: 'singleSelect', valueOptions: ['TOTP', 'FIDO2'] },
        {
          field: 'available',
          headerName: '利用状況',
          type: 'boolean',
          editable: true,
        },
      ]}
      parentHeight={400}
      pageSize={PAGE_SIZE}
      rowsPerPageOptions={[PAGE_SIZE]}
      getList={getMFAList}
      editItem={editMFA}
      onDelete={async (params) => {
        await deleteMFA(params.row.id);
      }}
    />
  );
}

export default MFAList;
