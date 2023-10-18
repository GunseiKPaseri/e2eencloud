import type { GridFilterModel, GridSortItem } from '@mui/x-data-grid/models';
import type { AxiosResponse } from 'axios';
import { axiosWithSession } from '~/lib/axios';
import { ExhaustiveError } from '~/utils/assert';
import type { HookDataGridRowModel } from './HookList';

export type HookData =
  | {
      method: 'USER_DELETE';
    }
  | {
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
  }[];
};

export const explainHook = (hook: HookData) => {
  switch (hook.method) {
    case 'USER_DELETE': {
      return 'ユーザ消去';
    }
    case 'NONE': {
      return '無効';
    }
    default: {
      throw new ExhaustiveError(hook);
    }
  }
};

export const getHookList = async (params: {
  offset: number;
  limit: number;
  sortQuery: GridSortItem[];
  filterQuery: GridFilterModel;
}) => {
  const result = await axiosWithSession.get<
    Record<string, never>,
    AxiosResponse<GetHookListJSONRow>,
    {
      offset: number;
      limit: number;
      orderby?: string;
      order?: GridSortItem['sort'];
    }
  >('/api/hooks', {
    params: {
      limit: params.limit,
      offset: params.offset,
      order: params.sortQuery[0]?.sort,
      orderby: params.sortQuery[0]?.field,
      q: JSON.stringify(params.filterQuery),
    },
  });
  return {
    items: result.data.hooks.map((x) => ({
      ...x,
      created_at: new Date(x.created_at),
      data: explainHook(x.data),
      expired_at: x.expired_at === null ? null : new Date(x.expired_at),
    })),
    total_number: result.data.number_of_hook,
  };
};

export const addHock = async (
  name: string,
  hook: HookData,
  expired_at: Date | null,
) => {
  await axiosWithSession.post('/api/hooks', { data: hook, expired_at, name });
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
    expired_at:
      edited.expired_at === undefined
        ? targetHook.expired_at
        : edited.expired_at,
    name: edited.name === undefined ? targetHook.name : edited.name,
  };
};
