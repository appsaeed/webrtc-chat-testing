//get search params as object
export const searchParams = () => {
  const search = location.search.substring(1);
  const params = Object.fromEntries(new URLSearchParams(search));
  return params;
};
