require("dotenv").config();
const { Telegraf, Markup } = require("telegraf");
const mongoose = require("mongoose");
const User = require("./models/User"); // የዳታቤዝ ሞዴል

// የቢንጎ ኢንጂን ሰርቪስ (የነበረው)
const {
  initGame,
  setActivePlayers,
  startGame,
  nextTurn,
  getGameState
} = require("../services/fullBingoEngine");

// ቦቱን እና ዳታቤዙን ማስነሳት
const bot = new Telegraf(process.env.BOT_TOKEN);
const connectDB = require("../config/db");

// ዳታቤዙን ማገናኘት
connectDB();                                                                                                                                                                 
// 1. የ /start ኮማንድ (በሪፈራል ሊንክ ሲገቡና አዲስ ሲሆኑ)
bot.start(async (ctx) => {
  const telegramId = ctx.from.id;
  const referralId = ctx.payload; // ከሊንኩ ጀርባ ያለውን የጋባዥ ID ያነባል

  try {
    // ተጠቃሚው አስቀድሞ በስልክ ቁጥሩ ተመዝግቦ እንደሆነ በዳታቤዝ ቼክ ይደረጋል
    const existingUser = await User.findOne({ telegramId });

    if (existingUser) {
      // ተመዝግቦ ከሆነ ቀጥታ ሚኒ አፑን መክፈቻ ቁልፍ ያሳየዋል
      return ctx.reply(
        👋 እንኳን ወደ Beteseb Bingo በድጋሚ መጡ!\n\n💰 የአሁኑ ባላንስዎ: ${existingUser.walletBalance} ETB,
        Markup.inlineKeyboard([
          Markup.button.webApp("🎮 Open Bingo", process.env.WEB_APP_URL || "https://your-website-link.com")
        ])
      );
    }

    // ተጠቃሚው አዲስ ከሆነ እና በሪፈራል ሊንክ ከመጣ፣ የጋባዡን ID በጊዜያዊነት Context ውስጥ እናስቀምጣለን
    if (referralId && Number(referralId) !== telegramId) {
      ctx.session = ctx.session || {};
      ctx.session.referredBy = Number(referralId);
    }

    // ለመመዝገብ ስልክ ቁጥር ይጠይቃል
    ctx.reply(
      👋 እንኳን ወደ Beteseb Bingo በሰላም መጡ!\n\n +
      ⚠️ ጨዋታውን ለመጀመርና ወደ ሚኒ አፑ ለመግባት መጀመሪያ ስልክ ቁጥርዎን ማጋራት (Register) ማድረግ አለብዎት።\n +
      ከታች ያለውን "📲 ስልክ ቁጥርህን አጋራ" የሚለውን ቁልፍ ይጫኑ።,
      Markup.keyboard([
        [Markup.button.contactRequest("📲 ስልክ ቁጥርህን አጋራ")]
      ]).oneTime().resize()
    );

  } catch (error) {
    console.error("Start Error:", error);
    ctx.reply("ስህተት አጋጥሟል፣ እባክዎ እንደገና /start ይበሉ።");
  }
});

// 2. የስልክ ቁጥር መቀበያ እና ምዝገባ ማጠናቀቂያ
bot.on("contact", async (ctx) => {
  const contact = ctx.message.contact;
  const telegramId = ctx.from.id;
  const firstName = ctx.from.first_name;
  const phoneNumber = contact.phone_number;

  // Security Check: የላከው ስልክ የራሱ መሆኑን ማረጋገጥ
  if (contact.user_id !== telegramId) {
    return ctx.reply("❌ እባክዎ የራስዎን ስልክ ቁጥር ያጋሩ!");
  }

  try {
    // የሪፈራል መረጃ በሴሽን ውስጥ ካለ እናነባለን
    const referredBy = ctx.session?.referredBy || null;

    // መረጃውን ዳታቤዝ ውስጥ መመዝገብ (ከሌለ አዲስ ይፈጥራል፣ ካለ ያድሳል)
    const newUser = await User.findOneAndUpdate(
      { telegramId },
      { 
        telegramId, 
        firstName, 
        phoneNumber, 
        referredBy,
        $setOnInsert: { walletBalance: 0 } // አዲስ አካውንት ከሆነ ባላንሱ 0 ይጀምራል
      },
      { upsert: true, new: true }
    );

    // የጋበዘው ሰው ካለ ለጋባዡ ለምሳሌ የ 50 ብር ቦነስ መስጠት ቢፈለግ፡
    if (referredBy) {
      await User.findOneAndUpdate(
        { telegramId: referredBy },
        { $inc: { walletBalance: 50 } } // ለጋባዡ 50 ብር ይጨምራል
      );
      console.log(🎁 User ${referredBy} received a 50 ETB referral bonus!);
    }

    // ስልኩ ከተመዘገበ በኋላ የድሮውን ኪቦርድ ያጠፋል
    await ctx.reply(
      "✅ ምዝገባዎ በተሳካ ሁኔታ ተጠናቋል። አሁን ወደ ጨዋታው መግባት ይችላሉ!",
      Markup.removeKeyboard()
    );

    // የሚኒ አፕ መክፈቻ ቁልፍ
    ctx.reply(
      "🎮 ወደ ቢንጎ አፕ ለመግባት ከታች ያለውን ቁልፍ ይጫኑ፡",
      Markup.inlineKeyboard([
        Markup.button.webApp("🎮 Open Bingo", process.env.WEB_APP_URL || "https://your-website-link.com")
      ])
    );

    // ሴሽኑን ማጽዳት
    if (ctx.session) ctx.session.referredBy = null;

  } catch (error) {
    console.error("Registration Error:", error);
    ctx.reply("❌ ይቅርታ፣ ምዝገባው ላይ ስህተት አጋጥሟል። እባክዎ ድጋሚ ይሞክሩ።");
  }
});

// 3. የጨዋታ መቆጣጠሪያ ኮማንዶች (የነበሩት)
bot.command("startgame", (ctx) => {
  initGame();
  setActivePlayers(50);
  startGame();
  ctx.reply("🎉 Bingo Game Started!");
});

bot.command("next", (ctx) => {
  const result = nextTurn();
  if (!result) return ctx.reply("Game not started");
  ctx.reply(🎲 Number: ${result.number});
});
[03/07/2026 21:02] Y: bot.command("state", (ctx) => {
  const state = getGameState();
  ctx.reply(Status: ${state.status});
});

// ቦቱን ማጫወት
bot.launch()
  .then(() => console.log("🚀 Bingo Bot with DB & Referral Running..."))
  .catch((err) => console.error("❌ Bot launch error:", err));

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
