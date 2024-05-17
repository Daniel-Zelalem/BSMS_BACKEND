const express = require("express");
const router = express.Router();
const property = require("../controller/propertycontroller");

router.get("/all", property.fetchAllValues);
router.get("/allData", property.fetchAll);
router.get("/allProp", property.allProperties);
router.get("/pending", property.pendingProperty);
router.get("/favourite", property.pendingProperty);
router.get("/assigned/approved", property.fetchMyApprovedProperty);
router.get("/approved", property.fetchMyApproved);
router.get("/assigned", property.fetchMyProperty);
router.get("/number", property.fetchCount);
router.get("/getProperty", property.fetchProperty);
router.get("/getMe", property.fetchAllProp);
router.get("/pay", property.payment);

module.exports = router;
