


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

async function chargerEtablissements() {
  const { data: residents, error } = await supabaseClient
    .from("residents")
    .select("etablissement");

  if (error) return console.error("❌ Erreur chargement établissements :", error.message);

  const etablissements = [...new Set(residents.map(r => r.etablissement))];
  const selectEtab = document.getElementById("etablissement");
  selectEtab.innerHTML = '<option value="">-- Choisir un établissement --</option>';
  etablissements.forEach(e => {
    const opt = document.createElement("option");
    opt.value = e;
    opt.textContent = e;
    selectEtab.appendChild(opt);
  });
}

function ouvrirSignature() {
  console.log("✅ Fonction ouvrirSignature appelée !");
  document.getElementById("signatureModal").classList.remove("hidden");
}

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
    signature_url: signatureUrl
  }]).then(({ error }) => {
    if (error) {
      console.error("❌ Erreur enregistrement :", error.message);
      alert("Erreur lors de l'enregistrement.");
    } else {
      alert("✅ Entretien enregistré avec signature !");
      document.getElementById("formulaire-entretien").reset();
      resetChamps(["nom", "prenom", "numero"]);
      residentSelectionne = null;
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  chargerEtablissements();

  const ouvrirBtn = document.getElementById("ouvrir-signature");
  const fermerBtn = document.getElementById("fermer-signature");
  if (ouvrirBtn) ouvrirBtn.addEventListener("click", ouvrirSignature);
  if (fermerBtn) fermerBtn.addEventListener("click", () =>
    document.getElementById("signatureModal").classList.add("hidden")
  );

  document.getElementById("etablissement")?.addEventListener("change", async (e) => {
    const selectedEtab = e.target.value;
    resetChamps(["nom", "prenom", "numero"]);
    residentSelectionne = null;

    if (!selectedEtab) return;

    const { data: residents, error } = await supabaseClient
      .from("residents")
      .select("*")
      .eq("etablissement", selectedEtab);

    if (error) return console.error("❌ Erreur chargement résidents :", error.message);

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

  document.getElementById("nom")?.addEventListener("change", (e) => {
    const nomChoisi = e.target.value;
    const residents = window.residentsFiltres || [];
    const prenomsUniques = [...new Set(residents.filter(r => r.nom === nomChoisi).map(r => r.prenom))];

    const selectPrenom = document.getElementById("prenom");
    selectPrenom.innerHTML = '<option value="">-- Choisir un prénom --</option>';
    prenomsUniques.forEach(prenom => {
      const opt = document.createElement("option");
      opt.value = prenom;
      opt.textContent = prenom;
      selectPrenom.appendChild(opt);
    });
  });

  document.getElementById("prenom")?.addEventListener("change", (e) => {
    const prenomChoisi = e.target.value;
    const nomChoisi = document.getElementById("nom").value;
    const resident = (window.residentsFiltres || []).find(r =>
      r.nom === nomChoisi && r.prenom === prenomChoisi
    );

    if (resident) {
      residentSelectionne = resident;
      document.getElementById("numero").value = resident.numero_unique || "";
      document.getElementById("esi")?.value = resident.esi || "";
    }
  });

  const canvas = document.getElementById("signaturePad");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#111827";
  let isDrawing = false;
  let lastX = 0, lastY = 0;

  function draw(x, y) {
    if (!isDrawing) return;
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
  canvas.addEventListener("mousemove", (e) => draw(e.offsetX, e.offsetY));
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
    draw(touch.clientX - rect.left, touch.clientY - rect.top);
  });

  canvas.addEventListener("touchend", () => isDrawing = false);

  document.getElementById("effacer-signature")?.addEventListener("click", () =>
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  );

  document.getElementById("valider-signature")?.addEventListener("click", async () => {
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
      console.error("❌ Erreur Firebase :", err);
      alert("Erreur lors de l'envoi de la signature.");
    }
  });
});












