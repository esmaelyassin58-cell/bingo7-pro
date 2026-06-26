const { Telegraf } = require("telegraf");
const {
  initGame,
  setActivePlayers,
  startGame,
  nextTurn,
  getGameState
} = require("../services/fullBingoEngine");

const bot = new Telegraf(process.env.BOT_TOKEN);

// 🎮 START GAME
bot.command("startgame", (ctx) => {
  initGame();
  setActivePlayers(50); // default 50 players
  startGame();

  ctx.reply("🎮 Bingo Game Started!");
});

// 🎰 NEXT NUMBER
bot.command("next", (ctx) => {
    let result = nextTurn();

    if (result && result.winners && result.winners.length > 0) {
        ctx.reply(🎰 Number: ${result.number}\n🏆 Winner(s): ${result.winners.join(", ")});
    } else {
        ctx.reply(🎰 Number: ${result.number});
    }
});

// 📊 GAME STATE
bot.command("state", (ctx) => {
  let state = getGameState();
  ctx.reply(Status: ${state.status}\nCalled: ${state.calledNumbers.length});
});

// 🚀 LAUNCH BOT
bot.launch();

console.log("🤖 Bingo Bot Running...");
