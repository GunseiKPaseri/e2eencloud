import { Router, Status, z } from 'tinyserver/deps.ts';
import {
  deleteUserById,
  getNumberOfUsers,
  getUserById,
  getUsers,
  parseUserFilterQuery,
  userFieldValidate,
} from 'tinyserver/src/model/Users.ts';

const router = new Router();

// users

interface GETuserlistJSON {
  number_of_user: number;
  users: {
    id: string;
    email: string;
    max_capacity: string; // bigint
    file_usage: string; // bigint
    role?: string;
    two_factor_authentication: boolean;
  }[];
}

router.get('/users', async (ctx) => {
  // admin auth
  const uid: string | null = await ctx.state.session.get('uid');
  const user = await getUserById(uid);
  if (!user || user.role !== 'ADMIN') {
    return ctx.response.status = Status.Forbidden;
  }

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
  const orderBy = userFieldValidate(
    ctx.request.url.searchParams.get('orderby'),
  );
  const order = ctx.request.url.searchParams.get('order') === 'desc' ? 'desc' : 'asc';
  const queryFilter = parseUserFilterQuery(
    ctx.request.url.searchParams.get('q') ?? '',
  );

  // get
  const number_of_users = getNumberOfUsers(queryFilter);
  const list = (await getUsers({
    offset,
    limit,
    orderBy,
    order,
    queryFilter,
    select: {
      id: true,
      email: true,
      max_capacity: true,
      file_usage: true,
      role: true,
      tfa_solutions: {
        select: {
          id: true,
        },
      },
    },
  }))
    .flatMap((user): GETuserlistJSON['users'][0][] => ((
        user.id !== undefined &&
        user.email !== undefined &&
        user.max_capacity !== undefined &&
        user.file_usage !== undefined &&
        user.role !== undefined
      )
      ? [{
        id: user.id,
        email: user.email,
        max_capacity: user.max_capacity.toString(),
        file_usage: user.file_usage.toString(),
        role: user.role,
        two_factor_authentication: user.tfa_solutions !== undefined && user.tfa_solutions.length !== 0,
      }]
      : [])
    );

  const result: GETuserlistJSON = {
    number_of_user: await number_of_users,
    users: list,
  };
  ctx.response.status = Status.OK;
  ctx.response.body = result;
  ctx.response.type = 'json';
});

// user list

router.delete('/user/:id', async (ctx) => {
  // admin auth
  const uid: string | null = await ctx.state.session.get('uid');
  const user = await getUserById(uid);
  if (!user || user.role !== 'ADMIN') {
    return ctx.response.status = Status.Forbidden;
  }

  const id = ctx.params.id;

  // can't remove me
  if (user.id === id) return ctx.response.status = Status.BadRequest;

  const result = await deleteUserById(id);
  if (!result.success) return ctx.response.status = Status.BadRequest;
  ctx.response.status = Status.NoContent;
  ctx.response.type = 'json';
});

const PATCHUserScheme = z.object({
  max_capacity: z.preprocess(
    (v) => (typeof v === 'string' ? BigInt(v) : (typeof v === 'bigint' ? v : null)),
    z.bigint(),
  ),
  two_factor_authentication: z.boolean(),
}).partial({
  max_capacity: true,
  two_factor_authentication: true,
});

router.patch('/user/:id', async (ctx) => {
  // admin auth
  const uid: string | null = await ctx.state.session.get('uid');
  const user = await getUserById(uid);
  if (!user || user.role !== 'ADMIN') {
    return ctx.response.status = Status.Forbidden;
  }

  const id = ctx.params.id;

  // validate request
  if (!ctx.request.hasBody) return ctx.response.status = Status.BadRequest;
  const body = ctx.request.body();
  if (body.type !== 'json') return ctx.response.status = Status.BadRequest;

  const parsed = PATCHUserScheme.safeParse(await body.value);
  if (!parsed.success) {
    return ctx.response.status = Status.BadRequest;
  }

  const targetUser = await getUserById(id);
  const result = await targetUser?.patch(parsed.data);

  if (!result) return ctx.response.status = Status.BadRequest;
  ctx.response.status = Status.NoContent;
});

export default router;
