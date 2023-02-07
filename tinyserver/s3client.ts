import {
  BUCKET_ACCESS_KEY_ID,
  BUCKET_ENDPOINT,
  BUCKET_NAME,
  BUCKET_REGION,
  BUCKET_SECRET_KEY,
  S3Bucket,
} from './deps.ts';

export const bucket = new S3Bucket({
  accessKeyID: BUCKET_ACCESS_KEY_ID,
  secretKey: BUCKET_SECRET_KEY,
  bucket: BUCKET_NAME,
  region: BUCKET_REGION,
  endpointURL: BUCKET_ENDPOINT,
});
