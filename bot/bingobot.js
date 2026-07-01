const { Telegraf } = require("telegraf");

const {
  initGame,
  setActivePlayers,
  startGame,
  nextTurn,
  getGameState
} = require("../services/fullBingoEngine");

const bot = new Telegraf(process.env.BOT_TOKEN);

/**
 * START GAME
 */
bot.command("startgame", (ctx) => {
  initGame();
  setActivePlayers(50);
  startGame();

  ctx.reply("🎉 Bingo Game Started!");
});

/**
 * NEXT NUMBER
 */
bot.command("next", (ctx) => {
  const result = nextTurn();

  if (!result) {
    return ctx.reply("⚠️ Game has not started!");
  }

  const numberText = `🎲 Number: ${result.number}`;

  if (result.winners && result.winners.length > 0) {
    return ctx.reply(
      `${numberText}\n🏆 Winner(s): ${result.winners.join(", ")}`
    );
  }

  ctx.reply(numberText);
});

/**
 * GAME STATE
 */
bot.command("state", (ctx) => {
  const state = getGameState();

  if (!state) {
    return ctx.reply("⚠️ No game state found!");
  }

  ctx.reply(
    `📊 Status: ${state.status}\n🔢 Called: ${state.calledNumbers.length}`
  );
});

/**
 * ERROR HANDLING
 */
bot.catch((err, ctx) => {
  console.error("Bot error:", err);
  ctx.reply("❌ Something went wrong!");
});

/**
 * START BOT
 */
bot.launch();

console.log("🚀 Bingo Bot Running...");
