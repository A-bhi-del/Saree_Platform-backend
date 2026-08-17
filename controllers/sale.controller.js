import * as saleService from "../services/sale.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

import {
    createSaleSchema,
    updateSaleSchema,
} from "../validators/sale.validator.js";

export const createSale = asyncHandler(async (req, res, next) => {
    const validatedData = createSaleSchema.parse(req.body);

    const sale = await saleService.createSale(
        validatedData,
        req.user._id
    );

    return res.status(201).json(
        new ApiResponse(
            200,
            "Sale created successfully",
            sale
        )
    );
})

export const getMySale = asyncHandler(async (req, res, next) => {
    const sale = await saleService.getMySale(
        req.user._id
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Sale fetched successfully",
            sale
        )
    );
})

export const updateSale = asyncHandler(async (req, res, next) => {
    const validatedData = updateSaleSchema.parse(req.body);

    const sale = await saleService.updateSale(
        req.params.id,
        req.user._id,
        validatedData
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Sale updated successfully",
            sale
        )
    );
})

export const deleteSale = asyncHandler(async (req, res, next) => {
    await saleService.deleteSale(
        req.params.id,
        req.user._id
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Sale deleted successfully"
        )
    );
})

export const getActiveSales = asyncHandler(async (req, res, next) => {
    const sales = await saleService.getActiveSales();

    return res.status(200).json(
        new ApiResponse(
            200,
            "Sales fetched successfully",
            sales
        )
    );
})