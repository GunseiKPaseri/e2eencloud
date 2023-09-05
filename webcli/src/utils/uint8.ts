import { toByteArray, fromByteArray } from 'base64-js';

const textencoder = new TextEncoder();
const textdecoder = new TextDecoder();
export const string2ByteArray = (str: string) => textencoder.encode(str);
export const byteArray2string = (x: Uint8Array) => textdecoder.decode(x);
export const byteArray2base64 = (x: Uint8Array) => fromByteArray(x);
export const base642ByteArray = (base64: string) => toByteArray(base64);
export const base64uri2ByteArray = (base64uri: string) =>
  toByteArray(
    base64uri
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(base64uri.length / 4) * 4, '='),
  );
export const byteArray2base64uri = (x: Uint8Array) =>
  fromByteArray(x).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

export const hex2bytearray = (hex: string) => {
  const array = hex.match(/.{2}/g)?.map((x) => parseInt(x, 16));
  if (!array) throw new Error('bad hex');
  return new Uint8Array(array);
};

export const byteArray2hex = (x: Uint8Array) =>
  Array.from(new Uint8Array(x))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

export const UUID2ByteArray = (uuid: string) =>
  hex2bytearray(uuid.replace(/-/g, ''));

export const blob2DataURL = (x: Blob) =>
  new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(x);
    reader.addEventListener('load', () => {
      resolve(reader.result as string);
    });
  });
