const parseJSONwithoutErr = (query: string): Record<string, unknown> => {
  try {
    return JSON.parse(query);
  } catch {
    return {};
  }
};

export default parseJSONwithoutErr;
