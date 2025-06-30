const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  telegramId: String,
  isPremium: { type: Boolean, default: false },
  messagesCount: { type: Number, default: 0 },
  firstMessageAt: Date,
  lastMessageAt: Date, // добавить
  lastActiveDate: String, // добавить
  dailyCount: Number, // добавить
  chatHistory: [
    // добавить
    {
      role: String,
      content: String,
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
