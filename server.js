require("dotenv").config();
const express = require("express");

const app = express();
app.use(express.json());

// ================== ROUTE ==================
app.get("/", (req, res) => {
  res.send("🎉 Bingo Seven Pro Running!");
});

// ================== START BOT ==================
require("./bot/bingobot");

// ================== PORT ==================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});
