const cloudinary = require("cloudinary").v2;
const Land = require("../models/Land");
const User = require("../models/Users");
const streamifier = require("streamifier");
const jwt = require("jsonwebtoken");

cloudinary.config({
  cloud_name: "dg5vvvpxd",
  api_key: "527162717384989",
  api_secret: "dH5wfMQl-_9cQm47hjbWYIoNl-E",
});

const uploadland = async (req, res) => {
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
        const allowedTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "multipart/form-data",
        ];
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
            const folder = "Land";

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

    console.log(req.body.Location);
    await Promise.all(uploadPromises);
    await Promise.all(uploadDocumentPromises);
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

    const newland = new Land({
      Title: req.body.title,
      ContractType: req.body.ContractType,
      Area: req.body.Area,
      City: req.body.City,
      Description: req.body.description,
      PriceCategory: req.body.PriceCategory,
      Currency: req.body.Currency,
      Price: req.body.Price,
      imageUrls: imageUrls,
      uploadedby: userEmail,
      documentUrls: documentUrls,
      Location: locationObject,
      PricePrefix: req.body.PricePrefix,
    });

    const savedland = await newland.save();
    res.json({
      success: true,
      message: "Land Information added Successfully",
      data: {
        newland: savedland,
      },
    });
  } catch (error) {
    console.error("Server error:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  }
};

const showland = (req, res, next) => {
  Land.find()
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

const deleteland = async (req, res) => {
  try {
    const { LandId } = req.body;

    const deletedland = await Land.findByIdAndDelete(LandId);

    if (!deletedland) {
      return res.status(404).json({ success: false, error: "Land not found" });
    }

    res.json({
      success: true,
      message: "Land deleted successfully",
      deletedland,
    });
  } catch (error) {
    console.error("Server error:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  }
};
const updateland = async (req, res) => {
  try {
    const { LandId } = req.params;
    const updatedData = {
      ContractType: req.body.ContractType,
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

          const folder = "Land";
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

    const updatedProperty = await Land.findByIdAndUpdate(LandId, updatedData, {
      new: true,
    });

    if (!updatedProperty) {
      return res.status(404).json({ success: false, error: "Land not found." });
    }

    res.json({
      success: true,
      message: "Land Information updated successfully",
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
const getlandbyid = async (req, res, next) => {
  try {
    let landID = req.params.landID;
    const mainLand = await Land.findById(landID).populate({
      path: "Broker",
      select: "FirstName LastName Phone imageUrls Email",
    });

    if (!mainLand) {
      return res
        .status(404)
        .json({ success: false, message: "Land not found." });
    }
    const similarLand = await Land.find({
      _id: { $ne: mainLand._id }, // Exclude the main house
      Price: { $gte: mainLand.Price - 10000, $lte: mainLand.Price + 10000 }, // Adjust the price range as needed
    })
      .limit(3)
      .populate({
        path: "Broker",
        select: "FirstName LastName Phone",
      }); // Limit to 3 similar houses

    res.json({
      success: true,
      mainHouse: mainLand,
      similarHouses: similarLand,
    });
  } catch (error) {
    console.error("Error while fetching house:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching house.",
    });
  }
};

const approveLand = async (req, res) => {
  try {
    const { landID, Email } = req.params;
    const user = await User.findOne({ Email: Email });

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }

    const land = await Land.findById(landID);
    if (!land) {
      return res.status(404).json({ success: false, error: "Land not found." });
    }

    if (!isAuthorizedToApprove(user)) {
      return res.status(403).json({
        success: false,
        error: "User is not authorized to approve land.",
      });
    }

    (land.Status = "Approved"), (land.approvedBy = user._id);
    await land.save();

    res.json({
      success: true,
      message: "Land approved successfully.",
      data: land,
    });
  } catch (error) {
    console.error("Error approving land:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const rejectLand = async (req, res) => {
  try {
    const { landID } = req.params;
    const land = await Land.findById(landID);

    land.Status = "Rejected";
    await land.save();

    res.json({
      success: true,
      message: "Land Rejected successfully.",
      data: land,
    });
  } catch (error) {
    console.error("Error rejecting house:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const assignBrokerToLand = async (req, res) => {
  try {
    const { landID, Email } = req.params;

    const land = await Land.findById(landID);
    if (!land) {
      return res.status(404).json({ success: false, error: "Land not found." });
    }

    const broker = await User.findOne({ Email: Email });
    if (!broker) {
      return res
        .status(404)
        .json({ success: false, error: "Broker not found." });
    }

    land.Broker = broker._id;
    await land.save();
    res.json({
      success: true,
      message: "Broker assigned successfully.",
      data: land,
    });
  } catch (error) {
    console.error("Error assigning broker to land:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const isAuthorizedToApprove = (User) => {
  return User && User.Role === "BrokerAdmin";
};

module.exports = {
  uploadland,
  showland,
  deleteland,
  updateland,
  rejectLand,
  approveLand,
  getlandbyid,
  assignBrokerToLand,
};
