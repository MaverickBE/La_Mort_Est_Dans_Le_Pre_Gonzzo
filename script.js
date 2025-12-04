// ============================
//   LA MORT EST DANS LE PRÉ
//   9 malus + 1 bonus, 11e case = victoire
// ============================

console.log("script Mort Est Dans Le Pré chargé");

// --- CONFIG GRILLE ---
const GRID_ROWS = 4;
const GRID_COLS = 3;
const CENTER_ROW = 1;
const CENTER_COL = 1;
const imagesFolder = "images/";

// --- LISTE DES IMAGES ---
const ListeImages = [
  { id: 1, name: "Batte.webp" },
  { id: 2, name: "Boucher.webp" },
  { id: 3, name: "Faux1.webp" },
  { id: 4, name: "Faux2.webp" },
  { id: 5, name: "Hache1.webp" },
  { id: 6, name: "Hache2.webp" },
  { id: 7, name: "Homme_Nu.webp" },
  { id: 8, name: "Machette.webp" },
  { id: 9, name: "Petite_Fille.webp" },
  { id: 10, name: "Sadako.webp" },
  { id: 11, name: "Robe.webp" },
];

// Image FIXE au centre
const centerImage = {
  name: "Logo_Mort.png",
};

// --- HOMMES / FEMMES ---
const FEMALE_IMAGES = new Set([
  "Faux2.webp",
  "Petite_Fille.webp",
  "Robe.webp",
  "Sadako.webp",
]);

function getGenderClass(imageName) {
  return FEMALE_IMAGES.has(imageName) ? "female" : "male";
}

// ============================
//         MALUS / BONUS
// ============================

const MALUS_LIST = [
  "0% de sante mentale",
  "-1 preuve",
  "Sprint OFF",
  "Pas de lampe torche",
  "0 objet maudit",
  "EMF interdit",
  "Thermo interdit",
  "Objets électroniques interdit",
  "Objets non électro. interdit",
  "Pas d'encens",
  "Pas de crucifix",
  "50% de santé mentale",
  "Sold out",
  "Full T1",
  "Full T2",
  "Vitesse joueur 50%",
  "Pas de cachettes",
  "Disjoncteur cassé",
];

const BONUS_LIST = [
  "Sprint illimité",
  "Vitesse joueur 150%",
  "Pas de malus",
  "Vitesse entité 50%",
];

const MAX_EFFECTS_PER_GRID = 10; // 9 malus + 1 bonus

let malusPool = [];
let malusIndex = 0;

let malusShownCount = 0;
let bonusCount = 0;
let victoryJustTriggered = false;
let gameOver = false;

// Compteurs pour l'historique (labels affichés)
let malusCount = 0;
let bonusHistCount = 0;

// Historique logique (pour sauvegarde)
let historyEffects = [];

// timer pour fermer le popup
let malusTimeoutId = null;

// ============================
//   SAUVEGARDE / REPRISE
// ============================

const STORAGE_PREFIX = "mort_pre_game_";
const LAST_GAME_KEY = "mort_pre_last_game";
let currentGameId = null;

function createNewGameId() {
  if (window.crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return (
    Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8)
  );
}

function getGameIdFromUrl() {
  const url = new URL(window.location.href);
  return url.searchParams.get("g");
}

function setGameIdInUrl(id) {
  const url = new URL(window.location.href);
  url.searchParams.set("g", id);
  window.history.replaceState(null, "", url.toString());
}

function clearGameIdFromUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete("g");
  window.history.replaceState(null, "", url.toString());
}

function clearSavedGame() {
  if (currentGameId) {
    localStorage.removeItem(STORAGE_PREFIX + currentGameId);
  }
  localStorage.removeItem(LAST_GAME_KEY);
  clearGameIdFromUrl();
  currentGameId = null;
}

function saveGameState() {
  if (!currentGameId) return;
  const table = document.getElementById("carte");
  if (!table) return;

  const cells = table.getElementsByTagName("td");
  const gridImages = [];
  const selectedIndices = [];

  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    const img = cell.querySelector("img");
    const isCenter = cell.dataset.center === "1";

    let imgName = null;
    if (img) {
      // on récupère juste le nom du fichier (après le dernier /)
      const parts = img.src.split("/");
      imgName = parts[parts.length - 1];
    }

    gridImages.push({
      name: imgName,
      isCenter: isCenter,
    });

    if (cell.classList.contains("selected")) {
      selectedIndices.push(i);
    }
  }

  const state = {
    gridImages,
    selectedIndices,
    malusPool,
    malusIndex,
    malusShownCount,
    bonusCount,
    gameOver,
    victoryJustTriggered,
    historyEffects,
  };

  localStorage.setItem(STORAGE_PREFIX + currentGameId, JSON.stringify(state));
  localStorage.setItem(LAST_GAME_KEY, currentGameId);
}

function restoreGame(state) {
  // --- restaurer les variables logiques ---
  malusPool = state.malusPool || [];
  malusIndex = state.malusIndex || 0;
  malusShownCount = state.malusShownCount || 0;
  bonusCount = state.bonusCount || 0;
  gameOver = state.gameOver || false;
  victoryJustTriggered = state.victoryJustTriggered || false;
  historyEffects = state.historyEffects || [];

  // --- reconstruire la grille ---
  const table = document.getElementById("carte");
  if (!table) return;
  table.innerHTML = "";

  const gridImages = state.gridImages || [];
  const selectedSet = new Set(state.selectedIndices || []);

  for (let i = 0; i < GRID_ROWS; i++) {
    const row = table.insertRow(i);
    for (let j = 0; j < GRID_COLS; j++) {
      const cell = row.insertCell(j);
      const index = i * GRID_COLS + j;
      const cellInfo = gridImages[index] || {};
      const img = document.createElement("img");

      const isCenter = !!cellInfo.isCenter;
      if (isCenter) {
        img.src = imagesFolder + centerImage.name;
        img.alt = "Image centre";
        cell.dataset.center = "1";
      } else {
        // si pas de name stocké (sécurité), on tombe sur une image de base
        const name =
          cellInfo.name ||
          (ListeImages[index] ? ListeImages[index].name : centerImage.name);
        img.src = imagesFolder + name;
        img.alt = "Image";

        const genderClass = getGenderClass(name);
        cell.classList.add(genderClass);
      }

      const overlay = document.createElement("div");
      overlay.className = "overlay";

      const logo = document.createElement("img");
      logo.src = imagesFolder + "Bingo_confirme.webp";
      logo.alt = "Bingo_confirme";
      logo.className = "logo";

      overlay.appendChild(logo);
      cell.appendChild(img);
      cell.appendChild(overlay);

      cell.classList.add("cell-appear");

      if (!isCenter) {
        cell.addEventListener("click", function () {
          toggleSelected(this);
        });
      }

      if (selectedSet.has(index) && !isCenter) {
        cell.classList.add("selected");
      }
    }
  }

  // --- reconstruire l'historique visuel ---
  const hist = document.getElementById("historique-malus");
  const list = document.getElementById("liste-malus");
  if (hist && list) {
    list.innerHTML = "";
    malusCount = 0;
    bonusHistCount = 0;

    historyEffects.forEach((eff) => {
      const li = document.createElement("li");
      if (eff.type === "bonus") {
        bonusHistCount++;
        li.textContent = `Bonus ${bonusHistCount} : ${eff.text}`;
        li.classList.add("bonus");
      } else {
        malusCount++;
        li.textContent = `Malus ${malusCount} : ${eff.text}`;
        li.classList.add("malus");
      }
      list.appendChild(li);
    });

    hist.style.visibility = historyEffects.length ? "visible" : "hidden";
  }

  // logo réduit
  const logoMort = document.getElementById("Logo_Mort_Pre");
  if (logoMort) {
    logoMort.classList.add("logo-small");
  }
}

// ============================
//   POPUP MALUS/BONUS
// ============================

function showMalusMessage(effect) {
  const box = document.getElementById("malus-message");
  if (!box) return;

  // d'abord l'historique
  addEffectToHistory(effect);

  // on annule un éventuel timer précédent
  if (malusTimeoutId) {
    clearTimeout(malusTimeoutId);
    malusTimeoutId = null;
  }

  box.textContent = effect.text;
  box.style.display = "block";

  // reset des classes + reflow
  box.classList.remove("show", "effect-malus", "effect-bonus");
  void box.offsetWidth;

  box.classList.add(
    effect.type === "bonus" ? "effect-bonus" : "effect-malus",
    "show"
  );

  // disparition auto après 2,5s
  malusTimeoutId = setTimeout(() => {
    box.classList.remove("show");
    box.style.display = "none";
    malusTimeoutId = null;
  }, 2500);
}

// ============================
//   HISTORIQUE
// ============================

function addEffectToHistory(effect) {
  const hist = document.getElementById("historique-malus");
  const list = document.getElementById("liste-malus");
  if (!hist || !list) return;

  hist.style.visibility = "visible";

  const li = document.createElement("li");

  if (effect.type === "bonus") {
    bonusHistCount++;
    li.textContent = `Bonus ${bonusHistCount} : ${effect.text}`;
    li.classList.add("bonus");
  } else {
    malusCount++;
    li.textContent = `Malus ${malusCount} : ${effect.text}`;
    li.classList.add("malus");
  }

  list.appendChild(li);
  hist.scrollTop = hist.scrollHeight;

  // on garde aussi l'historique logique pour la sauvegarde
  historyEffects.push({ type: effect.type, text: effect.text });
}

// ============================
//   FIN DE PARTIE
// ============================

function nettoyerGrilleApresVictoire() {
  const table = document.getElementById("carte");
  if (table) {
    table.innerHTML = "";
  }

  const malusBox = document.getElementById("malus-message");
  if (malusBox) {
    malusBox.style.display = "none";
    malusBox.classList.remove("show", "effect-malus", "effect-bonus");
  }

  if (malusTimeoutId) {
    clearTimeout(malusTimeoutId);
    malusTimeoutId = null;
  }

  const logoMort = document.getElementById("Logo_Mort_Pre");
  if (logoMort) {
    logoMort.classList.remove("logo-small");
  }

  const hist = document.getElementById("historique-malus");
  const list = document.getElementById("liste-malus");
  if (hist && list) {
    hist.style.visibility = "hidden";
    list.innerHTML = "";
  }

  clearSavedGame();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showVictoryMessage() {
  const box = document.getElementById("victory-message");
  const malusBox = document.getElementById("malus-message");

  if (!box) return;

  if (malusTimeoutId) {
    clearTimeout(malusTimeoutId);
    malusTimeoutId = null;
  }
  if (malusBox) {
    malusBox.style.display = "none";
    malusBox.classList.remove("show", "effect-malus", "effect-bonus");
  }

  jouerSonVictoire();

  box.textContent = "🎉 Félicitations 🎉";
  box.style.display = "block";
  box.classList.remove("show");
  void box.offsetWidth;
  box.classList.add("show");

  setTimeout(() => {
    box.classList.remove("show");
    box.style.display = "none";
    nettoyerGrilleApresVictoire();
  }, 10000);
}

// ============================
//   MALUS / BONUS SUR CASE
// ============================

function maybeAssignMalus(cell) {
  if (cell.dataset.malusAssigned === "1") return;
  if (gameOver) return;

  const totalEffects = malusShownCount + bonusCount;

  // déjà 10 effets → cette case déclenche la victoire
  if (totalEffects >= MAX_EFFECTS_PER_GRID) {
    cell.dataset.malusAssigned = "1";
    victoryJustTriggered = true;
    gameOver = true;
    showVictoryMessage();
    saveGameState(); // sauvegarde finale avant reset (optionnel)
    return;
  }

  if (malusIndex >= malusPool.length) return;

  const effect = malusPool[malusIndex++]; // { text, type }

  if (effect.type === "bonus") {
    bonusCount++;
  } else {
    malusShownCount++;
  }

  cell.dataset.malusAssigned = "1";

  // popup + historique instantanés
  showMalusMessage(effect);
  saveGameState();
}

// ============================
//   GÉNÉRATION CARTE
// ============================

function genererNouvelleCarte() {
  console.log("Génération de la carte...");

  const table = document.getElementById("carte");
  if (!table) return;

  // nouvelle partie → on efface l'ancienne si elle existe
  clearSavedGame();

  currentGameId = createNewGameId();
  setGameIdInUrl(currentGameId);

  initMalusPool();
  table.innerHTML = "";

  const imagesMelangees = shuffle([...ListeImages]);
  let indexImage = 0;

  for (let i = 0; i < GRID_ROWS; i++) {
    const row = table.insertRow(i);

    for (let j = 0; j < GRID_COLS; j++) {
      const cell = row.insertCell(j);
      const img = document.createElement("img");

      const isCenter = i === CENTER_ROW && j === CENTER_COL;

      if (isCenter) {
        img.src = imagesFolder + centerImage.name;
        img.alt = "Image centre";
        cell.dataset.center = "1";
      } else {
        const imageData = imagesMelangees[indexImage];
        img.src = imagesFolder + imageData.name;
        img.alt = "Image " + imageData.id;

        const genderClass = getGenderClass(imageData.name);
        cell.classList.add(genderClass);

        indexImage++;
      }

      const overlay = document.createElement("div");
      overlay.className = "overlay";

      const logo = document.createElement("img");
      logo.src = imagesFolder + "Bingo_confirme.webp";
      logo.alt = "Bingo_confirme";
      logo.className = "logo";

      overlay.appendChild(logo);
      cell.appendChild(img);
      cell.appendChild(overlay);

      const order = i * GRID_COLS + j;
      cell.classList.add("cell-appear");
      cell.style.animationDelay = `${order * 80}ms`;

      if (!isCenter) {
        cell.addEventListener("click", function () {
          toggleSelected(this);
        });
      }
    }
  }

  const logoMort = document.getElementById("Logo_Mort_Pre");
  if (logoMort) {
    logoMort.classList.add("logo-small");
  }

  // on sauvegarde l'état de départ
  saveGameState();
}

// ============================
//   INIT MALUS POOL (avec exclusions)
// ============================

function initMalusPool() {
  const EXCLUSIVE_A = "Objets électroniques interdit";
  const EXCLUSIVE_B = "Objets non électro. interdit";

  const shuffledMalus = shuffle([...MALUS_LIST]);

  const chosenMalus = [];
  let hasExclusiveAlready = false;

  for (const text of shuffledMalus) {
    if (chosenMalus.length >= 9) break;

    if (text === EXCLUSIVE_A || text === EXCLUSIVE_B) {
      if (hasExclusiveAlready) continue;
      hasExclusiveAlready = true;
      chosenMalus.push({ text, type: "malus" });
    } else {
      chosenMalus.push({ text, type: "malus" });
    }
  }

  if (chosenMalus.length < 9) {
    for (const text of shuffledMalus) {
      if (chosenMalus.length >= 9) break;
      if (chosenMalus.some((e) => e.text === text)) continue;

      if (hasExclusiveAlready && (text === EXCLUSIVE_A || text === EXCLUSIVE_B)) {
        continue;
      }

      chosenMalus.push({ text, type: "malus" });
    }
  }

  const bonusText = BONUS_LIST[Math.floor(Math.random() * BONUS_LIST.length)];
  const bonusEntry = { text: bonusText, type: "bonus" };

  malusPool = shuffle([...chosenMalus, bonusEntry]);

  malusIndex = 0;
  malusShownCount = 0;
  bonusCount = 0;
  gameOver = false;
  victoryJustTriggered = false;

  malusCount = 0;
  bonusHistCount = 0;
  historyEffects = [];

  if (malusTimeoutId) {
    clearTimeout(malusTimeoutId);
    malusTimeoutId = null;
  }

  const box = document.getElementById("malus-message");
  if (box) {
    box.style.display = "none";
    box.classList.remove("show", "effect-malus", "effect-bonus");
  }

  const hist = document.getElementById("historique-malus");
  const list = document.getElementById("liste-malus");
  if (hist && list) {
    hist.style.visibility = "hidden";
    list.innerHTML = "";
  }
}

// ============================
//   SÉLECTION / SON
// ============================

function jouerCriHomme() {
  const audio = document.getElementById("maleSound");
  if (!audio) return;
  audio.volume = 0.2;
  audio.play();
}

function jouerCriFemme() {
  const audio = document.getElementById("femaleSound");
  if (!audio) return;
  audio.volume = 0.2;
  audio.play();
}

function toggleSelected(cell) {
  if (gameOver) return;
  if (cell.classList.contains("selected")) return;

  cell.classList.add("selected");
  console.log("Case selected");
  maybeAssignMalus(cell);

  if (!victoryJustTriggered) {
    if (cell.classList.contains("male")) {
      jouerCriHomme();
    } else if (cell.classList.contains("female")) {
      jouerCriFemme();
    }
  } else {
    victoryJustTriggered = false;
  }

  saveGameState();
}

function jouerSonVictoire() {
  const audio = document.getElementById("victorySound");
  if (!audio) return;
  audio.volume = 0.4;
  audio.play();
}

// ============================
//   UTILITAIRE : SHUFFLE
// ============================

function shuffle(array) {
  let currentIndex = array.length;
  while (currentIndex !== 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
}

// ============================
//   INITIALISATION
// ============================

document.addEventListener("DOMContentLoaded", () => {
  const urlGameId = getGameIdFromUrl();
  let loaded = false;

  if (urlGameId) {
    const saved = localStorage.getItem(STORAGE_PREFIX + urlGameId);
    if (saved) {
      currentGameId = urlGameId;
      const state = JSON.parse(saved);
      restoreGame(state);
      loaded = true;
    }
  }

  // fallback : si pas de g= dans l’URL mais une partie en cours stockée
  if (!loaded) {
    const lastId = localStorage.getItem(LAST_GAME_KEY);
    if (lastId) {
      const saved = localStorage.getItem(STORAGE_PREFIX + lastId);
      if (saved) {
        currentGameId = lastId;
        setGameIdInUrl(currentGameId);
        const state = JSON.parse(saved);
        restoreGame(state);
        loaded = true;
      }
    }
  }

  // sinon, on attend que le joueur clique sur "Générer une carte"
});
