let _rsaPrivateKey: CryptoKey|null = null;
let _rsaPublicKey: CryptoKey|null = null;

export const setRSAKey = (params: {rsaPrivateKey: CryptoKey, rsaPublicKey: CryptoKey}) => {
  _rsaPrivateKey = params.rsaPrivateKey;
  _rsaPublicKey = params.rsaPublicKey;
  console.log(params);
};
