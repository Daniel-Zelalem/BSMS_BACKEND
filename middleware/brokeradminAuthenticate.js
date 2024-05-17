const jwt = require("jsonwebtoken");
const User = require("../models/Users");

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token || !token.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "No token provided or token is invalid.",
    });
  }

  const tokenValue = token.split(" ")[1];

  jwt.verify(tokenValue, "AZQ,PI)0(", (err, decoded) => {
    if (err) {
      return res
        .status(403)
        .json({ success: false, message: "Failed to authenticate token." });
    } else {
      req.user = decoded;
      next();
    }
  });
};

const isBrokerAdmin = async (req, res, next) => {
  const user = await User.findOne({ Email: req.user.Email });

  if (user && user.Role === "BrokerAdmin") {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "User is not authorized to perform this action.",
    });
  }
};

const isUser = async (req, res, next) => {
  const user = await User.findOne({
    Email: req.user.Email,
  });
  if (user && user.Role === "User") {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "User is not authorized to perform this action.",
    });
  }
};
module.exports = { verifyToken, isBrokerAdmin, isUser };
