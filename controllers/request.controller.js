import * as requestService from "../services/request.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  createRequestSchema,
  updateRequestStatusSchema,
} from "../validators/request.validator.js";

export const createRequest = asyncHandler(async (req, res, next) => {
  const validatedData = createRequestSchema.parse(req.body);

  const request = await requestService.createRequest(
    validatedData,
    req.user._id
  );

  return res.status(201).json(
    new ApiResponse(
      200,
      "Request created successfully",
      request
    )
  );
})

export const getRequests = asyncHandler(async (req, res, next) => {
  const { page, limit } = req.query;
  const result = await requestService.getRequests(
    req.user,
    page,
    limit
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      "Requests fetched successfully",
      result.requests,
      result.pagination
    )
  );
})

export const updateRequestStatus = asyncHandler(async (req, res, next) => {
  const { status } = updateRequestStatusSchema.parse(req.body);

  const request = await requestService.updateRequestStatus(
    req.params.id,
    req.user._id,
    status
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      "Request status updated successfully",
      request
    )
  );
})

export const deleteCustomerRequest = asyncHandler(async (req, res, next) => {
  await requestService.deleteCustomerRequest(
    req.params.id,
    req.user._id
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      "Request deleted successfully"
    )
  );
})

export const deleteAdminRequest = asyncHandler(async (req, res, next) => {
  await requestService.deleteAdminRequest(
    req.params.id,
    req.user._id
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      "Request deleted successfully"
    )
  );
})