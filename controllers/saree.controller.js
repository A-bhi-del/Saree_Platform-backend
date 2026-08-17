import * as sareeService from "../services/saree.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { createSareeSchema, updateSareeSchema } from "../validators/saree.validator.js";

export const createSaree = asyncHandler(async (req, res, next) => {
  const validatedData = createSareeSchema.parse(req.body);

  const saree = await sareeService.createSaree({
    ...validatedData,
    admin: req.user._id,
  });

  return res.status(201).json(
    new ApiResponse(
      200,
      "Saree created successfully",
      saree
    )
  );
})

export const updateSaree = asyncHandler(async (req, res, next) => {
  const validatedData = updateSareeSchema.parse(req.body);
  const saree = await sareeService.updateSaree(
    req.params.id,
    req.user._id,
    validatedData
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      "Saree updated successfully",
      saree
    )
  );
})

export const getAllSarees = asyncHandler(async (req, res, next) => {
  const filters = { ...req.query };

  if (req.user.role === "admin") {
    filters.admin = req.user._id;
  }

  const result = await sareeService.getAllSarees(filters);

  return res.status(200).json(
    new ApiResponse(
      200,
      "Sarees fetched successfully",
      result.sarees,
      result.pagination
    )
  );
})

export const getRelatedSarees = asyncHandler(async (req, res, next) => {
  const sarees = await sareeService.getRelatedSarees(req.params.id);

  return res.status(200).json(
    new ApiResponse(
      200,
      "Related sarees fetched successfully",
      sarees
    )
  );
})

export const getSareeById = asyncHandler(async (req, res, next) => {
  const saree = await sareeService.getSareeByID(req.params.id);

  return res.status(200).json(
    new ApiResponse(
      200,
      "Saree fetched successfully",
      saree
    )
  );
})


export const deleteSaree = (async (req, res, next) => {
  await sareeService.deleteSaree(
    req.params.id,
    req.user._id
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      "Saree deleted successfully"
    )
  );
})