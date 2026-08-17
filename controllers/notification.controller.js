import * as notificationService from "../services/notification.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { notificationIdSchema } from "../validators/notification.validator.js";

export const getNotifications = asyncHandler(async (req, res, next) => {
  const { page, limit } = req.query;
  const result = await notificationService.getNotifications(
    req.user._id,
    page,
    limit
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      "Notifications fetched successfully",
      result.notifications,
      result.pagination
    )
  );
})

export const markAsRead = asyncHandler(async (req, res, next) => {
  notificationIdSchema.parse(req.params);

  const notification = await notificationService.markAsRead(
    req.params.id,
    req.user._id
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      "Notification marked as read",
      notification
    )
  );
})

export const markAllAsRead = asyncHandler(async (req, res, next) => {
  await notificationService.markAllAsRead(req.user._id);

  return res.status(200).json(
    new ApiResponse(
      200,
      "All notifications marked as read"
    )
  );
})

export const deleteNotification = asyncHandler(async (req, res, next) => {
  notificationIdSchema.parse(req.params);

  await notificationService.deleteNotification(
    req.params.id,
    req.user._id
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      "Notification deleted successfully"
    )
  );
})