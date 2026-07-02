import * as notificationService from "../services/notification.service.js";
import { notificationIdSchema } from "../validators/notification.validator.js";

export const getNotifications = async (req, res, next) => {
  try {
    const { page, limit } = req.query;

    const result = await notificationService.getNotifications(
      req.user._id,
      page,
      limit
    );

    res.status(200).json({
      success: true,
      data: result.notifications,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    notificationIdSchema.parse(req.params);

    const notification = await notificationService.markAsRead(
      req.params.id,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user._id);

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    notificationIdSchema.parse(req.params);

    await notificationService.deleteNotification(
      req.params.id,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};