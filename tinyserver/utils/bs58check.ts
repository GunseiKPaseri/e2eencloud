/* eslint-disable no-bitwise */
import { bs58 } from '../deps.ts'

const SHA256 = (payload: ArrayBuffer) => crypto.subtle.digest('SHA-256', payload)

const checksumFn = async (payload: Uint8Array) => {
  return new Uint8Array(await SHA256(await SHA256(payload)))
}

export const bs58CheckEncode = async (payload: Uint8Array) => {
  const checksum = (await checksumFn(payload)).slice(0, 4)
  return bs58.encode(
    new Uint8Array([
      ...Array.from(payload),
      ...Array.from(checksum),
    ]),
  )
}

const bs58CheckDecodeRaw = async (buffer: Uint8Array) => {
  const payload = buffer.slice(0, -4)
  const checksum = buffer.slice(-4)
  const regenChecksum = await checksumFn(payload)
  if (
    checksum[0] ^ regenChecksum[0] |
    checksum[1] ^ regenChecksum[1] |
    checksum[2] ^ regenChecksum[2] |
    checksum[3] ^ regenChecksum[3]
  ) {
    throw new Error('Invalid checksum')
  }
  return payload
}

export const bs58CheckDecode = (rawbuffer: string | Uint8Array) => {
  const buffer = typeof rawbuffer === 'string' ? bs58.decode(rawbuffer) : rawbuffer
  return bs58CheckDecodeRaw(buffer)
}

export const bs58CheckDecodeWithoutErr = async (rawbuffer: string | Uint8Array) => {
  try {
    return await bs58CheckDecode(rawbuffer)
  } catch {
    return null
  }
}
