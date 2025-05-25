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

// 🟦 Bloc 4.2 – Affichage de la modale de signature
document.getElementById("ouvrir-signature").addEventListener("click", () => {
  document.getElementById("modale-signature").classList.remove("hidden");
});

// ❌ Fermer la signature
document.getElementById("fermer-signature").addEventListener("click", () => {
  document.getElementById("modale-signature").classList.add("hidden");
});











