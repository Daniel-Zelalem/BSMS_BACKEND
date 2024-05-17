const User = require("../models/Users");
const Chat = require("../models/Chat");
const Message = require("../models/Message");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const {
  initiatePasswordReset,
  completePasswordReset,
} = require("../utils/email");

cloudinary.config({
  cloud_name: "dg5vvvpxd",
  api_key: "527162717384989",
  api_secret: "dH5wfMQl-_9cQm47hjbWYIoNl-E",
});

const listUser = (req, res, next) => {
  User.find({ Role: "User" })
    .then((users) => {
      if (!users) {
        return res
          .status(404)
          .json({ message: "No users found with the role of User" });
      }
      res.json({ users });
    })
    .catch((error) => {
      console.error("Error fetching users:", error);
      res
        .status(500)
        .json({ message: "An error occurred while fetching users" });
    });
};

const userRegister = async (req, res, next) => {
  try {
    bcrypt.hash(req.body.Password, 10, async (err, hashedPass) => {
      if (err) {
        return res.json({ error: err });
      }

      const imageUrls = [];
      if (req.files && req.files.length > 0) {
        if (req.files.length > 2) {
          return res
            .status(400)
            .json({ success: false, error: "Maximum of 1 file allowed." });
        }
      }

      const uploadPromises = req.files.map((file) => {
        return new Promise((resolve, reject) => {
          if (file.size > 10485760) {
            reject({
              success: false,
              error: `File ${file.originalname} is too large. Maximum size is 10 MB.`,
            });
          }

          const folder = "ProfilePicture";
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
        });
      });
      await Promise.all(uploadPromises);

      const existingUser = await User.findOne({ Email: req.body.Email });
      if (existingUser) {
        return res.json({
          success: false,
          message: "Email address is already in use.",
        });
      }

      const user = new User({
        FirstName: req.body.FirstName,
        LastName: req.body.LastName,
        Email: req.body.Email,
        Phone: req.body.Phone,
        Password: hashedPass,
        ConfirmPassword: hashedPass,
        Role: "User",
        imageUrls: imageUrls,
      });

      const usersaved = await user.save();

      res.json({
        success: true,
        message: "Registration is Successfull",
        data: usersaved,
      });
    });
  } catch (error) {
    console.error("Error during user registration:", error);
    res.status(500).json({
      message: "An error occurred!",
    });
  }
};

const agentRegister = async (req, res, next) => {
  try {
    bcrypt.hash(req.body.Password, 10, async function (err, hashedPass) {
      if (err) {
        return res.json({
          error: err,
        });
      }

      const imageUrls = [];

      if (req.files && req.files.length > 0) {
        if (req.files.length > 2) {
          return res
            .status(400)
            .json({ success: false, error: "Maximum of 1 file allowed." });
        }
      }

      const uploadPromises = req.files.map((file) => {
        return new Promise((resolve, reject) => {
          if (file.size > 10485760) {
            reject({
              success: false,
              error: `File ${file.originalname} is too large. Maximum size is 10 MB.`,
            });
          }

          const folder = "ProfilePicture";

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
        });
      });

      await Promise.all(uploadPromises);

      const existingUser = await User.findOne({ Email: req.body.Email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email address is already in use.",
        });
      }

      let user = new User({
        FirstName: req.body.FirstName,
        LastName: req.body.LastName,
        Email: req.body.Email,
        Phone: req.body.Phone,
        Password: hashedPass,
        ConfirmPassword: hashedPass,
        Role: "Broker",
        imageUrls: imageUrls,
      });
      const usersaved = await user.save();
      res.json({
        success: true,
        message: "Registration is Successfull",
        data: usersaved,
      });
    });
  } catch (error) {
    console.error("Error during agent registration:", error);
    res.status(500).json({
      message: "An error occurred!",
    });
  }
};

const brokerAdminRegister = (req, res, next) => {
  try {
    bcrypt.hash(req.body.Password, 10, async (err, hashedPass) => {
      if (err) {
        return res.json({ error: err });
      }

      const imageUrls = [];
      if (req.files && req.files.length > 0) {
        if (req.files.length > 2) {
          return res
            .status(400)
            .json({ success: false, error: "Maximum of 1 file allowed." });
        }
      }
      const uploadPromises = req.files.map((file) => {
        return new Promise((resolve, reject) => {
          if (file.size > 10485760) {
            reject({
              success: false,
              error: `File ${file.originalname} is too large. Maximum size is 10 MB.`,
            });
          }

          const folder = "ProfilePicture";

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
        });
      });

      await Promise.all(uploadPromises);

      const existingUser = await User.findOne({ Email: req.body.Email });
      if (existingUser) {
        return res.json({
          success: false,
          message: "Email address is already in use.",
        });
      }

      let user = new User({
        FirstName: req.body.FirstName,
        LastName: req.body.LastName,
        Email: req.body.Email,
        Phone: req.body.Phone,
        Password: hashedPass,
        ConfirmPassword: hashedPass,
        Role: "BrokerAdmin",
        imageUrls: imageUrls,
      });

      const usersaved = await user.save();

      res.json({
        success: true,
        message: "Registration is Successfull",
        data: usersaved,
      });
    });
  } catch (error) {
    console.error("Error during agent registration:", error);
    res.status(500).json({
      message: "An error occurred!",
    });
  }
};

const adminRegister = (req, res, next) => {
  try {
    bcrypt.hash(req.body.Password, 10, async (err, hashedPass) => {
      if (err) {
        return res.json({ error: err });
      }

      const imageUrls = [];
      if (req.files && req.files.length > 0) {
        if (req.files.length > 2) {
          return res
            .status(400)
            .json({ success: false, error: "Maximum of 1 file allowed." });
        }
      }
      const uploadPromises = req.files.map((file) => {
        return new Promise((resolve, reject) => {
          if (file.size > 10485760) {
            reject({
              success: false,
              error: `File ${file.originalname} is too large. Maximum size is 10 MB.`,
            });
          }

          const folder = "ProfilePicture";

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
        });
      });
      await Promise.all(uploadPromises);
      if (
        req.body.FirstName === "" ||
        req.body.LastName.trim === "" ||
        req.body.Password === "" ||
        req.body.Email === "" ||
        req.body.Phone === "" ||
        req.body.ConfirmPassword === ""
      ) {
        return res
          .status(400)
          .json({ success: false, message: "All fields are required." });
      }
      if (req.body.Password.length < 8) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters long.",
        });
      }

      const existingUser = await User.findOne({ Email: req.body.Email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email address is already in use.",
        });
      }
      if (
        !/^[a-zA-Z]+$/.test(req.body.FirstName) ||
        !/^[a-zA-Z]+$/.test(req.body.LastName)
      ) {
        return res.status(400).json({
          success: false,
          message: "First name and last name must contain only letters.",
        });
      }
      if (req.body.Password.length < 8) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters long.",
        });
      }

      if (!/^\d+$/.test(req.body.Phone) || req.body.Phone.length > 10) {
        return res.status(400).json({
          success: false,
          message:
            "Phone number must contain only numbers and not exceed 10 digits.",
        });
      }
      if (
        !/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(
          req.body.Email
        )
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid email address." });
      }
      let user = new User({
        FirstName: req.body.FirstName,
        LastName: req.body.LastName,
        Email: req.body.Email,
        Phone: req.body.Phone,
        Password: hashedPass,
        ConfirmPassword: hashedPass,
        Role: "Admin",
        imageUrls: imageUrls,
      });

      const usersaved = await user.save();

      res.json({
        message: "System Admin Added Successfully",
        data: usersaved,
      });
    });
  } catch (error) {
    console.error("Error during agent registration:", error);
    res.status(500).json({
      message: "An error occurred!",
    });
  }
};

const list = (req, res, next) => {
  User.find({ Role: "User" })
    .sort({ createdAt: -1 })
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

/*CHAT*/

//All Chat Users List
const allChatUsers = async (req, res) => {
  try {
    const loggedInUserRole = req.headers.userrole;

    let response;
    if (loggedInUserRole === "User") {
      response = await User.find({ Role: "Broker" });
    } else if (loggedInUserRole === "Broker") {
      response = await User.find({ Role: "User" });
    } else {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    res.status(200).json(response);
  } catch (err) {
    console.error("Failed to get all users:", err);
    res.status(500).json({ error: "Failed to get all users" });
  }
};

// Search Users by Email, FristName and LristName
const searchUsers = async (req, res, next) => {
  try {
    const { query } = req.query;
    const loggedInUserRole = req.headers.userrole;

    let roleToQuery;

    if (loggedInUserRole === "Broker") {
      roleToQuery = ["User"];
    } else if (loggedInUserRole === "User") {
      roleToQuery = ["Broker"];
    } else {
      return res.status(403).json({ error: "Unauthorized search" });
    }
    const searchedUsers = await User.find({
      Role: { $in: roleToQuery },
      $or: [
        { FirstName: { $regex: query, $options: "i" } },
        { LastName: { $regex: query, $options: "i" } },
      ],
    });

    res.status(200).json(searchedUsers);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while searching for users" });
  }
};

// All chats of a single user
const getAllChats = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const allChats = await Chat.find({ members: userId })
      .sort({ lastMessageAt: -1 })
      .populate({
        path: "members",
        model: User,
      })
      .populate({
        path: "messages",
        model: Message,
        populate: {
          path: "sender seenBy",
          model: User,
        },
      })
      .exec();

    res.status(200).json(allChats);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to get all chats of current user" });
  }
};

// Search All chats
const searchChats = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { query } = req.query;

    const searchedChats = await Chat.find({
      members: userId,
      name: { $regex: query, $options: "i" },
    })
      .populate({
        path: "members",
        model: User,
      })
      .populate({
        path: "messages",
        model: Message,
        populate: {
          path: "sender seenBy",
          model: User,
        },
      })
      .exec();

    res.status(200).json(searchedChats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to search chat" });
  }
};

const listManager = (req, res, next) => {
  User.find({ Role: "BrokerAdmin" })
    .sort({ createdAt: -1 })
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

const update = (req, res, next) => {
  const { id } = req.params;

  let updatedData = {
    FirstName: req.body.firstName,
    LastName: req.body.lastName,
    Status: req.body.status,
  };

  User.findByIdAndUpdate(id, { $set: updatedData }, { new: true })
    .then((updatedUser) => {
      res.status(200).json({
        success: true,
        message: "User Updated Successfully!",
        user: updatedUser,
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: "An error occurred!",
        error: error.message,
      });
    });
};

const Remove = (req, res, next) => {
  const { id } = req.params;

  User.findByIdAndDelete(id)
    .then((user) => {
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
      res.json({
        success: true,
        message: "User deleted successfully!",
      });
    })
    .catch((error) => {
      console.error("Error occurred:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred!",
      });
    });
};

const login = (req, res, next) => {
  User.findOne({ Email: req.body.Email })
    .then((User) => {
      if (User) {
        bcrypt.compare(
          req.body.Password,
          User.Password,
          function (err, result) {
            if (err) {
              res.json({
                error: err,
              });
            } else {
              if (result) {
                let token = jwt.sign(
                  { Email: User.Email, Id: User._id },
                  "AZQ,PI)0(",
                  {
                    expiresIn: "24h",
                  }
                );

                const responseData = {
                  message: "Login Successful",
                  token: token,
                  user: User,
                };
                res.json({
                  responseData,
                });
              } else {
                res.json({
                  message: "Password does not Matched!",
                });
              }
            }
          }
        );
      } else {
        res.json({
          message: "No user Found!",
        });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({
        success: false,
        error: "Internal Server Error",
      });
    });
};

const blacklistedTokens = [];

const listBroker = (req, res, next) => {
  User.find({ Role: "Broker" })
    .sort({ createdAt: -1 })
    .then((users) => {
      if (!users) {
        return res
          .status(404)
          .json({ message: "No users found with the role of Broker" });
      }
      res.json({ users });
    })
    .catch((error) => {
      console.error("Error fetching users:", error);
      res
        .status(500)
        .json({ message: "An error occurred while fetching users" });
    });
};

const logout = (req, res) => {
  const token = req.header("Authorization");

  if (token) {
    blacklistedTokens.push(token);
    res.json({ message: "Logout successful" });
  } else {
    res.status(401).json({ message: "Invalid token" });
  }
};

const initiatePassword = async (req, res) => {
  try {
    await initiatePasswordReset(req, res);
  } catch (error) {
    console.error("Error in initiatePasswordResetController:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during password reset initiation.",
    });
  }
};

const completePassword = async (req, res) => {
  try {
    await completePasswordReset(req, res);
  } catch (error) {
    console.error("Error in completePasswordResetController:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during password reset completion.",
    });
  }
};

const updateProfile = async (req, res) => {
  const { userId } = req.params;

  try {
    if (req.files && req.files.length > 0) {
      if (req.files.length > 1) {
        return res
          .status(400)
          .json({ success: false, error: "Maximum of 1 file allowed." });
      }

      const file = req.files[0];
      if (file.size > 10485760) {
        return res.status(400).json({
          success: false,
          error: `File ${file.originalname} is too large. Maximum size is 10 MB.`,
        });
      }

      const folder = "ProfilePicture";
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "auto", folder: folder },
        (error, result) => {
          if (error) {
            console.error("Error uploading to Cloudinary:", error);
            return res
              .status(500)
              .json({ success: false, error: "Error uploading to Cloudinary" });
          }

          const imageUrl = result.secure_url;
          console.log("Image uploaded to Cloudinary:", imageUrl);

          // Update user data with the Cloudinary URL
          updateUserWithImage(imageUrl);
        }
      );

      streamifier.createReadStream(file.buffer).pipe(stream);
    } else {
      // If no files are uploaded, update user data without image URL
      updateUserWithImage(null);
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }

  // Function to update user data with or without image URL
  const updateUserWithImage = (imageUrl) => {
    const updatedData = {
      FirstName: req.body.firstName,
      LastName: req.body.lastName,
      Phone: req.body.phone,
      imageUrls: imageUrl, // Assign the image URL here
    };

    User.findByIdAndUpdate(userId, { $set: updatedData }, { new: true })
      .then((updatedUser) => {
        console.log("User updated successfully:", updatedUser);
        res.status(200).json({
          success: true,
          message: "User Updated Successfully!",
          user: updatedUser,
        });
      })
      .catch((error) => {
        console.error("Error updating user:", error);
        res.status(500).json({
          success: false,
          error: "An error occurred while updating user.",
        });
      });
  };
};

module.exports = {
  userRegister,
  agentRegister,
  brokerAdminRegister,
  adminRegister,
  list,
  allChatUsers,
  searchUsers,
  getAllChats,
  searchChats,
  listManager,
  update,
  updateProfile,
  Remove,
  login,
  logout,
  completePassword,
  initiatePassword,
  listUser,
  listBroker,
};
