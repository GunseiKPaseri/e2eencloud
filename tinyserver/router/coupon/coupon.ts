import { Router, Status, z } from '../../deps.ts';
import { getUserById } from '../../model/Users.ts';

import { addCoupon, couponScheme, getCoupon } from '../../model/Coupons.ts';

const router = new Router();

const PUTCouponScheme = z.object({
  coupon: couponScheme,
  number: z.number().min(1),
});

router.post('/coupons', async (ctx) => {
  // auth only admin
  const uid: string | null = await ctx.state.session.get('uid');
  const user = await getUserById(uid);
  if (!user || user.role !== 'ADMIN') {
    return ctx.response.status = Status.Forbidden;
  }
  // validate request
  if (!ctx.request.hasBody) return ctx.response.status = Status.BadRequest;
  const body = ctx.request.body();
  if (body.type !== 'json') return ctx.response.status = Status.BadRequest;

  const parsed = PUTCouponScheme.safeParse(await body.value);
  if (!parsed.success) {
    return ctx.response.status = Status.BadRequest;
  }

  const result = await addCoupon({ ...parsed.data });

  ctx.response.status = Status.Created;
  ctx.response.body = {
    coupons_id: result.map((x) => x.id),
  };
});

const CouponsUseScheme = z.object({
  couponid: z.string(),
});

router.post('/coupons/use', async (ctx) => {
  // auth only user
  const uid: string | null = await ctx.state.session.get('uid');
  const user = await getUserById(uid);
  if (!user) return ctx.response.status = Status.Forbidden;

  // parse
  if (!ctx.request.hasBody) return ctx.response.status = Status.BadRequest;
  const body = ctx.request.body();
  if (body.type !== 'json') return ctx.response.status = Status.BadRequest;

  const parsed = CouponsUseScheme.safeParse(await body.value);
  if (!parsed.success) {
    return ctx.response.status = Status.BadRequest;
  }

  // getcoupon

  const coupon = await getCoupon(parsed.data.couponid);

  if (coupon === null) return ctx.response.status = Status.BadRequest;

  const result = await coupon.use(user);

  if (!result) return ctx.response.status = Status.BadRequest;
  ctx.response.status = Status.NoContent;
});

export default router;
