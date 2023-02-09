// 共用体型定義を交差型定義に
export type Intersectionize<T> = (T extends unknown ? (_: T) => void : never) extends (
  _: infer R,
) => void ? R
  : never;

// 配列で与えられる複数のRecordを一つに（修正が必要）
export const recordUnion = <T extends (Record<string, unknown> | undefined | null)[]>(records: T) =>
  records.reduce((prev, cur) => ({ ...prev, ...cur }), {} as const) as Intersectionize<NonNullable<T[number]>>;
