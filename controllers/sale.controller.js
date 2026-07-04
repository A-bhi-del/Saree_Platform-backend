import * as saleService from "../services/sale.service.js";

import {
    createSaleSchema,
    updateSaleSchema,
} from "../validators/sale.validator.js";

export const createSale = async (req, res, next) => {
    try {
        const validatedData = createSaleSchema.parse(req.body);

        const sale = await saleService.createSale(
            validatedData,
            req.user._id
        );

        res.status(201).json({
            success: true,
            message: "Sale created successfully",
            data: sale,
        });
    } catch (error) {
        next(error);
    }
};

export const getMySale = async (req, res, next) => {
    try {
        const sale = await saleService.getMySale(
            req.user._id
        );

        res.status(200).json({
            success: true,
            data: sale,
        });
    } catch (error) {
        next(error);
    }
};

export const updateSale = async (req, res, next) => {
    try {
        const validatedData = updateSaleSchema.parse(req.body);

        const sale = await saleService.updateSale(
            req.params.id,
            req.user._id,
            validatedData
        );

        res.status(200).json({
            success: true,
            message: "Sale updated successfully",
            data: sale,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteSale = async (req, res, next) => {
    try {
        await saleService.deleteSale(
            req.params.id,
            req.user._id
        );

        res.status(200).json({
            success: true,
            message: "Sale deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};