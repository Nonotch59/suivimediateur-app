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

// ✅ Fonction pour charger les établissements sans doublons
async function chargerEtablissements() {
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
  selectEtab.innerHTML = '<option value="">-- Choisir un établissement --</option>';
  etablissements.forEach(e => {
    const opt = document.createElement("option");
    opt.value = e;
    opt.textContent = e;
    selectEtab.appendChild(opt);
  });
}

// 🔁 Initialisation globale au chargement
window.addEventListener("DOMContentLoaded", () => {
  chargerEtablissements();

  const ouvrirBtn = document.getElementById("ouvrir-signature");
  const fermerBtn = document.getElementById("fermer-signature");
  const modale = document.getElementById("modale-signature");

  if (ouvrirBtn && fermerBtn && modale) {
    ouvrirBtn.addEventListener("click", () => modale.classList.remove("hidden"));
    fermerBtn.addEventListener("click", () => modale.classList.add("hidden"));
  }

  const canvas = document.getElementById("canvas-signature");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let isDrawing = false;
    let lastX = 0, lastY = 0;

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
    canvas.addEventListener("mouseup", () => isDrawing = false);
    canvas.addEventListener("mouseout", () => isDrawing = false);

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
    canvas.addEventListener("touchend", () => isDrawing = false);
  }
});

// 🔁 Établissement → résidents
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

// 🔁 Nom → prénoms
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

// 🔁 Prénom → détails
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

// ✅ Enregistrement entretien
document.getElementById("formulaire-entretien").addEventListener("submit", async (e) => {
  e.preventDefault();

  const type_entretien = document.getElementById("type_entretien").value;
  const theme = document.getElementById("theme").value;
  const notes = document.getElementById("notes").value;

  if (!residentSelectionne || !type_entretien || !theme) {
    alert("Merci de remplir tous les champs obligatoires.");
    return;
  }

  const { error } = await supabaseClient
    .from("entretiens")
    .insert([{
      type_entretien,
      themes_abordes: [theme],
      notes,
      id_resident: residentSelectionne.id
    }]);

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


// ✅ Fonction d'upload Firebase
async function uploadSignatureToFirebase(dataUrl, id_resident) {
  try {
    const fileName = `signatures/${id_resident}_${Date.now()}.png`;
    const storageRef = firebase.storage().ref().child(fileName);
    await storageRef.putString(dataUrl, 'data_url');
    const downloadURL = await storageRef.getDownloadURL();
    console.log("✅ Signature enregistrée :", downloadURL);
    return downloadURL;
  } catch (err) {
    console.error("❌ Firebase upload error :", err);
    return null;
  }
}





function envoyerFormulaire(signatureUrl) {
  const type_entretien = document.getElementById("type_entretien").value;
  const theme = document.getElementById("theme").value;
  const notes = document.getElementById("notes").value;

  if (!residentSelectionne || !type_entretien || !theme) {
    alert("Merci de remplir tous les champs obligatoires.");
    return;
  }

  supabaseClient.from("entretiens").insert([{
    type_entretien,
    themes_abordes: [theme],
    notes,
    id_resident: residentSelectionne.id,
    signature_url: signatureUrl  // ✅ Envoi de l'URL de signature dans la base
  }]).then(({ error }) => {
    if (error) {
      console.error("❌ Erreur enregistrement avec signature :", error.message);
      alert("Erreur lors de l'enregistrement.");
    } else {
      alert("✅ Entretien enregistré avec signature !");
      document.getElementById("formulaire-entretien").reset();
      resetChamps(["nom", "prenom", "numero_unique", "esi"]);
      residentSelectionne = null;
    }
  });
}


// ⚙️ Initialisation complète des boutons "Effacer" et "Valider"
window.addEventListener("DOMContentLoaded", () => {
  canvas = document.getElementById("signaturePad");
  if (!canvas) return;

  ctx = canvas.getContext("2d");
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#111827";

  canvas.addEventListener("mousedown", commencerDessin);
  canvas.addEventListener("mousemove", dessiner);
  canvas.addEventListener("mouseup", terminerDessin);
  canvas.addEventListener("mouseout", terminerDessin);

  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    commencerDessin({ offsetX: touch.clientX - rect.left, offsetY: touch.clientY - rect.top });
  });
  canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    dessiner({ offsetX: touch.clientX - rect.left, offsetY: touch.clientY - rect.top });
  });
  canvas.addEventListener("touchend", terminerDessin);

  // 🔁 Branche les boutons
  const effacerBtn = document.getElementById("effacer-signature");
  if (effacerBtn) effacerBtn.addEventListener("click", effacerSignature);

  const validerBtn = document.getElementById("valider-signature");
  if (validerBtn) validerBtn.addEventListener("click", async () => {
    const dataUrl = canvas.toDataURL();
    if (dataUrl.length < 2000) return alert("Merci de signer avant de valider.");

    const id_resident = document.getElementById("numero").value;
    if (!id_resident) return alert("Résident non sélectionné");

    try {
      const url = await uploadSignatureToFirebase(dataUrl, id_resident);
      if (!url) return;
      document.getElementById("signatureModal").classList.add("hidden");
      envoyerFormulaire(url);
    } catch (err) {
      console.error("Erreur Firebase :", err);
      alert("❌ Erreur lors de l'envoi de la signature.");
    }
  });

});

// ✅ En dehors du bloc : accessible globalement depuis le HTML

function ouvrirSignature() {
  document.getElementById("signatureModal").classList.remove("hidden");
}


