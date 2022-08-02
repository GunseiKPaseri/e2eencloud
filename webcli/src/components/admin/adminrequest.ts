import type { GridFilterModel, GridSortItem } from '@mui/x-data-grid';
import { type AxiosResponse } from 'axios';
import { appLocation, axiosWithSession } from '../../features/componentutils';
import type { UserDataGridRowModel } from './UserList';

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

export const getUserList = async (props: {
  offset: number,
  limit: number,
  sortQuery: GridSortItem[],
  filterQuery: GridFilterModel,
}) => {
  const result = await axiosWithSession.get<
  Record<string, never>,
  AxiosResponse<GetUserListJSONRow>,
  { offset: number, limit: number, orderby?: string, order?: GridSortItem['sort'] }>(
    `${appLocation}/api/users`,
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
    total_number: result.data.number_of_user,
    items: result.data.users.map((x) => ({
      ...x,
      authority: x.authority ?? null,
    })),
  };
};

export const deleteUser = async (id: number) => {
  await axiosWithSession.delete(`${appLocation}/api/user/${id}`);
};

export const editUser = async (
  targetUser: UserDataGridRowModel,
  edited: Partial<UserDataGridRowModel>,
) => {
  await axiosWithSession.patch(`${appLocation}/api/user/${targetUser.id}`, edited);
  return {
    ...targetUser,
    max_capacity: typeof edited.max_capacity === 'undefined' ? targetUser.max_capacity : edited.max_capacity,
  };
};

export const issuanceCoupon = async (num: number) => {
  const result = await axiosWithSession.post<
  Record<string, never>,
  AxiosResponse<{ coupons_id: string[] }>>(`${appLocation}/api/coupons`, {
    coupon: {
      method: 'ADD_CAPACITY',
      value: 5 * 1024 * 1024 * 1024,
    },
    number: num,
  });
  return result.data.coupons_id;
};
