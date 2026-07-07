import Sale from "../models/Sale.js";
import ApiError from "../utils/ApiError.js";
import * as notificationService from "./notification.service.js";
import * as favoriteService from "./favorite.service.js";
import { deleteCache } from "../utils/cache.js";

export const createSale = async (saleData, adminId) => {
  const existingSale = await Sale.findOne({
    admin: adminId,
    startDate: { $lte: saleData.endDate },
    endDate: { $gte: saleData.startDate },
  });

  if (existingSale) {
    throw new ApiError(
      400,
      "Another sale already exists for the selected date range."
    );
  }

  const sale = await Sale.create({
    ...saleData,
    admin: adminId,
  });

  const followers = await favoriteService.getFollowers(adminId);

  await Promise.all(
    followers.map((customer) =>
      notificationService.createNotification({
        sender: adminId,
        receiver: customer._id,
        type: "sale-created",
        title: "New Sale Started",
        message: `${sale.title} is now live.`,
        data: {
          adminId,
          saleId: sale._id,
        },
      })
    )
  );

  await deleteCache(`shop:${adminId}`);

  return sale;
};

export const getMySale = async (adminId) => {
  const sale = await Sale.findOne({
    admin: adminId,
  });

  if (!sale) {
    throw new ApiError(404, "Sale not found");
  }

  return sale;
};

export const updateSale = async (
  saleId,
  adminId,
  updateData
) => {
  const sale = await Sale.findById(saleId);

  if (!sale) {
    throw new ApiError(404, "Sale not found");
  }

  if (sale.admin.toString() !== adminId.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  const newStartDate =
    updateData.startDate ?? sale.startDate;

  const newEndDate =
    updateData.endDate ?? sale.endDate;

  if (newEndDate <= newStartDate) {
    throw new ApiError(
      400,
      "End date must be after start date."
    );
  }

  Object.assign(sale, updateData);

  await sale.save();

  await deleteCache(`shop:${adminId}`);

  return sale;
};

export const deleteSale = async (
  saleId,
  adminId
) => {
  const sale = await Sale.findById(saleId);

  if (!sale) {
    throw new ApiError(404, "Sale not found");
  }

  if (sale.admin.toString() !== adminId.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  await Sale.findByIdAndDelete(saleId);

  await deleteCache(`shop:${adminId}`);
};