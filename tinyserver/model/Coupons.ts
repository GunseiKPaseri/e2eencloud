import { compareAsc, Order, Query, replaceParams, Where, z } from '../deps.ts';
import client from '../dbclient.ts';
import {
  easyIsFilterItem,
  FilterDateItem,
  filterModelToSQLWhereObj,
  FilterStringItem,
  GridFilterModel,
  isFilterStringItem,
} from '../utils/dataGridFilter.ts';
import { ExhaustiveError } from '../util.ts';
import { isFilterDateItem } from '../utils/dataGridFilter.ts';
import parseJSONwithoutErr from '../utils/parseJSONWithoutErr.ts';
import { User } from './Users.ts';
import { bs58CheckEncode } from '../utils/bs58check.ts';

export const couponScheme = z.union([
  z.object({
    method: z.literal('ADD_CAPACITY'),
    value: z.number().min(0),
  }),
  z.object({
    method: z.literal('NONE'),
  }),
]);

export type CouponData = z.infer<typeof couponScheme>;

interface SQLTableCoupon {
  id: string;
  data: string | CouponData;
  created_at: Date;
  expired_at: Date | null;
}

export const parseCouponData = (target: string | unknown): CouponData | null => {
  const object = (typeof target === 'string' ? parseJSONwithoutErr(target) : target);
  try {
    return couponScheme.parse(object);
  } catch (_) {
    return null;
  }
};

export class Coupon {
  readonly id: string;
  readonly created_at: Date;
  #data: CouponData;
  #expired_at: Date | null;
  #used: boolean;
  constructor(coupon: SQLTableCoupon) {
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
    await client.execute(
      `UPDATE coupons SET expired_at = ? WHERE id = ?`,
      [
        params.expired_at === undefined ? this.#expired_at : params.expired_at,
        this.id,
      ],
    );
    if (params.expired_at !== undefined) this.#expired_at = params.expired_at;
    return true;
  }

  async delete() {
    const result = await client.execute(`DELETE FROM coupons WHERE id = ?`, [
      this.id,
    ]);

    return result.affectedRows && result.affectedRows > 0 ? true : false;
  }

  async use(user: User) {
    if (this.#used || (this.#expired_at && compareAsc(new Date(), this.#expired_at) > 0)) return false;
    this.#used = true;
    switch (this.#data.method) {
      case 'ADD_CAPACITY':
        await user.patch({ max_capacity: user.max_capacity + this.#data.value });
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

  const couponData = JSON.stringify(params.coupon);

  const createdCoupons = await Promise.all(
    [...Array(params.number)]
      .map(async () => ({
        expired_at: params.expired_at,
        data: couponData,
        id: await genCouponID(),
      })),
  );

  const fields = ['id', 'data', 'expired_at'] as const;
  const values = createdCoupons.map((row) => fields.map((key) => row[key]));
  const insertquery = replaceParams(
    `INSERT INTO ?? ?? VALUES ${Array(createdCoupons.length).fill('?').join()}`,
    ['coupons', fields, ...values],
  );

  console.log(insertquery);
  await client.execute(insertquery);

  return createdCoupons.map((x) => new Coupon({ ...x, created_at: now, expired_at: x.expired_at ?? null }));
};

const couponFields = ['id', 'created_at', 'data', 'expired_at'] as const;
type CouponField = typeof couponFields[number];
const isCouponField = (field: string): field is CouponField => {
  return couponFields.some((value) => value === field);
};
export const couponFieldValidate = (
  field: unknown,
): CouponField => (typeof field === 'string' ? (isCouponField(field) ? field : 'created_at') : 'created_at');

type GridCouponFilterItem =
  | FilterStringItem<'id' | 'data'>
  | FilterDateItem<'created_at' | 'expired_at'>;
type GridCouponFilterModel = GridFilterModel<GridCouponFilterItem>;
const isGridCouponFilterItem = (item: unknown): item is GridCouponFilterItem => {
  if (!easyIsFilterItem<GridCouponFilterItem['columnField']>(item)) return false;
  switch (item.columnField) {
    case 'id':
    case 'data':
      return isFilterStringItem<'id' | 'data'>(item);
    case 'created_at':
    case 'expired_at':
      return isFilterDateItem<'created_at' | 'expired_at'>(item);
    default:
      console.log(new ExhaustiveError(item));
      return false;
  }
};

/**
 * parse as MUI DataGrid FilterModel
 * @param query DataGrid FilterModel(for Users)
 * @returns
 */
export const parseCouponFilterQuery = (query: string): GridCouponFilterModel => {
  const parsed = parseJSONwithoutErr(query);
  const linkOperator = parsed.linkOperator === 'or' ? 'or' : 'and';
  if (!Array.isArray(parsed.items)) return { items: [], linkOperator: 'and' };
  const items = parsed.items.filter((x): x is GridCouponFilterItem => (
    isGridCouponFilterItem(x) && (x.columnField !== 'data')
  ));
  return { items, linkOperator };
};

export const getCouponsList = async (params: {
  user_id: number;
  offset: number;
  limit: number;
  orderBy: CouponField;
  order: 'asc' | 'desc';
  queryFilter: GridCouponFilterModel;
}): Promise<Coupon[]> => {
  const whereobj = filterModelToSQLWhereObj(params.queryFilter);
  const query = (new Query())
    .select('*')
    .table('coupons')
    .limit(params.offset, params.limit)
    .order(Order.by(params.orderBy)[params.order])
    // If there is no condition, remove the WHERE clause.
    .where(Where.and(
      whereobj.value !== '()' ? whereobj : null,
      Where.eq('user_id', params.user_id),
    ))
    .build();

  const coupons: SQLTableCoupon[] = await client.query(query);
  return coupons.map((coupon) => new Coupon(coupon));
};

export const getNumberOfCoupons = async (user_id: number, queryFilter?: GridCouponFilterModel): Promise<number> => {
  const query = `SELECT COUNT(*) FROM coupons WHERE ${
    filterModelToSQLWhereObj(queryFilter, [Where.eq('user_id', user_id)]).value
  }`;
  const [result]: [{ 'COUNT(*)': number }] = await client.query(query, [
    user_id,
  ]);
  return result['COUNT(*)'];
};

export const getCoupon = async (couponid: string): Promise<Coupon | null> => {
  const coupon: [SQLTableCoupon] | [] = await client.query(
    `SELECT * FROM coupons WHERE id = ?`,
    [couponid],
  );
  return coupon.length === 1 ? new Coupon(coupon[0]) : null;
};
