import { PrismaClient } from './deps.ts'
export type {
  Coupons as DBCoupons,
  Files as DBFiles,
  Hooks as DBHooks,
  Prisma,
  Role as DBEnumRole,
  Sessions as DBSessions,
  User as DBUser,
} from './generated/client/deno/index.d.ts'

export const prisma = new PrismaClient()
