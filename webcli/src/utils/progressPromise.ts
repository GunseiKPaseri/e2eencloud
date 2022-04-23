/**
 * Promise all with progress
 */
export const allProgress = <T>(values: Array<Promise<T>>, callback: (resolved:number, rejected: number, all: number) => void): Promise<(Awaited<T>|null)[]> => {
  let resolvecnt = 0
  let rejectcnt = 0
  const all = values.length
  callback(resolvecnt, rejectcnt, all)
  const thenFunc = (u:T) => {
    resolvecnt++
    callback(resolvecnt, rejectcnt, all)
    return u
  }
  const rejectFunc = (u:unknown) => {
    rejectcnt++
    callback(resolvecnt, rejectcnt, all)
    return Promise.resolve(null)
  }
  return Promise.all(
    values.map(x => x.then(thenFunc, rejectFunc))
  )
}
