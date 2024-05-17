const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const VehicleSchema = new Schema(
  {
    Title: {
      type: String,
    },
    Brand: {
      type: String,
    },
    Model: {
      type: String,
    },
    BodyType: {
      type: String,
    },
    PricePrefix: { type: String },
    FuelType: {
      type: String,
    },
    Milleage: {
      type: String,
    },
    ContractType: {
      type: String,
    },
    Currency: {
      type: String,
    },

    Location: {
      lat: { type: Number },
      lng: { type: Number },
    },
    PriceCategory: {
      type: String,
    },

    Colour: {
      type: String,
    },
    Transmission: {
      type: String,
    },
    ManufacturingYear: {
      type: Number,
    },
    Price: {
      type: Number,
    },
    Description: {
      type: String,
    },
    City: {
      type: String,
    },
    Rating: {
      type: Number,
    },
    Status: {
      type: String,
      enum: ["Pending", "Assigned", "Approved", "Rejected", "Closed"],
      default: "Pending",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    Broker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    PropertyType: {
      type: String,
      default: "Vehicle",
    },
    uploadedby: {
      type: String,
    },
    imageUrls: [String],
    documentUrls: [String],
    agreementDocUrl: [String],
  },
  { timestamps: true }
);

const vehicle = mongoose.model("Vehicle", VehicleSchema);
module.exports = vehicle;
