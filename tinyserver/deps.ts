export {
  decode as base642ByteArray,
  encode as byteArray2base64,
} from 'https://deno.land/std@0.136.0/encoding/base64.ts';
export { bold, yellow } from 'https://deno.land/std@0.136.0/fmt/colors.ts';
export { v4 } from 'https://deno.land/std@0.136.0/uuid/mod.ts';

// load dotenv
import 'https://deno.land/std@0.136.0/dotenv/load.ts';
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

export { ClientMySQL } from 'https://deno.land/x/nessie@2.0.6/mod.ts';
export type { NessieConfig } from 'https://deno.land/x/nessie@2.0.6/mod.ts';

export { Application, Router, Status } from 'https://deno.land/x/oak@v10.5.1/mod.ts';

export { Session as oakSession } from 'https://deno.land/x/oak_sessions@v3.2.8/mod.ts';
import OakSessionStore from 'https://deno.land/x/oak_sessions@v3.2.8/src/stores/Store.ts';
export type { OakSessionStore };
export type { SessionData } from 'https://deno.land/x/oak_sessions@v3.2.8/src/Session.ts';

export { oakCors } from 'https://deno.land/x/cors@v1.2.2/mod.ts';

export { Client, configLogger } from 'https://deno.land/x/mysql@v2.10.2/mod.ts';
export type { ClientConfig } from 'https://deno.land/x/mysql@v2.10.2/mod.ts';
export { Query, Where } from 'https://deno.land/x/sql_builder@v1.9.1/mod.ts';

// @deno-types="https://deno.land/x/otpauth@v7.1.2/dist/otpauth.d.ts"
export * as OTPAuth from 'https://deno.land/x/otpauth@v7.1.2/dist/otpauth.esm.js';

// @deno-types="https://cdn.skypack.dev/@types/ua-parser-js?dts"
import uaparser from 'https://cdn.skypack.dev/ua-parser-js@1.0.2?dts';
export { uaparser };

export { S3Bucket } from 'https://deno.land/x/s3@0.1.0/mod.ts';

import compareAsc from 'https://deno.land/x/date_fns@v2.22.1/compareAsc/index.ts';
export { compareAsc };

import bs58 from 'https://cdn.skypack.dev/bs58@5.0.0?dts';
export { bs58 };
