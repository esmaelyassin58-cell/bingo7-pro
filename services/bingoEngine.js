// 🔥 Shuffle helper
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

// 🎯 BINGO column ranges
const ranges = {
  B: [1, 15],
  I: [16, 30],
  N: [31, 45],
  G: [46, 60],
  O: [61, 75],
};

// 🎲 get unique numbers per column
function getRandomNumbers(min, max, count) {
  let nums = [];

  for (let i = min; i <= max; i++) {
    nums.push(i);
  }

  nums = shuffle(nums);

  return nums.slice(0, count);
}

// 🎫 generate ONE bingo card
function generateBingoCard() {
  let card = [];

  let B = getRandomNumbers(...ranges.B, 5);
  let I = getRandomNumbers(...ranges.I, 5);
  let N = getRandomNumbers(...ranges.N, 5);
  let G = getRandomNumbers(...ranges.G, 5);
  let O = getRandomNumbers(...ranges.O, 5);

  for (let i = 0; i < 5; i++) {
    card[i] = [B[i], I[i], N[i], G[i], O[i]];
  }

  // FREE space
  card[2][2] = "FREE";

  return card;
}

// 🎮 generate dynamic cards (200 default system pool)
function generateManyCards(count = 200) {
  let cards = [];

  for (let i = 0; i < count; i++) {
    cards.push({
      id: i + 1,
      card: generateBingoCard(),
      status: "inactive" // will be activated per game
    });
  }

  return cards;
}

module.exports = {
  generateBingoCard,
  generateManyCards,
};
