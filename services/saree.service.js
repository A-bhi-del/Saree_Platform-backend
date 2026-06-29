import Saree from "../models/Saree.js";
import { getPagination } from "../utils/pagination.js";

export const createSaree = async (sareeData) => {
  const newSaree = await Saree.create(sareeData);
  return newSaree;
};

export const getAllSarees = async (page, limit) => {

  const { skip, page: currentPage, limit: perPage } =
    getPagination(page, limit);

  const [sarees, total] = await Promise.all([
    Saree.find()
      .populate("admin", "name email profileImage")
      .skip(skip)
      .limit(perPage),

    Saree.countDocuments(),
  ]);

  return {
    sarees,

    pagination: {
      page: currentPage,
      limit: perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    },
  };
};

export const getSareeByID = async (id) => {
  const saree = await Saree.findById(id).populate(
    "admin",
    "name email profileImage"
  );

  return saree;
};

export const updateSaree = async (id, userId, updateData) => {
  const saree = await Saree.findById(id);

  if (!saree) {
    throw new Error("Saree not found");
  }

  if (saree.admin.toString() !== userId.toString()) {
    throw new Error("You are not allowed to update this saree");
  }

  return await Saree.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
};

export const deleteSaree = async (id, userId) => {
  const saree = await Saree.findById(id);

  if (!saree) {
    throw new Error("Saree not found");
  }

  if (saree.admin.toString() !== userId.toString()) {
    throw new Error("You are not allowed to delete this saree");
  }

  return await Saree.findByIdAndDelete(id);
};