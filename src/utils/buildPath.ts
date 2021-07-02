export const buildPath = (queryParams: Record<string, string | number | boolean | undefined>) =>
  Object.keys(queryParams).reduce(
    (p, key) =>
      queryParams[key] !== undefined
        ? p.length === 1
          ? p + `${key}=${encodeURIComponent(queryParams[key]!)}`
          : p + `&${key}=${encodeURIComponent(queryParams[key]!)}`
        : p + '',
    '?',
  );
