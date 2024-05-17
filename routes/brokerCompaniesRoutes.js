const express = require("express");
const router = express.Router();
const BrokercompaniesController = require("../controller/BrokercompaniesController");

router.get("/", BrokercompaniesController.showBrokerCompanies);
router.get(
  "/:BrokerCompaniesID",
  BrokercompaniesController.getbrokercompaniesbyid
);
router.post(
  "/brokerCompanyRegister",
  BrokercompaniesController.BrokerCompaRegister
);
router.post(
  "/updatebrokercompanies",
  BrokercompaniesController.updatebrokercompanies
);
router.post(
  "/Removebrokercompanies",
  BrokercompaniesController.Removebrokercompanies
);

module.exports = router;
