const STORAGE_KEY = "montore_save_v4";
const TUTORIAL_KEY = "montore_tutorial_seen_v3";

// 開発用メニューを表示したいときだけ true にする
// 完成版・普段使いでは false のままでOK
const DEBUG_MODE = false;

const monsters = [
  {
    id: "mokopina",
    name: "モコピナ",
    evoName: "モコリエル",
    type: "回復タイプ",
    desc: "かわいい癒し系モンスター"
  },
  {
    id: "rioruhu",
    name: "リオルフ",
    evoName: "リオルガ",
    type: "バランスタイプ",
    desc: "王道の主人公タイプ"
  },
  {
    id: "foremin",
    name: "フォレミン",
    evoName: "フォレスティア",
    type: "継続タイプ",
    desc: "自然をまとったおっとり系"
  },
  {
    id: "darun",
    name: "ダルン",
    evoName: "ダルバーン",
    type: "覚醒タイプ",
    desc: "普段はだらけているが本気は強い"
  },
  {
    id: "zaldo",
    name: "ザルド",
    evoName: "ザルヴェイル",
    type: "パワータイプ",
    desc: "緑の炎を持つ熱血モンスター"
  }
];

const enemies = [
  {
    id: "slime",
    name: "はじまりスライム",
    img: "images/enemy_slime.png",
    requiredTotal: 30,
    required: { power: 5, stamina: 5, recovery: 5, continuity: 3 },
    rewardBackground: "草原"
  },
  {
    id: "goblin",
    name: "森のゴブリン",
    img: "images/enemy_goblin.png",
    requiredTotal: 80,
    required: { power: 18, stamina: 15, recovery: 10, continuity: 8 },
    rewardBackground: "森"
  },
  {
    id: "golem",
    name: "岩石ゴーレム",
    img: "images/enemy_golem.png",
    requiredTotal: 150,
    required: { power: 35, stamina: 30, recovery: 18, continuity: 15 },
    rewardBackground: "岩山"
  },
  {
    id: "volcano",
    name: "火山の番人",
    img: "images/enemy_volcano.png",
    requiredTotal: 250,
    required: { power: 60, stamina: 48, recovery: 30, continuity: 25 },
    rewardBackground: "火山"
  },
  {
    id: "sky",
    name: "天空の守護者",
    img: "images/enemy_sky.png",
    requiredTotal: 380,
    required: { power: 85, stamina: 75, recovery: 55, continuity: 45 },
    rewardBackground: "天空"
  },
  {
    id: "dark",
    name: "闇の王",
    img: "images/enemy_dark.png",
    requiredTotal: 550,
    required: { power: 125, stamina: 105, recovery: 80, continuity: 70 },
    rewardBackground: "闇の城"
  }
];

const backgrounds = [
  { id: "start", name: "はじまり" },
  { id: "grass", name: "草原" },
  { id: "forest", name: "森" },
  { id: "rock", name: "岩山" },
  { id: "volcano", name: "火山" },
  { id: "sky", name: "天空" },
  { id: "dark", name: "闇の城" }
];

let state = loadState();

document.addEventListener("DOMContentLoaded", () => {
  setupSelectScreen();
  setupDebugMode();
  setupEvents();
  checkDailyReset();

  if (state.partnerId) {
    showMainApp();
  } else {
    showScreen("selectScreen");
  }

  updateAll();
  showTutorialIfNeeded();
});

function defaultState() {
  return {
    partnerId: null,
    level: 1,
    exp: 0,
    stats: {
      power: 0,
      stamina: 0,
      recovery: 0,
      continuity: 0
    },
    today: {
      date: getTodayKey(),
      training: 0,
      protein: 0,
      sleep: 0,
      battle: 0
    },
    totalTraining: 0,
    trainingDates: [],
    maxWeights: {
      bench: null,
      squat: null,
      deadlift: null
    },
    weightHistory: [],
    targetWeight: null,
    targetDate: null,
    unlockedBackgrounds: ["はじまり"],
    selectedBackground: "はじまり",
    defeatedEnemies: []
  };
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return defaultState();

  try {
    const parsed = JSON.parse(saved);
    const base = defaultState();

    return {
      ...base,
      ...parsed,
      stats: {
        ...base.stats,
        ...(parsed.stats || {})
      },
      today: {
        ...base.today,
        ...(parsed.today || {})
      },
      maxWeights: {
        ...base.maxWeights,
        ...(parsed.maxWeights || {})
      }
    };
  } catch {
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getTodayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function checkDailyReset() {
  const today = getTodayKey();

  if (state.today.date !== today) {
    state.today = {
      date: today,
      training: 0,
      protein: 0,
      sleep: 0,
      battle: 0
    };
    saveState();
  }
}

function setupSelectScreen() {
  const grid = document.getElementById("monsterSelectGrid");
  if (!grid) return;
  grid.innerHTML = "";

  monsters.forEach(monster => {
    const card = document.createElement("button");
    card.className = "monster-card";
    card.innerHTML = `
      <img src="images/${monster.id}.png" alt="${monster.name}">
      <strong>${monster.name}</strong>
      <p>${monster.type}</p>
      <p>${monster.desc}</p>
    `;

    card.addEventListener("click", () => {
      state.partnerId = monster.id;
      saveState();
      showMainApp();
      updateAll();
    });

    grid.appendChild(card);
  });
}

function setupDebugMode() {
  const debugCard = document.querySelector(".debug-card");
  if (!debugCard) return;

  if (DEBUG_MODE) {
    debugCard.classList.remove("hidden");
  } else {
    debugCard.classList.add("hidden");
  }
}

function setupEvents() {
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      showScreen(btn.dataset.screen);

      document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      updateAll();
    });
  });

  document.getElementById("trainingBtn").addEventListener("click", doTraining);
  document.getElementById("proteinBtn").addEventListener("click", drinkProtein);
  document.getElementById("sleepBtn").addEventListener("click", doSleep);
  document.getElementById("battleBtn").addEventListener("click", doBattle);

  document.getElementById("saveMaxWeightBtn").addEventListener("click", saveMaxWeight);
  document.getElementById("saveWeightBtn").addEventListener("click", saveWeight);
  document.getElementById("saveTargetBtn").addEventListener("click", saveTarget);

  document.querySelectorAll(".toggle-card-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.toggle;
      const target = document.getElementById(targetId);
      if (!target) return;

      target.classList.toggle("hidden");
      updateToggleButtonText(btn, targetId, target.classList.contains("hidden"));

      if (targetId === "weightGraphContent" && !target.classList.contains("hidden")) {
        drawWeightGraph();
      }
    });
  });

  const resetBtn = document.getElementById("resetBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", resetAllData);
  }

  const tutorialCloseBtn = document.getElementById("tutorialCloseBtn");
  if (tutorialCloseBtn) {
    tutorialCloseBtn.addEventListener("click", closeTutorial);
  }

  const debugLv1Btn = document.getElementById("debugLv1Btn");
  if (debugLv1Btn) debugLv1Btn.addEventListener("click", () => debugSetLevel(1));

  const debugLv5Btn = document.getElementById("debugLv5Btn");
  if (debugLv5Btn) debugLv5Btn.addEventListener("click", () => debugSetLevel(5));

  const debugLv15Btn = document.getElementById("debugLv15Btn");
  if (debugLv15Btn) debugLv15Btn.addEventListener("click", () => debugSetLevel(15));

  const debugLv30Btn = document.getElementById("debugLv30Btn");
  if (debugLv30Btn) debugLv30Btn.addEventListener("click", () => debugSetLevel(30));

  const debugAddExpBtn = document.getElementById("debugAddExpBtn");
  if (debugAddExpBtn) debugAddExpBtn.addEventListener("click", () => debugAddExp(100));

  const debugResetDailyBtn = document.getElementById("debugResetDailyBtn");
  if (debugResetDailyBtn) debugResetDailyBtn.addEventListener("click", debugResetDailyLimit);

  const debugResetBattleBtn = document.getElementById("debugResetBattleBtn");
  if (debugResetBattleBtn) debugResetBattleBtn.addEventListener("click", debugResetBattleCount);

  const modalCloseBtn = document.getElementById("eventModalCloseBtn");
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", closeEventModal);
  }

  const modal = document.getElementById("eventModal");
  if (modal) {
    modal.addEventListener("click", event => {
      if (event.target === modal) {
        closeEventModal();
      }
    });
  }
}

function updateToggleButtonText(btn, targetId, isClosed) {
  const labels = {
    appIntroContent: ["アプリ紹介を見る", "アプリ紹介を閉じる"],
    howtoContent: ["遊び方を見る", "遊び方を閉じる"],
    weightGraphContent: ["体重グラフを見る", "体重グラフを閉じる"],
    debugContent: ["開発用メニューを見る", "開発用メニューを閉じる"]
  };

  if (!labels[targetId]) return;

  btn.textContent = isClosed ? labels[targetId][0] : labels[targetId][1];
}

function showMainApp() {
  document.getElementById("bottomNav").classList.remove("hidden");
  showScreen("homeScreen");

  document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"));
  document.querySelector('[data-screen="homeScreen"]').classList.add("active");
}

function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });

  document.getElementById(screenId).classList.add("active");

  if (screenId === "otherScreen") {
    drawWeightGraph();
  }
}

function getPartner() {
  return monsters.find(m => m.id === state.partnerId) || monsters[0];
}

function getEvolutionStageByLevel(level) {
  if (level >= 30) return 3;
  if (level >= 15) return 2;
  if (level >= 5) return 1;
  return 0;
}

function getEvolutionStage() {
  return getEvolutionStageByLevel(state.level);
}

function getMonsterDisplayNameByStage(stage) {
  const partner = getPartner();
  if (stage >= 2) return partner.evoName;
  return partner.name;
}

function getMonsterDisplayName() {
  return getMonsterDisplayNameByStage(getEvolutionStage());
}

function getEvolutionTitle(stage) {
  if (stage === 1) return "第1進化！";
  if (stage === 2) return "第2進化！";
  if (stage === 3) return "最終進化！";
  return "進化！";
}

function getMonsterImage() {
  const partner = getPartner();
  const stage = getEvolutionStage();

  if (stage === 0) return `images/${partner.id}.png`;
  return `images/${partner.id}_evo${stage}.png`;
}

function handleImageError(img) {
  const partner = getPartner();
  img.onerror = null;
  img.src = `images/${partner.id}.png`;
}

function addExp(amount, messageId = "trainMessage") {
  const beforeLevel = state.level;
  const beforeStage = getEvolutionStageByLevel(beforeLevel);
  const beforeName = getMonsterDisplayNameByStage(beforeStage);

  state.exp += amount;

  while (state.exp >= getNeedExp()) {
    state.exp -= getNeedExp();
    state.level += 1;
  }

  const afterLevel = state.level;
  const afterStage = getEvolutionStageByLevel(afterLevel);
  const afterName = getMonsterDisplayNameByStage(afterStage);

  const result = {
    leveled: afterLevel > beforeLevel,
    evolved: afterStage > beforeStage,
    beforeLevel,
    afterLevel,
    beforeStage,
    afterStage,
    beforeName,
    afterName
  };

  if (result.leveled) {
    playSound("level");
    if (messageId) {
      setMessage(messageId, `レベルアップ！ Lv.${afterLevel}になった！`);
    }
  }

  return result;
}

function showEvolutionModal(expResult) {
  if (!expResult || !expResult.evolved) return;

  const title = getEvolutionTitle(expResult.afterStage);
  const lines = [];

  if (expResult.beforeName === expResult.afterName) {
    lines.push(`${expResult.afterName}は進化した！`);
  } else {
    lines.push(`${expResult.beforeName} → ${expResult.afterName}`);
  }

  lines.push(`Lv.${expResult.afterLevel} に到達！`);
  showEventModal(title, lines, "evolution");
}

function getNeedExp() {
  return 100;
}

function doTraining() {
  checkDailyReset();

  if (state.today.training >= 2) {
    setMessage("trainMessage", "今日の筋トレ記録は上限です。");
    return;
  }

  state.today.training += 1;
  state.totalTraining += 1;
  state.trainingDates.push(getTodayKey());

  const bench = Number(state.maxWeights?.bench || 0);
  const bonus = bench >= 80 ? 2 : 0;

  state.stats.power += 7 + bonus;
  state.stats.stamina += 4;
  state.stats.continuity += 3;

  const expResult = addExp(35, "trainMessage");
  playSound("training");
  saveState();
  updateAll();

  setMessage("trainMessage", "筋トレ記録完了！パワーと体力が上がった！");
  showEvolutionModal(expResult);
}
const STORAGE_KEY = "montore_save_v4";
const TUTORIAL_KEY = "montore_tutorial_seen_v3";

// 開発用メニューを表示したいときだけ true にする
// 完成版・普段使いでは false のままでOK
const DEBUG_MODE = false;

const monsters = [
  {
    id: "mokopina",
    name: "モコピナ",
    evoName: "モコリエル",
    type: "回復タイプ",
    desc: "かわいい癒し系モンスター"
  },
  {
    id: "rioruhu",
    name: "リオルフ",
    evoName: "リオルガ",
    type: "バランスタイプ",
    desc: "王道の主人公タイプ"
  },
  {
    id: "foremin",
    name: "フォレミン",
    evoName: "フォレスティア",
    type: "継続タイプ",
    desc: "自然をまとったおっとり系"
  },
  {
    id: "darun",
    name: "ダルン",
    evoName: "ダルバーン",
    type: "覚醒タイプ",
    desc: "普段はだらけているが本気は強い"
  },
  {
    id: "zaldo",
    name: "ザルド",
    evoName: "ザルヴェイル",
    type: "パワータイプ",
    desc: "緑の炎を持つ熱血モンスター"
  }
];

const enemies = [
  {
    id: "slime",
    name: "はじまりスライム",
    img: "images/enemy_slime.png",
    requiredTotal: 30,
    required: { power: 5, stamina: 5, recovery: 5, continuity: 3 },
    rewardBackground: "草原"
  },
  {
    id: "goblin",
    name: "森のゴブリン",
    img: "images/enemy_goblin.png",
    requiredTotal: 80,
    required: { power: 18, stamina: 15, recovery: 10, continuity: 8 },
    rewardBackground: "森"
  },
  {
    id: "golem",
    name: "岩石ゴーレム",
    img: "images/enemy_golem.png",
    requiredTotal: 150,
    required: { power: 35, stamina: 30, recovery: 18, continuity: 15 },
    rewardBackground: "岩山"
  },
  {
    id: "volcano",
    name: "火山の番人",
    img: "images/enemy_volcano.png",
    requiredTotal: 250,
    required: { power: 60, stamina: 48, recovery: 30, continuity: 25 },
    rewardBackground: "火山"
  },
  {
    id: "sky",
    name: "天空の守護者",
    img: "images/enemy_sky.png",
    requiredTotal: 380,
    required: { power: 85, stamina: 75, recovery: 55, continuity: 45 },
    rewardBackground: "天空"
  },
  {
    id: "dark",
    name: "闇の王",
    img: "images/enemy_dark.png",
    requiredTotal: 550,
    required: { power: 125, stamina: 105, recovery: 80, continuity: 70 },
    rewardBackground: "闇の城"
  }
];

const backgrounds = [
  { id: "start", name: "はじまり" },
  { id: "grass", name: "草原" },
  { id: "forest", name: "森" },
  { id: "rock", name: "岩山" },
  { id: "volcano", name: "火山" },
  { id: "sky", name: "天空" },
  { id: "dark", name: "闇の城" }
];

let state = loadState();

document.addEventListener("DOMContentLoaded", () => {
  setupSelectScreen();
  setupDebugMode();
  setupEvents();
  checkDailyReset();

  if (state.partnerId) {
    showMainApp();
  } else {
    showScreen("selectScreen");
  }

  updateAll();
  showTutorialIfNeeded();
});

function defaultState() {
  return {
    partnerId: null,
    level: 1,
    exp: 0,
    stats: {
      power: 0,
      stamina: 0,
      recovery: 0,
      continuity: 0
    },
    today: {
      date: getTodayKey(),
      training: 0,
      protein: 0,
      sleep: 0,
      battle: 0
    },
    totalTraining: 0,
    trainingDates: [],
    maxWeights: {
      bench: null,
      squat: null,
      deadlift: null
    },
    weightHistory: [],
    targetWeight: null,
    targetDate: null,
    unlockedBackgrounds: ["はじまり"],
    selectedBackground: "はじまり",
    defeatedEnemies: []
  };
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return defaultState();

  try {
    const parsed = JSON.parse(saved);
    const base = defaultState();

    return {
      ...base,
      ...parsed,
      stats: {
        ...base.stats,
        ...(parsed.stats || {})
      },
      today: {
        ...base.today,
        ...(parsed.today || {})
      },
      maxWeights: {
        ...base.maxWeights,
        ...(parsed.maxWeights || {})
      }
    };
  } catch {
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getTodayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function checkDailyReset() {
  const today = getTodayKey();

  if (state.today.date !== today) {
    state.today = {
      date: today,
      training: 0,
      protein: 0,
      sleep: 0,
      battle: 0
    };
    saveState();
  }
}

function setupSelectScreen() {
  const grid = document.getElementById("monsterSelectGrid");
  if (!grid) return;
  grid.innerHTML = "";

  monsters.forEach(monster => {
    const card = document.createElement("button");
    card.className = "monster-card";
    card.innerHTML = `
      <img src="images/${monster.id}.png" alt="${monster.name}">
      <strong>${monster.name}</strong>
      <p>${monster.type}</p>
      <p>${monster.desc}</p>
    `;

    card.addEventListener("click", () => {
      state.partnerId = monster.id;
      saveState();
      showMainApp();
      updateAll();
    });

    grid.appendChild(card);
  });
}

function setupDebugMode() {
  const debugCard = document.querySelector(".debug-card");
  if (!debugCard) return;

  if (DEBUG_MODE) {
    debugCard.classList.remove("hidden");
  } else {
    debugCard.classList.add("hidden");
  }
}

function setupEvents() {
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      showScreen(btn.dataset.screen);

      document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      updateAll();
    });
  });

  document.getElementById("trainingBtn").addEventListener("click", doTraining);
  document.getElementById("proteinBtn").addEventListener("click", drinkProtein);
  document.getElementById("sleepBtn").addEventListener("click", doSleep);
  document.getElementById("battleBtn").addEventListener("click", doBattle);

  document.getElementById("saveMaxWeightBtn").addEventListener("click", saveMaxWeight);
  document.getElementById("saveWeightBtn").addEventListener("click", saveWeight);
  document.getElementById("saveTargetBtn").addEventListener("click", saveTarget);

  document.querySelectorAll(".toggle-card-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.toggle;
      const target = document.getElementById(targetId);
      if (!target) return;

      target.classList.toggle("hidden");
      updateToggleButtonText(btn, targetId, target.classList.contains("hidden"));

      if (targetId === "weightGraphContent" && !target.classList.contains("hidden")) {
        drawWeightGraph();
      }
    });
  });

  const resetBtn = document.getElementById("resetBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", resetAllData);
  }

  const tutorialCloseBtn = document.getElementById("tutorialCloseBtn");
  if (tutorialCloseBtn) {
    tutorialCloseBtn.addEventListener("click", closeTutorial);
  }

  const debugLv1Btn = document.getElementById("debugLv1Btn");
  if (debugLv1Btn) debugLv1Btn.addEventListener("click", () => debugSetLevel(1));

  const debugLv5Btn = document.getElementById("debugLv5Btn");
  if (debugLv5Btn) debugLv5Btn.addEventListener("click", () => debugSetLevel(5));

  const debugLv15Btn = document.getElementById("debugLv15Btn");
  if (debugLv15Btn) debugLv15Btn.addEventListener("click", () => debugSetLevel(15));

  const debugLv30Btn = document.getElementById("debugLv30Btn");
  if (debugLv30Btn) debugLv30Btn.addEventListener("click", () => debugSetLevel(30));

  const debugAddExpBtn = document.getElementById("debugAddExpBtn");
  if (debugAddExpBtn) debugAddExpBtn.addEventListener("click", () => debugAddExp(100));

  const debugResetDailyBtn = document.getElementById("debugResetDailyBtn");
  if (debugResetDailyBtn) debugResetDailyBtn.addEventListener("click", debugResetDailyLimit);

  const debugResetBattleBtn = document.getElementById("debugResetBattleBtn");
  if (debugResetBattleBtn) debugResetBattleBtn.addEventListener("click", debugResetBattleCount);

  const modalCloseBtn = document.getElementById("eventModalCloseBtn");
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", closeEventModal);
  }

  const modal = document.getElementById("eventModal");
  if (modal) {
    modal.addEventListener("click", event => {
      if (event.target === modal) {
        closeEventModal();
      }
    });
  }
}

function updateToggleButtonText(btn, targetId, isClosed) {
  const labels = {
    appIntroContent: ["アプリ紹介を見る", "アプリ紹介を閉じる"],
    howtoContent: ["遊び方を見る", "遊び方を閉じる"],
    weightGraphContent: ["体重グラフを見る", "体重グラフを閉じる"],
    debugContent: ["開発用メニューを見る", "開発用メニューを閉じる"]
  };

  if (!labels[targetId]) return;

  btn.textContent = isClosed ? labels[targetId][0] : labels[targetId][1];
}

function showMainApp() {
  document.getElementById("bottomNav").classList.remove("hidden");
  showScreen("homeScreen");

  document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"));
  document.querySelector('[data-screen="homeScreen"]').classList.add("active");
}

function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });

  document.getElementById(screenId).classList.add("active");

  if (screenId === "otherScreen") {
    drawWeightGraph();
  }
}

function getPartner() {
  return monsters.find(m => m.id === state.partnerId) || monsters[0];
}

function getEvolutionStageByLevel(level) {
  if (level >= 30) return 3;
  if (level >= 15) return 2;
  if (level >= 5) return 1;
  return 0;
}

function getEvolutionStage() {
  return getEvolutionStageByLevel(state.level);
}

function getMonsterDisplayNameByStage(stage) {
  const partner = getPartner();
  if (stage >= 2) return partner.evoName;
  return partner.name;
}

function getMonsterDisplayName() {
  return getMonsterDisplayNameByStage(getEvolutionStage());
}

function getEvolutionTitle(stage) {
  if (stage === 1) return "第1進化！";
  if (stage === 2) return "第2進化！";
  if (stage === 3) return "最終進化！";
  return "進化！";
}

function getMonsterImage() {
  const partner = getPartner();
  const stage = getEvolutionStage();

  if (stage === 0) return `images/${partner.id}.png`;
  return `images/${partner.id}_evo${stage}.png`;
}

function handleImageError(img) {
  const partner = getPartner();
  img.onerror = null;
  img.src = `images/${partner.id}.png`;
}

function addExp(amount, messageId = "trainMessage") {
  const beforeLevel = state.level;
  const beforeStage = getEvolutionStageByLevel(beforeLevel);
  const beforeName = getMonsterDisplayNameByStage(beforeStage);

  state.exp += amount;

  while (state.exp >= getNeedExp()) {
    state.exp -= getNeedExp();
    state.level += 1;
  }

  const afterLevel = state.level;
  const afterStage = getEvolutionStageByLevel(afterLevel);
  const afterName = getMonsterDisplayNameByStage(afterStage);

  const result = {
    leveled: afterLevel > beforeLevel,
    evolved: afterStage > beforeStage,
    beforeLevel,
    afterLevel,
    beforeStage,
    afterStage,
    beforeName,
    afterName
  };

  if (result.leveled) {
    playSound("level");
    if (messageId) {
      setMessage(messageId, `レベルアップ！ Lv.${afterLevel}になった！`);
    }
  }

  return result;
}

function showEvolutionModal(expResult) {
  if (!expResult || !expResult.evolved) return;

  const title = getEvolutionTitle(expResult.afterStage);
  const lines = [];

  if (expResult.beforeName === expResult.afterName) {
    lines.push(`${expResult.afterName}は進化した！`);
  } else {
    lines.push(`${expResult.beforeName} → ${expResult.afterName}`);
  }

  lines.push(`Lv.${expResult.afterLevel} に到達！`);
  showEventModal(title, lines, "evolution");
}

function getNeedExp() {
  return 100;
}

function doTraining() {
  checkDailyReset();

  if (state.today.training >= 2) {
    setMessage("trainMessage", "今日の筋トレ記録は上限です。");
    return;
  }

  state.today.training += 1;
  state.totalTraining += 1;
  state.trainingDates.push(getTodayKey());

  const bench = Number(state.maxWeights?.bench || 0);
  const bonus = bench >= 80 ? 2 : 0;

  state.stats.power += 7 + bonus;
  state.stats.stamina += 4;
  state.stats.continuity += 3;

  const expResult = addExp(35, "trainMessage");
  playSound("training");
  saveState();
  updateAll();

  setMessage("trainMessage", "筋トレ記録完了！パワーと体力が上がった！");
  showEvolutionModal(expResult);
}
  document.getElementById("powerText").textContent = state.stats.power;
  document.getElementById("staminaText").textContent = state.stats.stamina;
  document.getElementById("recoveryText").textContent = state.stats.recovery;
  document.getElementById("continuityText").textContent = state.stats.continuity;
  document.getElementById("totalPowerText").textContent = getTotalPower();
}

function updateBattle() {
  const enemy = getCurrentEnemy();

  document.getElementById("enemyNameText").textContent = enemy.name;

  const battleArea = document.querySelector(".battle-area");
  if (battleArea) {
    battleArea.className = `battle-area enemy-theme-${enemy.id} battle-bg-${getBackgroundId(state.selectedBackground)}`;
  }

  const enemyImg = document.getElementById("enemyImg");
  if (enemyImg) {
    enemyImg.src = enemy.img;
    enemyImg.className = `enemy-img enemy-size-${enemy.id}`;
    enemyImg.onerror = () => {
      enemyImg.onerror = null;
      enemyImg.src = "images/enemy_slime.png";
      enemyImg.className = "enemy-img enemy-size-slime";
    };
  }

  const playerImg = document.getElementById("battlePlayerImg");
  if (playerImg) {
    playerImg.src = getMonsterImage();
    playerImg.onerror = () => handleImageError(playerImg);
  }

  document.getElementById("battlePlayerName").textContent = getMonsterDisplayName();
  document.getElementById("currentEnemyInfo").textContent = enemy.name;
  document.getElementById("requiredPowerText").textContent = enemy.requiredTotal;
  document.getElementById("todayBattleText").textContent = state.today.battle || 0;

  const playerHpPercent = Math.min(100, Math.floor((getTotalPower() / enemy.requiredTotal) * 100));
  document.getElementById("playerHpFill").style.width = `${playerHpPercent}%`;

  const diff = getTotalPower() - enemy.requiredTotal;

  let enemyHpPercent = 100;

  if (canDefeat(enemy)) {
    enemyHpPercent = 15;
  } else if (diff <= -1 && diff >= -2) {
    enemyHpPercent = 35;
  } else if (diff <= -3 && diff >= -5) {
    enemyHpPercent = 55;
  }

  document.getElementById("enemyHpFill").style.width = `${enemyHpPercent}%`;
}

function updateOther() {
  updateBackgroundList();
  updateAchievementList();
}

function getNextEvolutionText() {
  if (state.level < 5) return `次の進化まであと${5 - state.level}Lv`;
  if (state.level < 15) return `次の進化まであと${15 - state.level}Lv`;
  if (state.level < 30) return `次の進化まであと${30 - state.level}Lv`;
  return "最終進化済み";
}

function getWeeklyTrainingCount() {
  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 6);

  return state.trainingDates.filter(dateText => {
    const d = new Date(dateText);
    return d >= new Date(sevenDaysAgo.toDateString());
  }).length;
}

function getDaysLeftText() {
  if (!state.targetDate) return "未設定";

  const today = new Date(getTodayKey());
  const target = new Date(state.targetDate);
  const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));

  if (diff < 0) return "終了";
  if (diff === 0) return "今日";
  return `${diff}日`;
}

function getNeedPerDayText() {
  const latest = state.weightHistory[state.weightHistory.length - 1];

  if (!latest || !state.targetWeight || !state.targetDate) {
    return "未計算";
  }

  const today = new Date(getTodayKey());
  const target = new Date(state.targetDate);
  const diffDays = Math.ceil((target - today) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "目標日を過ぎています";

  const diffWeight = state.targetWeight - latest.weight;
  const perDay = diffWeight / diffDays;

  if (perDay > 0) return `+${perDay.toFixed(2)}kg / 日`;
  return `${perDay.toFixed(2)}kg / 日`;
}

function normalizeSelectedBackground() {
  if (!state.selectedBackground) {
    state.selectedBackground = "はじまり";
  }

  if (!state.unlockedBackgrounds.includes(state.selectedBackground)) {
    state.selectedBackground = "はじまり";
  }
}

function getBackgroundId(name) {
  const found = backgrounds.find(bg => bg.name === name);
  return found ? found.id : "start";
}

function applySelectedBackground() {
  const app = document.getElementById("app");
  if (!app) return;

  const bgId = getBackgroundId(state.selectedBackground);
  app.classList.remove(
    "app-bg-start",
    "app-bg-grass",
    "app-bg-forest",
    "app-bg-rock",
    "app-bg-volcano",
    "app-bg-sky",
    "app-bg-dark"
  );
  app.classList.add(`app-bg-${bgId}`);
}

function selectBackground(bgName) {
  if (!state.unlockedBackgrounds.includes(bgName)) {
    setMessage("otherMessage", "この背景はまだ解放されていません。");
    return;
  }

  state.selectedBackground = bgName;
  saveState();
  updateAll();
  setMessage("otherMessage", `背景を「${bgName}」に変更しました。`);
}

function updateBackgroundList() {
  const list = document.getElementById("backgroundList");
  if (!list) return;

  list.innerHTML = "";

  backgrounds.forEach(bg => {
    const unlocked = state.unlockedBackgrounds.includes(bg.name);
    const selected = state.selectedBackground === bg.name;

    const button = document.createElement("button");
    button.type = "button";
    button.className = `background-btn ${unlocked ? "unlocked" : "locked"} ${selected ? "selected" : ""}`;
    button.disabled = !unlocked;
    button.innerHTML = `
      <span class="background-name">${bg.name}</span>
      <span class="background-status">${selected ? "使用中" : unlocked ? "使う" : "未解放"}</span>
    `;

    if (unlocked) {
      button.addEventListener("click", () => selectBackground(bg.name));
    }

    list.appendChild(button);
  });
}

function updateAchievementList() {
  const list = document.getElementById("achievementList");
  if (!list) return;

  const hasAnyMaxWeight =
    !!state.maxWeights?.bench ||
    !!state.maxWeights?.squat ||
    !!state.maxWeights?.deadlift;

  const defeatedCount = state.defeatedEnemies.length;
  const unlockedBackgroundCount = state.unlockedBackgrounds.length;
  const weightRecordCount = state.weightHistory.length;

  const achievements = [
    { name: "初トレ達成", ok: state.totalTraining >= 1 },
    { name: "筋トレ10回", ok: state.totalTraining >= 10 },
    { name: "筋トレ30回", ok: state.totalTraining >= 30 },
    { name: "筋トレ100回", ok: state.totalTraining >= 100 },

    { name: "Lv5到達", ok: state.level >= 5 },
    { name: "Lv15到達", ok: state.level >= 15 },
    { name: "Lv30到達", ok: state.level >= 30 },

    { name: "初勝利", ok: defeatedCount >= 1 },
    { name: "3体撃破", ok: defeatedCount >= 3 },
    { name: "全敵撃破", ok: defeatedCount >= enemies.length },

    { name: "体重を初記録", ok: weightRecordCount >= 1 },
    { name: "体重を7回記録", ok: weightRecordCount >= 7 },
    { name: "体重を30回記録", ok: weightRecordCount >= 30 },
    { name: "目標設定完了", ok: !!state.targetWeight && !!state.targetDate },

    { name: "最大重量を初記録", ok: hasAnyMaxWeight },
    { name: "ベンチ80kg達成", ok: Number(state.maxWeights?.bench || 0) >= 80 },
    { name: "スクワット100kg達成", ok: Number(state.maxWeights?.squat || 0) >= 100 },
    { name: "デッドリフト120kg達成", ok: Number(state.maxWeights?.deadlift || 0) >= 120 },

    { name: "背景3種類解放", ok: unlockedBackgroundCount >= 3 },
    { name: "背景全解放", ok: unlockedBackgroundCount >= backgrounds.length }
  ];

  list.innerHTML = "";

  achievements.forEach(a => {
    const span = document.createElement("span");
    span.className = a.ok ? "badge achievement-badge unlocked" : "badge achievement-badge";
    span.textContent = a.ok ? `達成：${a.name}` : `未達成：${a.name}`;
    list.appendChild(span);
  });
}

function drawWeightGraph() {
  const canvas = document.getElementById("weightCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.fillRect(0, 0, w, h);

  const data = state.weightHistory.slice(-10);

  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 1;

  for (let i = 1; i <= 3; i++) {
    const y = (h / 4) * i;
    ctx.beginPath();
    ctx.moveTo(20, y);
    ctx.lineTo(w - 10, y);
    ctx.stroke();
  }

  if (data.length < 2) {
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.font = "14px sans-serif";
    ctx.fillText("体重を2回以上記録するとグラフが表示されます", 20, 78);
    return;
  }

  const weights = data.map(d => d.weight);
  const min = Math.min(...weights) - 1;
  const max = Math.max(...weights) + 1;

  const points = data.map((d, i) => {
    const x = 24 + (i * (w - 48)) / (data.length - 1);
    const y = h - 24 - ((d.weight - min) / (max - min)) * (h - 48);
    return { x, y, weight: d.weight };
  });

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.beginPath();

  points.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });

  ctx.stroke();

  points.forEach(p => {
    ctx.fillStyle = "#ff4d4d";
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = "11px sans-serif";
  ctx.fillText(`${max.toFixed(1)}kg`, 4, 16);
  ctx.fillText(`${min.toFixed(1)}kg`, 4, h - 8);
}

function updateMuteButton() {
  // 音なし版なので何もしない
}

function playSound() {
  // 音なし版なので効果音処理は何もしない
}

function showTutorialIfNeeded() {
  const modal = document.getElementById("tutorialModal");
  if (!modal) return;

  if (localStorage.getItem(TUTORIAL_KEY)) return;

  modal.classList.remove("hidden");
}

function closeTutorial() {
  localStorage.setItem(TUTORIAL_KEY, "true");

  const modal = document.getElementById("tutorialModal");
  if (modal) {
    modal.classList.add("hidden");
  }
}

function resetAllData() {
  const firstConfirm = confirm("本当にモントレのデータをすべてリセットしますか？");
  if (!firstConfirm) return;

  const secondConfirm = confirm("育成データ、体重記録、実績、背景解放などが削除されます。元に戻せません。");
  if (!secondConfirm) return;

  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(TUTORIAL_KEY);

  state = defaultState();

  alert("データをリセットしました。最初から開始します。");
  location.reload();
}

function setMessage(id, text) {
  const el = document.getElementById(id);
  if (!el) return;

  el.textContent = text;

  setTimeout(() => {
    if (el.textContent === text) {
      el.textContent = "";
    }
  }, 3500);
}

function playBattleAnimation(resultType) {
  const battleArea = document.querySelector(".battle-area");
  if (!battleArea) return;

  battleArea.classList.remove("result-win", "result-lose");
  void battleArea.offsetWidth;
  battleArea.classList.add(resultType === "win" ? "result-win" : "result-lose");

  setTimeout(() => {
    battleArea.classList.remove("result-win", "result-lose");
  }, 900);
}

function showEventModal(title, lines, type = "normal") {
  const modal = document.getElementById("eventModal");
  const modalTitle = document.getElementById("eventModalTitle");
  const modalBody = document.getElementById("eventModalBody");
  const modalCard = modal ? modal.querySelector(".event-modal-card") : null;

  if (!modal || !modalTitle || !modalBody) return;

  if (modalCard) {
    modalCard.classList.remove("modal-win", "modal-lose", "modal-evolution", "modal-normal");
    modalCard.classList.add(`modal-${type}`);
  }

  modalTitle.textContent = title;

  modalBody.innerHTML = "";
  lines.forEach(line => {
    const p = document.createElement("p");
    p.textContent = line;
    modalBody.appendChild(p);
  });

  modal.classList.remove("hidden");
}

function closeEventModal() {
  const modal = document.getElementById("eventModal");
  if (!modal) return;

  modal.classList.add("hidden");
}