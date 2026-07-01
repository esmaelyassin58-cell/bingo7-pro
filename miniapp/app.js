function startGame() {
  document.getElementById("output").innerText = "Game Started 🎉";
}

function nextNumber() {
  const num = Math.floor(Math.random() * 75) + 1;
  document.getElementById("output").innerText = "Number: " + num;
}
