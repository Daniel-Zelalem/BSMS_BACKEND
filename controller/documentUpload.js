const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

cloudinary.config({
  cloud_name: "dg5vvvpxd",
  api_key: "527162717384989",
  api_secret: "dH5wfMQl-_9cQm47hjbWYIoNl-E",
});

const uploadDocument = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "No files uploaded." });
    }

    const documentUrls = [];

    const uploadPromises = req.files.map((file) => {
      return new Promise((resolve, reject) => {
        if (!file.mimetype.startsWith("application/pdf")) {
          return reject({
            success: false,
            error: `File ${file.originalname} is not a PDF.`,
          });
        }

        if (file.size > 10485760) {
          return reject({
            success: false,
            error: `File ${file.originalname} is too large. Maximum size is 10 MB.`,
          });
        }

        const stream = cloudinary.uploader.upload_stream(
          { folder: "Documents" },
          (error, result) => {
            if (error) {
              console.error("Error uploading document to Cloudinary:", error);
              return reject({
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

    await Promise.all(uploadPromises);

    //res.json({ success: true, message: 'Documents uploaded successfully.', documentUrls: documentUrls });
  } catch (error) {
    console.error("Error uploading documents:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

module.exports = { uploadDocument };
