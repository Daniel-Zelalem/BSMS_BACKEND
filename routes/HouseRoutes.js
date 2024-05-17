const express = require("express");
const router = express.Router();
const multer = require("multer");
const houseController = require("../controller/HouseController");

const authenticate = require("../middleware/authenticate");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const uploadFiles = upload.any();

router.get("/showHouse", houseController.showHouse);
router.get("/:houseId", houseController.gethousebyid);
router.post(
  "/upload",
  (req, res, next) => {
    uploadFiles(req, res, (err) => {
      if (err) {
        console.error(err);
        return res.status(400).json({ success: false, error: err.message });
      }
      next();
    });
  },
  authenticate,
  houseController.uploadImages
);

router.post("/deleteProp", houseController.deleteProperty);
router.put(
  "/update/:propertyId",
  upload.array("images", 3),
  houseController.updateProperty
);
router.put(
  "/approve/:houseId/:Email",
  authenticate,
  houseController.approveHouse
);
router.put("/approve/:houseId", houseController.approveHouseStatus);
router.put("/reject/:houseId", houseController.rejectHouse);
router.put("/assign/:houseId/:Email", houseController.assignBrokerToHouse);
module.exports = router;
