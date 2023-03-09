import { PrismaClient } from 'tinyserver/deps.ts';
export type {
  ConfirmingEmailAddress as DBConfirmingEmailAddress,
  Coupons as DBCoupons,
  Files as DBFiles,
  Hooks as DBHooks,
  Prisma,
  Role as DBEnumRole,
  Sessions as DBSessions,
  User as DBUser,
} from 'tinyserver/generated/client/deno/index.d.ts';

export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
