import * as requestService from "../services/request.service.js";

import {
  createRequestSchema,
  updateRequestStatusSchema,
} from "../validators/request.validator.js";

export const createRequest = async (req, res, next) => {
  try {
    const validatedData = createRequestSchema.parse(req.body);

    const request = await requestService.createRequest(
      validatedData,
      req.user._id
    );

    res.status(201).json({
      success: true,
      message: "Request created successfully",
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

export const getRequests = async (req, res, next) => {
  try {
    const { page, limit } = req.query;

    const result = await requestService.getRequests(
      req.user,
      page,
      limit
    );

    res.status(200).json({
      success: true,
      data: result.requests,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRequestStatus = async (req, res, next) => {
  try {
    const { status } = updateRequestStatusSchema.parse(req.body);

    const request = await requestService.updateRequestStatus(
      req.params.id,
      req.user._id,
      status
    );

    res.status(200).json({
      success: true,
      message: "Request status updated successfully",
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCustomerRequest = async (req, res, next) => {
  try {
    await requestService.deleteCustomerRequest(
      req.params.id,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: "Request deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAdminRequest = async (req, res, next) => {
  try {
    await requestService.deleteAdminRequest(
      req.params.id,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: "Request deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};