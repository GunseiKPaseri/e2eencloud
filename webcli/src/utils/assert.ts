/**
 * 要素がnullでもundefinedでもないと確信
 */
export const assertNotNull: <T>(x: T | null | undefined) => asserts x is T = (
  x,
) => {
  if (x === undefined || x === null) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new Error(`This(${x}) is bad!!`);
  }
};

/**
 * 要素が指定文字列と確信
 */
export const assertString: <T extends string, U extends string>(
  x: T | U,
  y: U,
) => asserts x is U = (x, y) => {
  if (x !== y) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new Error(`This(${x}) is bad!!`);
  }
};

/**
 * 場合分け不備（neverにならない）でエラー
 */
export class ExhaustiveError extends Error {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  constructor(value: never, message = `Unsupported type: ${value}`) {
    super(message);
  }
}

/**
 * 交差型を展開
 */
export type Expand<T> = T extends object
  ? T extends infer O
    ? { [K in keyof O]: Expand<O[K]> }
    : never
  : T;

type KeyOfUnion<T> = T extends T ? keyof T : never;

// 分配的なOmit
export type DistributiveOmit<T, K extends KeyOfUnion<T>> = T extends T
  ? Omit<T, K>
  : never;
