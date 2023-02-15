import type * as z from 'zod';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const schemaForType = <T>() => <S extends z.ZodType<T, any, any>>(arg: S) => arg;

export default schemaForType;
