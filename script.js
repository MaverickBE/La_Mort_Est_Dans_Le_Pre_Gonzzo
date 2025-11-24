// ============================
//   LA MORT EST DANS LE PRÉ
//   Grille 4 x 3 (12 cases)
//   - PAS de vérification de bingo
//   - 11 images aléatoires
//   - 1 image fixe au "centre"
// ============================

console.log("script-mort-pre chargé");

// --- CONFIG ---

// 3 lignes, 4 colonnes => 12 cases
const GRID_ROWS = 4;
const GRID_COLS = 3;
const TOTAL_CELLS = GRID_ROWS * GRID_COLS; // 12

// Case "centrale" (0 = première ligne/colonne)
// Ici : 2e ligne, 2e colonne (visuellement au milieu)
const CENTER_ROW = 1;
const CENTER_COL = 1;

// On encode uniquement les 11 cases NON centrales dans la seed
const SEED_LENGTH = 11 * 2; // 22 caractères

// ============================
//   LISTE DES IMAGES
// ============================

// 11 images aléatoires (les cases NON centrales)
const ListeImages = [
  { id: 1, name: "Banshee.webp" },
  { id: 2, name: "Démon.webp" },
  { id: 3, name: "Djinn.webp" },
  { id: 4, name: "Esprit.webp" },
  { id: 5, name: "Goryo.webp" },
  { id: 6, name: "Oni.webp" },
  { id: 7, name: "Polter.webp" },
  { id: 8, name: "Revenant.webp" },
  { id: 9, name: "Thaye.webp" },
  { id: 10, name: "Yokai.webp" },
  { id: 11, name: "Hantu.webp" },
  { id: 12, name: "Spectre.webp" },
  { id: 13, name: "Fantome.webp" },
  { id: 14, name: "Ombre.webp" },
  { id: 15, name: "Yurei.webp" },
  { id: 16, name: "Cauchemar.webp" },
  { id: 17, name: "Deogen.webp" },
  { id: 18, name: "Jumeaux.webp" },
  { id: 19, name: "Mimic.webp" },
  { id: 20, name: "Moroi.webp" },
  { id: 21, name: "Myling.webp" },
  { id: 22, name: "Obake.webp" },
  { id: 23, name: "Onryo.webp" },
  { id: 24, name: "Raiju.webp" },
  // Ajoutez le reste des images ici
];

// Image FIXE au centre (12e image)
const centerImage = {
  id: 99,                // id arbitraire, pas utilisé dans la seed
  name: "Logo_Mort.png" // ➜ Remplace par le nom EXACT du fichier de l'image centrale
};

// ============================
//       GÉNÉRATION CARTE
// ============================

function genererNouvelleCarte(images) {
  console.log("genererNouvelleCarte appelée, images param =", images);

  if (images === undefined) {
    // Mélanger les 11 images non centrales
    images = shuffle(ListeImages);
    let seed = "";
    for (const image of images) {
      const idStr = image.id.toString().padStart(2, "0");
      seed += idStr;
    }

    // Seed = 22 caractères (11 images * 2 chiffres)
    seed = seed.substring(0, SEED_LENGTH);
    const url = "?seed=" + seed;
    window.history.pushState({ path: url }, "", url);
    console.log("Seed générée:", seed, "URL:", url);

    // Afficher le bouton de partage
    document.getElementById("boutonPartager").style.display = "block";
  }

  const table = document.getElementById("carte");
  console.log("Carte 4x3 générée");

  table.innerHTML = "";

  const imagesFolder = "images/";
  let count = 0;

  for (let i = 0; i < GRID_ROWS; i++) {
    const row = table.insertRow(i);
    for (let j = 0; j < GRID_COLS; j++) {
      const cell = row.insertCell(j);

      const img = document.createElement("img");

      // Si on est sur la case centrale -> image fixe
      if (i === CENTER_ROW && j === CENTER_COL) {
        img.src = imagesFolder + centerImage.name;
        img.alt = "Image centre";
      } else {
        // Sinon -> on prend la prochaine image aléatoire dans la liste
        img.src = imagesFolder + images[count].name;
        img.alt = "Image " + (count + 1);
        count++;
      }

      const overlay = document.createElement("div");
      overlay.className = "overlay";

      const logo = document.createElement("img");
      logo.src = "images/Valide.webp";
      logo.alt = "Valide";
      logo.className = "logo";

      overlay.appendChild(logo);
      cell.appendChild(img);
      cell.appendChild(overlay);

      // Clic = toggle + son (PAS de vérif bingo)
      cell.addEventListener("click", function () {
        toggleSelected(this);
      });
    }
  }
}

// ============================
//         SEED / URL
// ============================

function ControlSeedURL() {
  const paramsString = window.location.search;
  const searchParams = new URLSearchParams(paramsString);
  if (searchParams.has("seed") === true) {
    const seed = searchParams.get("seed");
    console.log("Seed trouvée dans l'URL:", seed);
    if (seed.length == SEED_LENGTH) {
      CutSeed(seed);
    } else {
      alert("Mauvais format de seed");
    }
  }
}

function doublon(tableau) {
  const tableauunique = Array.from(new Set(tableau));
  return tableau.length !== tableauunique.length;
}

// Découpe le seed -> reconstruit la liste des 11 images non centrales
function CutSeed(seed) {
  const ListeImagesGenerees = [];
  const tableidimages = seed.match(/.{1,2}/g);

  for (const id of tableidimages) {
    for (const image of ListeImages) {
      if (image.id == id) {
        ListeImagesGenerees.push(image);
      }
    }
  }

  if (doublon(ListeImagesGenerees)) {
    alert("Mauvais format de seed");
  } else {
    if (ListeImagesGenerees.length == 11) {
      genererNouvelleCarte(ListeImagesGenerees);
    } else {
      alert("Mauvais format de seed");
    }
  }
}

// ============================
//    PARTAGE / COPIE LIEN
// ============================

function copierLien() {
  const lienGeneré = window.location.href;

  const textarea = document.createElement("textarea");
  textarea.value = lienGeneré;
  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, 99999);
  document.execCommand("copy");
  document.body.removeChild(textarea);

  alert("Lien copié dans le presse-papiers");
}

// ============================
//          UTILS
// ============================

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  while (currentIndex != 0) {
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
//    SÉLECTION / SON
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
//   INITIALISATION
// ============================

document.addEventListener("DOMContentLoaded", () => {
  // Si une seed est présente dans l'URL -> on la lit
  ControlSeedURL();

  // Si pas de seed -> on génère une nouvelle grille
  if (!window.location.search.includes("seed")) {
    genererNouvelleCarte();
  }
});
