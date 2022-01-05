import { createHash as createSHA256Hash } from 'sha256-uint8array';
import aesjs from 'aes-js';
import argon2 from 'argon2-wasm-esm';

const textencoder = new TextEncoder();
const textdecoder = new TextDecoder();
export const string2ByteArray = (str: string) => textencoder.encode(str);
export const byteArray2base64 = (x: Uint8Array) => btoa(String.fromCharCode(...x));

export const AESECB = (message: Uint8Array , key: Uint8Array) => {
  const aesEcb = new aesjs.ModeOfOperation.ecb(key);
  return aesEcb.encrypt(message);
};

const iteration = 100;

export const argon2encrypt = (password: string, salt: Uint8Array) =>{
  console.log(password, salt);
  return argon2.hash({
  pass: password,
  salt,
  hashLen: 32,
  time: iteration,
}).then((res)=>{
  console.log(res);
  return res.hash;
}).catch((e)=>{
  console.log(e);
  return new Uint8Array([0]);
});
}

export const SHA256 = (array: Uint8Array) => createSHA256Hash().update(array).digest();

/**
 * Salt = SHA-256( “e2ee” || “Padding” || Client Random Value )
 */
const defaultString = "e2ee";
const saltStringMaxLength = 200;
// “e2ee” || “Padding”
const saltString = defaultString + "P".repeat(saltStringMaxLength - defaultString.length);
const saltArray = string2ByteArray(saltString);
export const createSalt = (ClientRandomValue: Uint8Array) => {
  // "e2ee” || “Padding” || Client Random Value
  const concatenatedSaltArray = new Uint8Array(saltStringMaxLength + ClientRandomValue.length);
  concatenatedSaltArray.set(saltArray);
  concatenatedSaltArray.set(ClientRandomValue, saltStringMaxLength);

  return SHA256(concatenatedSaltArray);
};