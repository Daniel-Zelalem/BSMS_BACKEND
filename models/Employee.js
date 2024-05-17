const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EmployeeSchema = new Schema(
  {
    EmpAvatar: [String],
    FullName: {
      type: String,
      required: [true, "name is required"],
    },
    Age: {
      type: String,
      required: [true, "DOB is required"],
    },
    Gender: {
      type: String,
      required: [true, "Gender is required"],
    },
    Phone: {
      type: String,
      required: [true, "Phonenumber is required"],
    },
    Address: {
      type: String,
      required: [true, "Skill is required"],
    },
    JobType: {
      type: String,
      required: [true, "JobType is required"],
    },
    Experience: {
      type: String,
      required: [true, "Experience is required"],
    },
    RelAvatar: [String],
    RelativeName: {
      type: String,
      required: [true, "RelativeName is required"],
    },
    RelativePhone: {
      type: String,
      required: [true, "RelativePhone is required"],
    },
    RelativeAddress: {
      type: String,
      required: [true, "RelativeAddress is required"],
    },
    Relationship: {
      type: String,
      required: [true, "Relationship is required"],
    },
    Agent: {
      type: String,
      required: [true, "Agent is required"],
    },
  },
  { timestamps: true }
);

const Employee = mongoose.model("Employee", EmployeeSchema);
module.exports = Employee;
