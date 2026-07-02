import express from "express";
import * as notificationController from "../controllers/notification.controller.js";
import protect from "../middleware/auth.middleware.js";

const router = express.Router();

router.get(
  "/",
  protect,
  notificationController.getNotifications
);

router.patch(
  "/:id/read",
  protect,
  notificationController.markAsRead
);

router.patch(
  "/read-all",
  protect,
  notificationController.markAllAsRead
);

router.delete(
  "/:id",
  protect,
  notificationController.deleteNotification
);

export default router;