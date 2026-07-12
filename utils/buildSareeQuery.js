export const buildSareeQuery = (filters) => {
  const {
    search,
    category,
    fabric,
    color,
    minPrice,
    maxPrice,
    available,
    inStock,
    admin,
  } = filters;

  const query = {};

  // Search
  if (search) {
    query.$or = [
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
    ];
  }

  // Category
  if (category) {
    query.category = category;
  }

  // Fabric
  if (fabric) {
    query.fabric = fabric;
  }

  // Color
  if (color) {
    query.color = color;
  }

  // Price
  if (minPrice || maxPrice) {
    query.price = {};

    if (minPrice) {
      query.price.$gte = Number(minPrice);
    }

    if (maxPrice) {
      query.price.$lte = Number(maxPrice);
    }
  }

  // Availability
  if (available !== undefined) {
    query.isAvailable = available === "true";
  }

  // Stock
  if (inStock === "true") {
    query.stock = {
      $gt: 0,
    };
  }

  // Admin
  if (admin) {
    query.admin = admin;
  }

  return query;
};