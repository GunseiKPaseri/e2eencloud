import { Router, Status } from 'tinyserver/deps.ts';
import AuthRouter from './auth.ts';
import FIDO2Router from './auth/fido2.ts';
import CouponRouter from './coupon/coupon.ts';
import FileRouter from './file/file.ts';
import HookRouter from './hook/hook.ts';
import MyUserRouter from './user/my.ts';
import UserRouter from './user/user.ts';

const router = new Router({ prefix: '/api' });

router.use(AuthRouter.routes());
router.use(FIDO2Router.routes());
router.use(CouponRouter.routes());
router.use(FileRouter.routes());
router.use(HookRouter.routes());
router.use(MyUserRouter.routes());
router.use(UserRouter.routes());

router.get('/test', (ctx) => {
  ctx.response.status = Status.OK;
  ctx.response.body = { status: 200 };
  ctx.response.type = 'json';
});

export default router;
