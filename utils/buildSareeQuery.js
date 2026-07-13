import {
  buildAvailabilityQuery,
  buildMultiValueQuery,
  buildPriceQuery,
  buildSearchQuery,
} from "./queryHelpers.js";

export const buildSareeQuery = (
  filters
) => {
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

  return {
    ...buildSearchQuery(search),

    ...buildPriceQuery(
      minPrice,
      maxPrice
    ),

    ...buildAvailabilityQuery(
      available,
      inStock
    ),

    ...buildMultiValueQuery(
      "category",
      category
    ),

    ...buildMultiValueQuery(
      "fabric",
      fabric
    ),

    ...buildMultiValueQuery(
      "color",
      color
    ),

    ...(admin && { admin }),
  };
};