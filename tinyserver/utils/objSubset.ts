export const pick = <T extends Record<string, unknown>, U extends (keyof T)[]>(obj: T, word: U): Pick<T, U[number]> => {
  const s = new Set(word);
  return Object.fromEntries(Object.entries(obj).filter((x) => s.has(x[0]))) as Pick<T, U[number]>;
};

export const omit = <T extends Record<string, unknown>, U extends (keyof T)[]>(obj: T, word: U): Omit<T, U[number]> => {
  const s = new Set(word);
  return Object.fromEntries(Object.entries(obj).filter((x) => !s.has(x[0]))) as Omit<T, U[number]>;
};
