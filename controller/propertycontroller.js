const mongoose = require("mongoose");
const House = require("../models/House");
const Land = require("../models/Land");
const Vehicle = require("../models/Vehicle");
const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");
const User = require("../models/Users");

// Fisher-Yates (aka Knuth) Shuffle Algorithm
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const allProperties = async (req, res) => {
  try {
    const [houses, lands, vehicles] = await Promise.all([
      House.find({}),
      Land.find(),
      Vehicle.find(),
    ]);

    // Merge arrays into one array
    let allProperties = [...houses, ...lands, ...vehicles];

    // Shuffle the array
    allProperties = shuffleArray(allProperties);

    res.json({ success: true, data: allProperties });
  } catch (error) {
    console.error("Error fetching data:", error);
    res
      .status(500)
      .json({ success: false, error: "An error occurred while fetching data" });
  }
};
const fetchAllValues = async (req, res) => {
  try {
    const [houses, lands, vehicles] = await Promise.all([
      House.find({ Status: "Approved" }).populate({
        path: "Broker",
        select: "FirstName LastName Phone imageUrls",
      }),
      Land.find({ Status: "Approved" }).populate({
        path: "Broker",
        select: "FirstName LastName Phone imageUrls",
      }),
      Vehicle.find({ Status: "Approved" }).populate({
        path: "Broker",
        select: "FirstName LastName Phone imageUrls",
      }),
    ]);

    // Merge arrays into one array
    let allProperties = [...houses, ...lands, ...vehicles];

    // Shuffle the array
    allProperties = shuffleArray(allProperties);

    res.json({ success: true, data: allProperties });
  } catch (error) {
    console.error("Error fetching data:", error);
    res
      .status(500)
      .json({ success: false, error: "An error occurred while fetching data" });
  }
};
const fetchCount = async (req, res) => {
  try {
    const [houseCount, landCount, vehicleCount, employeeCount] =
      await Promise.all([
        House.countDocuments({ Status: "Approved" }),
        Land.countDocuments({ Status: "Approved" }),
        Vehicle.countDocuments({ Status: "Approved" }),
        Employee.countDocuments({}),
      ]);

    const result = {
      House: houseCount,
      Land: landCount,
      Vehicle: vehicleCount,
      Employee: employeeCount,
    };
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching data:", error);
    res
      .status(500)
      .json({ success: false, error: "An error occurred while fetching data" });
  }
};

const payment = async (req, res) => {
  var request = require("request");
  var options = {
    method: "POST",
    url: "https://api.chapa.co/v1/transaction/initialize",
    headers: {
      Authorization: "Bearer CHASECK_TEST-qdTEq6YnHFFhFIPBePj9z51xJV5Hv5d5",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: "100",
      currency: "ETB",
      email: "abebech_bekele@gmail.com",
      first_name: "Bilen",
      last_name: "Gizachew",
      phone_number: "0912345678",
      tx_ref: "chewatatest-6669",
      callback_url: "https://webhook.site/077164d6-29cb-40df-ba29-8a00e59a7e60",
      return_url: "https://www.google.com/",
      "customization[title]": "Payment for my favourite merchant",
      "customization[description]": "I love online payments",
    }),
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log(response.body);
  });
};

const fetchProperty = async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, error: "Token is missing." });
    }
    const decodedToken = jwt.verify(token.split(" ")[1], "AZQ,PI)0(");
    if (!decodedToken) {
      return res.status(401).json({ success: false, error: "Invalid token." });
    }
    const userEmail = decodedToken.Email;
    const [houses, lands, vehicles] = await Promise.all([
      House.find({
        uploadedby: userEmail,
      }).populate({
        path: "Broker",
        select: "FirstName LastName Phone",
      }),
      Land.find({
        uploadedby: userEmail,
      }).populate({
        path: "Broker",
        select: "FirstName LastName Phone",
      }),
      Vehicle.find({ uploadedby: userEmail }).populate({
        path: "Broker",
        select: "FirstName LastName Phone",
      }),
    ]);

    let allProperties = [...houses, ...lands, ...vehicles];
    allProperties = shuffleArray(allProperties);
    allProperties.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, data: allProperties });
  } catch (error) {
    console.error("Error fetching data:", error);
    res
      .status(500)
      .json({ success: false, error: "An error occurred while fetching data" });
  }
};

const pendingProperty = async (req, res) => {
  try {
    const [houses, lands, vehicles] = await Promise.all([
      House.find({ Status: "Pending" }).sort({ createdAt: -1 }),
      Land.find({ Status: "Pending" }).sort({ createdAt: -1 }),
      Vehicle.find({ Status: "Pending" }).sort({ createdAt: -1 }),
    ]);

    let allProperties = [...houses, ...lands, ...vehicles];
    allProperties.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, data: allProperties });
  } catch (error) {
    console.error("Error fetching data:", error);
    res
      .status(500)
      .json({ success: false, error: "An error occurred while fetching data" });
  }
};

const fetchMyProperty = async (req, res) => {
  try {
    // Decode the token sent from the frontend
    const token = req.headers.authorization;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, error: "Token is missing." });
    }
    const decodedToken = jwt.verify(token.split(" ")[1], "AZQ,PI)0(");
    if (!decodedToken) {
      return res.status(401).json({ success: false, error: "Invalid token." });
    }

    const brokerId = decodedToken.Id;
    const properties = await Vehicle.find({
      Broker: new mongoose.Types.ObjectId(brokerId),
      Status: "Assigned",
    });
    if (!properties || properties.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Properties not found." });
    }
    res.json({ success: true, data: properties });
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({
      success: false,
      error: "An error occurred while fetching properties",
    });
  }
};

const fetchMyApprovedProperty = async (req, res) => {
  try {
    // Decode the token sent from the frontend
    const token = req.headers.authorization;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, error: "Token is missing." });
    }
    const decodedToken = jwt.verify(token.split(" ")[1], "AZQ,PI)0(");
    if (!decodedToken) {
      return res.status(401).json({ success: false, error: "Invalid token." });
    }

    const brokerId = decodedToken.Id;
    const houseProperties = await House.find({
      Broker: new mongoose.Types.ObjectId(brokerId),
      Status: "Assigned",
    });
    const landProperties = await Land.find({
      Broker: new mongoose.Types.ObjectId(brokerId),
      Status: "Assigned",
    });
    const vehicleProperties = await Vehicle.find({
      Broker: new mongoose.Types.ObjectId(brokerId),
      Status: "Assigned",
    });

    const allProperties = [
      ...houseProperties,
      ...landProperties,
      ...vehicleProperties,
    ];

    if (!allProperties || allProperties.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "Properties not found." });
    }
    res.json({ success: true, data: allProperties });
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({
      success: false,
      error: "An error occurred while fetching properties",
    });
  }
};
const fetchMyApproved = async (req, res) => {
  try {
    // Decode the token sent from the frontend
    const token = req.headers.authorization;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, error: "Token is missing." });
    }
    const decodedToken = jwt.verify(token.split(" ")[1], "AZQ,PI)0(");
    if (!decodedToken) {
      return res.status(401).json({ success: false, error: "Invalid token." });
    }

    const brokerId = decodedToken.Id;
    const houseProperties = await House.find({
      Broker: new mongoose.Types.ObjectId(brokerId),
      Status: "Approved",
    });
    const landProperties = await Land.find({
      Broker: new mongoose.Types.ObjectId(brokerId),
      Status: "Approved",
    });
    const vehicleProperties = await Vehicle.find({
      Broker: new mongoose.Types.ObjectId(brokerId),
      Status: "Approved",
    });

    const allProperties = [
      ...houseProperties,
      ...landProperties,
      ...vehicleProperties,
    ];

    if (!allProperties || allProperties.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "Properties not found." });
    }
    res.json({ success: true, data: allProperties });
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({
      success: false,
      error: "An error occurred while fetching properties",
    });
  }
};
const fetchAll = async (req, res) => {
  try {
    const houseCount = await House.countDocuments();
    const landCount = await Land.countDocuments();
    const vehicleCount = await Vehicle.countDocuments();
    const userCount = await User.countDocuments({ Role: "User" });
    const brokerCount = await User.countDocuments({ Role: "Broker" });

    res.status(200).json({
      success: true,
      totalProperties: houseCount + vehicleCount + landCount,
      totalUsers: userCount,
      totalBrokers: brokerCount,
    });
  } catch (error) {
    console.error("Error fetching Data:", error);
    res.status(500).json({
      success: false,
      error: "An error occurred while fetching Data",
    });
  }
};
const fetchAllProp = async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, error: "Token is missing." });
    }
    const decodedToken = jwt.verify(token.split(" ")[1], "AZQ,PI)0(");
    if (!decodedToken) {
      return res.status(401).json({ success: false, error: "Invalid token." });
    }
    const brokerId = decodedToken.Id;

    const houseCount = await House.countDocuments({
      Broker: new mongoose.Types.ObjectId(brokerId),
    });
    const landCount = await Land.countDocuments({
      Broker: new mongoose.Types.ObjectId(brokerId),
    });
    const vehicleCount = await Vehicle.countDocuments({
      Broker: new mongoose.Types.ObjectId(brokerId),
    });
    const assignedHouseCount = await House.countDocuments({
      Broker: new mongoose.Types.ObjectId(brokerId),
      Status: "Assigned",
    });
    const assignedLandCount = await Land.countDocuments({
      Broker: new mongoose.Types.ObjectId(brokerId),
      Status: "Assigned",
    });
    const assignedVehicleCount = await Vehicle.countDocuments({
      Broker: new mongoose.Types.ObjectId(brokerId),
      Status: "Assigned",
    });
    const approvedHouseCount = await House.countDocuments({
      Broker: new mongoose.Types.ObjectId(brokerId),
      Status: "Approved",
    });
    const approvedLandCount = await Land.countDocuments({
      Broker: new mongoose.Types.ObjectId(brokerId),
      Status: "Approved",
    });
    const approvedVehicleCount = await Vehicle.countDocuments({
      Broker: new mongoose.Types.ObjectId(brokerId),

      Status: "Approved",
    });

    const totalProperties = houseCount + vehicleCount + landCount;
    const assignedProperties =
      assignedHouseCount + assignedVehicleCount + assignedLandCount;
    const approvedProperties =
      approvedHouseCount + approvedVehicleCount + approvedLandCount;

    res.status(200).json({
      success: true,
      totalProperties,
      assignedProperties,
      approvedProperties,
    });
  } catch (error) {
    console.error("Error fetching Data:", error);
    res.status(500).json({
      success: false,
      error: "An error occurred while fetching Data",
    });
  }
};

module.exports = {
  fetchAllValues,
  allProperties,
  fetchProperty,
  payment,
  pendingProperty,
  fetchCount,
  fetchMyProperty,
  fetchMyApprovedProperty,
  fetchMyApproved,
  fetchAll,
  fetchAllProp,
};
