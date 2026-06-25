// 🎯 check if a line is fully marked
function isLineComplete(line, calledNumbers) {
  return line.every(cell => cell === "FREE" || calledNumbers.includes(cell));
}

// 🏆 check full bingo card
function checkWinner(card, calledNumbers) {
  // rows check
  for (let row of card) {
    if (isLineComplete(row, calledNumbers)) {
      return true;
    }
  }

  // columns check
  for (let col = 0; col < 5; col++) {
    let column = [];

    for (let row = 0; row < 5; row++) {
      column.push(card[row][col]);
    }

    if (isLineComplete(column, calledNumbers)) {
      return true;
    }
  }

  // diagonal 1
  let diag1 = [];
  for (let i = 0; i < 5; i++) {
    diag1.push(card[i][i]);
  }
  if (isLineComplete(diag1, calledNumbers)) {
    return true;
  }

  // diagonal 2
  let diag2 = [];
  for (let i = 0; i < 5; i++) {
    diag2.push(card[i][4 - i]);
  }
  if (isLineComplete(diag2, calledNumbers)) {
    return true;
  }

  return false;
}

// 🎮 check all players
function findWinners(cards, calledNumbers) {
  let winners = [];

  cards.forEach(player => {
    if (checkWinner(player.card, calledNumbers)) {
      winners.push(player.id);
    }
  });

  return winners;
}

module.exports = {
  checkWinner,
  findWinners,
};
