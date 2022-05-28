import type { AxiosResponse } from 'axios';
import type { GridFilterModel, GridSortItem } from '@mui/x-data-grid/models';
import { ExhaustiveError } from '../../utils/assert';
import { appLocation, axiosWithSession } from '../../features/componentutils';

export type HookData = {
  method: 'USER_DELETE';
} | {
  method: 'NONE';
};

type GetHookListJSONRow = {
  number_of_hook: number;
  hooks: {
    id: number;
    created_at: string;
    name: string;
    data: HookData;
    expired_at: string;
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

export const getHookList = async (
  offset: number,
  limit: number,
  sortQuery: GridSortItem[],
  filterQuery: GridFilterModel,
) => {
  const result = await axiosWithSession.get<
  Record<string, never>,
  AxiosResponse<GetHookListJSONRow>,
  { offset: number, limit: number, orderby?: string, order?: GridSortItem['sort'] }>(`${appLocation}/api/hooks`, {
    params: {
      offset,
      limit,
      orderby: sortQuery[0]?.field,
      order: sortQuery[0]?.sort,
      q: JSON.stringify(filterQuery),
    },
  });
  return result.data;
};

export const addHock = async (name: string, hook: HookData, expired_at: Date | null) => {
  await axiosWithSession.post(`${appLocation}/api/hooks`, { name, data: hook, expired_at });
};

export const deleteHook = async (id: string) => {
  await axiosWithSession.delete(`${appLocation}/api/hook/${id}`);
};

export const editHook = async (
  targetHook: { id: number; name: string; expired_at: Date },
  edited: { name?: string; expired_at?: Date },
) => {
  await axiosWithSession.patch(`${appLocation}/api/hook/${targetHook.id}`, edited);
  return {
    name: typeof edited.name === 'undefined' ? targetHook.name : edited.name,
    expired_at: typeof edited.expired_at === 'undefined' ? targetHook.expired_at : edited.expired_at,
  };
};
