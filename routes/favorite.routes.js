import express from "express";
import * as favoriteController from "../controllers/favorite.controller.js";
import protect from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

const router = express.Router();

router.post(
  "/:adminId",
  protect,
  authorize("admin"),
  favoriteController.followAdmin
);

router.delete(
  "/:adminId",
  protect,
  authorize("admin"),
  favoriteController.unfollowAdmin
);

router.get(
  "/",
  protect,
  authorize("admin"),
  favoriteController.getFavoriteAdmins
);

export default router;