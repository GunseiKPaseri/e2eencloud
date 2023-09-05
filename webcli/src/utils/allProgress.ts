/**
 * Promise all with progress
 */
const allProgress = <T>(
  values: Promise<T>[],
  callback: (resolved: number, rejected: number, all: number) => void,
): Promise<(Awaited<T> | null)[]> => {
  let resolvecnt = 0;
  let rejectcnt = 0;
  const all = values.length;
  callback(resolvecnt, rejectcnt, all);
  const thenFunc = (u: T) => {
    resolvecnt += 1;
    callback(resolvecnt, rejectcnt, all);
    return u;
  };
  const rejectFunc = () => {
    rejectcnt += 1;
    callback(resolvecnt, rejectcnt, all);
    return Promise.resolve(null);
  };
  return Promise.all(values.map((x) => x.then(thenFunc, rejectFunc)));
};

export default allProgress;
