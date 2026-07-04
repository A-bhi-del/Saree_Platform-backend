import Sale from "../models/Sale.js";
import ApiError from "../utils/ApiError.js";

export const createSale = async (saleData, adminId) => {
    const today = new Date();
    const existingSale = await Sale.findOne({
        admin: adminId,
        startDate: { $lte: saleData.endDate },
        endDate: { $gte: saleData.startDate },
    });

    if (existingSale) {
        throw new ApiError(
            400,
            "You already have an active sale."
        );
    }

    const sale = await Sale.create({
        ...saleData,
        admin: adminId,
    });

    return sale;
};

export const getMySale = async (adminId) => {
    const sale = await Sale.findOne({
        admin: adminId,
    });

    if (!sale) {
        throw new ApiError(
            404,
            "Sale not found"
        );
    }
    return sale;
};


export const updateSale = async (
    saleId,
    adminId,
    updateData
) => {
    const sale = await Sale.findById(saleId);
    const newStartDate = updateData.startDate ?? sale.startDate;
    const newEndDate = updateData.endDate ?? sale.endDate;

    if (newEndDate <= newStartDate) {
        throw new ApiError(400, "End date must be after start date");
    }

    if (!sale) {
        throw new ApiError(
            404,
            "Sale not found"
        );
    }

    if (sale.admin.toString() !== adminId.toString()) {
        throw new ApiError(
            403,
            "Unauthorized"
        );
    }

    Object.assign(sale, updateData);
    await sale.save();
    return sale;
};

export const deleteSale = async (
    saleId,
    adminId
) => {
    const sale = await Sale.findById(saleId);
    if (!sale) {
        throw new ApiError(
            404,
            "Sale not found"
        );
    }

    if (sale.admin.toString() !== adminId.toString()) {
        throw new ApiError(
            403,
            "Unauthorized"
        );
    }

    await Sale.findByIdAndDelete(saleId);
};