// ============================
//   LA MORT EST DANS LE PRÉ
//   Grille 4 x 3 (12 cases)
//   - 11 images mélangées
//   - 1 image fixe au centre
//   - Cases hommes = overlay BLEU
//   - Cases femmes = overlay ROSE
//   - À chaque nouvelle case cochée (max 10) => MALUS aléatoire
//   - 11e case cochée = pas de malus
// ============================

console.log("script Mort Est Dans Le Pré chargé");

// --- CONFIG GRILLE ---
const GRID_ROWS = 4;
const GRID_COLS = 3;
const CENTER_ROW = 1; // 2e ligne (index 1)
const CENTER_COL = 1; // 2e colonne (index 1)
const imagesFolder = "images/";

// --- LISTE DES IMAGES ---
const ListeImages = [
  { id: 1, name: "Batte.webp" },
  { id: 2, name: "Boucher.webp" },
  { id: 3, name: "Faux1.webp" },
  { id: 4, name: "Faux2.webp" },
  { id: 5, name: "Hache1.webp" },
  { id: 6, name: "Hache2.webp" },
  { id: 7, name: "Homme_Nu.webp" }, // ⚠ bien avec le N majuscule
  { id: 8, name: "Machette.webp" },
  { id: 9, name: "Petite_Fille.webp" },
  { id: 10, name: "Sadako.webp" },
  { id: 11, name: "Robe.webp" },
];

// Image FIXE au centre
const centerImage = {
  name: "Logo_Mort.png", // mets bien le bon nom de fichier
};

// --- HOMMES / FEMMES POUR LES COULEURS ---
// Femmes = rose, les autres = hommes = bleu
const FEMALE_IMAGES = new Set([
  "Faux2.webp",
  "Petite_Fille.webp",
  "Robe.webp",
  "Sadako.webp",
]);

function getGenderClass(imageName) {
  if (FEMALE_IMAGES.has(imageName)) {
    return "female";
  }
  return "male";
}

// ============================
//         MALUS
// ============================

// Tu peux mettre PLUS de 10 malus ici.
// Le jeu en utilisera 10 différents par grille.
const MALUS_LIST = [
  "0% de sante mentale",
  "-1 preuve",
  "Sprint OFF",
  "Pas de cachettes autorisees",
  "Lumiere interdite",
  "Pas de self-care",
  "Pas de talkie-walkie",
  "Marche accroupie obligatoire",
  "Interdiction de fuir la premiere chasse",
  "Un seul objet bonus autorise",
  // Tu peux en rajouter autant que tu veux :
  "Pas le droit de fermer les portes",
  "Micro coupe pour le prochain run",
];

const MAX_MALUS_PER_GRID = 10; // ✅ on limite à 10 par grille

let malusPool = [];
let malusIndex = 0;
let malusShownCount = 0; // combien de malus déjà attribués (max 10)
let victoryJustTriggered = false; // true uniquement sur le clic de la 11e case

// file d’attente des malus à afficher
let malusQueue = [];
let malusDisplaying = false;
let malusTimeoutId = null;

function initMalusPool() {
  // copie + mélange de la liste de malus
  malusPool = shuffle([...MALUS_LIST]);
  malusIndex = 0;
  malusShownCount = 0;
  malusQueue = [];
  malusDisplaying = false;
  if (malusTimeoutId) {
    clearTimeout(malusTimeoutId);
    malusTimeoutId = null;
  }
}

// Ajoute un malus à la file d'affichage
function showMalusMessage(text) {
  malusQueue.push(text);
  if (!malusDisplaying) {
    displayNextMalus();
  }
}

// Affiche le prochain malus de la file
function displayNextMalus() {
  const box = document.getElementById("malus-message");
  if (!box) return;

  if (malusQueue.length === 0) {
    malusDisplaying = false;
    box.style.display = "none";
    return;
  }

  malusDisplaying = true;
  const text = malusQueue.shift();

  box.textContent = text;
  box.style.display = "block";

  // 💡 chaque malus reste 5 SECONDES
  malusTimeoutId = setTimeout(() => {
    displayNextMalus();
  }, 5000);
}

function nettoyerGrilleApresVictoire() {
  const table = document.getElementById("carte");
  if (table) {
    table.innerHTML = "";
  }

  // On cache le message de malus si encore affiché
  const malusBox = document.getElementById("malus-message");
  if (malusBox) {
    malusBox.style.display = "none";
  }

  // On reset la file de malus
  malusQueue = [];
  malusDisplaying = false;
  if (malusTimeoutId) {
    clearTimeout(malusTimeoutId);
    malusTimeoutId = null;
  }

  // On remet le logo en grand pour la prochaine run
  const logoMort = document.getElementById("Logo_Mort_Pre");
  if (logoMort) {
    logoMort.classList.remove("logo-small");
  }

  // Remonte en haut de la page
  window.scrollTo({ top: 0, behavior: "smooth" });
}


function showVictoryMessage() {
  const box = document.getElementById("victory-message");
  const malusBox = document.getElementById("malus-message");

  if (!box) return;

  // On coupe proprement les malus en cours
  malusQueue = [];
  malusDisplaying = false;
  if (malusTimeoutId) {
    clearTimeout(malusTimeoutId);
    malusTimeoutId = null;
  }
  if (malusBox) {
    malusBox.style.display = "none";
  }

  // 🔊 son de victoire
  jouerSonVictoire();
  
  box.textContent = "🎉Felicitations🎉";
  box.style.display = "block";
  box.classList.add("show");

  // On laisse le message 5s, puis on nettoie la grille
  setTimeout(() => {
    box.classList.remove("show");
    box.style.display = "none";
    nettoyerGrilleApresVictoire();
  }, 10000);
}


// Appelé quand une case passe de "non cochée" -> "cochée"
function maybeAssignMalus(cell) {
  // si cette case a déjà reçu un malus avant, on ne recommence pas
  if (cell.dataset.malusAssigned === "1") return;

  // si on a déjà donné le max de malus = la prochaine case (11e) => VICTOIRE
  if (malusShownCount >= MAX_MALUS_PER_GRID) {
    cell.dataset.malusAssigned = "1";
    
    // ✅ on indique qu'une victoire vient de se produire
    victoryJustTriggered = true;

    showVictoryMessage(); // 🎉 victoire
    return;
  }

  // sécurité : si plus de malus dispo
  if (malusIndex >= malusPool.length) return;

  const malusText = malusPool[malusIndex];
  malusIndex++;
  malusShownCount++;

  cell.dataset.malusAssigned = "1";

  showMalusMessage(malusText);
}



// ============================
//       GÉNÉRATION CARTE
// ============================

function genererNouvelleCarte() {
  console.log("Génération de la carte...");

  const table = document.getElementById("carte");
  if (!table) return;

  // réinitialise le pool de malus pour cette nouvelle grille
  initMalusPool();

  // vider la grille
  table.innerHTML = "";

  // on mélange les 11 images à chaque génération
  const imagesMelangees = shuffle([...ListeImages]);
  let indexImage = 0;

  for (let i = 0; i < GRID_ROWS; i++) {
    const row = table.insertRow(i);

    for (let j = 0; j < GRID_COLS; j++) {
      const cell = row.insertCell(j);
      const img = document.createElement("img");

      const isCenter = i === CENTER_ROW && j === CENTER_COL;

      if (isCenter) {
        // Case CENTRALE : image fixe, ni male ni female, pas cliquable
        img.src = imagesFolder + centerImage.name;
        img.alt = "Image centre";
      } else {
        // Les 11 autres cases : images mélangées
        const imageData = imagesMelangees[indexImage];
        img.src = imagesFolder + imageData.name;
        img.alt = "Image " + imageData.id;

        // Ajoute la classe male/female pour la couleur d’overlay
        const genderClass = getGenderClass(imageData.name);
        cell.classList.add(genderClass);

        indexImage++;
      }

      // overlay + logo central
      const overlay = document.createElement("div");
      overlay.className = "overlay";

      const logo = document.createElement("img");
      logo.src = imagesFolder + "Bingo_confirme.webp";
      logo.alt = "Bingo_confirme";
      logo.className = "logo";

      overlay.appendChild(logo);
      cell.appendChild(img);
      cell.appendChild(overlay);

      // clic = coche/décoche + son (sauf pour la case centrale)
      if (!isCenter) {
        cell.addEventListener("click", function () {
          toggleSelected(this);
        });
      }
    }
  }

  // Réduire le logo en haut quand une carte est générée
  const logoMort = document.getElementById("Logo_Mort_Pre");
  if (logoMort) {
    logoMort.classList.add("logo-small");
  }
}

// ============================
//       SÉLECTION / SON
// ============================

function toggleSelected(cell) {
  const wasSelected = cell.classList.contains("selected");

  if (wasSelected) {
    // on décoche => pas de malus
    cell.classList.remove("selected");
    console.log("Case unselected");
  } else {
    // on coche => malus éventuel ou victoire
    cell.classList.add("selected");
    console.log("Case selected");
    maybeAssignMalus(cell);
  }

  // 👉 Si une victoire vient d’être déclenchée, NE PAS jouer le son bingo
  if (!victoryJustTriggered) {
    jouerSonBingo();
  } else {
    // Reset pour les prochains clics
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
  audio.volume = 0.4; // tu peux ajuster
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
  // Si un jour tu veux générer direct au chargement :
  // genererNouvelleCarte();
});
