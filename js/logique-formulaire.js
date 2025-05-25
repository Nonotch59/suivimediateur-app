// 🧹 Fonction pour réinitialiser certains champs
function resetChamps(ids) {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (el.tagName === "SELECT") {
        el.innerHTML = '<option value="">-- Choisir --</option>';
      } else {
        el.value = "";
      }
    }
  });
}

let residentSelectionne = null;

// 🔁 Lors du chargement de la page : charger les établissements
window.addEventListener("DOMContentLoaded", async () => {
  const { data: residents, error } = await supabaseClient
    .from("residents")
    .select("etablissement");

  if (error) {
    console.error("❌ Erreur chargement des établissements :", error.message);
    return;
  }

  const etablissements = [...new Set(residents.map(r => r.etablissement))];
  console.log("✅ Établissements trouvés :", etablissements);

  const selectEtab = document.getElementById("etablissement");
  etablissements.forEach(e => {
    const opt = document.createElement("option");
    opt.value = e;
    opt.textContent = e;
    selectEtab.appendChild(opt);
  });
});

// 🔁 Lorsqu’on change d’établissement
document.getElementById("etablissement").addEventListener("change", async (e) => {
  const selectedEtab = e.target.value;
  resetChamps(["nom", "prenom", "numero_unique", "esi"]);
  residentSelectionne = null;

  if (!selectedEtab) return;

  const { data: residents, error } = await supabaseClient
    .from("residents")
    .select("*")
    .eq("etablissement", selectedEtab);

  if (error) {
    console.error("❌ Erreur chargement résidents :", error.message);
    return;
  }

  const nomsUniques = [...new Set(residents.map(r => r.nom))];
  const selectNom = document.getElementById("nom");
  selectNom.innerHTML = '<option value="">-- Choisir un nom --</option>';
  nomsUniques.forEach(nom => {
    const opt = document.createElement("option");
    opt.value = nom;
    opt.textContent = nom;
    selectNom.appendChild(opt);
  });

  window.residentsFiltres = residents;
});

// 🔁 Lorsqu’on choisit un prénom
document.getElementById("prenom").addEventListener("change", (e) => {
  const prenomChoisi = e.target.value;
  const nomChoisi = document.getElementById("nom").value;

  const resident = (window.residentsFiltres || []).find(
    r => r.nom === nomChoisi && r.prenom === prenomChoisi
  );

  if (resident) {
    residentSelectionne = resident;
    document.getElementById("numero_unique").value = resident.numero_unique || "";
    document.getElementById("esi").value = resident.esi || "";
  }
});

// 🔁 Lorsqu’on choisit un nom → charger les prénoms correspondants
document.getElementById("nom").addEventListener("change", (e) => {
  const nomChoisi = e.target.value;
  const residents = window.residentsFiltres || [];

  const prenomsUniques = [...new Set(
    residents.filter(r => r.nom === nomChoisi).map(r => r.prenom)
  )];

  const selectPrenom = document.getElementById("prenom");
  selectPrenom.innerHTML = '<option value="">-- Choisir un prénom --</option>';
  prenomsUniques.forEach(prenom => {
    const opt = document.createElement("option");
    opt.value = prenom;
    opt.textContent = prenom;
    selectPrenom.appendChild(opt);
  });
});

// ✅ Bloc 3 : Enregistrement de l’entretien
document.getElementById("formulaire-entretien").addEventListener("submit", async (e) => {
  e.preventDefault();

  const type_entretien = document.getElementById("type_entretien").value;
  const theme = document.getElementById("theme").value;
  const notes = document.getElementById("notes").value;

  if (!residentSelectionne || !type_entretien || !theme) {
    alert("Merci de remplir tous les champs obligatoires.");
    return;
  }

  const { data, error } = await supabaseClient
    .from("entretiens")
    .insert([
      {
        type_entretien,
        themes_abordes: [theme],
        notes,
        id_resident: residentSelectionne.id
      },
    ]);

  if (error) {
    console.error("❌ Erreur enregistrement :", error.message);
    alert("Erreur lors de l'enregistrement. Voir console.");
  } else {
    alert("✅ Entretien enregistré !");
    document.getElementById("formulaire-entretien").reset();
    resetChamps(["nom", "prenom", "numero_unique", "esi"]);
    residentSelectionne = null;
  }
});


  // 🔁 Charger établissements
  const { data: residents, error } = await supabaseClient
    .from("residents")
    .select("etablissement");

  if (error) {
    console.error("❌ Erreur chargement des établissements :", error.message);
    return;
  }

  const etablissements = [...new Set(residents.map(r => r.etablissement))];
  console.log("✅ Établissements trouvés :", etablissements);

  const selectEtab = document.getElementById("etablissement");
  etablissements.forEach(e => {
    const opt = document.createElement("option");
    opt.value = e;
    opt.textContent = e;
    selectEtab.appendChild(opt);
  });

  // 🟦 Affichage de la modale de signature
  const ouvrirBtn = document.getElementById("ouvrir-signature");
  const fermerBtn = document.getElementById("fermer-signature");
  const modale = document.getElementById("modale-signature");

  if (!ouvrirBtn || !fermerBtn || !modale) {
    console.warn("❗ Boutons ou modale non trouvés dans le DOM.");
    return;
  }

  ouvrirBtn.addEventListener("click", () => {
    modale.classList.remove("hidden");
  });

  fermerBtn.addEventListener("click", () => {
    modale.classList.add("hidden");
  });

  // 🎨 Activation du dessin sur le canvas
  const canvas = document.getElementById("canvas-signature");
  if (!canvas) {
    console.warn("❗ Canvas non trouvé !");
    return;
  }

  const ctx = canvas.getContext("2d");
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;

  function drawLine(x, y) {
    if (!isDrawing) return;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#111827";
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    [lastX, lastY] = [x, y];
  }

  canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
  });

  canvas.addEventListener("mousemove", (e) => drawLine(e.offsetX, e.offsetY));
  canvas.addEventListener("mouseup", () => (isDrawing = false));
  canvas.addEventListener("mouseout", () => (isDrawing = false));

  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    isDrawing = true;
    lastX = touch.clientX - rect.left;
    lastY = touch.clientY - rect.top;
  });

  canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    drawLine(touch.clientX - rect.left, touch.clientY - rect.top);
  });

  canvas.addEventListener("touchend", () => (isDrawing = false));
});







