export {
  decode as base642ByteArray,
  encode as byteArray2base64,
} from 'https://deno.land/std@0.123.0/encoding/base64.ts';
export { bold, yellow } from 'https://deno.land/std@0.123.0/fmt/colors.ts';
export { v4 } from 'https://deno.land/std@0.123.0/uuid/mod.ts';

export { ClientMySQL } from 'https://deno.land/x/nessie@2.0.5/mod.ts';
export type { NessieConfig } from 'https://deno.land/x/nessie@2.0.5/mod.ts';

export { Application, Router, Status } from 'https://deno.land/x/oak@v10.1.0/mod.ts';

export { Session as oakSession } from 'https://deno.land/x/oak_sessions@v3.2.3/mod.ts';
import OakSessionStore from 'https://deno.land/x/oak_sessions@v3.2.3/src/stores/Store.ts';
export type { OakSessionStore };
export type { SessionData } from 'https://deno.land/x/oak_sessions@v3.2.3/src/Session.ts';

export { oakCors } from 'https://deno.land/x/cors@v1.2.2/mod.ts';

export { Client, configLogger } from 'https://deno.land/x/mysql@v2.10.2/mod.ts';
export type { ClientConfig } from 'https://deno.land/x/mysql@v2.10.2/mod.ts';

// @deno-types="https://deno.land/x/otpauth@v7.0.10/dist/otpauth.d.ts"
export * as OTPAuth from 'https://deno.land/x/otpauth@v7.0.10/dist/otpauth.esm.js';

// @deno-types="https://cdn.skypack.dev/@types/ua-parser-js?dts"
import uaparser from 'https://cdn.skypack.dev/ua-parser-js@1.0.2?dts';
export { uaparser };

export { Query, Where } from 'https://deno.land/x/sql_builder@v1.9.1/mod.ts';
