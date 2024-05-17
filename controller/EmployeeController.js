const cloudinary = require("cloudinary").v2;
const Employee = require("../models/Employee");
const streamifier = require("streamifier");
const mongoose = require("mongoose");
cloudinary.config({
  cloud_name: "dg5vvvpxd",
  api_key: "527162717384989",
  api_secret: "dH5wfMQl-_9cQm47hjbWYIoNl-E",
});

//single Employee fetch controller
const getEmployee = async (req, res) => {
  try {
    const { EmployeeId } = req.params;
    if (EmployeeId) {
      const getEmp = await Employee.findById(EmployeeId);
      if (getEmp) {
        return res.status(200).json(getEmp);
      } else {
        return res.status(404).json({ error: "Employee not found" });
      }
    } else {
      return res.status(400).json({ error: "Employee ID not provided" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

//All Employee fetch controller
const showemployee = (req, res, next) => {
  Employee.find()
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

//Employee regestration controller
const addemployee = async (req, res) => {
  try {
    const EmpAvatar = [];
    const RelAvatar = [];

    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "No files uploaded." });
    }
    if (req.files.length > 2) {
      return res
        .status(400)
        .json({ success: false, error: "Maximum of 2 files allowed." });
    }

    const uploadPromises = req.files.map((file) => {
      return new Promise((resolve, reject) => {
        if (file.size > 10485760) {
          reject({
            success: false,
            error: `File ${file.originalname} is too large. Maximum size is 10 MB.`,
          });
        } else {
          const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
          if (!allowedTypes.includes(file.mimetype)) {
            reject({
              success: false,
              error: `File type ${file.mimetype} not supported. Only JPEG, JPG, and PNG are allowed.`,
            });
            return;
          }

          if (file.fieldname === "EmpAvatar") {
            const empstream = cloudinary.uploader.upload_stream(
              { resource_type: "auto", folder: "EmployeeID" },
              (error, result) => {
                if (error) {
                  console.error("Error uploading to Cloudinary:", error);
                  reject({
                    success: false,
                    error: "Error uploading to Cloudinary",
                  });
                }
                EmpAvatar.push(result.secure_url);
                resolve();
              }
            );

            streamifier.createReadStream(file.buffer).pipe(empstream);
          } else if (file.fieldname === "RelAvatar") {
            const relstream = cloudinary.uploader.upload_stream(
              { resource_type: "auto", folder: "EmployeeRelativeID" },
              (error, result) => {
                if (error) {
                  console.error("Error uploading to Cloudinary:", error);
                  reject({
                    success: false,
                    error: "Error uploading to Cloudinary",
                  });
                }
                RelAvatar.push(result.secure_url);
                resolve();
              }
            );

            streamifier.createReadStream(file.buffer).pipe(relstream);
          }
        }
      });
    });

    await Promise.all(uploadPromises);

    const newEmployee = new Employee({
      EmpAvatar: EmpAvatar,
      FullName: req.body.FullName,
      Age: req.body.Age,
      Gender: req.body.Gender,
      Phone: req.body.Phone,
      Address: req.body.Address,
      JobType: req.body.JobType,
      Experience: req.body.Experience,
      RelAvatar: RelAvatar,
      RelativeName: req.body.RelativeName,
      RelativePhone: req.body.RelativePhone,
      RelativeAddress: req.body.RelativeAddress,
      Relationship: req.body.Relationship,
      Agent: req.body.Agent,
    });
    const savedEmployee = await newEmployee.save();

    res.json({
      success: true,
      message: "Employee information added successfully",
      data: {
        newEmployee: savedEmployee,
      },
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

//Employeee Update controller
const updateemployee = async (req, res) => {
  try {
    const { EmployeeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(EmployeeId)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid EmployeeId." });
    }

    const prevEmployee = await Employee.findById(EmployeeId);

    if (!prevEmployee) {
      return res
        .status(404)
        .json({ success: false, error: "Employee not found." });
    }

    const updateEmpData = {
      FullName: req.body.FullName || prevEmployee.FullName,
      Age: req.body.Age || prevEmployee.Age,
      Gender: req.body.Gender || prevEmployee.Gender,
      Phone: req.body.Phone || prevEmployee.Phone,
      Address: req.body.Address || prevEmployee.Address,
      JobType: req.body.JobType || prevEmployee.JobType,
      Experience: req.body.Experience || prevEmployee.Experience,
      RelativeName: req.body.RelativeName || prevEmployee.RelativeName,
      RelativePhone: req.body.RelativePhone || prevEmployee.RelativePhone,
      RelativeAddress: req.body.RelativeAddress || prevEmployee.RelativeAddress,
      Relationship: req.body.Relationship || prevEmployee.Relationship,
    };

    const empAvatarFiles = req.files["EmpAvatar"];
    const relAvatarFiles = req.files["RelAvatar"];

    const uploadAndSavePromises = [];

    if (empAvatarFiles && empAvatarFiles.length > 0) {
      const empUploadPromise = new Promise((resolve, reject) => {
        const empAvatar = empAvatarFiles[0];
        const empStream = cloudinary.uploader.upload_stream(
          { resource_type: "auto", folder: "EmployeeID" },
          (error, result) => {
            if (error) {
              console.error("Error uploading EmpAvatar to Cloudinary:", error);
              reject(error);
            } else {
              updateEmpData.EmpAvatar = [result.secure_url];
              resolve();
            }
          }
        );
        streamifier.createReadStream(empAvatar.buffer).pipe(empStream);
      });
      uploadAndSavePromises.push(empUploadPromise);
    }

    if (relAvatarFiles && relAvatarFiles.length > 0) {
      const relUploadPromise = new Promise((resolve, reject) => {
        const relAvatar = relAvatarFiles[0];
        const relStream = cloudinary.uploader.upload_stream(
          { resource_type: "auto", folder: "EmployeeRelativeID" },
          (error, result) => {
            if (error) {
              console.error("Error uploading RelAvatar to Cloudinary:", error);
              reject(error);
            } else {
              updateEmpData.RelAvatar = [result.secure_url];
              resolve();
            }
          }
        );
        streamifier.createReadStream(relAvatar.buffer).pipe(relStream);
      });
      uploadAndSavePromises.push(relUploadPromise);
    }

    await Promise.all(uploadAndSavePromises);
    const updatedEmployee = await Employee.findByIdAndUpdate(
      EmployeeId,
      updateEmpData,
      { new: true }
    );

    if (!updatedEmployee) {
      return res
        .status(404)
        .json({ success: false, error: "Employee not Updated." });
    }

    res.json({
      success: true,
      message: "Employee information updated successfully",
      data: updatedEmployee,
    });
  } catch (error) {
    console.error("Server error:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  }
};

//Employeee delete controller
const deleteemployee = async (req, res) => {
  try {
    const { EmployeeId } = req.params;

    const deletedemployee = await Employee.findByIdAndDelete(EmployeeId);

    if (!deletedemployee) {
      return res
        .status(404)
        .json({ success: false, error: "Employee not found" });
    }

    res.json({
      success: true,
      message: "Employee deleted successfully",
      deletedemployee,
    });
  } catch (error) {
    console.error("Server error:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  }
};

module.exports = {
  addemployee,
  getEmployee,
  showemployee,
  deleteemployee,
  updateemployee,
};
