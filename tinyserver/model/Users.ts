import { DBEnumRole, DBUser, prisma } from '../dbclient.ts'
import type { Prisma } from '../dbclient.ts'

import { createSalt, ExhaustiveError } from '../util.ts'
import { deleteEmailConfirms, isEmailConfirmSuccess } from './ConfirmingEmailAddress.ts'
import { byteArray2base64, OTPAuth, z } from '../deps.ts'
import parseJSONwithoutErr from '../utils/parseJSONWithoutErr.ts'
import {
  anyFilterModelSchema,
  filterNumberItemSchema,
  filterStringItemSchema,
  gridFilterToPrismaFilter,
} from '../utils/dataGridFilter.ts'
import type { FilterNumberItem, FilterStringItem } from '../utils/dataGridFilter.ts'
import { GridFilterModel } from '../utils/dataGridFilter.ts'
import { pick } from '../utils/objSubset.ts'
import { recordUnion } from '../utils/typeUtil.ts'

const DEFAULT_MAX_CAPACITY = 10n * 1024n * 1024n //10MiB
/*
interface SQLTableUser {
  id: string;
  email: string;
  client_random_value: string;
  encrypted_master_key: string;
  encrypted_master_key_iv: string;
  hashed_authentication_key: string;
  is_email_confirmed: boolean;
  max_capacity: number;
  file_usage: number;
  two_factor_authentication_secret_key: string | null;
  rsa_public_key: string | null;
  encrypted_rsa_private_key: string | null;
  encrypted_rsa_private_key_iv: string | null;
  authority: string | null;
}*/

export class User {
  readonly id: string
  readonly email: string
  readonly client_random_value: string
  readonly encrypted_master_key: string
  readonly encrypted_master_key_iv: string
  readonly hashed_authentication_key: string
  readonly is_email_confirmed: boolean
  #max_capacity: number
  #file_usage: number
  #rsa_public_key: string | null
  #encrypted_rsa_private_key: string | null
  #encrypted_rsa_private_key_iv: string | null
  #role: DBEnumRole
  constructor(
    user: Omit<DBUser, 'max_capacity' | 'file_usage'> & {
      max_capacity: string | bigint | number
      file_usage: string | bigint | number
    },
  ) {
    this.id = user.id
    this.email = user.email
    this.client_random_value = user.client_random_value
    this.encrypted_master_key = user.encrypted_master_key
    this.encrypted_master_key_iv = user.encrypted_master_key_iv
    this.hashed_authentication_key = user.hashed_authentication_key
    this.is_email_confirmed = user.is_email_confirmed
    this.#max_capacity = typeof user.max_capacity === 'number' ? user.max_capacity : Number(user.max_capacity)
    this.#file_usage = typeof user.file_usage === 'number' ? user.file_usage : Number(user.file_usage)
    this.#rsa_public_key = user.rsa_public_key
    this.#encrypted_rsa_private_key = user.encrypted_rsa_private_key
    this.#encrypted_rsa_private_key_iv = user.encrypted_rsa_private_key_iv
    this.#role = user.role
  }

  get rsa_public_key() {
    return this.#rsa_public_key
  }
  get encrypted_rsa_private_key() {
    return this.#encrypted_rsa_private_key
  }
  get encrypted_rsa_private_key_iv() {
    return this.#encrypted_rsa_private_key_iv
  }
  get file_usage() {
    return this.#file_usage
  }

  get role() {
    return this.#role
  }
  get max_capacity() {
    return this.#max_capacity
  }

  async update() {
    const u = await prisma.user.findUnique({
      select: {
        file_usage: true,
        role: true,
        max_capacity: true,
      },
      where: {
        id: this.id,
      },
    })
    if (u === null) throw new Error('User deleted')
    this.#file_usage = Number(u.file_usage)
    this.#role = u.role
    this.#max_capacity = Number(u.max_capacity)
    return this
  }

  // value() {
  //   return {
  //     id: this.id,
  //     email: this.email,
  //     max_capacity: this.max_capacity,
  //     file_usage: this.file_usage,
  //     role: this.role ?? undefined,
  //   };
  // }

  async patchUsage(diffUsageX: bigint | number) {
    const diffUsage = Number(diffUsageX)
    try {
      await this.update()
      if (diffUsage > 0) {
        // want `UPDATE users SET file_usage = file_usage + ? WHERE id = ? AND max_capacity - file_usage >= ?`
        if (this.#max_capacity - this.#file_usage >= diffUsage) {
          prisma.user.update({
            where: { id: this.id },
            data: {
              file_usage: Number(this.#file_usage + diffUsage),
            },
          })
        } else {
          return null
        }
      } else {
        await prisma.user.update({
          where: { id: this.id },
          data: {
            file_usage: Number(this.#file_usage + diffUsage),
          },
        })
      }
      this.#file_usage += diffUsage
      return this.#file_usage
    } catch (_) {
      console.log(_)
      return null
    }
  }

  async confirmTOTP(token: string): Promise<{ success: boolean; useTOTP: boolean }> {
    const registedTOTPkey = await prisma.tFASolution.findMany({
      select: {
        value: true,
      },
      where: {
        type: 'TOTP',
        user_id: this.id,
      },
    })
    if (registedTOTPkey.length === 0) return { success: true, useTOTP: false }

    return {
      success: registedTOTPkey.some((key) => {
        const totp = new OTPAuth.TOTP({
          issuer: 'E2EEncloud',
          label: `${this.email}`,
          algorithm: 'SHA1',
          digits: 6,
          period: 30,
          secret: key.value,
        })
        return totp.validate({ token: token, window: 1 }) !== null
      }),
      useTOTP: true,
    }
  }

  async addTOTP(key: string) {
    await this.deleteTOTP()
    await prisma.tFASolution.create({
      data: {
        type: 'TOTP',
        value: key,
        user_id: this.id,
      },
    })
  }

  async deleteTOTP() {
    await prisma.tFASolution.deleteMany({
      where: {
        type: 'TOTP',
        user_id: this.id,
      },
    })
  }

  async addRSAPublicKey(
    params: Pick<DBUser, 'encrypted_rsa_private_key' | 'encrypted_rsa_private_key_iv' | 'rsa_public_key'>,
  ) {
    try {
      await prisma.user.update({
        where: { id: this.id },
        data: pick(params, ['encrypted_rsa_private_key', 'encrypted_rsa_private_key_iv', 'rsa_public_key']),
      })
      this.#encrypted_rsa_private_key = params.encrypted_rsa_private_key
      this.#encrypted_rsa_private_key_iv = params.encrypted_rsa_private_key_iv
      this.#rsa_public_key = params.rsa_public_key
      return true
    } catch (_) {
      console.log(_)
      return false
    }
  }

  async patchPassword(
    params: Pick<
      DBUser,
      'client_random_value' | 'encrypted_master_key' | 'encrypted_master_key_iv' | 'hashed_authentication_key'
    >,
  ) {
    try {
      await prisma.user.update({
        where: { id: this.id },
        data: pick(params, [
          'client_random_value',
          'encrypted_master_key',
          'encrypted_master_key_iv',
          'hashed_authentication_key',
        ]),
      })
      return true
    } catch (_) {
      console.log(_)
      return false
    }
  }

  async patch(params: {
    max_capacity?: number | bigint
  }) {
    // validation
    const max_capacity = typeof params.max_capacity === 'undefined' ? undefined : Number(params.max_capacity)

    if (typeof max_capacity === 'number' && max_capacity < 0) return false

    if (max_capacity !== undefined) this.#max_capacity = max_capacity

    try {
      await prisma.user.update({
        where: { id: this.id },
        data: {
          max_capacity: Number(this.#max_capacity),
        },
      })
      return true
    } catch (_) {
      console.log(_)
      return false
    }
  }
}

export const addUser = async (
  params: Pick<
    DBUser,
    | 'email'
    | 'client_random_value'
    | 'encrypted_master_key'
    | 'encrypted_master_key_iv'
    | 'hashed_authentication_key'
    | 'max_capacity'
  >,
) => {
  try {
    console.log(params, 0n)
    await prisma.user.create({
      data: {
        ...pick(params, [
          'email',
          'client_random_value',
          'encrypted_master_key',
          'encrypted_master_key_iv',
          'hashed_authentication_key',
        ]),
        max_capacity: params.max_capacity ?? DEFAULT_MAX_CAPACITY,
        file_usage: 0,
        is_email_confirmed: false,
        id: crypto.randomUUID(),
        rsa_public_key: '',
        encrypted_rsa_private_key: '',
        encrypted_rsa_private_key_iv: '',
      },
    })
  } catch (_) {
    // ユーザが既に存在する場合
    console.log(_)
    const alreadyExistUser = await prisma.user.findUnique({
      where: { email: params.email },
      select: { is_email_confirmed: true },
    })
    if (alreadyExistUser?.is_email_confirmed) {
      // メールが確認状態ならば追加不可
      return false
    }
    // 未確認状態なら上書き
    await prisma.user.update({
      where: { email: params.email },
      data: pick(params, [
        'client_random_value',
        'encrypted_master_key',
        'encrypted_master_key_iv',
        'hashed_authentication_key',
      ]),
    })
    // これまでの確認メールに付属していたリンクは削除する
    await deleteEmailConfirms(params.email)
  }
  return true
}

const userFields = ['id', 'email', 'max_capacity', 'file_usage', 'authority', 'two_factor_authentication'] as const
type UserField = typeof userFields[number]
const isUserField = (field: string): field is UserField => {
  return userFields.some((value) => value === field)
}
export const userFieldValidate = (
  field: unknown,
): UserField => (typeof field === 'string' ? (isUserField(field) ? field : 'email') : 'email')

export const userEmailConfirm = async (
  email: string,
  email_confirmation_token: string,
) => {
  try {
    const confirmed = await isEmailConfirmSuccess(
      email,
      email_confirmation_token,
    )
    if (confirmed) {
      await prisma.user.update({ where: { email }, data: { is_email_confirmed: true } })
    }
    return confirmed
  } catch (_) {
    console.log(_)
    return false
  }
}

export const getUserById = async (id: string | null): Promise<User | null> => {
  if (!id) return null
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) return null
  return new User(user)
}

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const user: DBUser | null = await prisma.user.findUnique({
    where: { email },
  })
  if (!user) return null
  return new User(user)
}

export const getClientRandomSalt = async (email: string): Promise<string> => {
  const user = await prisma.user.findUnique({ where: { email }, select: { client_random_value: true } })
  const hashedClientRandomSalt = await createSalt(
    email,
    user?.client_random_value,
  )
  return byteArray2base64(hashedClientRandomSalt)
}

export const getUsers = async (
  params: {
    offset: number
    limit: number
    orderBy: UserField
    order: 'asc' | 'desc'
    queryFilter: GridUserFilterModel
    select: Prisma.UserSelect
  },
) => {
  const users = await prisma.user.findMany({
    skip: params.offset,
    take: params.limit,
    orderBy: { [params.orderBy]: params.order },
    select: params.select,
    where: userFilterQueryToPrismaQuery(params.queryFilter),
  })
  return users
}

export const getNumberOfUsers = async (queryFilter?: GridUserFilterModel): Promise<number> => {
  return await prisma.user.count({
    where: queryFilter ? userFilterQueryToPrismaQuery(queryFilter) : {},
  })
}

export const deleteUserById = async (id: string | null): Promise<{ success: boolean }> => {
  if (!id) return { success: false }
  const result = await prisma.user.deleteMany({ where: { id } })
  return { success: result.count === 1 }
}

// ===================================================================
//  Filter
// ===================================================================

const filterStringColumn = ['id', 'email', 'authority'] as const
const filterNumberColumn = ['max_capacity', 'file_usage'] as const

const userFilterItemSchema = z.union([
  filterStringItemSchema('id'),
  filterStringItemSchema('email'),
  filterStringItemSchema('authority'),
  filterNumberItemSchema('max_capacity'),
  filterNumberItemSchema('file_usage'),
])
type GridUserFilterItem = z.infer<typeof userFilterItemSchema>

type FixedGridUserFilterItem =
  | FilterStringItem<typeof filterStringColumn[number]>
  | FilterNumberItem<typeof filterNumberColumn[number]>

type GridUserFilterModel = GridFilterModel<FixedGridUserFilterItem>

/**
 * parse as MUI DataGrid FilterModel
 * @param query DataGrid FilterModel(for Users)
 * @returns
 */
export const parseUserFilterQuery = (query: string): GridFilterModel<GridUserFilterItem> => {
  const parsed = anyFilterModelSchema(userFilterItemSchema, parseJSONwithoutErr(query))
  return parsed
}

// const prismaNumberColumn = ['max_capacity', 'file_usage'] as const;
// const prismaStringColumn = ['id', 'email', 'authority'] as const;

// const prismaUserFilterSchema = z.union([
//   createFilterBooleanItemUnionSchema([] as const),
//   createFilterDateItemUnionSchema([] as const),
//   createFilterNumberItemUnionSchema(prismaNumberColumn),
//   createFilterStringItemUnionSchema(prismaStringColumn),
// ]);

const userFilterQueryToPrismaQuery = (gridFilter: GridUserFilterModel): Prisma.UserWhereInput => {
  const t = gridFilter.items
    .map((x) => {
      switch (x.columnField) {
        case 'max_capacity':
        case 'file_usage':
          return gridFilterToPrismaFilter(x, 'Number')
        case 'id':
        case 'email':
        case 'authority':
          return gridFilterToPrismaFilter(x, 'String')
        default:
          console.log(new ExhaustiveError(x))
      }
    })
  return recordUnion(t)
}
