import type { AxiosProgressEvent, AxiosResponse } from 'axios';
import { axiosWithSession } from '~/lib/axios';
import type { GetfileinfoJSONRow } from './file.type';
import socket from '~/class/socketio';

export const getAllFileInfoRaw = async ({
  onDownloadProgress,
}: { onDownloadProgress?: (progressEvent: AxiosProgressEvent) => void }) => {
  const rawfiles = await axiosWithSession.get<
  Record<string, never>, AxiosResponse<GetfileinfoJSONRow[]>>(
    '/api/my/files',
    {
      onDownloadProgress,
    },
  );
  return rawfiles.data;
};

export const deleteFile = async ({
  deleteItems,
  onDownloadProgress,
}: {
  deleteItems: string[],
  onDownloadProgress?:(progressEvent: AxiosProgressEvent) => void
}) => {
  const rawfiles = await axiosWithSession.post<
  { files: string[] },
  AxiosResponse<{ deleted: string[] }>
  >(
    '/api/files/delete',
    { files: deleteItems },
    {
      onDownloadProgress,
    },
  );
  return rawfiles.data;
};

export const addFile = async (props: {
  id: string,
  encryptedFileInfoBase64: string,
  encryptedFileInfoIVBase64: string,
  encryptedFileKeyBase64: string,
} | {
  id: string,
  encryptedFileInfoBase64: string,
  encryptedFileInfoIVBase64: string,
  encryptedFileKeyBase64: string,
  encryptedFileBlob: Blob,
  encryptedFileIVBase64: string,
}) => {
  const fileSendData = new FormData();
  fileSendData.append('socketid', socket.id);
  fileSendData.append('id', props.id);
  fileSendData.append('encryptedFileInfoBase64', props.encryptedFileInfoBase64);
  fileSendData.append('encryptedFileInfoIVBase64', props.encryptedFileInfoIVBase64);
  fileSendData.append('encryptedFileKeyBase64', props.encryptedFileKeyBase64);
  if ('encryptedFileBlob' in props) {
    fileSendData.append('encryptedFile', props.encryptedFileBlob);
    fileSendData.append('encryptedFileIVBase64', props.encryptedFileIVBase64);
  }
  await axiosWithSession.post('/api/files', fileSendData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * 対象ファイルの生データを取得
 */
export const getEncryptedFileRaw = async (fileId: string) => {
  const encryptedFileRowDL = await axiosWithSession.get<Record<string, never>, AxiosResponse<ArrayBuffer>>(`/api/files/${fileId}/bin`, { responseType: 'arraybuffer' });
  return encryptedFileRowDL.data;
};
