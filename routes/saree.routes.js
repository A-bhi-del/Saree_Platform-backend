import express from "express";

import * as sareeController from "../controllers/saree.controller.js";

import protect from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";
import validate from "../middleware/validate.js";

import { createSareeSchema, updateSareeSchema } from "../validators/saree.validator.js";
import { searchSareeSchema } from "../validators/sareeSearch.validator.js";
import { mongoIdSchema } from "../validators/common.validator.js";

const router = express.Router();

router.get(
  "/",
  validate(searchSareeSchema, "query"),
  sareeController.getAllSarees
);

router.get(
  "/:id",
  validate(mongoIdSchema, "params"),
  sareeController.getSareeById
);

router.post(
  "/",
  protect,
  authorize("admin"),
  validate(createSareeSchema),
  sareeController.createSaree
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  validate(mongoIdSchema, "params"),
  validate(updateSareeSchema),
  sareeController.updateSaree
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  validate(mongoIdSchema, "params"),
  sareeController.deleteSaree
);

export default router;