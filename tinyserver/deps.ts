export {
  decode as base642ByteArray,
  encode as byteArray2base64,
} from 'https://deno.land/std@0.194.0/encoding/base64.ts';
export {
  decode as base64Url2ByteArray,
  encode as byteArray2base64Url,
} from 'https://deno.land/std@0.194.0/encoding/base64url.ts';

export { bold, yellow } from 'https://deno.land/std@0.194.0/fmt/colors.ts';
export { v4 } from 'https://deno.land/std@0.194.0/uuid/mod.ts';

export type { IsExact } from 'https://deno.land/std@0.194.0/testing/types.ts';
export { assertType } from 'https://deno.land/std@0.194.0/testing/types.ts';

// load dotenv
import 'https://deno.land/std@0.194.0/dotenv/load.ts';
export * as ENV from './env.ts';

// load dependent package

export {
  Application,
  type RouteParams,
  Router,
  type RouterContext,
  Status,
} from 'https://deno.land/x/oak@v11.1.0/mod.ts';

export { Session as oakSession } from 'https://deno.land/x/oak_sessions@v4.1.0/mod.ts';
import OakSessionStore from 'https://deno.land/x/oak_sessions@v4.1.9/src/stores/Store.ts';
export type { OakSessionStore };
export type { SessionData } from 'https://deno.land/x/oak_sessions@v4.1.9/src/Session.ts';

export { oakCors } from 'https://deno.land/x/cors@v1.2.2/mod.ts';

export { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts';

import * as z from 'https://deno.land/x/zod@v3.21.4/mod.ts';
export { z };

export { expect } from 'https://deno.land/x/expect@v0.4.0/mod.ts';

// @deno-types="https://deno.land/x/otpauth@v9.1.3/dist/otpauth.d.ts"
export * as OTPAuth from 'https://deno.land/x/otpauth@v9.1.3/dist/otpauth.esm.js';

// @deno-types="npm:@types/ua-parser-js@0.7.36"
import uaparser from 'npm:ua-parser-js@1.0.33';
export { uaparser };

export { S3Bucket } from 'https://deno.land/x/s3@0.5.0/mod.ts';

import compareAsc from 'https://deno.land/x/date_fns@v2.22.1/compareAsc/index.ts';
export { compareAsc };

export { Fido2AssertionResult, Fido2Lib } from 'https://deno.land/x/fido2@3.4.1/dist/main.js';

import UUIDshort from 'npm:short-uuid@4.2.2';
export { UUIDshort };
export { uuidv7 } from 'npm:uuidv7@0.5.3';

import * as bcrypt from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts';
export { bcrypt };

export { PrismaClient } from 'prisma-cli';

import baseX from 'npm:base-x@4.0.0';
const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const bs58 = baseX(BASE58);
export { bs58 };

// for
import _prisma from 'prisma';
