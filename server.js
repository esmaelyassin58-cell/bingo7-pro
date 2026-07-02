require("dotenv").config();
const express = require("express");

const app = express();
app.use(express.json());

// ================== HEALTH CHECK ==================
app.get("/", (req, res) => {
  res.status(200).send("🎉 Bingo Seven Pro is LIVE!");
});

// ================== START TELEGRAM BOT ==================
try {
  require("./bot/bingobot");
  console.log("🤖 Telegram bot loaded");
} catch (err) {
  console.error("Bot error:", err.message);
}

// ================== RENDER PORT FIX ==================
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Server running on port:", PORT);
});
