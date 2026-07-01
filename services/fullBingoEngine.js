const { generateManyCards } = require("./bingoEngine");
const { getNextNumber, resetCaller, getCalledNumbers } = require("./bingoCaller");
const { findWinners } = require("./bingoWinner");

// 🎮 GAME STATE
let game = {
  cards: [],
  activeCards: [],
  calledNumbers: [],
  winners: [],
  status: "waiting"
};

// 🎫 INIT GAME (200 cards pool)
function initGame() {
  game.cards = generateManyCards(200);
  game.activeCards = [];
  game.calledNumbers = [];
  game.winners = [];
  game.status = "ready";

  return game;
}

// 👥 SET ACTIVE PLAYERS (dynamic 50 / 100 / 200)
function setActivePlayers(count) {
  game.activeCards = game.cards.slice(0, count);
  return game.activeCards;
}

// 🎲 START GAME
function startGame() {
  game.status = "running";
  resetCaller();
  game.calledNumbers = [];
  game.winners = [];

  return "Game Started 🎮";
}

// 🎯 NEXT TURN (core loop)
function nextTurn() {
  let number = getNextNumber();

  if (!number) {
    game.status = "finished";
    return { message: "Game Finished", winners: game.winners };
  }

  game.calledNumbers.push(number);

  // 🏆 check winners
  let winners = findWinners(game.activeCards, game.calledNumbers);

  if (winners.length > 0) {
    game.winners = winners;
    game.status = "finished";

    return {
      number,
      winners,
      message: "We have a winner 🏆"
    };
  }

  return {
    number,
    winners: null,
    message: "Next round"
  };
}

// 📊 GET GAME STATE
function getGameState() {
  return game;
}

module.exports = {
  initGame,
  setActivePlayers,
  startGame,
  nextTurn,
  getGameState
};
