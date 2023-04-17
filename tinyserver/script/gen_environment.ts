const S = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-';

const genPassword = (len: number) =>
  Array.from(crypto.getRandomValues(new Uint32Array(len)))
    .map((n) => S[n % S.length]).join('');

console.log(`
# Windows Conf
COMPOSE_CONVERT_WINDOWS_PATHS=1

# APP
APP_PORT = 3000

# DB
DB_NAME = e2eencloud
DB_USER = e2eencloudserver
DB_PASS = ${genPassword(25)}

TZ = Asia/Tokyo

# S3(or MinIO)
AWS_ACCESS_KEY_ID = ${genPassword(25)}
AWS_SECRET_ACCESS_KEY = ${genPassword(25)}
AWS_DEFAULT_REGION = ap-northeast-1
AWS_BUCKET = e2eencloud-bucket-test
AWS_USE_PATH_STYLE_ENDPOINT = true
# URL IN AppNetwork(like docker)
AWS_ENDPOINT = http://minio:9000
# URL IN EndPoint(like browser)
AWS_URL = http://minio:9000

# For DockerCompose Admin
L_DB_ROOT_PASS = ${genPassword(25)}
L_MINIO_PORT = 9000
L_MINIO_CONSOLE_PORT = 9001
L_MINIO_ROOT_USER = Admin
L_MINIO_ROOT_PASSWORD = ${genPassword(25)}

# SMTP
SMTP_PORT = 1025
SMTP_USER = e2eeuser
SMTP_PASSWORD = ${genPassword(25)}
`);
