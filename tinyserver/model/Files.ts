import client from '../dbclient.ts';
import { v4 } from "https://deno.land/std@0.120.0/uuid/mod.ts";

const validateFileId = (x: string ) =>
    x.indexOf("-") === -1 && v4.validate(x.replace(/_/g, '-'));

export class File{
  readonly id: string;
  readonly encrypted_file_iv: string;
  readonly encrypted_file_key: string;
  readonly encrypted_file_info: string;
  readonly encrypted_file_info_iv: string;
  readonly size: number;
  constructor(file: {
      id: string,
      encrypted_file_iv: string,
      encrypted_file_key: string,
      encrypted_file_info: string,
      encrypted_file_info_iv: string,
      size: number;
    }) {
    this.id = file.id;
    this.encrypted_file_iv = file.encrypted_file_iv;
    this.encrypted_file_info = file.encrypted_file_info;
    this.encrypted_file_info_iv = file.encrypted_file_info_iv;
    this.encrypted_file_key = file.encrypted_file_key;
    this.size = file.size;
  }

  async saveFile(file : Uint8Array){
    await Deno.writeFile(`${Deno.cwd()}/../webcli/dist/bin/${this.id}`, file, {append: true});
  }
}

export const addFile = async (params: {
  id: string,
  encrypted_file_iv: string,
  encrypted_file_key: string,
  encrypted_file_info: string,
  encrypted_file_info_iv: string,
  bin: Uint8Array,
}) => {
  if(!validateFileId(params.id)) return null;
  try {
    await client.execute(`INSERT INTO files(
      id,
      encrypted_file_iv,
      encrypted_file_key,
      encrypted_file_info,
      encrypted_file_info_iv,
      size) values(?, ?, ?, ?, ?, ?)`, [
        params.id,
        params.encrypted_file_iv,
        params.encrypted_file_key,
        params.encrypted_file_info,
        params.encrypted_file_info_iv,
        params.bin.length]);
    const newfile = new File({...params, size: params.bin.length});
    await newfile.saveFile(params.bin);
    return newfile;
  } catch (e){
    console.log(e);
    return null;
  }
};

export const getFileById = async (id: string) => {
  const files = await client.query(`SELECT * FROM files WHERE id = ?`, [id]);
  if(files.length !== 1) return null;
  return new File(files[0]);
}

export const getFileBinById = async (id: string) => {
  if(!validateFileId(id)) return null;
  return await Deno.readFile(`${Deno.cwd()}/../webcli/dist/bin/${id}`);
}