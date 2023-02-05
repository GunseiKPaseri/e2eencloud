
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum
} = require('./runtime/index-browser')


const Prisma = {}

exports.Prisma = Prisma

/**
 * Prisma Client JS version: 4.7.1
 * Query Engine version: ceb5c99003b99c9ee2c1d2e618e359c14aef2ea5
 */
Prisma.prismaVersion = {
  client: "4.7.1",
  engine: "ceb5c99003b99c9ee2c1d2e618e359c14aef2ea5"
}

Prisma.PrismaClientKnownRequestError = () => {
  throw new Error(`PrismaClientKnownRequestError is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  throw new Error(`PrismaClientUnknownRequestError is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.PrismaClientRustPanicError = () => {
  throw new Error(`PrismaClientRustPanicError is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.PrismaClientInitializationError = () => {
  throw new Error(`PrismaClientInitializationError is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.PrismaClientValidationError = () => {
  throw new Error(`PrismaClientValidationError is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.NotFoundError = () => {
  throw new Error(`NotFoundError is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  throw new Error(`sqltag is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.empty = () => {
  throw new Error(`empty is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.join = () => {
  throw new Error(`join is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.raw = () => {
  throw new Error(`raw is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.validator = () => (val) => val


/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}

/**
 * Enums
 */
// Based on
// https://github.com/microsoft/TypeScript/issues/3192#issuecomment-261720275
function makeEnum(x) { return x; }

exports.Prisma.ConfirmingEmailAddressScalarFieldEnum = makeEnum({
  id: 'id',
  email: 'email',
  token: 'token',
  user_id: 'user_id',
  expired_at: 'expired_at',
  created_at: 'created_at',
  updated_at: 'updated_at'
});

exports.Prisma.CouponsScalarFieldEnum = makeEnum({
  id: 'id',
  data: 'data',
  expired_at: 'expired_at',
  created_at: 'created_at',
  updated_at: 'updated_at'
});

exports.Prisma.FilesScalarFieldEnum = makeEnum({
  id: 'id',
  size: 'size',
  created_by: 'created_by',
  created_at: 'created_at',
  updated_at: 'updated_at',
  encryption_data: 'encryption_data'
});

exports.Prisma.HooksScalarFieldEnum = makeEnum({
  id: 'id',
  name: 'name',
  data: 'data',
  user_id: 'user_id',
  expired_at: 'expired_at',
  created_at: 'created_at',
  updated_at: 'updated_at'
});

exports.Prisma.SessionsScalarFieldEnum = makeEnum({
  id: 'id',
  session_key: 'session_key',
  data: 'data',
  user_id: 'user_id',
  expired_at: 'expired_at',
  created_at: 'created_at',
  updated_at: 'updated_at'
});

exports.Prisma.SortOrder = makeEnum({
  asc: 'asc',
  desc: 'desc'
});

exports.Prisma.TFASolutionScalarFieldEnum = makeEnum({
  id: 'id',
  type: 'type',
  value: 'value',
  user_id: 'user_id',
  available: 'available',
  created_at: 'created_at',
  updated_at: 'updated_at'
});

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = makeEnum({
  id: 'id',
  email: 'email',
  is_email_confirmed: 'is_email_confirmed',
  role: 'role',
  max_capacity: 'max_capacity',
  file_usage: 'file_usage',
  client_random_value: 'client_random_value',
  encrypted_master_key: 'encrypted_master_key',
  encrypted_master_key_iv: 'encrypted_master_key_iv',
  encrypted_rsa_private_key: 'encrypted_rsa_private_key',
  encrypted_rsa_private_key_iv: 'encrypted_rsa_private_key_iv',
  hashed_authentication_key: 'hashed_authentication_key',
  rsa_public_key: 'rsa_public_key',
  created_at: 'created_at',
  updated_at: 'updated_at'
});
exports.Role = makeEnum({
  ADMIN: 'ADMIN',
  USER: 'USER'
});

exports.SolutionType = makeEnum({
  TOTP: 'TOTP',
  FIDO2: 'FIDO2',
  EMAIL: 'EMAIL'
});

exports.Prisma.ModelName = makeEnum({
  User: 'User',
  TFASolution: 'TFASolution',
  ConfirmingEmailAddress: 'ConfirmingEmailAddress',
  Sessions: 'Sessions',
  Hooks: 'Hooks',
  Files: 'Files',
  Coupons: 'Coupons'
});

/**
 * Create the Client
 */
class PrismaClient {
  constructor() {
    throw new Error(
      `PrismaClient is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
    )
  }
}
exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
