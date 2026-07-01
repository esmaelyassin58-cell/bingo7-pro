let gameState = {
  status: "idle",
  numbers: [],
  called: []
};

function initGame() {
  gameState = {
    status: "ready",
    numbers: Array.from({ length: 75 }, (_, i) => i + 1),
    called: []
  };
}

function setActivePlayers(count) {
  gameState.players = count;
}

function startGame() {
  gameState.status = "running";
}

function nextTurn() {
  if (gameState.numbers.length === 0) return null;

  const index = Math.floor(Math.random() * gameState.numbers.length);
  const number = gameState.numbers.splice(index, 1)[0];

  gameState.called.push(number);

  return { number };
}

function getGameState() {
  return gameState;
}

module.exports = {
  initGame,
  setActivePlayers,
  startGame,
  nextTurn,
  getGameState
};
