require("dotenv").config();
const { Bot } = require("grammy");
const mongoose = require("mongoose");
const express = require("express"); // Render የፖርት ችግርን ለመፍታት Express እንጠቀማለን

// 1. የቦት ቶከን ማረጋገጫ
if (!process.env.BOT_TOKEN) {
    console.error("❌ Error: BOT_TOKEN is missing in .env file!");
    process.exit(1);
}

const bot = new Bot(process.env.BOT_TOKEN);

// 2. የዌብ ሰርቨር አወቃቀር (Render "Open Port Detected" እንዲልና ሰርቨሩ እንዳይቆም ያደርጋል)
const app = express();
const PORT = process.env.PORT || 3000;

// Render ሰርቨሩ በህይወት መኖሩን የሚፈትሽበት ገጽ (Health Check)
app.get("/", (req, res) => {
    res.send("🎰 Bingo 7 Server is Running Perfectly!");
});

// የዌብ ሰርቨሩን በ Render በተሰጠው ፖርት ላይ ማስነሳት
app.listen(PORT, () => {
    console.log(`🌐 Web server is listening on port ${PORT} for Render!`);
});

// 3. የሞንጎ ዲቢ (MongoDB) ግንኙነት
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/bingo7")
    .then(() => console.log("💾 MongoDB connected successfully for Bingo 7!"))
    .catch(err => console.error("❌ MongoDB connection error:", err));

// የተጫዋች ዳታቤዝ ሞዴል (User Schema)
const userSchema = new mongoose.Schema({
    telegramId: { type: Number, required: true, unique: true },
    username: String,
    firstName: String,
    walletBalance: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);

// 4. የ /start ኮማንድ እና የመቀበያ መልእክት
bot.command("start", async (ctx) => {
    const telegramId = ctx.from.id;
    const username = ctx.from.username || "NoUsername";
    const firstName = ctx.from.first_name || "ተጫዋች";

    try {
        // ተጫዋቹ በዳታቤዝ ውስጥ ካለ መፈለግ፣ ከሌለ አዲስ መመዝገብ
        let existingUser = await User.findOne({ telegramId });
        
        if (!existingUser) {
            existingUser = new User({
                telegramId,
                username,
                firstName,
                walletBalance: 20 // ለአዲስ ተጫዋች የሚሰጥ የሙከራ 20 ብር ስጦታ
            });
            await existingUser.save();
            console.log(`🆕 New user registered: ${firstName} (${telegramId})`);
        }

        // ስሙ ወደ Bingo 7 የተቀየረበት ዋና መልእክት
        const welcomeMessage = `👋 እንኳን ወደ Bingo 7 በደህና መጡ!\n\n🎰 ዕድልዎን የሚሞክሩበት ምርጡ የቢንጎ መጫወቻ ቦት።\n\n💰 ጨዋታውን ለመጀመር ከታች ያለውን ቁልፍ ይጫኑ!`;

        // የሚኒ አፑ መክፈቻ ቁልፍ (Web App Button)
        await ctx.reply(welcomeMessage, {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "🎮 Play Bingo 7",
                            web_app: { url: process.env.WEB_APP_URL }
                        }
                    ]
                ]
            }
        });

    } catch (error) {
        console.error("❌ Error inside start command:", error);
        await ctx.reply("⚠️ ይቅርታ፣ ሲስተም ላይ ትንሽ መስተጓጎል ገጥሟል። እባክዎ እንደገና ይሞክሩ።");
    }
});

// 5. ተጨማሪ አጋዥ የቦት ኮማንዶች (ባላንስ ለማየት)
bot.command("balance", async (ctx) => {
    try {
        const existingUser = await User.findOne({ telegramId: ctx.from.id });
        if (existingUser) {
            await ctx.reply(`💰 የአሁኑ የኪስ ቦርሳዎ ባላንስ: ${existingUser.walletBalance} ETB ነው።`);
        } else {
            await ctx.reply("❌ እባክዎ መጀመሪያ ቦቱን ለመመዝገብ /start ብለው ያስነሱት።");
        }
    } catch (err) {
        console.error(err);
    }
});

bot.command("help", async (ctx) => {
    const helpText = "📖 Bingo 7 - እንዴት መጫወት ይቻላል?\n\n" +
                     "1. መጀመሪያ /start የሚለውን በመጫን ቦቱን ያስነሱ።\n" +
                     "2. 'Play Bingo 7' የሚለውን ቁልፍ ተጭነው ሚኒ አፑን ይክፈቱ。\n" +
                     "3. የሚፈልጉትን የመጫወቻ ብር መጠን (ካርቴላ) ይምረጡ。\n" +
                     "4. እድልዎን ይሞክሩ እና ያሸንፉ!";
    await ctx.reply(helpText);
});

// 6. ቦቱን የማስነሻ ኮድ
bot.start();
console.log("🤖 Telegram bot loaded successfully inside server!");
