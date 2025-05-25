// 🔁 Lorsqu'on change d'établissement
document.getElementById("etablissement").addEventListener("change", async (e) => {
  const selectedEtab = e.target.value;
  resetChamps(["nom", "prenom", "numero_unique", "esi"]);

  if (!selectedEtab) return;

  const { data: residents, error } = await supabaseClient
    .from("residents")
    .select("nom")
    .eq("etablissement", selectedEtab);

  if (error) {
    console.error("Erreur chargement noms :", error.message);
    return;
  }

  // Extraire noms uniques
  const nomsUniques = [...new Set(residents.map(r => r.nom))];

  const selectNom = document.getElementById("nom");
  selectNom.innerHTML = '<option value="">-- Choisir un nom --</option>';
  nomsUniques.forEach(nom => {
    const opt = document.createElement("option");
    opt.value = nom;
    opt.textContent = nom;
    selectNom.appendChild(opt);
  });
});

// 🔁 Lorsqu'on change de nom
document.getElementById("nom").addEventListener("change", async () => {
  const etab = document.getElementById("etablissement").value;
  const nom = document.getElementById("nom").value;

  resetChamps(["prenom", "numero_unique", "esi"]);

  if (!etab || !nom) return;

  const { data: residents, error } = await supabaseClient
    .from("residents")
    .select("prenom")
    .eq("etablissement", etab)
    .eq("nom", nom);

  if (error) {
    console.error("Erreur chargement prénoms :", error.message);
    return;
  }

  const selectPrenom = document.getElementById("prenom");
  selectPrenom.innerHTML = '<option value="">-- Choisir un prénom --</option>';
  residents.forEach(r => {
    const opt = document.createElement("option");
    opt.value = r.prenom;
    opt.textContent = r.prenom;
    selectPrenom.appendChild(opt);
  });
});

// 🔁 Lorsqu'on change de prénom
document.getElementById("prenom").addEventListener("change", async () => {
  const etab = document.getElementById("etablissement").value;
  const nom = document.getElementById("nom").value;
  const prenom = document.getElementById("prenom").value;

  if (!etab || !nom || !prenom) return;

  const { data, error } = await supabaseClient
    .from("residents")
    .select("numero_unique, esi")
    .eq("etablissement", etab)
    .eq("nom", nom)
    .eq("prenom", prenom)
    .single();

  if (error) {
    console.error("Erreur récupération numéro :", error.message);
    return;
  }

  document.getElementById("numero_unique").value = data.numero_unique || "";
  document.getElementById("esi").value = data.esi || "";
});

// 🔄 Fonction pour reset les champs dépendants
function resetChamps(ids) {
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;

    if (el.tagName === "SELECT") {
      el.innerHTML = `<option value="">-- Choisir ${id} --</option>`;
    } else {
      el.value = "";
    }
  });
}



