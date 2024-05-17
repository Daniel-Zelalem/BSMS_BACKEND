const express = require("express");
const router = express.Router();
const multer = require("multer");
const EmployeeController = require("../controller/EmployeeController");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/showemployee", EmployeeController.showemployee);
router.post("/addemployee", upload.any(), EmployeeController.addemployee);
router.delete("/deleteemployee/:EmployeeId", EmployeeController.deleteemployee);
router.get("/getEmployee/:EmployeeId", EmployeeController.getEmployee);
router.put(
  "/updateemployee/:EmployeeId",
  upload.fields([
    { name: "EmpAvatar", maxCount: 1 },
    { name: "RelAvatar", maxCount: 1 },
  ]),
  EmployeeController.updateemployee
);
module.exports = router;
