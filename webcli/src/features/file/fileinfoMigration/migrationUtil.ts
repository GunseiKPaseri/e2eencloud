import type * as z from 'zod';

const schemaForType =
  <T>() =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  <S extends z.ZodType<T, any, any>>(arg: S) =>
    arg;

export default schemaForType;
