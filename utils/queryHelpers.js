export const buildSearchQuery = (search) => {
  if (!search) return {};

  return {
    $or: [
      {
        name: {
          $regex: search,
          $options: "i",
        },
      },
      {
        description: {
          $regex: search,
          $options: "i",
        },
      },
    ],
  };
};

export const buildPriceQuery = (minPrice, maxPrice) => {
  if (!minPrice && !maxPrice) return {};

  const price = {};

  if (minPrice) price.$gte = Number(minPrice);

  if (maxPrice) price.$lte = Number(maxPrice);

  return { price };
};

export const buildAvailabilityQuery = (
  available,
  inStock
) => {
  const query = {};

  if (available !== undefined) {
    query.isAvailable = available === "true";
  }

  if (inStock === "true") {
    query.stock = {
      $gt: 0,
    };
  }

  return query;
};

export const buildMultiValueQuery = (
  field,
  value
) => {
  if (!value) return {};

  return {
    [field]: {
      $in: value
        .split(",")
        .map((item) => item.trim()),
    },
  };
};