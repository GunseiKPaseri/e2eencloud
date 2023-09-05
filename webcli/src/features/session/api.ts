import type { AxiosResponse } from 'axios';
import { axiosWithSession } from '~/lib/axios';

export interface SessionInfo {
  id: string;
  clientName: string;
  accessed: string;
  isMe: boolean;
}

export const getSessions = async () => {
  const result = await axiosWithSession.get<
    Record<string, never>,
    AxiosResponse<SessionInfo[]>
  >('/api/my/sessions');
  return result.data;
};

export const deleteSessions = async ({ id }: { id: string }) => {
  await axiosWithSession.delete<{ clientName: string }>(
    `/api/my/sessions/${id}`,
  );
};

export const changeClientName = async ({
  newClientName,
}: {
  newClientName: string;
}) => {
  const result = await axiosWithSession.patch<{ clientName: string }>(
    '/api/my/sessions',
    {
      clientName: newClientName,
    },
  );
  return result.data;
};
