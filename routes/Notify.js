const express = require("express");
const router = express.Router();

const notificationcontroller = require("../controller/notificationcontroller");

router.get(
  "/fetchAllNotification/:userId",
  notificationcontroller.fetchAllNotification
);
router.post(
  "/sendPropertyAssignmentNotification/:brokerEmail",
  notificationcontroller.sendPropertyAssignmentNotification
);
router.post(
  "/sendPropertyPostedNotification/:uploadedBy",
  notificationcontroller.sendPropertyPostedNotification
);
router.post(
  "/sendPropertyRegistrationNotification/:brokerAdminRole",
  notificationcontroller.sendPropertyRegistrationNotification
);
router.post(
  "/sendPropertyRejectionNotification/:uploadedBy",
  notificationcontroller.sendPropertyRejectionNotification
);
router.put(
  "/markAllSeenNotificationAsRead/:id",
  notificationcontroller.markAllSeenNotificationAsRead
);

module.exports = router;
