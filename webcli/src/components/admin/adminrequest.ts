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

export const getUserList = async (offset: number, limit: number) => {
  const result = await axiosWithSession.get<
  Record<string, never>,
  AxiosResponse<GetUserListJSONRow>,
  { offset: number, limit: number }>(`${appLocation}/api/users`, { params: { offset, limit } });
  return result.data;
};

export const deleteUser = async (id: number) => {
  await axiosWithSession.delete(`${appLocation}/api/user/${id}`);
};
