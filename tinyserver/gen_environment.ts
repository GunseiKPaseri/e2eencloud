const S = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-';

const genPassword = (len: number) =>
  Array.from(crypto.getRandomValues(new Uint32Array(len)))
    .map((n) => S[n % S.length]).join('');

console.log('# DB');
console.log('DB_HOSTNAME = localhost');
console.log('DB_PORT = 13306');
console.log('DB_NAME = e2eencloud');
console.log('DB_USER = e2eencloudserver');
console.log(`DB_PASS = ${genPassword(25)}`);
console.log('');
console.log('TZ = Asia/Tokyo');
console.log('');
console.log('# S3(or MinIO)');
console.log(`AWS_ACCESS_KEY_ID = ${genPassword(25)}`);
console.log(`AWS_SECRET_ACCESS_KEY = ${genPassword(25)}`);
console.log('AWS_DEFAULT_REGION = ap-northeast-1');
console.log('AWS_BUCKET = e2eencloud-bucket-test');
console.log('AWS_USE_PATH_STYLE_ENDPOINT = true');
console.log('# URL IN AppNetwork(like docker)');
console.log('AWS_ENDPOINT = http://minio:9000');
console.log('# URL IN EndPoint(like browser)');
console.log('AWS_URL = http://localhost:9000');
console.log('');
console.log('# For DockerCompose Admin');
console.log(`L_DB_ROOT_PASS = ${genPassword(25)}`);
console.log('L_MINIO_PORT = 9000');
console.log('L_MINIO_CONSOLE_PORT = 9001');
console.log('L_MINIO_ROOT_USER = Admin');
console.log(`L_MINIO_ROOT_PASSWORD = ${genPassword(25)}`);
