/* eslint-disable no-undef */
import { createHash as createSHA256Hash } from 'sha256-uint8array'
import { toByteArray, fromByteArray } from 'base64-js'

import { createBrowserHistory } from 'history'

import { argon2id } from 'hash-wasm'
import { AES_AUTH_KEY_LENGTH, ARGON2_ITERATIONS, ARGON2_MEMORYSISE, ARGON2_PARALLELISM } from './const'

const textencoder = new TextEncoder()
const textdecoder = new TextDecoder()
export const string2ByteArray = (str: string) => textencoder.encode(str)
export const byteArray2string = (x: Uint8Array) => textdecoder.decode(x)
export const byteArray2base64 = (x: Uint8Array) => fromByteArray(x)
export const base642ByteArray = (base64: string) => toByteArray(base64)

type SupportArray = Uint8Array | ArrayBuffer | Int8Array | Int16Array | Int32Array | Uint16Array | Uint32Array | Uint8ClampedArray | Float32Array | Float64Array | DataView

// AES-CTR
export const getAESCTRKey = (key: Uint8Array) =>
  crypto.subtle.importKey('raw', key, 'AES-CTR', false, ['encrypt', 'decrypt'])

export const AESCTR = async (message: SupportArray, key: CryptoKey) => {
  const iv = window.crypto.getRandomValues(new Uint8Array(AES_AUTH_KEY_LENGTH))
  const aesctr:ArrayBuffer = await crypto.subtle.encrypt({ name: 'AES-CTR', counter: iv, length: 64 }, key, message)
  return { encrypt: new Uint8Array(aesctr, 0), iv }
}

export const decryptAESCTR = (encryptedMessage: SupportArray, key: CryptoKey, iv: Uint8Array): Promise<Uint8Array> =>
  crypto.subtle.decrypt({ name: 'AES-CTR', counter: iv, length: 64 }, key, encryptedMessage).then((x) => new Uint8Array(x, 0))

// AES-GCM
export const getAESGCMKey = (key: Uint8Array) =>
  crypto.subtle.importKey('raw', key, 'AES-GCM', false, ['encrypt', 'decrypt'])

export const AESGCM = async (message: SupportArray, key: CryptoKey) => {
  const iv = window.crypto.getRandomValues(new Uint8Array(12))
  const aesgcm: ArrayBuffer = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, message)
  return { encrypt: aesgcm, iv }
}

export const decryptAESGCM = (encryptedMessage: SupportArray, key: CryptoKey, iv: Uint8Array): Promise<Uint8Array> =>
  crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encryptedMessage).then((x) => new Uint8Array(x, 0))

export const hex2bytearray = (hex: string) => {
  const array = hex.match(/.{2}/g)?.map(x => parseInt(x, 16))
  if (!array) throw new Error('bad hex')
  return new Uint8Array(array)
}

export const argon2encrypt = async (password: string, salt: Uint8Array) => {
  const key = await argon2id({
    password,
    salt,
    parallelism: ARGON2_PARALLELISM,
    hashLength: AES_AUTH_KEY_LENGTH * 2,
    iterations: ARGON2_ITERATIONS,
    memorySize: ARGON2_MEMORYSISE,
    outputType: 'hex'
  })
  console.log(key)
  const bytes = hex2bytearray(key)
  console.log(bytes)
  return bytes
}

export const SHA256 = (array: Uint8Array) => createSHA256Hash().update(array).digest()

/**
 * Salt = SHA-256( “e2ee” || “Padding” || Client Random Value )
 */
const defaultString = 'e2ee'
const saltStringMaxLength = 200
// “e2ee” || “Padding”
const saltString = defaultString + 'P'.repeat(saltStringMaxLength - defaultString.length)
const saltArray = string2ByteArray(saltString)
export const createSalt = (ClientRandomValue: Uint8Array) => {
  // "e2ee” || “Padding” || Client Random Value
  const concatenatedSaltArray = new Uint8Array(saltStringMaxLength + ClientRandomValue.length)
  concatenatedSaltArray.set(saltArray)
  concatenatedSaltArray.set(ClientRandomValue, saltStringMaxLength)

  return SHA256(concatenatedSaltArray)
}

export const generateRSAKey = async (masterkey: CryptoKey) => {
  const { privateKey, publicKey } = await crypto.subtle.generateKey({ name: 'RSA-OAEP', modulusLength: 4096, hash: 'SHA-512', publicExponent: new Uint8Array([0x01, 0x00, 0x01]) }, true, ['encrypt', 'decrypt'])
  if (!privateKey || !publicKey) throw new Error('why!!???')
  const [privateKeyArrayBuffer, publicKeyArrayBuffer] = await Promise.all([crypto.subtle.exportKey('pkcs8', privateKey), crypto.subtle.exportKey('spki', publicKey)])
  const publicKeyU = new Uint8Array(publicKeyArrayBuffer)

  const encriptedPrivateKey = AESCTR(privateKeyArrayBuffer, masterkey)

  return {
    privateKey,
    publicKey,
    encripted_private_key: byteArray2base64((await encriptedPrivateKey).encrypt),
    encripted_private_key_iv: byteArray2base64((await encriptedPrivateKey).iv),
    public_key: byteArray2base64(publicKeyU)
  }
}

export const importRSAKey = async (params: {masterkey: CryptoKey, encryptedPrivateKeyBase64: string, encryptedPrivateKeyIVBase64: string, publicKeyBase64: string}) => {
  const PrivateKeyArrayBuffer = await decryptAESCTR(
    base642ByteArray(params.encryptedPrivateKeyBase64),
    params.masterkey,
    base642ByteArray(params.encryptedPrivateKeyIVBase64)
  )
  const PublicKeyArrayBuffer = base642ByteArray(params.publicKeyBase64)
  const [privateKey, publicKey] = await Promise.all([
    crypto.subtle.importKey('pkcs8', PrivateKeyArrayBuffer, { name: 'RSA-OAEP', hash: 'SHA-512' }, true, ['decrypt']),
    crypto.subtle.importKey('spki', PublicKeyArrayBuffer, { name: 'RSA-OAEP', hash: 'SHA-512' }, true, ['encrypt'])
  ])
  return { privateKey, publicKey }
}

export const drawerWidth = 240

export const correctEmailaddr = /^[a-zA-Z0-9_+-]+(.[a-zA-Z0-9_+-]+)*@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/

export const browserHistory = createBrowserHistory()

/**
 * Promise all with progress
 */
export const allProgress = (proms: Promise<unknown>[], callback: (resolved:number, all: number) => void) => {
  let cnt = 0
  const all = proms.length
  callback(cnt, all)
  const thenFunc = (u:unknown) => {
    callback(cnt, all)
    cnt++
    return u
  }
  proms.map(x => x.then(thenFunc))
  return Promise.all(proms)
}
