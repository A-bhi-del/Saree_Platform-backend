import * as sareeService from "../services/saree.service.js";

export const createSaree = async (req, res, next) => {
  try {
    const saree = await sareeService.createSaree({
      ...req.body,
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
    const result = await sareeService.getAllSarees(req.query);

    res.status(200).json({
      success: true,
      data: result.sarees,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getRelatedSarees = async (
  req,
  res,
  next
) => {
  try {
    const sarees =
      await sareeService.getRelatedSarees(
        req.params.id
      );

    res.status(200).json({
      success: true,
      data: sarees,
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
    const saree = await sareeService.updateSaree(
      req.params.id,
      req.user._id,
      req.body
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
    await sareeService.deleteSaree(
      req.params.id,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: "Saree deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};