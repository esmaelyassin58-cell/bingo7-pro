require("dotenv").config();
const { Telegraf } = require("telegraf");

const {
  initGame,
  setActivePlayers,
  startGame,
  nextTurn,
  getGameState
} = require("../services/fullBingoEngine");

const bot = new Telegraf(process.env.BOT_TOKEN);

// START GAME
bot.command("startgame", (ctx) => {
  initGame();
  setActivePlayers(50);
  startGame();

  ctx.reply("🎉 Bingo Game Started!");
});

// NEXT NUMBER
bot.command("next", (ctx) => {
  const result = nextTurn();
  if (!result) return ctx.reply("Game not started");

  ctx.reply(`🎲 Number: ${result.number}`);
});

// STATE
bot.command("state", (ctx) => {
  const state = getGameState();
  ctx.reply(`Status: ${state.status}`);
});

bot.launch();
console.log("🚀 Bingo Bot Running...");
