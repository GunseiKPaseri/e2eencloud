import { encode as byteArray2base64, decode as base642ByteArray } from "https://deno.land/std/encoding/base64.ts"
const textencoder = new TextEncoder();
export const string2ByteArray = (str: string) => textencoder.encode(str);

const concatByteArray = (a:Uint8Array, b:Uint8Array):Uint8Array =>{
  const c = new Uint8Array(a.length + b.length);
  c.set(a);
  c.set(b, a.length);
  return c;
};

/**
 * Salt = SHA-256( “e2ee” || “Padding” || Client Random Value )
 */
const defaultString = "e2ee";
const saltStringMaxLength = 200;
const ServerRandomValue = byteArray2base64(window.crypto.getRandomValues(new Uint8Array(16)));
export const createSalt = (email: string, ClientRandomValue: string | null) => {
  // 存在可否によらず類似した処理を行い，メルアド存在可否を不明に
    if(ClientRandomValue){
      // "e2ee” || “Padding” || Client Random Value
      const saltString = defaultString + "P".repeat(saltStringMaxLength - defaultString.length);
      const saltArray = string2ByteArray(saltString);
      const clientRandomValueArray = base642ByteArray(ClientRandomValue);
      return crypto.subtle.digest("SHA-256", concatByteArray(saltArray, clientRandomValueArray));
    } else {
      // email || "e2ee" || "Padding" || Server Random Value(Dummy)
      const saltString = email + defaultString + "P".repeat(saltStringMaxLength - defaultString.length - email.length);
      const saltArray = string2ByteArray(saltString);
      const severRandomValueArray = base642ByteArray(ServerRandomValue);
      return crypto.subtle.digest("SHA-256", concatByteArray(saltArray, severRandomValueArray));
    }
  };