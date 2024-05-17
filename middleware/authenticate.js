const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, "AZQ,PI)0(");

    req.User = decoded;
    next();
  } catch (error) {
    res.json({
      message: "Authentication Failed!",
    });
  }
};

module.exports = authenticate;
