const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const HouseSchema = new Schema(
  {
    Title: {
      type: String,
    },
    Location: {
      lat: { type: Number },
      lng: { type: Number },
    },
    Description: {
      type: String,
    },
    PropertyType: {
      type: String,
      default: "House",
    },
    PropertyCategory: {
      type: String,
    },
    ContractType: {
      type: String,
    },
    Currency: {
      type: String,
    },
    City: {
      type: String,
    },
    PriceCategory: {
      type: String,
    },
    Bedroom: {
      type: Number,
    },
    Bathroom: {
      type: Number,
    },
    Area: {
      type: Number,
    },
    Price: {
      type: Number,
    },
    Favourite: {
      type: Number,
    },
    Status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Assigned", "Closed"],
      default: "Pending",
    },
    PricePrefix: { type: String },
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
    imageUrls: [String],
    documentUrls: [String],
  },
  { timestamps: true }
);

const House = mongoose.model("House", HouseSchema);
module.exports = House;
