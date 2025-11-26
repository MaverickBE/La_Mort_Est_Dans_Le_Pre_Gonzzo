// ============================
//   LA MORT EST DANS LE PRÉ
//   Grille 4 x 3 (12 cases)
//   11 images mélangées + 1 image fixe au centre
//   Hommes = overlay BLEU, Femmes = overlay ROSE
// ============================

console.log("script Mort Est Dans Le Pré chargé");

// --- CONFIG GRILLE ---
const GRID_ROWS = 4;
const GRID_COLS = 3;
const CENTER_ROW = 1; // 2e ligne (index 1)
const CENTER_COL = 1; // 2e colonne (index 1)

// --- LISTE DES IMAGES ---
const ListeImages = [
  { id: 1, name: "Batte.webp" },
  { id: 2, name: "Boucher.webp" },
  { id: 3, name: "Faux1.webp" },
  { id: 4, name: "Faux2.webp" },
  { id: 5, name: "Hache1.webp" },
  { id: 6, name: "Hache2.webp" },
  { id: 7, name: "Homme_Nu.webp" },       // 🔹 attention au N majuscule ici
  { id: 8, name: "Machette.webp" },
  { id: 9, name: "Petite_Fille.webp" },
  { id: 10, name: "Sadako.webp" },
  { id: 11, name: "Robe.webp" },
];

// Image FIXE au centre
const centerImage = {
  name: "Logo_Mort.png",   // adapte si c'est .webp dans ton dossier
};

// --- LISTES HOMMES / FEMMES POUR LES COULEURS ---
const FEMALE_IMAGES = new Set([
  "Faux2.webp",
  "Petite_Fille.webp",
  "Robe.webp",
  "Sadako.webp",
]);

// tout ce qui n’est pas dans FEMALE_IMAGES sera traité comme “homme”
function getGenderClass(imageName) {
  if (FEMALE_IMAGES.has(imageName)) {
    return "female";
  }
  return "male";
}

// ============================
//       GÉNÉRATION CARTE
// ============================

function genererNouvelleCarte() {
  console.log("Génération de la carte...");

  const table = document.getElementById("carte");
  if (!table) return;

  const imagesFolder = "images/";

  // vider la grille
  table.innerHTML = "";

  // 👉 on mélange les 11 images à chaque génération
  const imagesMelangees = shuffle([...ListeImages]);
  let indexImage = 0;

  for (let i = 0; i < GRID_ROWS; i++) {
    const row = table.insertRow(i);

    for (let j = 0; j < GRID_COLS; j++) {
      const cell = row.insertCell(j);
      const img = document.createElement("img");

      const isCenter = i === CENTER_ROW && j === CENTER_COL;

      // Case centrale : image fixe, non cliquable
      if (isCenter) {
        img.src = imagesFolder + centerImage.name;
        img.alt = "Image centre";
      } else {
        const imageData = imagesMelangees[indexImage];
        img.src = imagesFolder + imageData.name;
        img.alt = "Image " + imageData.id;

        // on ajoute la classe male/female pour la couleur d’overlay
        const genderClass = getGenderClass(imageData.name);
        cell.classList.add(genderClass);

        indexImage++;
      }

      // overlay + logo
      const overlay = document.createElement("div");
      overlay.className = "overlay";

      const logo = document.createElement("img");
      logo.src = imagesFolder + "Bingo_confirme.webp";
      logo.alt = "Bingo_confirme";
      logo.className = "logo";

      overlay.appendChild(logo);
      cell.appendChild(img);
      cell.appendChild(overlay);

      // clic = coche/décoche + son (sauf case centrale)
      if (!isCenter) {
        cell.addEventListener("click", function () {
          toggleSelected(this);
        });
      }
    }
  }

  // 🔽 Réduire le logo après génération de la carte
  const logoMort = document.getElementById("Logo_Mort_Pre");
  if (logoMort && !logoMort.classList.contains("logo-small")) {
    logoMort.classList.add("logo-small");
  }

  // 🔽 Scroll vers la grille (pratique sur mobile)
  table.scrollIntoView({ behavior: "smooth", block: "start" });
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
//         SHUFFLE
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
  console.log("DOM chargé – en attente du bouton Générer");
  // On génère la carte SEULEMENT quand tu cliques sur le bouton
  // Si tu veux une grille dès l’arrivée sur le site, ajoute :
  // genererNouvelleCarte();
});
