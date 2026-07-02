require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());

// ሚኒ አፑ (HTML, CSS, JS) ያለበትን ፎልደር ለሰርቨሩ ማስተዋወቅ
app.use(express.static(path.join(__dirname, "miniapp")));

// ==================== HEALTH CHECK & MINI APP ROUTE ====================
app.get("/", (req, res) => {
    // ሚኒ አፑን ቀጥታ እንዲከፍት ማድረግ
    res.sendFile(path.join(__dirname, "miniapp", "index.html"));
});

// ==================== RENDER PORT FIX & START ====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(🚀 Server running on port: ${PORT});
    
    // ሰርቨሩ ፖርቱን ከፍቶ እንደጨረሰ ቦቱን እዚህ ውስጥ እናስነሳዋለን (የማይዘጋው በዚህ መንገድ ነው)
    try {
        require("./bot/bingobot");
        console.log("🤖 Telegram bot loaded successfully inside server!");
    } catch (err) {
        console.error("Bot error:", err.message);
    }
});
