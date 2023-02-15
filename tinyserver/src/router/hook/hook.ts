import { compareAsc, Router, Status, z } from 'tinyserver/deps.ts';
import { deleteUserById, getUserById } from 'tinyserver/src/model/Users.ts';
import {
  addHook,
  getHook,
  getHooksList,
  getNumberOfHooks,
  HookData,
  hookScheme,
  hooksColumnsSchema,
  parseHookFilterQuery,
} from 'tinyserver/src/model/Hooks.ts';
import { ExhaustiveError } from 'tinyserver/src/utils/typeUtil.ts';

const router = new Router();

// hook

const POSTHooksScheme = z.object({
  name: z.string(),
  data: hookScheme,
  expired_at: z.string(),
}).partial({
  expired_at: true,
});
interface POSThooksJSON {
  name: string;
  data: HookData;
  expired_at?: string;
}

router.post('/hooks', async (ctx) => {
  const uid: string | null = await ctx.state.session.get('uid');
  const user = await getUserById(uid);
  if (!user) return ctx.response.status = Status.Forbidden;
  if (!ctx.request.hasBody) return ctx.response.status = Status.BadRequest;
  const body = ctx.request.body();
  if (body.type !== 'json') return ctx.response.status = Status.BadRequest;
  // validate
  const parsed = POSTHooksScheme.safeParse(await body.value);
  if (!parsed.success || parsed.data.data.method === 'NONE') {
    return ctx.response.status = Status.BadRequest;
  }
  const bodyvalue = parsed.data;
  const data = bodyvalue.data;

  const result = await addHook({
    name: bodyvalue.name,
    data,
    user_id: user.id,
    expired_at: bodyvalue.expired_at ? new Date(bodyvalue.expired_at) : undefined,
  });
  ctx.response.status = Status.OK;
  ctx.response.body = result.value();
  ctx.response.type = 'json';
});

router.get('/hooks', async (ctx) => {
  const uid: string | null = await ctx.state.session.get('uid');
  const user = await getUserById(uid);
  if (!user) return ctx.response.status = Status.Forbidden;
  // validate
  const prmoffset: number = parseInt(
    ctx.request.url.searchParams.get('offset') ?? '0',
    10,
  );
  const prmlimit: number = parseInt(
    ctx.request.url.searchParams.get('limit') ?? '10',
    10,
  );
  const offset = isNaN(prmoffset) ? 0 : prmoffset;
  const limit = isNaN(prmlimit) ? 10 : prmlimit;
  const orderBy = hooksColumnsSchema.default('name').parse(ctx.request.url.searchParams.get('orderby') ?? undefined);

  const order = ctx.request.url.searchParams.get('order') === 'desc' ? 'desc' : 'asc';
  const queryFilter = {
    ...parseHookFilterQuery(
      ctx.request.url.searchParams.get('q') ?? '',
    ),
    user_id: user.id,
  };

  const [list, getSizeOfHooks] = await Promise.all([
    getHooksList({
      user_id: user.id,
      offset,
      limit,
      order,
      orderBy,
      queryFilter,
      select: {
        id: true,
        created_at: true,
        name: true,
        data: true,
        expired_at: true,
      },
    }),
    getNumberOfHooks(queryFilter),
  ]);
  const result = {
    number_of_hook: getSizeOfHooks,
    hooks: list.map((x) => {
      const data = x.data as unknown;
      if (typeof data === 'string') {
        return { ...x, data: JSON.parse(data as string) };
      } else {
        return { ...x, data: { method: 'NONE' } };
      }
    }),
  };

  ctx.response.status = Status.OK;
  ctx.response.body = result;
  ctx.response.type = 'json';
});

router.post('/hook/:id', async (ctx) => {
  const hook = await getHook(ctx.params.id);
  console.log(hook?.value());
  if (
    !hook ||
    (hook.expired_at && compareAsc(hook.expired_at, new Date(Date.now())) < 0)
  ) {
    return ctx.response.status = Status.Forbidden;
  }

  switch (hook.data.method) {
    case 'USER_DELETE': {
      const result = await deleteUserById(
        typeof hook.user_id === 'string' ? hook.user_id : hook.user_id.id,
      );
      if (!result.success) return ctx.response.status = Status.BadRequest;
      break;
    }
    case 'NONE': {
      break;
    }
    default:
      throw new ExhaustiveError(hook.data);
  }

  ctx.response.status = Status.OK;
});

interface PATCHHookJSON {
  name?: string;
  expired_at?: string | null;
}

const PATCHHookScheme = z.object({
  name: z.string(),
  expired_at: z.string().nullable(),
}).partial();

router.patch('/hook/:id', async (ctx) => {
  // hook
  const hook = await getHook(ctx.params.id);
  if (!hook) return ctx.response.status = Status.NotFound;
  // auth
  const uid: string | null = await ctx.state.session.get('uid');
  const user = await getUserById(uid);
  if (!user) return ctx.response.status = Status.Unauthorized;
  if (user.id !== hook.user_id) return ctx.response.status = Status.Forbidden;

  // validate request
  if (!ctx.request.hasBody) return ctx.response.status = Status.BadRequest;
  const body = ctx.request.body();
  if (body.type !== 'json') return ctx.response.status = Status.BadRequest;

  const parsed = PATCHHookScheme.safeParse(await body.value);

  if (!parsed.success) {
    return ctx.response.status = Status.BadRequest;
  }

  const bodyvalue = parsed.data;

  const result = await hook.patch({
    ...bodyvalue,
    expired_at: (
      bodyvalue.expired_at === undefined || bodyvalue.expired_at === null
        ? bodyvalue.expired_at
        : new Date(bodyvalue.expired_at)
    ),
  });

  if (!result) return ctx.response.status = Status.BadRequest;
  ctx.response.status = Status.NoContent;
});

router.delete('/hook/:id', async (ctx) => {
  const hook = await getHook(ctx.params.id);
  if (!hook) return ctx.response.status = Status.NotFound;
  // auth
  const uid: string | null = await ctx.state.session.get('uid');
  const user = await getUserById(uid);
  if (!user) return ctx.response.status = Status.Unauthorized;
  if (user.id !== hook.user_id) return ctx.response.status = Status.Forbidden;

  const result = await hook.delete();

  if (!result) return ctx.response.status = Status.BadRequest;

  ctx.response.status = Status.OK;
});

export default router;
