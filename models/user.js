
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  telegramId: { type: Number, required: true, unique: true },
  firstName: { type: String },
  phoneNumber: { type: String, required: true, unique: true },
  walletBalance: { type: Number, default: 0 }, // የተጫዋቹ የኪስ ቦርሳ ብር
  referredBy: { type: Number, default: null }, // የጋባዡ ሰው Telegram ID
  isRegistered: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", UserSchema);
