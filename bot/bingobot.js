require("dotenv").config();
const { Bot, InlineKeyboard } = require("grammy");
const mongoose = require("mongoose");

// 1. የቦት ቶከን ማረጋገጫ
if (!process.env.BOT_TOKEN) {
    console.error("❌ Error: BOT_TOKEN is missing in .env file!");
    process.exit(1);
}

const bot = new Bot(process.env.BOT_TOKEN);

// 2. የሞንጎ ዲቢ (MongoDB) ግንኙነት
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

// 3. የ /start ኮማንድ እና የመቀበያ መልእክት (መስመር 33 ሙሉ በሙሉ ተስተካክሏል)
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

        // መስመር 33፡ ስህተቱ የተስተካከለበት እና ስሙ ወደ Bingo 7 የተቀየረበት ዋና መልእክት
        const welcomeMessage = `👋 እንኳን ወደ Bingo 7 በድጋሚ መጡ!\n\n💰 የአሁኑ ባላንስዎ: ${existingUser.walletBalance} ETB\n\n🎰 ዕድልዎን የሚሞክሩበት ምርጡ የቢንጎ መጫወቻ ቦት። ከታች ያለውን ቁልፍ ተጭነው መጫወት ይችላሉ!`;

        // የሚኒ አፑ መክፈቻ ቁልፍ (Web App Button)
        const keyboard = new InlineKeyboard().webApp("🎮 Play Bingo 7", process.env.WEB_APP_URL || "https://google.com");

        await ctx.reply(welcomeMessage, { reply_markup: keyboard });

    } catch (error) {
        console.error("❌ Error inside start command:", error);
        await ctx.reply("⚠️ ይቅርታ፣ ሲስተም ላይ ትንሽ መስተጓጎል ገጥሟል። እባክዎ እንደገና ይሞክሩ።");
    }
});

// 4. ተጨማሪ አጋዥ የቦት ኮማንዶች (ለምሳሌ ባላንስ ለማየት)
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
                     "2. 'Play Bingo 7' የሚለውን ቁልፍ ተጭነው ሚኒ አፑን ይክፈቱ።\n" +
                     "3. የሚፈልጉትን የመጫወቻ ብር መጠን (ካርቴላ) ይምረጡ።\n" +
                     "4. እድልዎን ይሞክሩ እና ያሸንፉ!";
    await ctx.reply(helpText);
});

// 5. ቦቱን እና ሰርቨሩን የማስነሻ ሎጂክ
bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`❌ Error while handling update ${ctx.update.update_id}:`);
    console.error(err.error);
});

bot.start();
console.log("🤖 Telegram bot loaded successfully inside server!");
