// 交差型を展開
export type Expand<T> = T extends Record<string, unknown> ? T extends infer O ? { [K in keyof O]: Expand<O[K]> }
  : never
  : T;

// 共用体型定義を交差型定義に
export type Intersectionize<T> = (T extends unknown ? (_: T) => void : never) extends (
  _: infer R,
) => void ? R
  : never;

// 配列で与えられる複数のRecordを一つに（修正が必要）
export const recordUnion = <T extends (Record<string, unknown> | undefined | null)[]>(records: T) =>
  records.reduce((prev, cur) => ({ ...prev, ...cur }), {} as const) as Expand<Intersectionize<NonNullable<T[number]>>>;

export class ExhaustiveError extends Error {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  constructor(value: never, message = `Unsupported type: ${value}`) {
    super(message);
  }
}
