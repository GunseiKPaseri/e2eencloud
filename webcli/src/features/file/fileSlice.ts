import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import { encriptByRSA } from '../../encrypt';
import { getAESGCMKey, AESGCM, string2ByteArray, byteArray2base64 } from '../../util';
import { v4 as uuidv4 } from 'uuid';
import { axiosWithSession, appLocation } from '../apirequest';
import FormData from 'form-data';

export interface FileState {
  loading: 0|1,
}

const initialState: FileState = {
  loading: 0,
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

  const fileinfo = {
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
    encriptByRSA(fileKeyRaw)
  ]);
  const encryptedFileBlob = new Blob([encryptedFile.encrypt], {type: "application/octet-binary"});

  const encryptedFileIVBase64 = byteArray2base64(encryptedFile.iv);

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


