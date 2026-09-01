import Saree from "../models/Saree.js";
import ApiError from "../utils/ApiError.js";
import { getPagination } from "../utils/pagination.js";
import * as notificationService from "./notification.service.js";
import * as favoriteService from "./favorite.service.js";
import { deleteCache } from "../utils/cache.js";
import { buildSortQuery } from "../utils/buildSortQuery.js";
import { buildSareeQuery } from "../utils/buildSareeQuery.js";
import User from "../models/User.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";

export const createSaree = async (sareeData, files) => {
  if (!files || files.length === 0) {
    return res.status(400).json({
      success: false,
      message: "At least one image is required",
    });
  }

  const uploadedImages = await Promise.all(
    files.map((file) =>
      uploadToCloudinary(file, "my_app/sarees")
    )
  );

  const images = uploadedImages.map((image) => ({
    url: image.secure_url,
    publicId: image.public_id,
  }));

  const saree = await Saree.create({ ...sareeData, images });

  notificationService.createNotification({
    sender: saree.admin,
    type: "new-saree",
    title: "New Saree Added",
    message: `${saree.name} has been added.`,
    route: "/sarees",
    data: {
      adminId: saree.admin,
      sareeId: saree._id,
    },
  });

  await deleteCache(`shop:${saree.admin}`);

  return saree;
};

export const getAllSarees = async (filters) => {
  const { page, limit, sort, admin } = filters;
  const { skip, page: currentPage, limit: perPage } = getPagination(page, limit);
  let query = buildSareeQuery(filters);

  if (admin) {
    query.admin = admin;
  }

  const [sarees, total] = await Promise.all([
    Saree.find(query)
      .populate("admin", "name email profileImage")
      .sort(buildSortQuery(sort))
      .skip(skip)
      .limit(perPage)
      .lean(),

    Saree.countDocuments(query),
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

export const getRelatedSarees = async (
  sareeId
) => {
  const saree = await Saree.findById(sareeId);

  if (!saree) {
    throw new ApiError(
      404,
      "Saree not found"
    );
  }

  const related = await Saree.find({
    _id: {
      $ne: saree._id,
    },

    isAvailable: true,

    $or: [
      {
        category: saree.category,
      },
      {
        fabric: saree.fabric,
      },
    ],
  })
    .populate(
      "admin",
      "name profileImage"
    )
    .limit(8)
    .lean();

  return related;
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
  updateData,
  files = []
) => {
  const saree = await Saree.findById(id);

  if (!saree) {
    throw new ApiError(404, "Saree not found");
  }

  if (
    saree.admin.toString() !==
    userId.toString()
  ) {
    throw new ApiError(403, "Unauthorized");
  }

  const oldDiscountPercentage =
    saree.discountPercentage;

  if (saree.images.length + files.length > 6) {
    throw new ApiError(
      400,
      `Maximum 6 images allowed. You already have ${saree.images.length} images.`
    );
  }

  if (files.length > 0) {
    const uploadedImages = await Promise.all(
      files.map((file) =>
        uploadToCloudinary(
          file,
          "my_app/sarees"
        )
      )
    );

    const newImages = uploadedImages.map(
      (image) => ({
        url: image.secure_url,
        publicId: image.public_id,
      })
    );

    saree.images.push(...newImages);
  }

  Object.assign(saree, updateData);
  const updatedSaree = await saree.save();
  await deleteCache(`shop:${userId}`);

  if (
    updatedSaree.discountPercentage !==
    oldDiscountPercentage
  ) {
    notificationService.createNotification({
      sender: saree.admin,
      type: "Discount Updated",
      title: "Something about saree has been updated",
      message: `${saree.name} has been updated.`,
      route: "/sarees",
      data: {
        adminId: saree.admin,
        sareeId: saree._id,
      },
    });
  }

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

