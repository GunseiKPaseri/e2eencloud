import { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import type {
  GridFilterModel,
  GridRowModel,
  GridSortItem,
} from '@mui/x-data-grid';
import { GridToolbarContainer } from '@mui/x-data-grid';
import type { AxiosResponse } from 'axios';
import { axiosWithSession } from '~/lib/axios';
import EditableDataGrid, {
  type ComputeMutation,
} from '~/components/molecule/EditableDataGrid';
import FIDO2Register from './FIDO2Register';
import TOTPAdder from './TOTPAdder';

type GetMFAListJSONRow = {
  number_of_mfa: number;
  mfa: {
    id: string;
    name: string;
    type: 'EMAIL' | 'FIDO2' | 'TOTP' | 'CODE';
    available: boolean;
  }[];
};

export type MFADataGridRowModel = GridRowModel<{
  id: string;
  type: string;
  name: string;
  available: boolean;
}>;

const getMFAList = async (props: {
  offset: number;
  limit: number;
  sortQuery: GridSortItem[];
  filterQuery: GridFilterModel;
}) => {
  const result = await axiosWithSession.get<
    Record<string, never>,
    AxiosResponse<GetMFAListJSONRow>,
    {
      offset: number;
      limit: number;
      orderby?: string;
      order?: GridSortItem['sort'];
    }
  >('/api/my/mfa', {
    params: {
      offset: props.offset,
      limit: props.limit,
      orderby: props.sortQuery[0]?.field,
      order: props.sortQuery[0]?.sort,
      q: JSON.stringify(props.filterQuery),
    },
  });
  return {
    total_number: result.data.number_of_mfa,
    items: result.data.mfa,
  };
};

const editMFA = async (
  targetMFA: MFADataGridRowModel,
  edited: Partial<MFADataGridRowModel>,
) => {
  await axiosWithSession.patch(`/api/my/mfa/${targetMFA.id}`, {
    available: edited.available,
    name: edited.name,
  });
  return {
    ...targetMFA,
    available: edited.available ?? false,
  };
};

const deleteMFA = async (id: string) => {
  const result = await axiosWithSession.delete<
    Record<string, never>,
    AxiosResponse<GetMFAListJSONRow>,
    {
      offset: number;
      limit: number;
      orderby?: string;
      order?: GridSortItem['sort'];
    }
  >(`/api/my/mfa/${id}`);
  return result;
};

const computeMutation: ComputeMutation<MFADataGridRowModel> = ({
  newRow,
  oldRow,
  t,
}) => {
  let str = '';
  if (newRow.available !== oldRow.available) {
    str += `${t('auth.multifactorauth', '多要素認証')}：${
      newRow.available ? t('admin.on', 'オン') : t('admin.off', 'オフ')
    }`;
  }
  if (newRow.name !== oldRow.name) {
    str += `${str === '' ? '' : '\n'}名前：${newRow.name}`;
  }
  if (str === '') return null;

  return str;
};

function MFAList() {
  const [openAdditionDialog, setOpenAdditionDialog] = useState<boolean>(false);
  const [pageReloader, setPageReloader] = useState<symbol>(Symbol('pageload'));

  const renderCustomToolbar = () => (
    <GridToolbarContainer>
      <Button
        startIcon={<AddIcon />}
        color='primary'
        onClick={() => {
          setOpenAdditionDialog(true);
        }}
      >
        追加
      </Button>
    </GridToolbarContainer>
  );

  return (
    <>
      <Dialog
        maxWidth='xs'
        open={openAdditionDialog}
        onClose={() => {
          setOpenAdditionDialog(false);
        }}
      >
        <DialogTitle>MFAの追加</DialogTitle>
        <DialogContent dividers>
          <TOTPAdder
            onSuccess={() => {
              setPageReloader(Symbol('reload'));
              setOpenAdditionDialog(false);
            }}
          />
          <FIDO2Register
            onSuccess={() => {
              setPageReloader(Symbol('reload'));
              setOpenAdditionDialog(false);
            }}
          />
        </DialogContent>
      </Dialog>
      <EditableDataGrid<MFADataGridRowModel>
        computeMutation={computeMutation}
        getName={(params) => `${params.row.name}`}
        columns={[
          { field: 'id', minWidth: 200 },
          {
            field: 'type',
            type: 'singleSelect',
            valueOptions: ['TOTP', 'FIDO2', 'CODE'],
          },
          { field: 'name', minWidth: 300, editable: true },
          {
            field: 'available',
            headerName: '有効',
            type: 'boolean',
            editable: true,
          },
        ]}
        parentHeight={400}
        slots={{
          toolbar: renderCustomToolbar,
        }}
        getList={getMFAList}
        editItem={editMFA}
        reloader={pageReloader}
        onDelete={async (params) => {
          await deleteMFA(params.row.id);
        }}
      />
    </>
  );
}

export default MFAList;
