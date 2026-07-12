export const buildSortQuery = (sort) => {
  switch (sort) {
    case "price_asc":
      return { price: 1 };

    case "price_desc":
      return { price: -1 };

    case "name_asc":
      return { name: 1 };

    case "name_desc":
      return { name: -1 };

    case "oldest":
      return { createdAt: 1 };

    case "newest":
    default:
      return { createdAt: -1 };
  }
};