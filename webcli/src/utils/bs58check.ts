/* eslint-disable no-bitwise */
import { sha256 } from '@noble/hashes/sha256';
import baseX from 'base-x';

const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

const bs58 = baseX(BASE58);

const checksumFn = (payload: Uint8Array) => sha256(sha256(payload));

export const bs58CheckEncode = (payload: Uint8Array) => {
  const checksum = checksumFn(payload).slice(0, 4);
  return bs58.encode(
    new Uint8Array([...Array.from(payload), ...Array.from(checksum)]),
  );
};

const bs58CheckDecodeRaw = (buffer: Uint8Array) => {
  const payload = buffer.slice(0, -4);
  const checksum = buffer.slice(-4);
  const regenChecksum = checksumFn(payload);
  if (
    (checksum[0] ^ regenChecksum[0]) |
    (checksum[1] ^ regenChecksum[1]) |
    (checksum[2] ^ regenChecksum[2]) |
    (checksum[3] ^ regenChecksum[3])
  ) {
    throw new Error('Invalid checksum');
  }
  return payload;
};

export const bs58CheckDecode = (rawbuffer: string | Uint8Array) => {
  const buffer =
    typeof rawbuffer === 'string' ? bs58.decode(rawbuffer) : rawbuffer;
  return bs58CheckDecodeRaw(buffer);
};

export const bs58CheckDecodeWithoutErr = (rawbuffer: string | Uint8Array) => {
  try {
    return bs58CheckDecode(rawbuffer);
  } catch {
    return null;
  }
};
