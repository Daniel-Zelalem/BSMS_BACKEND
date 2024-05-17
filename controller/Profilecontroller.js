const User = require("./models/User");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

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
module.exports = { updateProfile };
