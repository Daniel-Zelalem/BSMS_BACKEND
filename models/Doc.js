const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const docSchema = new Schema({
  billingId: Number,
  amount: Number,
  originalId: String,
  pendingId: String,
  signedId: String,
  sellerEmail: String,
  brokerEmail: String,
  buyerEmail: String,
  urlId: Number,
  x: Number,
  y: Number,
  url: String,
  price: Number,
  paymentStatus: {
    type: String,
    default: "Not Paid",
  },
  paymentWithdraw: {
    type: String,
    default: "Not Done",
  },
  PropertyId: {
    type: mongoose.Schema.Types.ObjectId,
  },
});

module.exports = mongoose.model("doc", docSchema);
