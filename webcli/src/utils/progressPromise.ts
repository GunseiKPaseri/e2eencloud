/**
 * Promise all with progress
 */
export const allProgress = <T>(values: Array<PromiseLike<T>>, callback: (resolved:number, all: number) => void): Promise<Awaited<T>[]> => {
  let cnt = 0
  const all = values.length
  callback(cnt, all)
  const thenFunc = (u:unknown) => {
    callback(cnt, all)
    cnt++
    return u
  }
  values.map(x => x.then(thenFunc))
  return Promise.all(values)
}
