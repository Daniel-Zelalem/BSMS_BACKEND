const User = require("../models/Users");
const ResetToken = require("../models/ResetToken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

const generateResetToken = () => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

const sendResetEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      debug: true,
      tls: {
        ciphers: "SSLv3",
      },
    });
    const mailOptions = {
      from: "cineflix support <support@cineflix.com>",
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending reset email:", error);
    throw new Error("Failed to send reset email");
  }
};

const initiatePasswordReset = async (req, res) => {
  try {
    const { Email } = req.body;

    const user = await User.findOne({ Email: Email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const resetToken = generateResetToken();

    const resetTokenModel = new ResetToken({
      Email: user.Email,
      token: resetToken,
    });
    await resetTokenModel.save();

    await sendResetEmail({
      email: user.Email,
      subject: "Password Reset",
      message: `Your password reset token is: ${resetToken}`,
    });

    res.json({
      success: true,
      message: "Password reset initiated. Check your email for instructions.",
    });
  } catch (error) {
    console.error("Error during password reset initiation:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during password reset initiation.",
    });
  }
};

const completePasswordReset = async (req, res) => {
  console.log(req.body);
  try {
    const { Email, token, newPassword } = req.body;

    if (!newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "New password is required." });
    }

    const resetTokenDoc = await ResetToken.findOne({ Email, token });

    if (!resetTokenDoc) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset token." });
    }

    const hashedPass = await bcrypt.hash(newPassword, 10);

    await User.findOneAndUpdate({ Email }, { Password: hashedPass });

    await ResetToken.findOneAndDelete({ Email, token });

    res.json({
      success: true,
      message:
        "Password reset successful. You can now login with your new password.",
    });
  } catch (error) {
    console.error("Error during password reset completion:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during password reset completion.",
    });
  }
};

module.exports = {
  sendResetEmail,
  initiatePasswordReset,
  completePasswordReset,
};
