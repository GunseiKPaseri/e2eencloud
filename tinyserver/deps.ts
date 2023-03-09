export {
  decode as base642ByteArray,
  encode as byteArray2base64,
} from 'https://deno.land/std@0.177.0/encoding/base64.ts';
export { bold, yellow } from 'https://deno.land/std@0.177.0/fmt/colors.ts';
export { v4 } from 'https://deno.land/std@0.177.0/uuid/mod.ts';

export type { IsExact } from 'https://deno.land/std@0.177.0/testing/types.ts';
export { assertType } from 'https://deno.land/std@0.177.0/testing/types.ts';

// load dotenv
import 'https://deno.land/std@0.177.0/dotenv/load.ts';
// APP PORT
export const PORT = parseInt(Deno.env.get('PORT') ?? '3001');
export const SERVER_HOSTNAME = Deno.env.get('SERVER_HOSTNAME') ?? 'localhost';
export const SERVER_URI = Deno.env.get('SERVER_URI') ?? 'http://localhost';

// DB
export const DB_HOSTNAME = Deno.env.get('DB_HOSTNAME') ?? '__NOTFOUND__';
export const DB_PORT = parseInt(Deno.env.get('DB_PORT') ?? '__NOTFOUND__');
export const DB_NAME = Deno.env.get('DB_NAME') ?? '__NOTFOUND__';
export const DB_USER = Deno.env.get('DB_USER') ?? '__NOTFOUND__';
export const DB_PASS = Deno.env.get('DB_PASS') ?? '__NOTFOUND__';
// Bucket
export const BUCKET_ACCESS_KEY_ID = Deno.env.get('L_MINIO_ROOT_USER') ?? '__NOTFOUND__';
export const BUCKET_SECRET_KEY = Deno.env.get('L_MINIO_ROOT_PASSWORD') ?? '__NOTFOUND__';
export const BUCKET_NAME = Deno.env.get('AWS_BUCKET') ?? '__NOTFOUND__';
export const BUCKET_REGION = Deno.env.get('AWS_DEFAULT_REGION') ?? '__NOTFOUND__';
export const BUCKET_ENDPOINT = Deno.env.get('AWS_URL') ?? '__NOTFOUND__';

// load dependent package

export {
  Application,
  type RouteParams,
  Router,
  type RouterContext,
  Status,
} from 'https://deno.land/x/oak@v11.1.0/mod.ts';

export { Session as oakSession } from 'https://deno.land/x/oak_sessions@v4.1.0/mod.ts';
import OakSessionStore from 'https://deno.land/x/oak_sessions@v4.1.0/src/stores/Store.ts';
export type { OakSessionStore };
export type { SessionData } from 'https://deno.land/x/oak_sessions@v4.1.0/src/Session.ts';

export { oakCors } from 'https://deno.land/x/cors@v1.2.2/mod.ts';

export { SMTPClient } from 'https://deno.land/x/denomailer@1.5.3/mod.ts';

import * as z from 'https://deno.land/x/zod@v3.20.2/mod.ts';
export { z };

export { expect } from 'https://deno.land/x/expect@v0.2.10/mod.ts';

// @deno-types="https://deno.land/x/otpauth@v9.0.2/dist/otpauth.d.ts"
export * as OTPAuth from 'https://deno.land/x/otpauth@v9.0.2/dist/otpauth.esm.js';

// @deno-types="npm:@types/ua-parser-js@0.7.36"
import uaparser from 'npm:ua-parser-js@1.0.33';
export { uaparser };

export { S3Bucket } from 'https://deno.land/x/s3@0.5.0/mod.ts';

import compareAsc from 'https://deno.land/x/date_fns@v2.22.1/compareAsc/index.ts';
export { compareAsc };

export { Fido2AssertionResult, Fido2Lib } from 'https://deno.land/x/fido2@3.3.5/dist/main.js';

import UUIDshort from 'npm:short-uuid';
export { UUIDshort };
export { uuidv7 } from 'npm:uuidv7';

import * as bcrypt from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts';
export { bcrypt };

export { PrismaClient } from 'prisma-cli';

import baseX from 'npm:base-x@4.0.0';
const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const bs58 = baseX(BASE58);
export { bs58 };

// for
import _prisma from 'prisma';

import * as trpc from 'npm:@trpc/server@10.14.1';
export { trpc };
