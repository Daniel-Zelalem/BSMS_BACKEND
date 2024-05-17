const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LandSchema = new Schema(
  {
    Title: {
      type: String,
    },
    ContractType: {
      type: String,
    },
    PriceCategory: {
      type: String,
    },
    Currency: {
      type: String,
    },
    PricePrefix: { type: String },
    Area: {
      type: Number,
    },
    Location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    City: {
      type: String,
    },
    Description: {
      type: String,
    },
    Price: {
      type: Number,
    },
    Status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Closed"],
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

    uploadedby: {
      type: String,
    },
    PropertyType: {
      type: String,
      default: "Land",
    },

    imageUrls: [String],
    documentUrls: [String],
  },
  { timestamps: true }
);

const Land = mongoose.model("Land", LandSchema);
module.exports = Land;
