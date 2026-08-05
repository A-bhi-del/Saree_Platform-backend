import express from "express";
import protect from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.js";
import * as favoriteSareeController from "../controllers/favoriteSaree.controller.js";
import { mongoIdSchema } from "../validators/common.validator.js";

const router = express.Router();

router.get(
  "/",
  protect,
  favoriteSareeController.getFavoriteSarees
);

router.post(
  "/:id",
  protect,
  validate(mongoIdSchema, "params"),
  favoriteSareeController.addToFavoriteSarees
);

router.delete(
  "/:id",
  protect,
  validate(mongoIdSchema, "params"),
  favoriteSareeController.removeFromFavoriteSarees
);

export default router;