const cloudinary = require("cloudinary").v2;
const House = require("../models/House");
const User = require("../models/Users");
const streamifier = require("streamifier");

const jwt = require("jsonwebtoken");

cloudinary.config({
  cloud_name: "dg5vvvpxd",
  api_key: "527162717384989",
  api_secret: "dH5wfMQl-_9cQm47hjbWYIoNl-E",
});

const uploadImages = async (req, res) => {
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
            const folder = "Houses";

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

    const newHouse = new House({
      Title: req.body.title,
      Location: locationObject,
      ContractType: req.body.ContractType,
      PropertyType: req.body.PropertyType,
      PropertyCategory: req.body.PropertyCategory,
      PriceCategory: req.body.PriceCategory,
      Currency: req.body.Currency,
      Bedroom: req.body.Bedrooms,
      Bathroom: req.body.Bathrooms,
      Area: req.body.Area,
      City: req.body.City,
      Description: req.body.description,
      Price: req.body.Price,
      uploadedby: userEmail,
      imageUrls: imageUrls,
      documentUrls: documentUrls,
      PricePrefix: req.body.PricePrefix,
    });

    const savedHouse = await newHouse.save();

    res.json({
      success: true,
      message: "House Information added Successfully",
      data: {
        newHouse: savedHouse,
      },
    });
  } catch (error) {
    console.error("Server error:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  }
};

const showHouse = (req, res, next) => {
  House.find()
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

const deleteProperty = async (req, res) => {
  try {
    const { propertyId } = req.body;

    const deletedProperty = await House.findByIdAndDelete(propertyId);

    if (!deletedProperty) {
      return res
        .status(404)
        .json({ success: false, error: "Property not found" });
    }

    res.json({
      success: true,
      message: "Property deleted successfully",
      deletedProperty,
    });
  } catch (error) {
    console.error("Server error:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  }
};
const updateProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const updatedData = {
      ContractType: req.body.ContractType,
      HouseType: req.body.HouseType,
      Bedroom: req.body.Bedroom,
      Bathroom: req.body.Bathroom,
      Area: req.body.Area,
      Location: req.body.Location,
      City: req.body.City,
      Description: req.body.Description,
      Price: req.body.Price,
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

          const folder = "Houses";
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

    const updatedProperty = await House.findByIdAndUpdate(
      propertyId,
      updatedData,
      { new: true }
    );

    if (!updatedProperty) {
      return res
        .status(404)
        .json({ success: false, error: "Property not found." });
    }

    res.json({
      success: true,
      message: "Property updated successfully",
      data: updatedProperty,
    });
  } catch (error) {
    console.error("Server error:", error);
    if (!res.headersSent) {
      res
        .status(500)
        .json({ success: false, error: "Internal Server Error", data: null });
    }
  }
};
const gethousebyid = async (req, res, next) => {
  try {
    let houseId = req.params.houseId;

    const mainHouse = await House.findById(houseId).populate({
      path: "Broker",
      select: "FirstName LastName Phone imageUrls Email",
    });

    if (!mainHouse) {
      return res
        .status(404)
        .json({ success: false, message: "House not found." });
    }
    const similarHouses = await House.find({
      _id: { $ne: mainHouse._id },
      Price: { $gte: mainHouse.Price - 100000, $lte: mainHouse.Price + 100000 }, // Adjust the price range as needed
    })
      .limit(3)
      .populate({
        path: "Broker",
        select: "FirstName LastName Phone",
      }); // Limit to 3 similar houses

    res.json({
      success: true,
      mainHouse: mainHouse,
      similarHouses: similarHouses,
    });
  } catch (error) {
    console.error("Error while fetching house:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching house.",
    });
  }
};

const assignBrokerToHouse = async (req, res) => {
  try {
    const { houseId, Email } = req.params;
    const house = await House.findById(houseId);

    if (!house) {
      return res
        .status(404)
        .json({ success: false, error: "house not found." });
    }

    const broker = await User.findOne({ Email: Email });

    if (!broker) {
      return res
        .status(404)
        .json({ success: false, error: "Broker not found." });
    }

    house.Broker = broker._id;
    house.Status = "Assigned";
    await house.save();

    const message = `You have been assigned.`;
    res.json({
      success: true,
      message: "Broker assigned successfully.",
      data: house,
    });
  } catch (error) {
    console.error("Error assigning broker to vehicle:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const approveHouseStatus = async (req, res) => {
  const { houseId } = req.params;

  try {
    const house = await House.findByIdAndUpdate(
      houseId,
      { Status: "Approved" },
      { new: true }
    );

    if (!house) {
      return res
        .status(404)
        .json({ success: false, error: "House not found." });
    }
    res.json({
      success: true,
      message: "Property is Approved successfully.",
      data: house,
    });
  } catch (error) {
    console.error("Error updating property status:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const approveHouse = async (req, res) => {
  try {
    const { houseId, Email } = req.params;

    const user = await User.findOne({ Email: Email });

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }

    const house = await House.findById(houseId);
    if (!house) {
      return res
        .status(404)
        .json({ success: false, error: "House not found." });
    }

    if (!isAuthorizedToApprove(user)) {
      return res.status(403).json({
        success: false,
        error: "User is not authorized to approve houses.",
      });
    }

    (house.Status = "Approved"), (house.approvedBy = user._id);
    await house.save();

    res.json({
      success: true,
      message: "House approved successfully.",
      data: house,
    });
  } catch (error) {
    console.error("Error approving house:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const rejectHouse = async (req, res) => {
  try {
    const { houseId } = req.params;
    const house = await House.findById(houseId);

    house.Status = "Rejected";
    await house.save();

    res.json({
      success: true,
      message: "House rejected successfully.",
      data: house,
    });
  } catch (error) {
    console.error("Error rejecting house:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const isAuthorizedToApprove = (User) => {
  return User && User.Role === "BrokerAdmin";
};

module.exports = {
  uploadImages,
  showHouse,
  deleteProperty,
  updateProperty,
  gethousebyid,
  rejectHouse,
  approveHouse,
  assignBrokerToHouse,
  approveHouseStatus,
};
