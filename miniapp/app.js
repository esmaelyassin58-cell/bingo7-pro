// 📱 የቴሌግራም ዌብ አፕ ነገሮችን ማዘጋጀት
const tg = window.Telegram.WebApp;
tg.expand(); // ሚኒ አፑ በስልኩ ላይ ሙሉ ስክሪን እንዲሆን ያደርጋል

// ተጫዋቹ በቴሌግራም ካልገባ ለሙከራ የሚሆን ናሙና ID (Development Mode)
const userTelegramId = tg.initDataUnsafe?.user?.id || 1936128674; 
const userFirstName = tg.initDataUnsafe?.user?.first_name || "ተጫዋች";

// በጨዋታው ውስጥ የምንጠቀምባቸው ተለዋዋጮች (Variables)
let currentBalance = 0;
let selectedRoomPrice = 0;
let timerInterval;

// 🚀 ገጹ ገና ሲከፈት መረጃዎችን ከሰርቨር ለመሳብ የሚሰራ
window.addEventListener("DOMContentLoaded", () => {
    fetchDashboardData();
});

// 📊 1. መረጃዎችን ከሰርቨር (Database) የመሳቢያ ተግባር
async function fetchDashboardData() {
    try {
        // ሰርቨራችን ላይ ወደ ሰራነው API ጥያቄ መላክ
        const response = await fetch(/api/dashboard?tgId=${userTelegramId});
        const data = await response.json();

        if (data.success) {
            currentBalance = data.walletBalance;
            
            // በአናቱ ባር ላይ ያሉትን መረጃዎች በፓወር መተካት
            document.getElementById("wallet-balance").innerText = currentBalance.toFixed(2);
            document.getElementById("prize-pool").innerText = data.prizePool;
            document.getElementById("active-players").innerText = data.activePlayers;
        } else {
            alert("❌ ስህተት፡ እባክዎ መጀመሪያ በቴሌግራም ቦቱ ላይ ይመዝገቡ!");
            tg.close(); // ያልተመዘገበ ከሆነ አፑ በራሱ ይዘጋል
        }
    } catch (error) {
        console.error("Error fetching dashboard:", error);
    }
}

// 🕹️ 2. ተጫዋቹ ባለ 10 ወይም ባለ 20 ብር መደብ ሲመርጥ
function openCardSelection(price) {
    selectedRoomPrice = price;
    
    // ገጾቹን መለዋወጥ (ዳሽቦርዱን ደብቆ የካርቴላ መምረጫውን ማሳየት)
    document.getElementById("home-page").classList.remove("active");
    document.getElementById("card-selection-page").classList.add("active");

    // 100 የካርቴላ ሳጥኖችን በስክሪኑ ላይ መደርደር
    generate100Cards();

    // የ60 ሰከንድ የጊዜ ቆጠራውን ማስጀመር
    startCountdown(60);
}

// 🃏 3. 100 የካርቴላ ሳጥኖችን የመፍጠሪያ ሉፕ (Loop)
function generate100Cards() {
    const container = document.getElementById("cards-grid-container");
    container.innerHTML = ""; // የድሮ ካርዶች ካሉ ማጽጃ

    for (let i = 1; i <= 100; i++) {
        const cardElement = document.createElement("div");
        cardElement.classList.add("bingo-card-item");
        cardElement.innerText = #${i}; // የጀርባ ቁጥሩን ያሳያል

        // ተጫዋቹ ሳጥኑን ሲነካ (ካርቴላ ሲገዛ)
        cardElement.onclick = () => buyCard(cardElement, i);

        container.appendChild(cardElement);
    }
}

// 💰 4. ካርቴላ ሲነካ የብር ቅነሳ እና ካርድ የመግለጥ ሂደት
function buyCard(element, cardNum) {
    // ካርዱ አስቀድሞ የተገዛ ከሆነ ድጋሚ እንዳይነካ መከልከል
    if (element.classList.contains("bought")) return;

    // ዋሌቱ ላይ በቂ ብር መኖሩን ማረጋገጥ
    if (currentBalance >= selectedRoomPrice) {
        // ብሩን ተቀናሽ ማድረግ
        currentBalance -= selectedRoomPrice;
        document.getElementById("wallet-balance").innerText = currentBalance.toFixed(2);

        // የካርዱን ገጽታ መቀየር (የተገዛ መሆኑን በከለር ማሳየት)
        element.classList.add("bought");
        
        // 🔥 እዚህ ጋ የካርዱ የፊት ለፊት መጫወቻ ቁጥሮች ይታያሉ
        // ለጊዜው በናሙናነት 'እድለኛ ቁጥር' ያሳየዋል (በቀጣይ ከቢንጎ ኢንጂኑ ጋር እናገናኘዋለን)
        element.innerText = 🎰 B-${cardNum}; 

        // TODO: እዚህ ጋ የገዛውን ካርድ መረጃ ወደ ሰርቨር (Back-end) የምንልክበትን ኮድ በቀጣይ እንጨምራለን
        console.log(User bought card #${cardNum} for ${selectedRoomPrice} ETB);
    } else {
        alert("❌ ይቅርታ፣ በቂ የዋሌት ባላንስ የለዎትም! እባክዎ ቦቱ ላይ በመሄድ አካውንትዎን ይሙሉ (Deposit)።");
    }
}

// ⏱️ 5. የሰከንድ መቁጠሪያ (Timer)
function startCountdown(seconds) {
    let timeLeft = seconds;
    const timerDisplay = document.getElementById("countdown-timer");
    timerDisplay.innerText = timeLeft;

    // የድሮ ታይመር ካለ ማጥፊያ
    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.innerText = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerDisplay.innerText = "0";
            endCardSelection();
        }
    }, 1000);
}
