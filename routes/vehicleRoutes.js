const express = require("express");
const router = express.Router();
const multer = require("multer");
const vehiclecontroller = require("../controller/VehicleController");
const authenticate = require("../middleware/authenticate");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const uploadfiles = upload.any();
router.get("/showvehicle", vehiclecontroller.showvehicle);

router.get("/:vehicleId", vehiclecontroller.getvehiclebyid);
router.post(
  "/upload",
  (req, res, next) => {
    uploadfiles(req, res, (err) => {
      if (err) {
        console.error(err);
        return res.status(400).json({ success: false, error: err.message });
      }
      next();
    });
  },
  authenticate,
  vehiclecontroller.uploadvehicle
);

router.post("/deletevehicle", vehiclecontroller.deletevehicle);
router.put(
  "/updatevehicle/:VehicleId",
  upload.array("images", 3),
  vehiclecontroller.updatevehicle
);

router.put("/reject/:vehicleId", vehiclecontroller.rejectVehicle);
router.put("/approve/:vehicleId", vehiclecontroller.approveVehicle);
router.put(
  "/assign/:vehicleId/:Email",
  vehiclecontroller.assignBrokerToVehicle
);
module.exports = router;
