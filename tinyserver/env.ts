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

// SMTP
export const SMTP_USER = Deno.env.get('SMTP_USER') ?? '__NOTFOUND__';
export const SMTP_PASSWORD = Deno.env.get('SMTP_PASSWORD') ?? '__NOTFOUND__';
