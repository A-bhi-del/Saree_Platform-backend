import express from "express";

import * as dashboardController from "../controllers/dashboard.controller.js";
import protect from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

const router = express.Router();

router.get(
  "/",
  protect,
  authorize("admin"),
  dashboardController.getDashboard
);

export default router;