import Saree from "../models/Saree.js";
import ApiError from "../utils/ApiError.js";
import { getPagination } from "../utils/pagination.js";
import * as notificationService from "./notification.service.js";
import * as favoriteService from "./favorite.service.js";
import { deleteCache } from "../utils/cache.js";

export const createSaree = async (sareeData) => {
  const saree = await Saree.create(sareeData);

  const followers = await favoriteService.getFollowers(
    saree.admin
  );

  await Promise.all(
    followers.map((customer) =>
      notificationService.createNotification({
        sender: saree.admin,
        receiver: customer._id,
        type: "new-saree",
        title: "New Saree Added",
        message: `${saree.name} has been added.`,
        data: {
          adminId: saree.admin,
          sareeId: saree._id,
        },
      })
    )
  );

  await deleteCache(`shop:${saree.admin}`);

  return saree;
};

export const getAllSarees = async (page, limit) => {
  const {
    skip,
    page: currentPage,
    limit: perPage,
  } = getPagination(page, limit);

  const [sarees, total] = await Promise.all([
    Saree.find()
      .populate(
        "admin",
        "name email profileImage"
      )
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

  if (!saree) {
    throw new ApiError(
      404,
      "Saree not found"
    );
  }

  return saree;
};

export const updateSaree = async (
  id,
  userId,
  updateData
) => {
  const saree = await Saree.findById(id);

  if (!saree) {
    throw new ApiError(
      404,
      "Saree not found"
    );
  }

  if (
    saree.admin.toString() !==
    userId.toString()
  ) {
    throw new ApiError(
      403,
      "Unauthorized"
    );
  }

  const updatedSaree =
    await Saree.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

  await deleteCache(`shop:${userId}`);

  return updatedSaree;
};

export const deleteSaree = async (
  id,
  userId
) => {
  const saree = await Saree.findById(id);

  if (!saree) {
    throw new ApiError(
      404,
      "Saree not found"
    );
  }

  if (
    saree.admin.toString() !==
    userId.toString()
  ) {
    throw new ApiError(
      403,
      "Unauthorized"
    );
  }

  const deletedSaree =
    await Saree.findByIdAndDelete(id);

  await deleteCache(`shop:${userId}`);

  return deletedSaree;
};