const cloudinary = require("cloudinary").v2;
const Vehicle = require("../models/Vehicle");
const User = require("../models/Users");
const streamifier = require("streamifier");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

cloudinary.config({
  cloud_name: "dg5vvvpxd",
  api_key: "527162717384989",
  api_secret: "dH5wfMQl-_9cQm47hjbWYIoNl-E",
});

const uploadvehicle = async (req, res) => {
  var locationObject;
  try {
    const locationString = req.body.Location;
    locationObject = JSON.parse(locationString);
  } catch (error) {
    console.error("Error parsing location:", error);
  }
  try {
    const imageUrls = [];
    const documentUrls = [];
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "No files uploaded." });
    }
    if (req.files.length > 4) {
      return res
        .status(400)
        .json({ success: false, error: "Maximum of 3 files allowed." });
    }

    const uploadPromises = req.files
      .filter((file) => {
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
        return allowedTypes.includes(file.mimetype);
      })
      .map((file) => {
        return new Promise((resolve, reject) => {
          if (file.size > 10485760) {
            reject({
              success: false,
              error: `File ${file.originalname} is too large. Maximum size is 10 MB.`,
            });
          } else {
            const folder = "Vehicles";
            const stream = cloudinary.uploader.upload_stream(
              { resource_type: "auto", folder: folder },
              (error, result) => {
                if (error) {
                  console.error("Error uploading to Cloudinary:", error);
                  reject({
                    success: false,
                    error: "Error uploading to Cloudinary",
                  });
                }
                imageUrls.push(result.secure_url);
                resolve();
              }
            );

            streamifier.createReadStream(file.buffer).pipe(stream);
          }
        });
      });

    const uploadDocumentPromises = req.files
      .filter((file) => file.mimetype.startsWith("application/pdf"))
      .map((file) => {
        return new Promise((resolve, reject) => {
          if (file.size > 10485760) {
            reject({
              success: false,
              error: `File ${file.originalname} is too large. Maximum size is 10 MB.`,
            });
          }

          const folder = "Documents";

          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "auto", folder: folder },
            (error, result) => {
              if (error) {
                console.error("Error uploading document to Cloudinary:", error);
                reject({
                  success: false,
                  error: "Error uploading document to Cloudinary",
                });
              }
              documentUrls.push(result.secure_url);
              resolve();
            }
          );

          streamifier.createReadStream(file.buffer).pipe(stream);
        });
      });
    await Promise.all(uploadDocumentPromises);
    await Promise.all(uploadPromises);
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

    const newvehicle = new Vehicle({
      Title: req.body.title,
      Brand: req.body.Brand,
      Model: req.body.Model,
      BodyType: req.body.BodyType,
      FuelType: req.body.FuelType,
      Milleage: req.body.Milleage,
      Colour: req.body.Color,
      City: req.body.City,
      Transmission: req.body.Transmission,
      ContractType: req.body.ContractType,
      PriceCategory: req.body.PriceCategory,
      ManufacturingYear: req.body.Year,
      Price: req.body.Price,
      Description: req.body.description,
      Currency: req.body.Currency,
      Location: locationObject,
      uploadedby: userEmail,
      imageUrls: imageUrls,
      documentUrls: documentUrls,
      PricePrefix: req.body.PricePrefix,
    });

    const savedvehicle = await newvehicle.save();

    res.json({
      success: true,
      message: "Vehicle Information added Successfully",
      data: {
        newvehicle: savedvehicle,
      },
    });
  } catch (error) {
    console.error("Server error:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  }
};

const showvehicle = (req, res, next) => {
  Vehicle.find()
    .then((response) => {
      res.json({
        response,
      });
    })
    .catch((error) => {
      res.json({
        message: "An error Occurred!",
      });
    });
};

const deletevehicle = async (req, res) => {
  try {
    const { VehicleId } = req.body;

    const deletedvehicle = await Vehicle.findByIdAndDelete(VehicleId);

    if (!deletedvehicle) {
      return res
        .status(404)
        .json({ success: false, error: "vehicle not found" });
    }

    res.json({
      success: true,
      message: "vehicle deleted successfully",
      deletedvehicle,
    });
  } catch (error) {
    console.error("Server error:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  }
};

const updatevehicle = async (req, res) => {
  try {
    const { VehicleId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(VehicleId)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid vehicleId." });
    }

    const updatedData = {
      ContractType: req.body.ContractType,
      VehiclesType: req.body.VehiclesType,
      FuelType: req.body.FuelType,
      Colour: req.body.Colour,
      Transmission: req.body.Transmission,
      VIN: req.body.VIN,
      ManufacturingYear: req.body.ManufacturingYear,
      Price: req.body.Price,
      Description: req.body.Description,
    };

    if (req.files && req.files.length > 0) {
      const newImageUrls = [];
      const uploadPromises = req.files.map((file) => {
        return new Promise((resolve, reject) => {
          if (file.size > 10485760) {
            reject({
              success: false,
              error: `File ${file.originalname} is too large. Maximum size is 10 MB.`,
            });
          }

          const folder = "Vehicles";
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "auto", folder: folder },
            (error, result) => {
              if (error) {
                console.error("Error uploading to Cloudinary:", error);
                reject({
                  success: false,
                  error: "Error uploading to Cloudinary",
                  file: file.originalname,
                });
              }
              newImageUrls.push(result.secure_url);
              resolve();
            }
          );

          streamifier.createReadStream(file.buffer).pipe(stream);
        });
      });

      await Promise.all(uploadPromises);
      updatedData.imageUrls = newImageUrls;
    }

    const updatedvehicle = await Vehicle.findByIdAndUpdate(
      VehicleId,
      updatedData,
      { new: true }
    );

    if (!updatedvehicle) {
      return res
        .status(404)
        .json({ success: false, error: "vehicle not found." });
    }

    res.json({
      success: true,
      message: "vehicle information updated successfully",
      data: updatedvehicle,
    });
  } catch (error) {
    console.error("Server error:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  }
};
const getvehiclebyid = async (req, res, next) => {
  try {
    let vehicleId = req.params.vehicleId;

    const mainVehicle = await Vehicle.findById(vehicleId).populate({
      path: "Broker",
      select: "FirstName LastName Phone imageUrls Email",
    });

    if (!mainVehicle) {
      return res
        .status(404)
        .json({ success: false, message: "Vehicle not found." });
    }
    const similarVehicle = await Vehicle.find({
      _id: { $ne: mainVehicle._id }, // Exclude the main house
      Price: {
        $gte: mainVehicle.Price - 100000,
        $lte: mainVehicle.Price + 100000,
      }, // Adjust the price range as needed
    })
      .limit(3)
      .populate({
        path: "Broker",
        select: "FirstName LastName Phone",
      }); // Limit to 3 similar houses

    res.json({
      success: true,
      mainHouse: mainVehicle,
      similarHouses: similarVehicle,
    });
  } catch (error) {
    console.error("Error while fetching house:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching house.",
    });
  }
};
const approveVehicle = async (req, res) => {
  const { vehicleId } = req.params;

  try {
    const vehicle = await Vehicle.findByIdAndUpdate(
      vehicleId,
      { Status: "Approved" },
      { new: true }
    );

    if (!vehicle) {
      return res
        .status(404)
        .json({ success: false, error: "Vehicle not found." });
    }
    res.json({
      success: true,
      message: "Property is Approved successfully.",
      data: vehicle,
    });
  } catch (error) {
    console.error("Error updating property status:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const rejectVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const vehicle = await Vehicle.findById(vehicleId);

    vehicle.Status = "Rejected";

    await vehicle.save();
    res.json({
      success: true,
      message: "vehicle rejected successfully.",
      data: vehicle,
    });
  } catch (error) {
    console.error("Error rejecting vehicle:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const assignBrokerToVehicle = async (req, res) => {
  try {
    const { vehicleId, Email } = req.params;
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res
        .status(404)
        .json({ success: false, error: "vehicle not found." });
    }

    const broker = await User.findOne({ Email: Email });
    if (!broker) {
      return res
        .status(404)
        .json({ success: false, error: "Broker not found." });
    }

    vehicle.Broker = broker._id;
    vehicle.Status = "Assigned";
    await vehicle.save();
    res.json({
      success: true,
      message: "Broker assigned successfully.",
      data: vehicle,
    });
  } catch (error) {
    console.error("Error assigning broker to vehicle:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

module.exports = {
  uploadvehicle,
  showvehicle,
  deletevehicle,
  updatevehicle,
  approveVehicle,
  rejectVehicle,
  getvehiclebyid,
  assignBrokerToVehicle,
};
