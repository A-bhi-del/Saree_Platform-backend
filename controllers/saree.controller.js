import { updateSareeSchema } from "../validators/saree.validator.js";
import * as sareeService from "../services/saree.service.js";
import { createSareeSchema } from "../validators/saree.validator.js";

export const createSaree = async (req, res, next) => {
    try {
        const validatedData = createSareeSchema.parse(req.body);

        const saree = await sareeService.createSaree({
            ...validatedData,
            admin: req.user._id,
        });

        res.status(201).json({
            success: true,
            message: "Saree created successfully",
            data: saree,
        });
    } catch (error) {
        next(error);
    }
};

export const getAllSarees = async (req, res, next) => {
    try {
        const page = req.query.page;
        const limit = req.query.limit;

        const result = await sareeService.getAllSarees(page, limit);

        res.status(200).json({
            success: true,
            data: result.sarees,
            pagination: result.pagination,
        });
    } catch (error) {
        next(error);
    }
};

export const getSareeById = async (req, res, next) => {
    try {
        const saree = await sareeService.getSareeByID(req.params.id);

        res.status(200).json({
            success: true,
            data: saree,
        });
    } catch (error) {
        next(error);
    }
};


export const updateSaree = async (req, res, next) => {
    try {
        const validatedData = updateSareeSchema.parse(req.body);

        const saree = await sareeService.updateSaree(
            req.params.id,
            req.user._id,
            validatedData
        );

        res.status(200).json({
            success: true,
            message: "Saree updated successfully",
            data: saree,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteSaree = async (req, res, next) => {
    try {
        await sareeService.deleteSaree(req.params.id, req.user._id);

        res.status(200).json({
            success: true,
            message: "Saree deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};