const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const tenantMiddleware = require("../middleware/tenant.middleware");

router.post(
  "/",
  requireAuth,
  tenantMiddleware,
  notificationController.createNotification,
);
router.get(
  "/",
  requireAuth,
  tenantMiddleware,
  notificationController.getNotifications,
);
router.get(
  "/:id",
  requireAuth,
  tenantMiddleware,
  notificationController.getNotificationById,
);
router.put(
  "/:id",
  requireAuth,
  tenantMiddleware,
  notificationController.updateNotification,
);
router.delete(
  "/:id",
  requireAuth,
  tenantMiddleware,
  notificationController.deleteNotification,
);

module.exports = router;
