import { decryptAESCTR } from '../utils/crypto';

let rsaPrivateKey: CryptoKey | null = null;
let rsaPublicKey: CryptoKey | null = null;
let DerivedEncryptionKey: CryptoKey | null = null;

export const setRSAKey = (params: { rsaPrivateKey: CryptoKey, rsaPublicKey: CryptoKey }) => {
  rsaPrivateKey = params.rsaPrivateKey;
  rsaPublicKey = params.rsaPublicKey;
  // console.log(params);
};

export const decryptByRSA = (data: ArrayBuffer): Promise<ArrayBuffer> => {
  if (!rsaPrivateKey) return Promise.reject(new Error('there is no rsa privatekey'));
  return crypto.subtle.decrypt({ name: 'RSA-OAEP' }, rsaPrivateKey, data);
};

export const encryptByRSA = (data: ArrayBuffer): Promise<ArrayBuffer> => {
  if (!rsaPublicKey) return Promise.reject(new Error('there is no rsa publickey'));
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return crypto.subtle.encrypt({ name: 'RSA-OAEP' }, rsaPublicKey, data);
};

export const setDerivedEncryptionKey = (derivedEncryptionKey: CryptoKey) => {
  DerivedEncryptionKey = derivedEncryptionKey;
};

export const decryptoByDerivedEncryptionKey = (params: { data: ArrayBuffer, iv: Uint8Array }) => {
  if (!DerivedEncryptionKey) return Promise.reject(new Error('there is no DerivedEncryptionKey'));
  return decryptAESCTR(
    params.data,
    DerivedEncryptionKey,
    params.iv,
  );
};
