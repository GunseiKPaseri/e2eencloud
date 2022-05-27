import type { AxiosResponse } from 'axios';
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

export const getHookList = async (offset: number, limit: number) => {
  const result = await axiosWithSession.get<
  Record<string, never>,
  AxiosResponse<GetHookListJSONRow>,
  { offset: number, limit: number }>(`${appLocation}/api/hooks`, { params: { offset, limit } });
  return result.data;
};

export const addHock = async (name: string, hook: HookData, expired_at: Date | null) => {
  await axiosWithSession.post(`${appLocation}/api/hooks`, { name, data: hook, expired_at });
};

export const deleteHook = async (id: string) => {
  await axiosWithSession.delete(`${appLocation}/api/hook/${id}`);
};
