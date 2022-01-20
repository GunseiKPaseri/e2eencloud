let _rsaPrivateKey: CryptoKey|null = null
let _rsaPublicKey: CryptoKey|null = null

export const setRSAKey = (params: {rsaPrivateKey: CryptoKey, rsaPublicKey: CryptoKey}) => {
  _rsaPrivateKey = params.rsaPrivateKey
  _rsaPublicKey = params.rsaPublicKey
  console.log(params)
}

export const decryptByRSA = (data: ArrayBuffer): Promise<ArrayBuffer> => {
  if (!_rsaPrivateKey) return Promise.reject(new Error('there is no rsa privatekey'))
  return crypto.subtle.decrypt({ name: 'RSA-OAEP' }, _rsaPrivateKey, data)
}

export const encryptByRSA = (data: ArrayBuffer): Promise<ArrayBuffer> => {
  if (!_rsaPublicKey) return Promise.reject(new Error('there is no rsa publickey'))
  return crypto.subtle.encrypt({ name: 'RSA-OAEP' }, _rsaPublicKey, data)
}
