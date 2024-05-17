const BrokerCompanies = require("../models/BrokerCompanies");
const jwt = require("jsonwebtoken");

const BrokerCompaRegister = async (req, res, next) => {
  if (
    req.body.companyName === "" ||
    req.body.companyAddress === "" ||
    req.body.companyContactNumber === "" ||
    req.body.companyEmail === ""
  ) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required." });
  }
  const companyEmail = await BrokerCompanies.findOne({
    companyEmail: req.body.companyEmail,
  });
  if (companyEmail) {
    return res
      .status(400)
      .json({ success: false, message: "Email address is already in use." });
  }
  if (
    !/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(
      req.body.companyEmail
    )
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid email address." });
  }
  if (!/^\d+$/.test(req.body.companyContactNumber)) {
    return res.status(400).json({
      success: false,
      message: "companyContactNumber only contains numbers.",
    });
  }
  if (!/^[a-zA-Z]+$/.test(req.body.companyName)) {
    return res.status(400).json({
      success: false,
      message: "companyName must contain only letters.",
    });
  }

  let newBrokerCompanies = new BrokerCompanies({
    companyName: req.body.companyName,
    companyAddress: req.body.companyAddress,
    companyContactNumber: req.body.companyContactNumber,
    companyEmail: req.body.companyEmail,
  });

  newBrokerCompanies
    .save()
    .then((savedbrokercompanies) => {
      res.json({
        message: "BrokerCompanies Added Successfully",
        data: savedbrokercompanies,
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: "An error occurred!",
        error: error,
      });
    });
};
const showBrokerCompanies = (req, res, next) => {
  BrokerCompanies.find()
    .then((response) => {
      res.json({
        response,
      });
    })
    .catch((error) => {
      res.json({
        message: "An error Occured!",
      });
    });
};
const updatebrokercompanies = (req, res, next) => {
  let BrokerCompaniesID = req.body.BrokerCompaniesID;
  let updatedData = {
    companyName: req.body.companyName,
    companyAddress: req.body.companyAddress,
    CompanyContactNumber: req.body.companyContactNumber,
    companyEmail: req.body.companyEmail,
  };
  BrokerCompanies.findByIdAndUpdate(
    BrokerCompaniesID,
    { $set: updatedData },
    { new: true }
  )
    .then((updatedbrokercompinfo) => {
      res.json({
        message: "BrokerCompanies updated Successfully!",
        data: updatedbrokercompinfo,
      });
    })
    .catch((error) => {
      res.json({
        message: "An error occurred!",
      });
    });
};
const Removebrokercompanies = (req, res, next) => {
  let BrokerCompaniesID = req.body.BrokerCompaniesID;
  BrokerCompanies.findOneAndDelete(BrokerCompaniesID)
    .then(() => {
      res.json({
        message: "BrokerCompanies deleted successfully!",
      });
    })
    .catch((error) => {
      res.json({
        message: "An error occurred!",
      });
    });
};
const getbrokercompaniesbyid = async (req, res, next) => {
  try {
    let BrokerCompaniesID = req.params.BrokerCompaniesID;

    const brokercompanies = await BrokerCompanies.findById(BrokerCompaniesID);

    if (!brokercompanies) {
      return res
        .status(404)
        .json({ success: false, message: "BrokerCompanies not found." });
    }

    res.json({
      success: true,
      data: brokercompanies,
    });
  } catch (error) {
    console.error("Error while fetching BrokerCompanies:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching BrokerCompanies.",
    });
  }
};

module.exports = {
  BrokerCompaRegister,
  Removebrokercompanies,
  updatebrokercompanies,
  showBrokerCompanies,
  getbrokercompaniesbyid,
};
