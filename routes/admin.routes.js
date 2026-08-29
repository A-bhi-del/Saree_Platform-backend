import express from "express";
import * as adminController from "../controllers/admin.controller.js";
import protect from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";
const router = express.Router();

router.get(
  "/",
  protect,
  authorize("admin"),
  adminController.getAdmins
);

export default router;