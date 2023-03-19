import type {
  GridFilterModel,
  GridRowModel, GridSortItem,
} from '@mui/x-data-grid';
import type { AxiosResponse } from 'axios';
import { appLocation, axiosWithSession } from '../../componentutils';
import EditableDataGrid, { type ComputeMutation } from '../../../components/assets/EditableDataGrid';

type GetTFAListJSONRow = {
  number_of_tfa: number;
  tfa: {
    id: string;
    type: 'EMAIL' | 'FIDO2' | 'TOTP'
    available: boolean;
  }[]
};

const PAGE_SIZE = 10;

export type TFADataGridRowModel = GridRowModel<{
  id: string;
  type: string;
  available: boolean;
}>;

const getTFAList = async (props: {
  offset: number,
  limit: number,
  sortQuery: GridSortItem[],
  filterQuery: GridFilterModel,
}) => {
  const result = await axiosWithSession.get<
  Record<string, never>,
  AxiosResponse<GetTFAListJSONRow>,
  { offset: number, limit: number, orderby?: string, order?: GridSortItem['sort'] }>(
    `${appLocation}/api/my/tfa`,
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
    total_number: result.data.number_of_tfa,
    items: result.data.tfa,
  };
};

const editTFA = async (
  targetTFA: TFADataGridRowModel,
  edited: Partial<TFADataGridRowModel>,
) => {
  await axiosWithSession.patch(`${appLocation}/api/my/tfa/${targetTFA.id}`, { available: edited.available });
  return {
    ...targetTFA,
    available: edited.available ?? false,
  };
};

const deleteTFA = async (id: string) => {
  const result = await axiosWithSession.get<
  Record<string, never>,
  AxiosResponse<GetTFAListJSONRow>,
  { offset: number, limit: number, orderby?: string, order?: GridSortItem['sort'] }>(
    `${appLocation}/api/my/tfa/${id}`,
    {
      method: 'delete',
    },
  );
  return result;
};

const computeMutation: ComputeMutation<TFADataGridRowModel> = ({ newRow, oldRow, t }) => {
  if (newRow.available !== oldRow.available) {
    return `${t('auth.twofactorauth', '二要素認証')}：${newRow.available ? t('admin.on', 'オン') : t('admin.off', 'オフ')}`;
  }
  return null;
};

function TFAList() {
  return (
    <EditableDataGrid <TFADataGridRowModel>
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
      getList={getTFAList}
      editItem={editTFA}
      onDelete={async (params) => {
        await deleteTFA(params.row.id);
      }}
    />
  );
}

export default TFAList;
