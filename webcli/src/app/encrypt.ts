let rsaPrivateKey: CryptoKey | null = null;
let rsaPublicKey: CryptoKey | null = null;

export const setRSAKey = (params: { rsaPrivateKey: CryptoKey, rsaPublicKey: CryptoKey }) => {
  console.log(params);
  rsaPrivateKey = params.rsaPrivateKey;
  rsaPublicKey = params.rsaPublicKey;
  // console.log(params);
};

export const decryptByRSA = (data: ArrayBuffer): Promise<ArrayBuffer> => {
  if (!rsaPrivateKey) return Promise.reject(new Error('there is no rsa privatekey'));
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  console.log(data, rsaPrivateKey);
  return crypto.subtle.decrypt({ name: 'RSA-OAEP' }, rsaPrivateKey, data);
};

export const encryptByRSA = (data: ArrayBuffer): Promise<ArrayBuffer> => {
  if (!rsaPublicKey) return Promise.reject(new Error('there is no rsa publickey'));
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return crypto.subtle.encrypt({ name: 'RSA-OAEP' }, rsaPublicKey, data);
};
