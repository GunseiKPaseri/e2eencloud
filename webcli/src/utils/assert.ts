
/**
 * 要素がstring[]であると確信
 * @param x
 */
export const assertArrayString:
(x: unknown) => asserts x is string[] =
(x) => {
  if (!Array.isArray(x)) {
    throw new Error('This is not Array!!')
  }
  if (!x.every(x => typeof x === 'string')) {
    throw new Error('This is not string[]')
  }
}

/**
 * 要素がnumber[]であると確信
 */
export const assertArrayNumber:
  (x: unknown) => asserts x is number[] =
  (x) => {
    if (!Array.isArray(x)) {
      throw new Error('This is not Array!!')
    }
    if (!x.every(x => typeof x === 'number')) {
      throw new Error('This is not number[]')
    }
  }

/**
* 要素がnullでもundefinedでもないと確信
*/
export const assertNotNull:
  <T>(x: T | null | undefined) => asserts x is T =
  (x) => {
    if (x === undefined || x === null) {
      throw new Error(`This(${x}) is bad!!`)
    }
  }
