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

// Compteurs pour l'historique
let malusCount = 0;
let bonusHistCount = 0;

// timer pour fermer le popup (plus de file d’attente)
let malusTimeoutId = null;

// ============================
//   GESTION POOL
// ============================

function initMalusPool() {
  // 9 malus aléatoires
  const shuffledMalus = shuffle([...MALUS_LIST]);
  const chosenMalus = shuffledMalus
    .slice(0, 9)
    .map(t => ({ text: t, type: "malus" }));

  // 1 bonus aléatoire
  const bonusText = BONUS_LIST[Math.floor(Math.random() * BONUS_LIST.length)];
  const bonusEntry = { text: bonusText, type: "bonus" };

  // 9 malus + 1 bonus mélangés
  malusPool = shuffle([...chosenMalus, bonusEntry]);

  malusIndex = 0;
  malusShownCount = 0;
  bonusCount = 0;
  gameOver = false;
  victoryJustTriggered = false;

  malusCount = 0;
  bonusHistCount = 0;

  if (malusTimeoutId) {
    clearTimeout(malusTimeoutId);
    malusTimeoutId = null;
  }

  const box = document.getElementById("malus-message");
  if (box) {
    box.style.display = "none";
    box.classList.remove("show", "effect-malus", "effect-bonus");
  }

  // reset historique
  const hist = document.getElementById("historique-malus");
  const list = document.getElementById("liste-malus");
  if (hist && list) {
    hist.style.display = "none";
    list.innerHTML = "";
  }
}

// ============================
//   POPUP MALUS/BONUS (instantané)
// ============================

function showMalusMessage(effect) {
  const box = document.getElementById("malus-message");
  if (!box) return;

  // on met d'abord à jour l'historique
  addEffectToHistory(effect);

  // on annule le timer précédent (si le joueur spam)
  if (malusTimeoutId) {
    clearTimeout(malusTimeoutId);
    malusTimeoutId = null;
  }

  // contenu + affichage
  box.textContent = effect.text;
  box.style.display = "block";

  // reset des classes + reflow pour relancer l'anim
  box.classList.remove("show", "effect-malus", "effect-bonus");
  void box.offsetWidth;

  // couleur selon type
  box.classList.add(
    effect.type === "bonus" ? "effect-bonus" : "effect-malus",
    "show"
  );

  // timer pour cacher automatiquement après 2,5s
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

  hist.style.display = "block";

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
    hist.style.display = "none";
    list.innerHTML = "";
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showVictoryMessage() {
  const box = document.getElementById("victory-message");
  const malusBox = document.getElementById("malus-message");

  if (!box) return;

  // arrêter proprement le popup
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

  // déjà 10 effets → la case actuelle fait gagner
  if (totalEffects >= MAX_EFFECTS_PER_GRID) {
    cell.dataset.malusAssigned = "1";
    victoryJustTriggered = true;
    gameOver = true;
    showVictoryMessage();
    return;
  }

  if (malusIndex >= malusPool.length) return;

  const effect = malusPool[malusIndex++];   // { text, type }

  if (effect.type === "bonus") {
    bonusCount++;
  } else {
    malusShownCount++;
  }

  cell.dataset.malusAssigned = "1";

  // popup + historique instantanés
  showMalusMessage(effect);
}

// ============================
//   GÉNÉRATION CARTE
// ============================

function genererNouvelleCarte() {
  console.log("Génération de la carte...");

  const table = document.getElementById("carte");
  if (!table) return;

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
}

// ============================
//   SÉLECTION / SON
// ============================

function toggleSelected(cell) {
  if (gameOver) return;

  // une fois cochée, plus possible de la décocher
  if (cell.classList.contains("selected")) return;

  cell.classList.add("selected");
  console.log("Case selected");
  maybeAssignMalus(cell);

  if (!victoryJustTriggered) {
    jouerSonBingo();
  } else {
    victoryJustTriggered = false;
  }
}

function jouerSonBingo() {
  const audio = document.getElementById("bingoSound");
  if (!audio) return;
  audio.volume = 0.2;
  audio.play();
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
  // On attend le clic sur "Générer une carte"
});
