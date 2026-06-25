// 🎯 store called numbers
let calledNumbers = [];

// 🎲 get random number 1–75 (no repeat)
function getNextNumber() {
  if (calledNumbers.length === 75) {
    return null; // game finished
  }

  let num;

  do {
    num = Math.floor(Math.random() * 75) + 1;
  } while (calledNumbers.includes(num));

  calledNumbers.push(num);

  return num;
}

// 📦 reset game
function resetCaller() {
  calledNumbers = [];
}

// 📊 get game state
function getCalledNumbers() {
  return calledNumbers;
}

module.exports = {
  getNextNumber,
  resetCaller,
  getCalledNumbers,
};
