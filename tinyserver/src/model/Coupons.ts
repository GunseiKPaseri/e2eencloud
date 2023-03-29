import { compareAsc, z } from 'tinyserver/deps.ts';
import { prisma } from 'tinyserver/src/client/dbclient.ts';
import type { DBCoupons, Prisma } from 'tinyserver/src/client/dbclient.ts';
import {
  anyFilterModelSchema,
  filterDateItemSchema,
  filterStringItemSchema,
  type GridFilterModel,
  gridFilterToPrismaFilter,
} from 'tinyserver/src/utils/dataGridFilter.ts';
import { ExhaustiveError } from 'tinyserver/src/utils/typeUtil.ts';
import parseJSONwithoutErr from 'tinyserver/src/utils/parseJSONWithoutErr.ts';
import { bs58CheckEncode } from 'tinyserver/src/utils/bs58check.ts';
import { recordUnion } from 'tinyserver/src/utils/typeUtil.ts';
import { User } from './Users.ts';

export const couponScheme = z.union([
  z.object({
    method: z.literal('ADD_CAPACITY'),
    value: z.preprocess(
      (v) => (typeof v === 'string' ? BigInt(v) : (typeof v === 'bigint' ? v : null)),
      z.bigint(),
    ),
  }),
  z.object({
    method: z.literal('NONE'),
  }),
]);

export type CouponData = z.infer<typeof couponScheme>;

const couponStringify = (coupon: CouponData) => {
  const t = coupon.method === 'ADD_CAPACITY' ? { ...coupon, value: coupon.value.toString() } : coupon;
  return JSON.stringify(t);
};

export const parseCouponData = (target: string | unknown): CouponData | null => {
  const object = typeof target === 'string' ? parseJSONwithoutErr(target) : target;
  try {
    return couponScheme.parse(object);
  } catch (_) {
    console.log(_);
    return null;
  }
};

export class Coupon {
  readonly id: string;
  readonly created_at: Date;
  #data: CouponData;
  #expired_at: Date | null;
  #used: boolean;
  constructor(coupon: DBCoupons) {
    this.id = coupon.id;
    this.created_at = coupon.created_at;
    this.#data = parseCouponData(coupon.data) ?? { method: 'NONE' };
    this.#expired_at = coupon.expired_at;
    this.#used = false;
  }

  get data() {
    return this.#data;
  }

  get expired_at() {
    return this.#expired_at;
  }

  get used() {
    return this.#used;
  }

  value() {
    return {
      id: this.id,
      created_at: this.created_at,
      data: this.#data,
      expired_at: this.#expired_at,
    };
  }

  async patch(params: { expired_at?: Date | null }) {
    // validate
    if (
      params.expired_at !== undefined &&
      params.expired_at !== null &&
      (
        Number.isNaN(params.expired_at.getTime()) ||
        !(
          compareAsc(new Date(), params.expired_at) < 0
        )
      )
    ) {
      return false;
    }
    await prisma.coupons.update({
      where: { id: this.id },
      data: {
        expired_at: params.expired_at === undefined ? this.#expired_at : params.expired_at,
      },
    });
    if (params.expired_at !== undefined) this.#expired_at = params.expired_at;
    return true;
  }

  async delete() {
    await prisma.coupons.delete({
      where: { id: this.id },
    });

    return true;
  }

  async use(user: User) {
    if (this.#used || (this.#expired_at && compareAsc(new Date(), this.#expired_at) > 0)) return false;
    this.#used = true;
    switch (this.#data.method) {
      case 'ADD_CAPACITY':
        await user.patch({ max_capacity: user.max_capacity + Number(this.#data.value) });
        break;
      case 'NONE':
        break;
      default:
        throw new ExhaustiveError(this.#data);
    }
    await this.delete();
    return true;
  }
}

const genCouponID = () => {
  return bs58CheckEncode(crypto.getRandomValues(new Uint8Array(15)));
};

export const addCoupon = async (
  params: { coupon: CouponData; expired_at?: Date | null; number: number },
): Promise<Coupon[]> => {
  const now = new Date(Date.now());

  const couponData = couponStringify(params.coupon);

  const createdCoupons = await Promise.all(
    [...Array(params.number)]
      .map(async () => ({
        expired_at: params.expired_at,
        data: couponData,
        id: await genCouponID(),
      })),
  );

  await prisma.coupons.createMany({
    data: createdCoupons,
  });

  return createdCoupons.map((x) =>
    new Coupon({ ...x, created_at: now, expired_at: x.expired_at ?? null, updated_at: now })
  );
};

// ===================================================================
//  Filter
// ===================================================================

const filterDateColumn = ['created_at', 'expired_at'] as const;
const filterStringColumn = ['id', 'data'] as const;

type CouponColumns = (typeof filterDateColumn)[number] | (typeof filterStringColumn)[number];

const couponFilterItemSchema = z.union([
  filterStringItemSchema('id'),
  filterStringItemSchema('data'),
  filterDateItemSchema('created_at'),
  filterDateItemSchema('expired_at'),
]);

type GridCouponFilterItem = z.infer<typeof couponFilterItemSchema>;
type GridCouponFilterModel = GridFilterModel<GridCouponFilterItem>;

/**
 * parse as MUI DataGrid FilterModel
 * @param query DataGrid FilterModel(for Coupons)
 * @returns
 */
export const parseCouponFilterQuery = (query: string): GridFilterModel<GridCouponFilterItem> => {
  const parsed = anyFilterModelSchema(couponFilterItemSchema, parseJSONwithoutErr(query));
  return parsed;
};

const couponFilterQueryToPrismaQuery = (gridFilter: GridCouponFilterModel): Prisma.CouponsWhereInput => {
  const t = gridFilter.items
    .map((x) => {
      switch (x.field) {
        case 'id':
        case 'data':
          return gridFilterToPrismaFilter(x, 'String');
        case 'created_at':
        case 'expired_at':
          return gridFilterToPrismaFilter(x, 'Date');
        default:
          console.log(new ExhaustiveError(x));
      }
    });
  return recordUnion(t);
};

export const getCouponsList = async (params: {
  user_id: string;
  offset: number;
  limit: number;
  orderBy: CouponColumns;
  order: 'asc' | 'desc';
  queryFilter: GridCouponFilterModel;
}): Promise<Coupon[]> => {
  const coupons = await prisma.coupons.findMany({
    skip: params.offset,
    take: params.limit,
    orderBy: { [params.orderBy]: params.order },
    where: {
      ...couponFilterQueryToPrismaQuery(params.queryFilter),
      id: params.user_id,
    },
  });
  return coupons.map((coupon) => new Coupon(coupon));
};

export const getNumberOfCoupons = async (queryFilter?: GridCouponFilterModel): Promise<number> => {
  return await prisma.coupons.count({
    where: {
      ...(queryFilter ? couponFilterQueryToPrismaQuery(queryFilter) : {}),
    },
  });
};

export const getCoupon = async (coupon_id: string): Promise<Coupon | null> => {
  const coupon = await prisma.coupons.findUnique({
    where: {
      id: coupon_id,
    },
  });
  return coupon !== null ? new Coupon(coupon) : null;
};
