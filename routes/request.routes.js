import express from "express";
import * as requestController from "../controllers/request.controller.js";
import protect from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("customer"),
  requestController.createRequest
);

router.get(
  "/",
  protect,
  requestController.getRequests
);

router.patch(
  "/:id/status",
  protect,
  authorize("admin"),
  requestController.updateRequestStatus
);

router.delete(
  "/customer/:id",
  protect,
  authorize("customer"),
  requestController.deleteCustomerRequest
);

router.delete(
  "/admin/:id",
  protect,
  authorize("admin"),
  requestController.deleteAdminRequest
);

export default router;