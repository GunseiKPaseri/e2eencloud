import type { GridFilterModel, GridSortItem } from '@mui/x-data-grid';
import { type AxiosResponse } from 'axios';
import { axiosWithSession } from '~/lib/axios';
import type { UserDataGridRowModel } from './UserList';

type GetUserListJSONRow = {
  number_of_user: number;
  users: {
    id: number;
    email: string;
    max_capacity: string;
    file_usage: string;
    role: 'ADMIN' | 'USER';
    multi_factor_authentication: boolean;
  }[];
};

export const getUserList = async (props: {
  offset: number;
  limit: number;
  sortQuery: GridSortItem[];
  filterQuery: GridFilterModel;
}) => {
  const result = await axiosWithSession.get<
    Record<string, never>,
    AxiosResponse<GetUserListJSONRow>,
    {
      offset: number;
      limit: number;
      orderby?: string;
      order?: GridSortItem['sort'];
    }
  >('/api/users', {
    params: {
      limit: props.limit,
      offset: props.offset,
      order: props.sortQuery[0]?.sort,
      orderby: props.sortQuery[0]?.field,
      q: JSON.stringify(props.filterQuery),
    },
  });
  return {
    items: result.data.users.map((x) => ({
      ...x,
      file_usage: Number(x.file_usage),
      max_capacity: Number(x.max_capacity),
      role: x.role,
    })),
    total_number: result.data.number_of_user,
  };
};

export const deleteUser = async (id: number) => {
  await axiosWithSession.delete(`/api/user/${id}`);
};

export const editUser = async (
  targetUser: UserDataGridRowModel,
  edited: Partial<UserDataGridRowModel>,
) => {
  await axiosWithSession.patch(`/api/user/${targetUser.id}`, {
    ...edited,
    file_usage: edited.file_usage?.toString(),
    max_capacity: edited.max_capacity?.toString(),
  });
  return {
    ...targetUser,
    max_capacity:
      edited.max_capacity === undefined
        ? targetUser.max_capacity
        : edited.max_capacity,
  };
};

export const issuanceCoupon = async (num: number) => {
  const result = await axiosWithSession.post<
    Record<string, never>,
    AxiosResponse<{ coupons_id: string[] }>
  >('/api/coupons', {
    coupon: {
      method: 'ADD_CAPACITY',
      value: (5n * 1024n * 1024n * 1024n).toString(),
    },
    number: num,
  });
  return result.data.coupons_id;
};
