const STORAGE_KEY = "montore_save_v4";
const TUTORIAL_KEY = "montore_tutorial_seen_v1";

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
      },
      trainingDates: Array.isArray(parsed.trainingDates) ? parsed.trainingDates : [],
      weightHistory: Array.isArray(parsed.weightHistory) ? parsed.weightHistory : [],
      unlockedBackgrounds: Array.isArray(parsed.unlockedBackgrounds) ? parsed.unlockedBackgrounds : ["はじまり"],
      defeatedEnemies: Array.isArray(parsed.defeatedEnemies) ? parsed.defeatedEnemies : []
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

  const trainingBtn = document.getElementById("trainingBtn");
  if (trainingBtn) trainingBtn.addEventListener("click", doTraining);

  const proteinBtn = document.getElementById("proteinBtn");
  if (proteinBtn) proteinBtn.addEventListener("click", drinkProtein);

  const sleepBtn = document.getElementById("sleepBtn");
  if (sleepBtn) sleepBtn.addEventListener("click", doSleep);

  const battleBtn = document.getElementById("battleBtn");
  if (battleBtn) battleBtn.addEventListener("click", doBattle);

  const saveMaxWeightBtn = document.getElementById("saveMaxWeightBtn");
  if (saveMaxWeightBtn) saveMaxWeightBtn.addEventListener("click", saveMaxWeight);

  const saveWeightBtn = document.getElementById("saveWeightBtn");
  if (saveWeightBtn) saveWeightBtn.addEventListener("click", saveWeight);

  const saveTargetBtn = document.getElementById("saveTargetBtn");
  if (saveTargetBtn) saveTargetBtn.addEventListener("click", saveTarget);

  const muteBtn = document.getElementById("muteBtn");
  if (muteBtn) {
    muteBtn.textContent = "🔇 音なし版";
    muteBtn.addEventListener("click", () => {
      setMessage("otherMessage", "現在は音なし版です。");
    });
  }

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

  const tutorialCloseBtn = document.getElementById("tutorialCloseBtn");
  if (tutorialCloseBtn) {
    tutorialCloseBtn.addEventListener("click", closeTutorial);
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
  const bottomNav = document.getElementById("bottomNav");
  if (bottomNav) bottomNav.classList.remove("hidden");

  showScreen("homeScreen");

  document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"));

  const homeBtn = document.querySelector('[data-screen="homeScreen"]');
  if (homeBtn) homeBtn.classList.add("active");
}

function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });

  const target = document.getElementById(screenId);
  if (target) target.classList.add("active");

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

  if (result.leveled && messageId) {
    setMessage(messageId, `レベルアップ！ Lv.${afterLevel}になった！`);
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

  saveState();
  updateAll();

  setMessage("trainMessage", "筋トレ記録完了！パワーと体力が上がった！");
  showEvolutionModal(expResult);
}

function drinkProtein() {
  checkDailyReset();

  if (state.today.protein >= 3) {
    setMessage("trainMessage", "今日のプロテイン記録は上限です。");
    return;
  }

  state.today.protein += 1;
  state.stats.power += 3;
  state.stats.recovery += 4;

  const expResult = addExp(18, "trainMessage");

  saveState();
  updateAll();

  setMessage("trainMessage", "プロテイン記録完了！回復力が上がった！");
  showEvolutionModal(expResult);
}

function doSleep() {
  checkDailyReset();

  if (state.today.sleep >= 2) {
    setMessage("trainMessage", "今日の睡眠記録は上限です。");
    return;
  }

  const hoursText = prompt("睡眠時間を入力してください。例：7");
  if (hoursText === null) return;

  const hours = Number(hoursText);
  if (Number.isNaN(hours) || hours <= 0) {
    setMessage("trainMessage", "正しい睡眠時間を入力してください。");
    return;
  }

  let recoveryPoint = 3;
  if (hours >= 10) recoveryPoint = 5;
  else if (hours >= 9) recoveryPoint = 7;
  else if (hours >= 8) recoveryPoint = 6;
  else if (hours >= 7) recoveryPoint = 5;
  else if (hours >= 6) recoveryPoint = 4;
  else if (hours >= 5) recoveryPoint = 3;
  else recoveryPoint = 1;

  state.today.sleep += 1;
  state.stats.recovery += recoveryPoint;
  state.stats.stamina += Math.max(1, Math.floor(recoveryPoint / 2));

  const expResult = addExp(22, "trainMessage");

  saveState();
  updateAll();

  setMessage("trainMessage", `睡眠記録完了！回復力が${recoveryPoint}上がった！`);
  showEvolutionModal(expResult);
}

function getTotalPower() {
  return state.stats.power + state.stats.stamina + state.stats.recovery + state.stats.continuity;
}

function getCurrentEnemy() {
  const next = enemies.find(enemy => !state.defeatedEnemies.includes(enemy.id));
  return next || enemies[enemies.length - 1];
}

function canDefeat(enemy) {
  const total = getTotalPower();
  const s = state.stats;

  return (
    total >= enemy.requiredTotal &&
    s.power >= enemy.required.power &&
    s.stamina >= enemy.required.stamina &&
    s.recovery >= enemy.required.recovery &&
    s.continuity >= enemy.required.continuity
  );
}

function judgeBattleResult(enemy) {
  const total = getTotalPower();
  const diff = total - enemy.requiredTotal;
  const s = state.stats;

  const clearsIndividualStats =
    s.power >= enemy.required.power &&
    s.stamina >= enemy.required.stamina &&
    s.recovery >= enemy.required.recovery &&
    s.continuity >= enemy.required.continuity;

  if (!clearsIndividualStats) {
    return { win: false, reason: "individual_lack" };
  }

  if (diff >= 1 && diff <= 5) {
    if (Math.random() < 0.1) {
      return { win: false, reason: "bad_luck" };
    }
    return { win: true, reason: "close_win" };
  }

  if (diff === 0 || diff >= 6) {
    return { win: true, reason: "normal_win" };
  }

  if (diff <= -1 && diff >= -2) {
    if (Math.random() < 0.3) {
      return { win: true, reason: "lucky_win" };
    }
    return { win: false, reason: "close_lack" };
  }

  if (diff <= -3 && diff >= -5) {
    if (Math.random() < 0.1) {
      return { win: true, reason: "miracle_win" };
    }
    return { win: false, reason: "total_lack" };
  }

  return { win: false, reason: "total_lack" };
}

function doBattle() {
  checkDailyReset();

  if ((state.today.battle || 0) >= 2) {
    setMessage("battleMessage", "今日のバトル回数は上限です。明日また挑戦しよう！");
    return;
  }

  const enemy = getCurrentEnemy();

  if (state.defeatedEnemies.includes(enemy.id) && enemy.id === enemies[enemies.length - 1].id) {
    setMessage("battleMessage", "すべての敵を倒しました！今後の追加ボスを待とう！");
    return;
  }

  state.today.battle = (state.today.battle || 0) + 1;

  const result = judgeBattleResult(enemy);

  if (result.win) {
    if (!state.defeatedEnemies.includes(enemy.id)) {
      state.defeatedEnemies.push(enemy.id);
    }

    const backgroundUnlockedNow = !state.unlockedBackgrounds.includes(enemy.rewardBackground);

    if (backgroundUnlockedNow) {
      state.unlockedBackgrounds.push(enemy.rewardBackground);
      state.selectedBackground = enemy.rewardBackground;
    }

    const expResult = addExp(45, null);

    saveState();
    updateAll();

    let message = `${enemy.name}に勝利！`;
    if (result.reason === "miracle_win") {
      message = `${enemy.name}に奇跡の勝利！`;
    } else if (result.reason === "lucky_win") {
      message = `${enemy.name}にラッキー勝利！`;
    } else if (result.reason === "close_win") {
      message = `${enemy.name}に勝利！少し危なかったけど勝ち切った！`;
    }

    setMessage("battleMessage", message);

    const modalLines = [];
    modalLines.push(message);
    modalLines.push("経験値 +45");

    if (backgroundUnlockedNow) {
      modalLines.push(`背景「${enemy.rewardBackground}」解放！`);
    }

    if (expResult.leveled) {
      modalLines.push(`Lv.${expResult.afterLevel} にアップ！`);
    }

    if (expResult.evolved) {
      if (expResult.beforeName === expResult.afterName) {
        modalLines.push(`${expResult.afterName}は進化した！`);
      } else {
        modalLines.push(`${expResult.beforeName} → ${expResult.afterName}`);
      }
    }

    playBattleAnimation("win");
    showEventModal("WIN!", modalLines, "win");
    return;
  }

  saveState();
  updateAll();
  playBattleAnimation("lose");

  let loseMessage = "まだ勝てない…";
  const modalLines = [];

  if (result.reason === "bad_luck") {
    loseMessage = "まさかの敗北…。総合力は足りていたが油断した！";
    modalLines.push(loseMessage);
    modalLines.push("次は勝てる可能性が高い！");
    setMessage("battleMessage", loseMessage);
    showEventModal("LOSE...", modalLines, "lose");
    return;
  }

  if (result.reason === "close_lack") {
    loseMessage = "かなり惜しかった…。あと少しで勝てそう！";
    modalLines.push(loseMessage);
  } else {
    loseMessage = "まだ勝てない…。能力を上げて再挑戦しよう！";
    modalLines.push(loseMessage);
  }

  const lack = getLackText(enemy);
  if (lack) {
    modalLines.push(lack);
  }

  setMessage("battleMessage", lack ? `${loseMessage} ${lack}` : loseMessage);
  showEventModal("LOSE...", modalLines, "lose");
}

function getLackText(enemy) {
  const lacks = [];
  const s = state.stats;

  if (getTotalPower() < enemy.requiredTotal) {
    lacks.push(`総合力あと${enemy.requiredTotal - getTotalPower()}`);
  }
  if (s.power < enemy.required.power) {
    lacks.push(`パワーあと${enemy.required.power - s.power}`);
  }
  if (s.stamina < enemy.required.stamina) {
    lacks.push(`体力あと${enemy.required.stamina - s.stamina}`);
  }
  if (s.recovery < enemy.required.recovery) {
    lacks.push(`回復力あと${enemy.required.recovery - s.recovery}`);
  }
  if (s.continuity < enemy.required.continuity) {
    lacks.push(`継続力あと${enemy.required.continuity - s.continuity}`);
  }

  return lacks.join("、");
}

function saveMaxWeight() {
  const benchValue = document.getElementById("benchInput").value;
  const squatValue = document.getElementById("squatInput").value;
  const deadliftValue = document.getElementById("deadliftInput").value;

  const bench = Number(benchValue);
  const squat = Number(squatValue);
  const deadlift = Number(deadliftValue);

  if (
    (benchValue && (Number.isNaN(bench) || bench <= 0)) ||
    (squatValue && (Number.isNaN(squat) || squat <= 0)) ||
    (deadliftValue && (Number.isNaN(deadlift) || deadlift <= 0))
  ) {
    setMessage("otherMessage", "正しい最大重量を入力してください。");
    return;
  }

  if (!benchValue && !squatValue && !deadliftValue) {
    setMessage("otherMessage", "保存する重量を入力してください。");
    return;
  }

  if (bench > 0) state.maxWeights.bench = bench;
  if (squat > 0) state.maxWeights.squat = squat;
  if (deadlift > 0) state.maxWeights.deadlift = deadlift;

  document.getElementById("benchInput").value = "";
  document.getElementById("squatInput").value = "";
  document.getElementById("deadliftInput").value = "";

  saveState();
  updateAll();

  setMessage("otherMessage", "最大重量を保存しました。");
}

function saveWeight() {
  const input = document.getElementById("weightInput");
  const value = Number(input.value);

  if (Number.isNaN(value) || value <= 0) {
    setMessage("otherMessage", "正しい体重を入力してください。");
    return;
  }

  state.weightHistory.push({
    date: getTodayKey(),
    weight: value
  });

  saveState();
  input.value = "";
  updateAll();

  setMessage("otherMessage", "体重を記録しました。");
}

function saveTarget() {
  const weightInput = document.getElementById("targetWeightInput");
  const dateInput = document.getElementById("targetDateInput");

  const weight = Number(weightInput.value);
  const date = dateInput.value;

  if (Number.isNaN(weight) || weight <= 0 || !date) {
    setMessage("otherMessage", "目標体重と目標日を入力してください。");
    return;
  }

  state.targetWeight = weight;
  state.targetDate = date;

  weightInput.value = "";
  dateInput.value = "";

  saveState();
  updateAll();

  setMessage("otherMessage", "目標を保存しました。");
}

function resetAllData() {
  const firstConfirm = confirm("本当にモントレのデータをすべてリセットしますか？");

  if (!firstConfirm) {
    return;
  }

  const secondConfirm = confirm("育成データ、体重記録、実績、背景解放などが削除されます。元に戻せません。");

  if (!secondConfirm) {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(TUTORIAL_KEY);

  state = defaultState();

  alert("データをリセットしました。最初から開始します。");
  location.reload();
}

function debugSetLevel(level) {
  if (!DEBUG_MODE) return;

  if (!state.partnerId) {
    setMessage("otherMessage", "先に相棒モンスターを選んでください。");
    return;
  }

  const beforeStage = getEvolutionStageByLevel(state.level);
  const beforeName = getMonsterDisplayNameByStage(beforeStage);

  state.level = level;
  state.exp = 0;

  const afterStage = getEvolutionStageByLevel(state.level);
  const afterName = getMonsterDisplayNameByStage(afterStage);

  saveState();
  updateAll();

  setMessage("otherMessage", `開発用：Lv.${level}に変更しました。`);

  if (afterStage > beforeStage) {
    showEvolutionModal({
      evolved: true,
      beforeLevel: level,
      afterLevel: level,
      beforeStage,
      afterStage,
      beforeName,
      afterName
    });
  }
}

function debugAddExp(amount) {
  if (!DEBUG_MODE) return;

  if (!state.partnerId) {
    setMessage("otherMessage", "先に相棒モンスターを選んでください。");
    return;
  }

  const expResult = addExp(amount, null);
  saveState();
  updateAll();

  setMessage("otherMessage", `開発用：経験値を${amount}追加しました。`);

  if (expResult.evolved) {
    showEvolutionModal(expResult);
  }
}

function debugResetDailyLimit() {
  if (!DEBUG_MODE) return;

  state.today = {
    date: getTodayKey(),
    training: 0,
    protein: 0,
    sleep: 0,
    battle: 0
  };

  saveState();
  updateAll();
  setMessage("otherMessage", "開発用：今日の上限をリセットしました。");
}

function debugResetBattleCount() {
  if (!DEBUG_MODE) return;

  state.today.battle = 0;

  saveState();
  updateAll();
  setMessage("otherMessage", "開発用：バトル回数をリセットしました。");
}

function updateAll() {
  normalizeSelectedBackground();
  applySelectedBackground();
  updateMuteButton();

  if (!state.partnerId) return;

  updateHome();
  updateTrain();
  updateBattle();
  updateOther();
  drawWeightGraph();
}

function updateHome() {
  const homeImg = document.getElementById("homeMonsterImg");
  if (homeImg) {
    homeImg.src = getMonsterImage();
    homeImg.onerror = () => handleImageError(homeImg);
  }

  const homeMonsterName = document.getElementById("homeMonsterName");
  if (homeMonsterName) homeMonsterName.textContent = getMonsterDisplayName();

  const homeLevelText = document.getElementById("homeLevelText");
  const homePowerText = document.getElementById("homePowerText");
  const homeNextEvolutionText = document.getElementById("homeNextEvolutionText");

  if (homeLevelText) homeLevelText.textContent = state.level;
  if (homePowerText) homePowerText.textContent = getTotalPower();
  if (homeNextEvolutionText) homeNextEvolutionText.textContent = getNextEvolutionText();

  const homeBenchText = document.getElementById("homeBenchText");
  const homeSquatText = document.getElementById("homeSquatText");
  const homeDeadliftText = document.getElementById("homeDeadliftText");

  if (homeBenchText) {
    homeBenchText.textContent = state.maxWeights?.bench ? `${state.maxWeights.bench}kg` : "未記録";
  }

  if (homeSquatText) {
    homeSquatText.textContent = state.maxWeights?.squat ? `${state.maxWeights.squat}kg` : "未記録";
  }

  if (homeDeadliftText) {
    homeDeadliftText.textContent = state.maxWeights?.deadlift ? `${state.maxWeights.deadlift}kg` : "未記録";
  }

  const weeklyTrainingText = document.getElementById("weeklyTrainingText");
  if (weeklyTrainingText) weeklyTrainingText.textContent = getWeeklyTrainingCount();

  const totalTrainingText = document.getElementById("totalTrainingText");
  if (totalTrainingText) totalTrainingText.textContent = state.totalTraining;

  const latest = state.weightHistory[state.weightHistory.length - 1];

  const homeCurrentWeightText = document.getElementById("homeCurrentWeightText");
  if (homeCurrentWeightText) {
    homeCurrentWeightText.textContent = latest ? `${latest.weight}kg` : "未記録";
  }

  const homeTargetWeightText = document.getElementById("homeTargetWeightText");
  if (homeTargetWeightText) {
    homeTargetWeightText.textContent = state.targetWeight ? `${state.targetWeight}kg` : "未設定";
  }

  const homeTargetDateText = document.getElementById("homeTargetDateText");
  if (homeTargetDateText) {
    homeTargetDateText.textContent = state.targetDate || "未設定";
  }

  const daysLeftText = document.getElementById("daysLeftText");
  if (daysLeftText) daysLeftText.textContent = getDaysLeftText();

  const needText = getNeedPerDayText();
  const homeNeedPerDayText = document.getElementById("homeNeedPerDayText");

  if (homeNeedPerDayText) {
    homeNeedPerDayText.textContent =
      needText === "未計算" ? "目標を設定すると表示されます" : `1日あたり ${needText}`;
  }
}

function updateTrain() {
  const levelText = document.getElementById("levelText");
  if (levelText) levelText.textContent = state.level;

  const homeTotalPowerText = document.getElementById("homeTotalPowerText");
  if (homeTotalPowerText) homeTotalPowerText.textContent = getTotalPower();

  const expPercent = Math.min(100, Math.floor((state.exp / getNeedExp()) * 100));

  const expFill = document.getElementById("expFill");
  if (expFill) expFill.style.width = `${expPercent}%`;

  const homeExpText = document.getElementById("homeExpText");
  if (homeExpText) homeExpText.textContent = `${state.exp} / ${getNeedExp()}`;

  const nextEvolutionText = document.getElementById("nextEvolutionText");
  if (nextEvolutionText) nextEvolutionText.textContent = getNextEvolutionText();

  const trainImg = document.getElementById("trainMonsterImg");
  const trainName = document.getElementById("trainMonsterName");

  if (trainImg) {
    trainImg.src = getMonsterImage();
    trainImg.onerror = () => handleImageError(trainImg);
  }

  if (trainName) {
    trainName.textContent = getMonsterDisplayName();
  }

  const todayTrainingText = document.getElementById("todayTrainingText");
  if (todayTrainingText) todayTrainingText.textContent = state.today.training;

  const todayProteinText = document.getElementById("todayProteinText");
  if (todayProteinText) todayProteinText.textContent = state.today.protein;

  const todaySleepText = document.getElementById("todaySleepText");
  if (todaySleepText) todaySleepText.textContent = state.today.sleep;

  const powerText = document.getElementById("powerText");
  if (powerText) powerText.textContent = state.stats.power;

  const staminaText = document.getElementById("staminaText");
  if (staminaText) staminaText.textContent = state.stats.stamina;

  const recoveryText = document.getElementById("recoveryText");
  if (recoveryText) recoveryText.textContent = state.stats.recovery;

  const continuityText = document.getElementById("continuityText");
  if (continuityText) continuityText.textContent = state.stats.continuity;

  const totalPowerText = document.getElementById("totalPowerText");
  if (totalPowerText) totalPowerText.textContent = getTotalPower();
}

function updateBattle() {
  const enemy = getCurrentEnemy();

  const enemyNameText = document.getElementById("enemyNameText");
  if (enemyNameText) enemyNameText.textContent = enemy.name;

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

  const battlePlayerName = document.getElementById("battlePlayerName");
  if (battlePlayerName) battlePlayerName.textContent = getMonsterDisplayName();

  const currentEnemyInfo = document.getElementById("currentEnemyInfo");
  if (currentEnemyInfo) currentEnemyInfo.textContent = enemy.name;

  const requiredPowerText = document.getElementById("requiredPowerText");
  if (requiredPowerText) requiredPowerText.textContent = enemy.requiredTotal;

  const todayBattleText = document.getElementById("todayBattleText");
  if (todayBattleText) todayBattleText.textContent = state.today.battle || 0;

  const playerHpPercent = Math.min(100, Math.floor((getTotalPower() / enemy.requiredTotal) * 100));
  const playerHpFill = document.getElementById("playerHpFill");
  if (playerHpFill) playerHpFill.style.width = `${playerHpPercent}%`;

  const diff = getTotalPower() - enemy.requiredTotal;

  let enemyHpPercent = 100;

  if (canDefeat(enemy)) {
    enemyHpPercent = 15;
  } else if (diff <= -1 && diff >= -2) {
    enemyHpPercent = 35;
  } else if (diff <= -3 && diff >= -5) {
    enemyHpPercent = 55;
  }

  const enemyHpFill = document.getElementById("enemyHpFill");
  if (enemyHpFill) enemyHpFill.style.width = `${enemyHpPercent}%`;
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
  const muteBtn = document.getElementById("muteBtn");
  if (!muteBtn) return;

  muteBtn.textContent = "🔇 音なし版";
}

function playSound() {
  // 音なし版のため、何もしない
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

function showTutorialIfNeeded() {
  const tutorialModal = document.getElementById("tutorialModal");
  if (!tutorialModal) return;

  const alreadySeen = localStorage.getItem(TUTORIAL_KEY);
  if (alreadySeen) return;

  tutorialModal.classList.remove("hidden");
}

function closeTutorial() {
  const tutorialModal = document.getElementById("tutorialModal");
  localStorage.setItem(TUTORIAL_KEY, "true");

  if (tutorialModal) {
    tutorialModal.classList.add("hidden");
  }
}