export const getPagination = (page, limit) => {
  const currentPage = Math.max(1, Number(page) || 1);
  const perPage = Math.max(1, Number(limit) || 10);

  return {
    page: currentPage,
    limit: perPage,
    skip: (currentPage - 1) * perPage,
  };
};