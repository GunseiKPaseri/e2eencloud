import { Router } from '../deps.ts';
import AuthRouter from './auth.ts';
import CouponRouter from './coupon/coupon.ts';
import FileRouter from './file/file.ts';
import HookRouter from './hook/hook.ts';
import MyUserRouter from './user/my.ts';
import UserRouter from './user/user.ts';

const router = new Router({ prefix: '/api' });

router.use(AuthRouter.routes());
router.use(CouponRouter.routes());
router.use(FileRouter.routes());
router.use(HookRouter.routes());
router.use(MyUserRouter.routes());
router.use(UserRouter.routes());

export default router;
