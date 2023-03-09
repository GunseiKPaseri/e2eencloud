import { trpc, z } from '../../deps.ts';

const t = trpc.initTRPC.create();
const router = t.router;
const publicProcedure = t.procedure;

interface Something {
  id: number;
  name: string;
}

export const appRouter = router({
  helloWorld: publicProcedure.query((req) => {
    return 'HELLO WORLD';
  }),
  createSomething: publicProcedure.input(z.object({ name: z.string() }))
    .mutation((req) => {
      const s = Math.random();
      const sm: Something = { id: s, name: req.input.name };
      return sm;
    }),
});

export type AppRouter = typeof appRouter;
