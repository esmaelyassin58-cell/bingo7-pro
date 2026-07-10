require("dotenv").config();
const express = require("express");
const path = require("path");
const connectDB = require("./config/db"); // ተስተካከለ፡ ከጎን ስላለ ./ ሆነ
const User = require("./models/user");     // ተስተካከለ፡ ከጎን ስላለ ./ ሆነ

const app = express();
app.use(express.json());

// 💾 ዳታቤዙን ማገናኘት
connectDB();

// 🎮 ሚኒ አፑ ያለበትን ፎልደር 'miniapp' ለሰርቨሩ ማስተዋወቅ
app.use(express.static(path.join(__dirname, "miniapp")));

// ==================== 📊 የዳሽቦርድ መረጃ አቅራቢ API ====================
app.get("/api/dashboard", async (req, res) => {
    const telegramId = req.query.tgId;

    if (!telegramId) {
        return res.status(400).json({ success: false, message: "Telegram ID missing" });
    }

    try {
        const user = await User.findOne({ telegramId: Number(telegramId) });
        
        if (!user) {
            return res.status(404).json({ success: false, isRegistered: false, message: "User not registered" });
        }

        const prizePool = "10,000,000 ETB"; 
        const activePlayers = 45; 

        res.json({
            success: true,
            isRegistered: true,
            walletBalance: user.walletBalance,
            prizePool: prizePool,
            activePlayers: activePlayers
        });

    } catch (error) {
        console.error("API Error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ==================== HEALTH CHECK & MINI APP ROUTE ====================
app.get("/", (req, res) => {
    // ሚኒ አፑን ቀጥታ እንዲከፍት ማድረግ
    res.sendFile(path.join(__dirname, "miniapp", "index.html"));
});

// ==================== RENDER PORT FIX & START ====================
const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port: ${PORT}`);
    
    // ሰርቨሩ ሲነሳ በ bot/ ፎልደር ውስጥ ያለውን ቦት በደህና ይፈልጋል
    try {
        // በ bot ፎልደር ውስጥ ያለው ፋይል ስሙ bingobot ወይም bot ሊሆን ስለሚችል በ 2ቱም ይሞክራል
        try {
            require("./bot/bingobot");
        } catch (e) {
            require("./bot/bot");
        }
        console.log("🤖 Telegram bot loaded successfully inside server!");
    } catch (err) {
        console.error("Bot loading error:", err.message);
    }
});
