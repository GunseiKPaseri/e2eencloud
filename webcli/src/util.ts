import { createHash as createSHA256Hash } from 'sha256-uint8array';
import { toByteArray, fromByteArray } from 'base64-js';
import argon2 from 'argon2-wasm-esm';

const textencoder = new TextEncoder();
const textdecoder = new TextDecoder();
export const string2ByteArray = (str: string) => textencoder.encode(str);
export const byteArray2string = (x: Uint8Array) => textdecoder.decode(x);
export const byteArray2base64 = (x: Uint8Array) => fromByteArray(x);
export const base642ByteArray = (base64: string) => toByteArray(base64);

// AES-CTR
export const getAESCTRKey = (key: Uint8Array) =>
  crypto.subtle.importKey("raw", key, "AES-CTR", false, ["encrypt", "decrypt"]);

export const AESCTR = async (message: BufferSource , key: CryptoKey) => {
  const iv = window.crypto.getRandomValues(new Uint8Array(16));
  const aesctr:ArrayBuffer = await crypto.subtle.encrypt({name: "AES-CTR", counter: iv, length: 64}, key, message);
  return {encrypt: new Uint8Array(aesctr, 0) , iv};
};

export const decryptAESCTR = (encrypted_message: BufferSource, key: CryptoKey, iv: Uint8Array): Promise<Uint8Array> =>
  crypto.subtle.decrypt({name: "AES-CTR", counter: iv, length: 64}, key, encrypted_message);

// AES-GCM
export const getAESGCMKey = (key: Uint8Array) =>
  crypto.subtle.importKey("raw", key, "AES-GCM", false, ["encrypt", "decrypt"]);

export const AESGCM = async (message: BufferSource, key: CryptoKey) => {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const aesgcm: ArrayBuffer = await crypto.subtle.encrypt({name: "AES-GCM", iv}, key, message);
  return {encrypt: aesgcm, iv};
}

export const decryptAESGCM = (encrypted_message: BufferSource, key: CryptoKey, iv: Uint8Array): Promise<Uint8Array> =>
  crypto.subtle.decrypt({name: "AES-GCM", iv}, key, encrypted_message);
  

const iteration = 100;

export const argon2encrypt = (password: string, salt: Uint8Array) =>{
  return argon2.hash({
  pass: password,
  salt,
  hashLen: 32,
  time: iteration,
}).then((res)=>{
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

export const generateRSAKey = async(masterkey: CryptoKey) =>{
  const {privateKey, publicKey} = await crypto.subtle.generateKey({name: "RSA-OAEP", modulusLength: 4096, hash: "SHA-512", publicExponent: new Uint8Array([0x01,0x00,0x01])}, true, ["encrypt", "decrypt"]);
  if(!privateKey || !publicKey) throw new Error("why!!???");
  const [privateKeyArrayBuffer, publicKeyArrayBuffer] = await Promise.all([crypto.subtle.exportKey("pkcs8", privateKey), crypto.subtle.exportKey("spki", publicKey)]);
  const publicKeyU = new Uint8Array(publicKeyArrayBuffer);

  const encriptedPrivateKey = AESCTR(privateKeyArrayBuffer,masterkey);

  return {
    privateKey,
    publicKey,
    encripted_private_key: byteArray2base64((await encriptedPrivateKey).encrypt),
    encripted_private_key_iv: byteArray2base64((await encriptedPrivateKey).iv),
    public_key:byteArray2base64(publicKeyU),
  };
};

export const importRSAKey = async (params: {masterkey: CryptoKey, encrypted_private_key: string, encrypted_private_key_iv: string, public_key: string}) =>{
  const PrivateKeyArrayBuffer = await decryptAESCTR(
    base642ByteArray(params.encrypted_private_key),
    params.masterkey,
    base642ByteArray(params.encrypted_private_key_iv)
  );
  const PublicKeyArrayBuffer = base642ByteArray(params.public_key);
  const [privateKey, publicKey] = await Promise.all([
    crypto.subtle.importKey("pkcs8", PrivateKeyArrayBuffer, {name: "RSA-OAEP", hash: "SHA-512"}, true, ["decrypt"]),
    crypto.subtle.importKey("spki", PublicKeyArrayBuffer, {name: "RSA-OAEP", hash: "SHA-512"}, true, ["encrypt"])
  ]);
  return {privateKey, publicKey};
};
