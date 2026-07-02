import Notification from "../models/Notification.js";
import { getPagination } from "../utils/pagination.js";

export const createNotification = async (notificationData) => {
  return await Notification.create(notificationData);
};

export const getNotifications = async (
  userId,
  page,
  limit
) => {

  const {
    skip,
    page: currentPage,
    limit: perPage,
  } = getPagination(page, limit);

  const [notifications, total] = await Promise.all([

    Notification.find({
      receiver: userId,
    })
      .populate("sender", "name profileImage role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage),

    Notification.countDocuments({
      receiver: userId,
    }),

  ]);

  return {
    notifications,

    pagination: {
      page: currentPage,
      limit: perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    },
  };
};

export const markAsRead = async (
  notificationId,
  userId
) => {

  const notification = await Notification.findById(notificationId);

  if (!notification) {
    throw new Error("Notification not found");
  }

  if (notification.receiver.toString() !== userId.toString()) {
    throw new Error("Unauthorized");
  }

  notification.isRead = true;

  await notification.save();

  return notification;
};

export const markAllAsRead = async (userId) => {

  await Notification.updateMany(
    {
      receiver: userId,
      isRead: false,
    },
    {
      isRead: true,
    }
  );

};

export const deleteNotification = async (
  notificationId,
  userId
) => {

  const notification = await Notification.findById(notificationId);

  if (!notification) {
    throw new Error("Notification not found");
  }

  if (notification.receiver.toString() !== userId.toString()) {
    throw new Error("Unauthorized");
  }

  await Notification.findByIdAndDelete(notificationId);
};