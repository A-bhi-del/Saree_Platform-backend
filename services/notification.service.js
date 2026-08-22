import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { getIO } from "../socket/socket.js";
import { getPagination } from "../utils/pagination.js";

export const createNotification = async (notificationData) => {

    const notification = await Notification.create(
        notificationData
    );

    const io = getIO();

    if (notification.receiver) {
        io.to(`user:${notification.receiver}`)
            .emit(
                "new-notification",
                notification
            );

        return notification;
    }

    io.to("customers").emit(
        "new-notification",
        notification
    );

    return notification;
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
      $or: [
        { receiver: userId },
        { type: "sale" },
        { type: "new-saree" },
        { type: "Discount Updated" },
        { type: "Follow" },
        { type: "Un-Follow" },
      ],
    })
      .populate("sender", "name profileImage role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage),

    Notification.countDocuments({
      $or: [
        { receiver: userId },
        { type: "sale" },
        { type: "new-saree" },
        { type: "Discount Updated" },
      ],
    })

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

  await Notification.findByIdAndDelete(notificationId);
};