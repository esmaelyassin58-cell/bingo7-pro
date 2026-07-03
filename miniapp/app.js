// 📱 የቴሌግራም ዌብ አፕ ነገሮችን ማዘጋጀት
const tg = window.Telegram.WebApp;
tg.expand();

const userTelegramId = tg.initDataUnsafe?.user?.id || 1936128674; 
const userFirstName = tg.initDataUnsafe?.user?.first_name || "ተጫዋች";

let currentBalance = 0;
let selectedRoomPrice = 0;
let timerInterval;
let gameCallInterval;

// 🎮 የጨዋታ መረጃዎች
let playerBoughtCards = []; // ተጫዋቹ የገዛቸው ካርዶች ቁጥሮች
let calledNumbers = new Set(); // የተጠሩ ቁጥሮች ስብስብ
let allGameCards = {}; // የሁሉንም 100 ካርቴላዎች ውስጣዊ ቁጥሮች መያዣ

window.addEventListener("DOMContentLoaded", () => {
    fetchDashboardData();
    generateInternalCardMatrices(); // የ100ዎቹን ካርቴላዎች 5x5 ቁጥሮች አስቀድሞ ማዘጋጀት
});

// 📊 1. መረጃዎችን ከሰርቨር መሳቢያ
async function fetchDashboardData() {
    try {
        const response = await fetch(/api/dashboard?tgId=${userTelegramId});
        const data = await response.json();
        if (data.success) {
            currentBalance = data.walletBalance;
            document.getElementById("wallet-balance").innerText = currentBalance.toFixed(2);
            document.getElementById("prize-pool").innerText = data.prizePool;
            document.getElementById("active-players").innerText = data.activePlayers;
        } else {
            alert("❌ እባክዎ መጀመሪያ በቦቱ ላይ ይመዝገቡ!");
            tg.close();
        }
    } catch (error) {
        console.error("Dashboard error:", error);
    }
}

// 🎰 2. ለ 100ውም ካርቴላዎች ከ 1 እስከ 75 ያሉ የቢንጎ ቁጥሮችን በ 5x5 ማትሪክስ ማዘጋጀት
function generateInternalCardMatrices() {
    for (let c = 1; c <= 100; c++) {
        let cardNumbers = [];
        while (cardNumbers.length < 25) {
            let num = Math.floor(Math.random() * 75) + 1;
            if (!cardNumbers.includes(num)) cardNumbers.push(num);
        }
        // መሃል ላይ ያለውን ቁጥር FREE (0) ማድረግ (የቢንጎ ህግ)
        cardNumbers[12] = 0; 
        allGameCards[c] = cardNumbers;
    }
}

// 🕹️ 3. መደብ ሲመረጥ
function openCardSelection(price) {
    selectedRoomPrice = price;
    playerBoughtCards = [];
    calledNumbers.clear();
    
    document.getElementById("home-page").classList.remove("active");
    document.getElementById("card-selection-page").classList.add("active");

    generate100Cards();
    startCountdown(60); // 1 ደቂቃ (60 ሰከንድ) መቁጠሪያ
}

function generate100Cards() {
    const container = document.getElementById("cards-grid-container");
    container.innerHTML = "";
    for (let i = 1; i <= 100; i++) {
        const cardElement = document.createElement("div");
        cardElement.classList.add("bingo-card-item");
        cardElement.innerText = #${i};
        cardElement.onclick = () => buyCard(cardElement, i);
        container.appendChild(cardElement);
    }
}

// 💰 4. ካርቴላ መግዛት
function buyCard(element, cardNum) {
    if (element.classList.contains("bought")) return;

    if (currentBalance >= selectedRoomPrice) {
        currentBalance -= selectedRoomPrice;
        document.getElementById("wallet-balance").innerText = currentBalance.toFixed(2);

        element.classList.add("bought");
        element.innerText = ✅ #${cardNum}; 
        playerBoughtCards.push(cardNum); // የገዛውን ካርድ ቁጥር መመዝገብ
    } else {
        alert("❌ በቂ ባላንስ የለዎትም!");
    }
}

function startCountdown(seconds) {
    let timeLeft = seconds;
    const timerDisplay = document.getElementById("countdown-timer");
    timerDisplay.innerText = timeLeft;
    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endCardSelection();
        }
    }, 1000);
}

// 🚫 5. የካርድ መምረጫው ሰከንድ ሲያልቅ ወደ ዋናው ጨዋታ መግቢያ
function endCardSelection() {
    document.getElementById("card-selection-page").classList.remove("active");
    document.getElementById("game-play-page").classList.add("active");

// በግራ በኩል 1-75 የቁጥር ሰንጠረዥ መደርደር
    const board75 = document.getElementById("board-75-container");
    board75.innerHTML = "";
    for (let i = 1; i <= 75; i++) {
        const numDiv = document.createElement("div");
        numDiv.classList.add("num-75-item");
        numDiv.id = grid-num-${i};
        numDiv.innerText = i;
        board75.appendChild(numDiv);
    }

    // የተጫዋቹን አክቲቭ ካርዶች በቀኝ በኩል መሳል
    renderPlayerActiveCards();

    // የቢንጎ ቁጥሮች ጥሪ መጀመር (በየ 3 ሰከንዱ አንድ ቁጥር ይጠራል)
    setTimeout(() => {
        startGameBallCalls();
    }, 2000);
}

// 🃏 6. የተጫዋቹን ካርቴላዎች 5x5 አድርጎ በቀኝ በኩል መሳል
function renderPlayerActiveCards() {
    const container = document.getElementById("player-cards-container");
    container.innerHTML = "";

    if (playerBoughtCards.length === 0) {
        container.innerHTML = "<p style='text-align:center; color:#8aa1b5;'>የገዙት ካርቴላ የለም። እባክዎ ቀጣዩን ዙር ይጠብቁ።</p>";
        return;
    }

    playerBoughtCards.forEach(cardId => {
        const cardWrapper = document.createElement("div");
        cardWrapper.style.marginBottom = "15px";
        cardWrapper.innerHTML = <div style="font-size:12px; color:#ffcc00; margin-bottom:4px;">💳 ካርቴላ #${cardId}</div>;

        const matrixGrid = document.createElement("div");
        matrixGrid.style.display = "grid";
        matrixGrid.style.gridTemplateColumns = "repeat(5, 1fr)";
        matrixGrid.style.gap = "3px";

        const numbers = allGameCards[cardId];
        numbers.forEach((num, index) => {
            const cell = document.createElement("div");
            cell.style.backgroundColor = num === 0 ? "#ffcc00" : "#2b394a";
            cell.style.color = num === 0 ? "#182533" : "#fff";
            cell.style.fontSize = "12px";
            cell.style.textAlign = "center";
            cell.style.padding = "6px 0";
            cell.style.borderRadius = "3px";
            cell.style.fontWeight = "bold";
            cell.id = card-${cardId}-cell-${index};
            cell.innerText = num === 0 ? "FREE" : num;
            matrixGrid.appendChild(cell);
        });

        cardWrapper.appendChild(matrixGrid);
        container.appendChild(cardWrapper);
    });
}

// 🎲 7. የቢንጎ ቁጥሮች ጥሪ ሞተር (Game Call Loop)
function startGameBallCalls() {
    clearInterval(gameCallInterval);

    gameCallInterval = setInterval(() => {
        // ከአንድ እስከ 75 ያልተጠራ ቁጥር መምረጥ
        let nextNum;
        do {
            nextNum = Math.floor(Math.random() * 75) + 1;
        } while (calledNumbers.has(nextNum) && calledNumbers.size < 75);

        calledNumbers.add(nextNum);

        // 1. አናቱ ላይ በትልቁ ቁጥሩን ማሳየት
        document.getElementById("current-called-number").innerText = nextNum;

        // 2. በግራ በኩል በ 1-75 ሰንጠረዥ ላይ ማብራት
        const gridItem = document.getElementById(grid-num-${nextNum});
        if (gridItem) gridItem.classList.add("called");

        // 3. የተጫዋቹን ካርዶች ቼክ ማድረግ እና ከመጣ ማቅለም
        checkAndMarkPlayerCards(nextNum);

        // 4. አጠቃላይ በጨዋታው ውስጥ (ለሁሉም 100 ካርዶች) ማሸነፋቸውን በራስ-ሰር መፈተሽ
        checkAll100CardsForWin();

    }, 3000); // በየ 3 ሰከንዱ ጥሪ ይደረጋል
}

function checkAndMarkPlayerCards(num) {
    playerBoughtCards.forEach(cardId => {
        const numbers = allGameCards[cardId];
        const index = numbers.indexOf(num);
        if (index !== -1) {
            const cell = document.getElementById(card-${cardId}-cell-${index});
            if (cell) {
                cell.style.backgroundColor = "#e63946"; // የመታው ቁጥር በቀይ ይደምቃል
                cell.style.color = "#fff";
            }
        }
    });
}

// 🏆 8. የቢንጎ አሸናፊን በራስ-ሰር መፈተሻ ህግ (1 መስመር የሰራ)
function checkAll100CardsForWin() {
    for (let cardId = 1; cardId <= 100; cardId++) {
        const numbers = allGameCards[cardId];
        
        // በካርዱ ላይ የተመቱትን ቦታዎች ማወቅ (FREE አካውንት እና የተጠሩት በሙሉ)
        let marks = numbers.map(num => num === 0 || calledNumbers.has(num));

        let hasWon = false;
