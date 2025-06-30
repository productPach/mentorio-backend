const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  messagesCount: { type: Number, default: 0 },
  isPremium: { type: Boolean, default: false },
  firstMessageAt: { type: Date, default: null },
});

module.exports = mongoose.model("User", userSchema);
