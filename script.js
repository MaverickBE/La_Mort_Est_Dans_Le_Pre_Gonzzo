// ============================
//   LA MORT EST DANS LE PRÉ
//   Grille 4 x 3 (12 cases)
//   - PAS de seed
//   - PAS de partage
//   - 11 images random + 1 image fixe au centre
//   - La carte se génère au clic sur le bouton
// ============================

console.log("script Mort Est Dans Le Pré chargé");

// --- CONFIG ---

const GRID_ROWS = 4;
const GRID_COLS = 3;
// 4 x 3 = 12 cases, dont 1 au centre => 11 images dans ListeImages

// Case "centrale" (2e ligne, 2e colonne : index 1,1)
const CENTER_ROW = 1;
const CENTER_COL = 1;

// 11 images pour toutes les cases SAUF le centre
// ➜ vérifie que les noms correspondent EXACTEMENT à tes fichiers dans /images
const ListeImages = [
  { id: 1, name: "Fantome.webp" },
  { id: 2, name: "Démon.webp" },
  { id: 3, name: "Jumeaux.webp" },
  { id: 4, name: "Djinn.webp" },
  { id: 5, name: "Yurei.webp" },
  { id: 6, name: "Moroi.webp" },
  { id: 7, name: "Goryo.webp" },
  { id: 8, name: "Mimic.webp" },
  { id: 9, name: "Banshee.webp" },
  { id: 10, name: "Moroi.webp" },
  { id: 11, name: "Revenant.webp" },
];

// Image FIXE au centre
const centerImage = {
  name: "Logo_Mort.png", // ➜ fichier pour la case centrale
};

// ============================
//       GÉNÉRATION CARTE
// ============================

function genererNouvelleCarte() {
  console.log("Génération de la carte...");

  const table = document.getElementById("carte");
  const imagesFolder = "images/";

  if (!table) {
    console.error("Table #carte introuvable dans le HTML");
    return;
  }

  // Vider la grille si elle existait déjà
  table.innerHTML = "";

  // On crée une copie mélangée de la liste d'images
  const imagesMelangees = shuffle([...ListeImages]);

  let indexImage = 0;

  for (let i = 0; i < GRID_ROWS; i++) {
    const row = table.insertRow(i);

    for (let j = 0; j < GRID_COLS; j++) {
      const cell = row.insertCell(j);

      const img = document.createElement("img");

      // Case centrale : image fixe
      if (i === CENTER_ROW && j === CENTER_COL) {
        img.src = imagesFolder + centerImage.name;
        img.alt = "Image centre";
      } else {
        // Toutes les autres cases : on parcourt la liste mélangée
        const imageData = imagesMelangees[indexImage];
        if (!imageData) {
          console.warn("Pas assez d'images dans ListeImages pour remplir la grille");
          continue;
        }
        img.src = imagesFolder + imageData.name;
        img.alt = "Image " + imageData.id;
        indexImage++;
      }

      const overlay = document.createElement("div");
      overlay.className = "overlay";

      const logo = document.createElement("img");
      logo.src = "images/Bingo_confirme.webp";
      logo.alt = "Bingo_confirme";
      logo.className = "logo";

      overlay.appendChild(logo);
      cell.appendChild(img);
      cell.appendChild(overlay);

      // Clic = coche/décoche + son
      cell.addEventListener("click", function () {
        toggleSelected(this);
      });
    }
  }

  // Une fois la carte générée, on cache le bouton "Générer"
  const boutonGenerer = document.getElementById("boutonGenerer");
  if (boutonGenerer) {
    boutonGenerer.style.display = "none";
  }
}

// ============================
//       SÉLECTION / SON
// ============================

function toggleSelected(cell) {
  if (cell.classList.contains("selected")) {
    cell.classList.remove("selected");
    console.log("Case unselected");
  } else {
    cell.classList.add("selected");
    console.log("Case selected");
  }

  jouerSonBingo();
}

function jouerSonBingo() {
  const audio = document.getElementById("bingoSound");
  if (!audio) return;
  audio.volume = 0.2;
  audio.play();
}

// ============================
//   FONCTION DE MÉLANGE
// ============================

function shuffle(array) {
  let currentIndex = array.length;
  let randomIndex;

  // Algorithme de Fisher–Yates
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
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
  // Au chargement, on s'assure que le bouton "Générer une carte" est visible
  const boutonGenerer = document.getElementById("boutonGenerer");
  if (boutonGenerer) {
    boutonGenerer.style.display = "block";
  }

  // La carte n'est générée que quand on clique sur le bouton
});
