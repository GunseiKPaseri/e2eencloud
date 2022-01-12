import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import { decryptByRSA, encryptByRSA } from '../../encrypt';
import { getAESGCMKey, AESGCM, string2ByteArray, byteArray2base64, base642ByteArray, decryptAESGCM, byteArray2string } from '../../util';
import { v4 as uuidv4 } from 'uuid';
import { axiosWithSession, appLocation } from '../apirequest';
import FormData from 'form-data';
import { AxiosResponse } from 'axios';

export interface FileState {
  loading: 0|1,
}

const initialState: FileState = {
  loading: 0,
};

interface FileInfo {
  id: string,
  name: string,
  sha256: string,
};

const readfile = (x: File) => new Promise<ArrayBuffer>((resolve, reject)=>{
  const fileReader = new FileReader();
  fileReader.readAsArrayBuffer(x);
  fileReader.onload = (e)=>{
    if(typeof fileReader.result === 'string' || fileReader.result === null) return reject(new Error("bad file"));
    resolve(fileReader.result);
  };
});

const getFileHash = async (bin: BufferSource) => {
  const hash = await crypto.subtle.digest("SHA-256", bin)
  return {hashStr: Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join(""), bin: bin};
}

const addFileWithEncryption = async (x: File) => {
  // gen unique name
  const uuid = uuidv4().replace(/-/g,'_');
  const fileKeyRaw = crypto.getRandomValues(new Uint8Array(32));
  // readfile,getHash | getKey
  const [{bin, hashStr}, fileKey] = await Promise.all([readfile(x).then((bin) => getFileHash(bin)), getAESGCMKey(fileKeyRaw)]);

  const fileinfo:FileInfo = {
    id: uuid,
    name: x.name,
    sha256: hashStr,
  };

  // encrypt
  const [
    encryptedFile,
    encryptedFileInfo,
    encryptedFileKey,
  ] = await Promise.all([
    AESGCM(bin, fileKey),
    AESGCM(string2ByteArray(JSON.stringify(fileinfo)), fileKey),
    encryptByRSA(fileKeyRaw)
  ]);
  const encryptedFileBlob = new Blob([encryptedFile.encrypt], {type: "application/octet-binary"});

  const encryptedFileIVBase64 = byteArray2base64(encryptedFile.iv);
console.log(encryptedFile, encryptedFile.iv, fileKey)

  const encryptedFileInfoBase64 = byteArray2base64(new Uint8Array(encryptedFileInfo.encrypt));
  const encryptedFileInfoIVBase64 = byteArray2base64(encryptedFileInfo.iv);

  const encryptedFileKeyBase64 = byteArray2base64(new Uint8Array(encryptedFileKey));

  // send encryptedfile, send encryptedfileinfo, encryptedfilekey iv,iv
  const fileSendData = new FormData();
  fileSendData.append("id", uuid);
  fileSendData.append("encryptedFile", encryptedFileBlob);
  fileSendData.append("encryptedFileIVBase64", encryptedFileIVBase64);
  fileSendData.append("encryptedFileInfoBase64", encryptedFileInfoBase64);
  fileSendData.append("encryptedFileInfoIVBase64", encryptedFileInfoIVBase64);
  fileSendData.append("encryptedFileKeyBase64", encryptedFileKeyBase64);
  await axiosWithSession.post(`${appLocation}/api/files`, fileSendData);

  // memory file to indexedDB

  return {uuid, sha256: hashStr};
};

export const fileuploadAsync = createAsyncThunk<{success: boolean}, {files: File[]}>(
  'file/fileupload',
  async (fileinput) => {
    const loadedfile = await Promise.all(
      fileinput.files.map((x) => addFileWithEncryption(x)));
    console.log(loadedfile);

    return {success: true};
  },
);

interface getfileinfoJSON {
  id: string,
  encrypted_file_iv: string,
  encrypted_file_key: string,
  encrypted_file_info: string,
  encrypted_file_info_iv: string,
  size: string;
}

const getFileInfo = async (fileId: string) => {
  const fileinforaw = await axiosWithSession.get<{},  AxiosResponse<getfileinfoJSON>>(`${appLocation}/api/files/${fileId}`);

  const encryptedFileIV = base642ByteArray(fileinforaw.data.encrypted_file_iv);
  const encryptedFileKey = base642ByteArray(fileinforaw.data.encrypted_file_key);
  const encryptedFileInfo = base642ByteArray(fileinforaw.data.encrypted_file_info);
  const encryptedFileInfoIV = base642ByteArray(fileinforaw.data.encrypted_file_info_iv);

  const fileKeyRaw = new Uint8Array(await decryptByRSA(encryptedFileKey));

  const fileKey = await getAESGCMKey(fileKeyRaw);
  const fileInfo:FileInfo = JSON.parse(byteArray2string(await decryptAESGCM(encryptedFileInfo, fileKey, encryptedFileInfoIV)));
  return {encryptedFileIV, fileKey, fileInfo}
};

const getEncryptedFileRaw = async (fileId: string) => {
  const encryptedFileRowDL = await axiosWithSession.get<{}, AxiosResponse<ArrayBuffer>>(`${appLocation}/bin/${fileId}`, { responseType: 'arraybuffer'});
  return encryptedFileRowDL.data;
};

export const filedownloadAsync = createAsyncThunk<{success: boolean}, {fileId: string}>(
  'file/filedownload',
  async (fileinput) => {

    const [{encryptedFileIV, fileKey, fileInfo}, encryptedFile] =
      await Promise.all([getFileInfo(fileinput.fileId), getEncryptedFileRaw(fileinput.fileId)]);
    

    const file = await decryptAESGCM(encryptedFile, fileKey, encryptedFileIV);
    
    const {hashStr} = await getFileHash(file);

    if(hashStr !== fileInfo.sha256) throw new Error("hashが異なります");

    console.log(fileInfo, file);

    return {success: true};
  },
);

export const fileSlice = createSlice({
    name: "file",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(fileuploadAsync.pending, (state) => {
        })
        .addCase(fileuploadAsync.rejected, (state) => {
        })
        .addCase(fileuploadAsync.fulfilled, (state, action) => {
        })
        
  }
});

export default fileSlice.reducer;


