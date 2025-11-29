// ============================
//   LA MORT EST DANS LE PRÉ
//   Grille 4 x 3 (12 cases)
//   - 11 images mélangées
//   - 1 image fixe au centre
//   - Cases hommes = overlay BLEU
//   - Cases femmes = overlay ROSE
//   - 10 malus / grille, 11e case = victoire
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

// --- HOMMES / FEMMES POUR LES COULEURS ---
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
//         MALUS
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
  "Objets non électroniques interdit",
  "Pas d'encens",
  "Pas de crucifix",
  "50% de santé mentale",
  "Sprint illimité",
  "Sold out",
  "Full T1",
  "Full T2",
  "Vitesse joueur 50%",
  "Vitesse joueur 150%",
  "Pas de cachettes",
  "Disjoncteur cassé",
];

const MAX_MALUS_PER_GRID = 10;

let malusPool = [];
let malusIndex = 0;
let malusShownCount = 0;
let victoryJustTriggered = false;
let gameOver = false; // true une fois la victoire obtenue

// file d’attente des malus à afficher
let malusQueue = [];
let malusDisplaying = false;
let malusTimeoutId = null;

function showMalusPanel() {
  const panel = document.getElementById("malus-panel");
  if (panel) panel.style.display = "block";
}

function hideMalusPanel() {
  const panel = document.getElementById("malus-panel");
  if (panel) panel.style.display = "none";
}


// ============================
//   HISTORIQUE DES MALUS
// ============================

function resetMalusHistorique() {
  const ul = document.getElementById("malus-list");
  if (ul) {
    ul.innerHTML = "";
  }
}

function ajouterMalusHistorique(text) {
  const ul = document.getElementById("malus-list");
  if (!ul) return;

  const li = document.createElement("li");
  li.textContent = `Malus ${malusShownCount} : ${text}`;
  ul.appendChild(li);
}

// ============================
//   GESTION MALUS POPUP
// ============================

function initMalusPool() {
  malusPool = shuffle([...MALUS_LIST]);
  malusIndex = 0;
  malusShownCount = 0;
  malusQueue = [];
  malusDisplaying = false;
  if (malusTimeoutId) {
    clearTimeout(malusTimeoutId);
    malusTimeoutId = null;
  }

  gameOver = false; // ✅ nouvelle grille = nouvelle partie

  const box = document.getElementById("malus-message");
  if (box) {
    box.style.display = "none";
    box.classList.remove("show");
  }

  // reset historique pour la nouvelle grille
  resetMalusHistorique();

  // 🔹 on cache le panneau au début de la game
  hideMalusPanel();
}

// Ajoute un malus à la file d'affichage (popup centrale)
function showMalusMessage(text) {
  malusQueue.push(text);
  if (!malusDisplaying) {
    displayNextMalus();
  }
}

function displayNextMalus() {
  const box = document.getElementById("malus-message");
  if (!box) return;

  if (malusQueue.length === 0) {
    malusDisplaying = false;
    box.classList.remove("show");
    box.style.display = "none";
    return;
  }

  malusDisplaying = true;
  const text = malusQueue.shift();

  box.textContent = text;
  box.style.display = "block";
  box.classList.remove("show");
  void box.offsetWidth; // reflow
  box.classList.add("show");

  malusTimeoutId = setTimeout(() => {
    displayNextMalus();
  }, 5000);
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
    malusBox.classList.remove("show");
  }

  malusQueue = [];
  malusDisplaying = false;
  if (malusTimeoutId) {
    clearTimeout(malusTimeoutId);
    malusTimeoutId = null;
  }

  const logoMort = document.getElementById("Logo_Mort_Pre");
  if (logoMort) {
    logoMort.classList.remove("logo-small");
  }

  window.scrollTo({ top: 0, behavior: "smooth" });

  // 🔹 panneau historique caché après la game
  hideMalusPanel();
}

function showVictoryMessage() {
  const box = document.getElementById("victory-message");
  const malusBox = document.getElementById("malus-message");

  if (!box) return;

  // stop malus
  malusQueue = [];
  malusDisplaying = false;
  if (malusTimeoutId) {
    clearTimeout(malusTimeoutId);
    malusTimeoutId = null;
  }
  if (malusBox) {
    malusBox.style.display = "none";
    malusBox.classList.remove("show");
  }

  // son de victoire
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
//   MALUS SUR CASE
// ============================

function maybeAssignMalus(cell) {
  if (cell.dataset.malusAssigned === "1") return;

  // si on a déjà donné 10 malus, la prochaine case cochée => victoire
  if (malusShownCount >= MAX_MALUS_PER_GRID) {
    cell.dataset.malusAssigned = "1";
    victoryJustTriggered = true;
    gameOver = true; // ✅ à partir de là, plus aucun clic ne doit marcher
    showVictoryMessage();
    return;
  }

  if (malusIndex >= malusPool.length) return;

  const malusText = malusPool[malusIndex];
  malusIndex++;
  malusShownCount++;

  cell.dataset.malusAssigned = "1";

  // 🔹 dès qu'on a un premier malus, on affiche le panneau historique
  showMalusPanel();

  // popup centrale
  showMalusMessage(malusText);
  // historique à droite / en bas
  ajouterMalusHistorique(malusText);
}


// ============================
//       GÉNÉRATION CARTE
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

      // ✨ animation d'apparition avec un léger décalage (effet wave)
      const order = i * GRID_COLS + j;          // ordre de la case dans la grille
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
//       SÉLECTION / SON
// ============================

function toggleSelected(cell) {
  // 🎮 Si la partie est terminée, on ignore tous les clics
  if (gameOver) {
    return;
  }

  // ❌ Si la case est déjà cochée, on ne peut plus la décocher
  if (cell.classList.contains("selected")) {
    return;
  }

  // ✔ Première fois qu’elle est cochée
  cell.classList.add("selected");
  console.log("Case selected");
  maybeAssignMalus(cell);

  // 👉 Si ce n’est pas une victoire, on joue le son bingo
  if (!victoryJustTriggered) {
    jouerSonBingo();
  } else {
    // La victoire vient d’être déclenchée, on ne rejoue pas le son bingo
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
  // genererNouvelleCarte();
});
