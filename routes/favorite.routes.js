import express from "express";
import * as favoriteController from "../controllers/favorite.controller.js";
import protect from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

const router = express.Router();

router.post(
  "/:adminId",
  protect,
  authorize("customer"),
  favoriteController.followAdmin
);

router.delete(
  "/:adminId",
  protect,
  authorize("customer"),
  favoriteController.unfollowAdmin
);

router.get(
  "/",
  protect,
  authorize("customer"),
  favoriteController.getFavoriteAdmins
);

export default router;