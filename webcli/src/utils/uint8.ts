import { toByteArray, fromByteArray } from 'base64-js'

const textencoder = new TextEncoder()
const textdecoder = new TextDecoder()
export const string2ByteArray = (str: string) => textencoder.encode(str)
export const byteArray2string = (x: Uint8Array) => textdecoder.decode(x)
export const byteArray2base64 = (x: Uint8Array) => fromByteArray(x)
export const base642ByteArray = (base64: string) => toByteArray(base64)

export const hex2bytearray = (hex: string) => {
  const array = hex.match(/.{2}/g)?.map(x => parseInt(x, 16))
  if (!array) throw new Error('bad hex')
  return new Uint8Array(array)
}
