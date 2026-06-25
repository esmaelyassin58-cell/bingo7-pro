function generateBingoCard() {
  let card = [];

  for (let i = 0; i < 5; i++) {
    card[i] = [];
    for (let j = 0; j < 5; j++) {
      card[i][j] = Math.floor(Math.random() * 75) + 1;
    }
  }

  // center free space
  card[2][2] = "FREE";

  return card;
}

module.exports = { generateBingoCard };
