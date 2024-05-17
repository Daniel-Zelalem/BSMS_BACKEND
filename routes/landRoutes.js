const express = require("express");
const router = express.Router();
const multer = require("multer");
const LandController = require("../controller/LandController");
const authenticate = require("../middleware/authenticate");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Middleware for handling all file uploads
const uploadFiles = upload.any();

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
  LandController.uploadland
);

router.get("/showland", LandController.showland);
router.get("/:landID", LandController.getlandbyid);
router.post("/deleteland", LandController.deleteland);
router.put(
  "/updateland/:LandId",
  upload.array("images", 3),
  LandController.updateland
);
router.put("/approve/:landID/:Email", authenticate, LandController.approveLand);
router.put("/reject/:landID", LandController.rejectLand);
router.put("/assign/:landID/:Email", LandController.assignBrokerToLand);

module.exports = router;
