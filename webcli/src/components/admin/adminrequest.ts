import type { GridFilterModel, GridSortItem } from '@mui/x-data-grid';
import { type AxiosResponse } from 'axios';
import { appLocation, axiosWithSession } from '../../features/componentutils';

type GetUserListJSONRow = {
  number_of_user: number;
  users: {
    id: number;
    email: string;
    max_capacity: number;
    file_usage: number;
    authority?: string;
    two_factor_authentication: boolean;
  }[]
};

export const getUserList = async (
  offset: number,
  limit: number,
  sortQuery: GridSortItem[],
  filterQuery: GridFilterModel,
) => {
  const result = await axiosWithSession.get<
  Record<string, never>,
  AxiosResponse<GetUserListJSONRow>,
  { offset: number, limit: number, orderby?: string, order?: GridSortItem['sort'] }>(
    `${appLocation}/api/users`,
    {
      params: {
        offset,
        limit,
        orderby: sortQuery[0]?.field,
        order: sortQuery[0]?.sort,
        q: JSON.stringify(filterQuery),
      },
    },
  );
  return result.data;
};

export const deleteUser = async (id: number) => {
  await axiosWithSession.delete(`${appLocation}/api/user/${id}`);
};

export const editUser = async (
  targetUser: { id: number; max_capacity: number },
  edited: { max_capacity?: number },
) => {
  await axiosWithSession.patch(`${appLocation}/api/user/${targetUser.id}`, edited);
  return {
    max_capacity: typeof edited.max_capacity === 'undefined' ? targetUser.max_capacity : edited.max_capacity,
  };
};
