const result = document.querySelector(".result");
const userDisplay = document.getElementById("user-display");
const userDisplay2 = document.getElementById("user-display-2");
const machineDisplay = document.getElementById("machine-display");
const machineDisplay2 = document.getElementById("machine-display-2");
const userHealText = document.getElementById("user-heal-text");
const machineHealText = document.getElementById("machine-heal-text");

const sndBgm = new Audio("bgm.mp3");
sndBgm.loop = true;
sndBgm.volume = 0.3;
const sndAtk = new Audio("ataque.mp3");
const sndHit = new Audio("sofrer.mp3");
const sndHeal = new Audio("cura.mp3");
const sndWin = new Audio("vitoria.mp3");
const sndLoss = new Audio("derrota.mp3");
const sndDraw = new Audio("derrota.mp3");

let userHP = 100;
let machineHP = 100;
let winCombo = 0;
let gameActive = true;
let isChampionMode = false;
let selectedTypes = [];
let uRounds = 0;
let mRounds = 0;

let isRevealed = false;
let nextMachineMove = null;
let nextMachineMove2 = null;

const advantages = {
  normal: [],
  fire: ["grass", "ice", "bug", "steel"],
  water: ["fire", "ground", "rock"],
  grass: ["water", "ground", "rock"],
  electric: ["water", "flying"],
  ice: ["grass", "ground", "flying", "dragon"],
  fighting: ["normal", "ice", "rock", "dark", "steel"],
  poison: ["grass", "fairy"],
  ground: ["fire", "electric", "poison", "rock", "steel"],
  flying: ["grass", "fighting", "bug"],
  psychic: ["fighting", "poison"],
  bug: ["grass", "psychic", "dark"],
  rock: ["fire", "ice", "flying", "bug"],
  ghost: ["psychic", "ghost"],
  dragon: ["dragon"],
  dark: ["psychic", "ghost"],
  steel: ["ice", "rock", "fairy"],
  fairy: ["fighting", "dragon", "dark"],
};

const prepareNextMove = () => {
  const allTypes = Object.keys(advantages);
  const slot1 = document.getElementById("prediction-slot");
  const slot2 = document.getElementById("prediction-slot-2");

  nextMachineMove = allTypes[Math.floor(Math.random() * 18)];
  slot1.innerText = nextMachineMove;
  slot1.className = "display-box " + nextMachineMove;
  nextMachineMove2 = allTypes[Math.floor(Math.random() * 18)];
  slot2.innerText = nextMachineMove2;
  slot2.className = "display-box " + nextMachineMove2;
  slot2.style.display = isChampionMode ? "flex" : "none";
};

const toggleReveal = () => {
  isRevealed = !isRevealed;
  const btn = document.getElementById("btn-reveal");
  const predContainer = document.getElementById("prediction-container");

  if (btn) btn.classList.toggle("active");

  if (isRevealed) {
    if (predContainer) predContainer.style.display = "block";
    prepareNextMove();
    result.innerHTML = "👁️ Previsão Ativada!";
  } else {
    if (predContainer) predContainer.style.display = "none";
    nextMachineMove = null;
    nextMachineMove2 = null;
  }
};

// --- JOGABILIDADE ---
const playUser = (type, btnElement) => {
  if (!gameActive) return;

  if (!isChampionMode) {
    const machine = isRevealed
      ? nextMachineMove
      : Object.keys(advantages)[Math.floor(Math.random() * 18)];
    playGame(type, machine);
    if (isRevealed) prepareNextMove();
  } else {
    if (selectedTypes.length < 2) {
      selectedTypes.push(type);
      if (btnElement) btnElement.classList.add("selected-type");
    }
    if (selectedTypes.length === 2) {
      setTimeout(processChampionTurn, 300);
    }
  }
};

const playGame = (user, machine) => {
  userDisplay.innerText = user;
  userDisplay.className = "display-box " + user;
  machineDisplay.innerText = machine;
  machineDisplay.className = "display-box " + machine;
  saveStats("uType", user);
  saveStats("mType", machine);

  if (advantages[user].includes(machine)) {
    sndAtk.play();
    result.innerHTML = "Super Efetivo! Você atacou forte.";
    machineHP -= 20;
    winCombo++;
    saveStats("uDmg", 20);
    if (winCombo >= 2) {
      sndHeal.play();
      userHP = Math.min(100, userHP + 15);
      showHealAnimation("user");
      saveStats("uHeal");
      result.innerHTML = "Combo! Você se curou!";
      winCombo = 0;
    }
  } else if (advantages[machine].includes(user)) {
    sndHit.play();
    result.innerHTML = "Efetivo! O rival te atingiu.";
    userHP -= 20;
    saveStats("mDmg", 20);
    winCombo = 0;
  } else {
    sndHit.play();
    result.innerHTML = "Colisão de tipos! Ambos sofrem dano.";
    userHP -= 10;
    machineHP -= 10;
    saveStats("uDmg", 10);
    saveStats("mDmg", 10);
  }
  updateUI();
};

const processChampionTurn = () => {
  const allTypes = Object.keys(advantages);

  const m1 = isRevealed
    ? nextMachineMove
    : allTypes[Math.floor(Math.random() * 18)];
  const m2 = isRevealed
    ? nextMachineMove2
    : allTypes[Math.floor(Math.random() * 18)];

  userDisplay.innerText = selectedTypes[0];
  userDisplay.className = "display-box " + selectedTypes[0];
  userDisplay2.innerText = selectedTypes[1];
  userDisplay2.className = "display-box " + selectedTypes[1];
  machineDisplay.innerText = m1;
  machineDisplay.className = "display-box " + m1;
  machineDisplay2.innerText = m2;
  machineDisplay2.className = "display-box " + m2;

  saveStats("uType", selectedTypes[0]);
  saveStats("uType", selectedTypes[1]);
  saveStats("mType", m1);
  saveStats("mType", m2);

  let dU = 0;
  let dM = 0;
  selectedTypes.forEach((u, i) => {
    const m = i === 0 ? m1 : m2;
    if (advantages[u].includes(m)) {
      dM += 20;
    } else if (advantages[m].includes(u)) {
      dU += 20;
    } else {
      dU += 10;
      dM += 10;
    }
  });

  if (dM > dU) sndAtk.play();
  else sndHit.play();

  userHP -= dU;
  machineHP -= dM;
  saveStats("uDmg", dM);
  saveStats("mDmg", dU);
  document
    .querySelectorAll(".selected-type")
    .forEach((el) => el.classList.remove("selected-type"));
  selectedTypes = [];

  if (isRevealed) prepareNextMove();
  updateUI();
};

const updateUI = () => {
  document.getElementById("user-hp-fill").style.width =
    Math.max(0, userHP) + "%";
  document.getElementById("machine-hp-fill").style.width =
    Math.max(0, machineHP) + "%";

  if (gameActive && (userHP <= 0 || machineHP <= 0)) {
    if (isChampionMode) {
      gameActive = false;
      let msg = "";

      if (machineHP <= 0 && userHP > 0) {
        uRounds++;
        msg = "🏆 VITÓRIA NO ROUND!";
        sndWin.play();
      } else if (userHP <= 0 && machineHP > 0) {
        mRounds++;
        msg = "❌ DERROTA NO ROUND!";
      } else {
        msg = "⚖️ EMPATE! REPETINDO ROUND...";
      }

      document.getElementById("u-rounds").innerText = uRounds;
      document.getElementById("m-rounds").innerText = mRounds;
      result.innerHTML = msg;

      setTimeout(() => {
        if (uRounds >= 2 || mRounds >= 2) {
          finishGame(uRounds >= 2);
        } else {
          resetRound();
          gameActive = true;
        }
      }, 2000);
    } else {
      finishGame(userHP > 0);
    }
  }
};

const resetRound = () => {
  userHP = 100;
  machineHP = 100;
  result.innerHTML = "Escolha seu tipo";
  document.getElementById("user-hp-fill").style.width = "100%";
  document.getElementById("machine-hp-fill").style.width = "100%";
  if (isRevealed) prepareNextMove();
};

const finishGame = (win) => {
  gameActive = false;
  if (win) sndWin.play();
  else sndLoss.play();
  document.getElementById("game-over-overlay").style.display = "flex";
  document.getElementById("game-over-message").innerText = win
    ? "VITÓRIA!"
    : "DERROTA!";
  saveStats(win ? "win" : "loss");
};

const saveStats = (type, value = 1) => {
  let stats = JSON.parse(localStorage.getItem("pkm_advanced_stats")) || {
    v: 0,
    d: 0,
    uDmg: 0,
    mDmg: 0,
    uHeal: 0,
    mHeal: 0,
    uTypes: {},
    mTypes: {},
  };
  if (type === "win") stats.v++;
  if (type === "loss") stats.d++;
  if (type === "uDmg") stats.uDmg += value;
  if (type === "mDmg") stats.mDmg += value;
  if (type === "uHeal") stats.uHeal++;
  if (type === "mHeal") stats.mHeal++;
  if (type === "uType") stats.uTypes[value] = (stats.uTypes[value] || 0) + 1;
  if (type === "mType") stats.mTypes[value] = (stats.mTypes[value] || 0) + 1;
  localStorage.setItem("pkm_advanced_stats", JSON.stringify(stats));
};

const toggleGameMode = () => {
  isChampionMode = !isChampionMode;
  uRounds = 0;
  mRounds = 0;
  document.getElementById("u-rounds").innerText = "0";
  document.getElementById("m-rounds").innerText = "0";

  userHP = 100;
  machineHP = 100;
  gameActive = true;

  document.getElementById("mode-toggle").innerText = isChampionMode
    ? "MODO ATUAL: CAMPEÃO"
    : "MODO ATUAL: PADRÃO";
  document.getElementById("user-display-2").style.display = isChampionMode
    ? "flex"
    : "none";
  document.getElementById("machine-display-2").style.display = isChampionMode
    ? "flex"
    : "none";
  document.getElementById("champion-rounds").style.display = isChampionMode
    ? "block"
    : "none";

  resetRound();
  if (isRevealed) prepareNextMove();
};

const toggleModal = (id) => {
  const modal = document.getElementById(id);
  const isOpening = modal.style.display !== "flex";

  modal.style.display = isOpening ? "flex" : "none";

  if (isOpening && id === "modal-hall") {
    updateStatsModal();
  }
};

const restartGame = () => {
  location.reload();
};

const showHealAnimation = (p) => {
  const el = p === "user" ? userHealText : machineHealText;
  el.style.animation = "heal-animation 1.5s forwards";
  setTimeout(() => (el.style.animation = ""), 1500);
};

document.addEventListener(
  "click",
  () => {
    sndBgm.play().catch(() => {});
  },
  { once: true }
);

const updateStatsModal = () => {
  const stats = JSON.parse(localStorage.getItem("pkm_advanced_stats")) || {
    v: 0,
    d: 0,
    uDmg: 0,
    mDmg: 0,
    uHeal: 0,
    mHeal: 0,
    uTypes: {},
    mTypes: {},
  };

  const totalGames = stats.v + stats.d;
  const wr = totalGames > 0 ? Math.round((stats.v / totalGames) * 100) : 0;

  document.getElementById("wr-percent").innerText = wr + "%";
  document.getElementById("wr-fill").style.width = wr + "%";
  document.getElementById("v-count").innerText = stats.v;
  document.getElementById("d-count").innerText = stats.d;

  const getFav = (obj) =>
    Object.keys(obj).reduce((a, b) => (obj[a] > obj[b] ? a : b), "???");
  document.getElementById("user-fav").innerText = getFav(stats.uTypes);
  document.getElementById("mach-fav").innerText = getFav(stats.mTypes);

  const totalDmg = stats.uDmg + stats.mDmg;
  const uDmgPct = totalDmg > 0 ? (stats.uDmg / totalDmg) * 100 : 50;
  const mDmgPct = totalDmg > 0 ? (stats.mDmg / totalDmg) * 100 : 50;

  document.getElementById("bar-dmg-u").style.width = uDmgPct + "%";
  document.getElementById("bar-dmg-m").style.width = mDmgPct + "%";
  document.getElementById("val-dmg-u").innerText = stats.uDmg;
  document.getElementById("val-dmg-m").innerText = stats.mDmg;
};

const resetStats = () => {
  if (confirm("Deseja zerar todo o seu histórico de batalhas?")) {
    localStorage.removeItem("pkm_advanced_stats");
    updateStatsModal();
  }
};
