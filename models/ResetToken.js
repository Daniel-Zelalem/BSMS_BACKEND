
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const resetTokenSchema = new Schema({
  Email: { type: String, required: true },
  token: { type: String, required: true }
});

const ResetToken = mongoose.model('ResetToken', resetTokenSchema);

module.exports = ResetToken;
