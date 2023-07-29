import { ENV, S3Bucket } from 'tinyserver/deps.ts';

export const bucket = new S3Bucket({
  accessKeyID: ENV.BUCKET_ACCESS_KEY_ID,
  secretKey: ENV.BUCKET_SECRET_KEY,
  bucket: ENV.BUCKET_NAME,
  region: ENV.BUCKET_REGION,
  endpointURL: ENV.BUCKET_ENDPOINT,
});
