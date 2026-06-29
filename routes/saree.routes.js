import express from "express";

import * as sareeController from "../controllers/saree.controller.js";

import authorize from "../middleware/role.middleware.js";
import protect from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", sareeController.getAllSarees);

router.get("/:id", sareeController.getSareeById);
router.post(
    "/",
    protect,
    authorize("admin"),
    sareeController.createSaree
);
router.put(
    "/:id",
    protect,
    authorize("admin"),
    sareeController.updateSaree
);
router.delete(
    "/:id",
    protect,
    authorize("admin"),
    sareeController.deleteSaree
);
export default router;