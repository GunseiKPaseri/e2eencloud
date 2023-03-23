import type { AxiosResponse } from 'axios';
import type { GridFilterModel, GridSortItem } from '@mui/x-data-grid/models';
import { ExhaustiveError } from '../../../utils/assert';
import { axiosWithSession } from '../../../lib/axios';
import type { HookDataGridRowModel } from './HookList';

export type HookData = {
  method: 'USER_DELETE';
} | {
  method: 'NONE';
};

type GetHookListJSONRow = {
  number_of_hook: number;
  hooks: {
    id: string;
    created_at: string;
    name: string;
    data: HookData;
    expired_at: string | null;
  }[]
};

export const explainHook = (hook: HookData) => {
  switch (hook.method) {
    case 'USER_DELETE': {
      return 'ユーザ消去';
    }
    case 'NONE': {
      return '無効';
    }
    default:
      throw new ExhaustiveError(hook);
  }
};

export const getHookList = async (params: {
  offset: number,
  limit: number,
  sortQuery: GridSortItem[],
  filterQuery: GridFilterModel,
}) => {
  const result = await axiosWithSession.get<
  Record<string, never>,
  AxiosResponse<GetHookListJSONRow>,
  { offset: number, limit: number, orderby?: string, order?: GridSortItem['sort'] }>('/api/hooks', {
    params: {
      offset: params.offset,
      limit: params.limit,
      orderby: params.sortQuery[0]?.field,
      order: params.sortQuery[0]?.sort,
      q: JSON.stringify(params.filterQuery),
    },
  });
  return {
    total_number: result.data.number_of_hook,
    items: result.data.hooks.map((x) => ({
      ...x,
      data: explainHook(x.data),
      created_at: new Date(x.created_at),
      expired_at: x.expired_at === null ? null : new Date(x.expired_at),
    })),
  };
};

export const addHock = async (name: string, hook: HookData, expired_at: Date | null) => {
  await axiosWithSession.post('/api/hooks', { name, data: hook, expired_at });
};

export const deleteHook = async (id: string) => {
  await axiosWithSession.delete(`/api/hook/${id}`);
};

export const editHook = async (
  targetHook: HookDataGridRowModel,
  edited: Partial<HookDataGridRowModel>,
) => {
  await axiosWithSession.patch(`/api/hook/${targetHook.id}`, edited);
  return {
    ...targetHook,
    name: typeof edited.name === 'undefined' ? targetHook.name : edited.name,
    expired_at: typeof edited.expired_at === 'undefined' ? targetHook.expired_at : edited.expired_at,
  };
};
