let currentPage = 1;
const limit = 10;
let currentResidentId = "";

async function fetchResidents() {
  const res = await fetch('/getResidents');
  const residents = await res.json();
  const select = document.getElementById('residentSelect');

  residents.forEach(r => {
    const opt = document.createElement('option');
    opt.value = r.id;
    opt.textContent = `${r.nom} ${r.prenom}`;
    select.appendChild(opt);
  });

  select.addEventListener('change', () => {
    currentResidentId = select.value;
    currentPage = 1;
    loadData();
  });
}

async function loadData() {
  const offset = (currentPage - 1) * limit;
  let url = `/entretiens?limit=${limit}&offset=${offset}`;
  if (currentResidentId) {
    url += `&resident_id=${currentResidentId}`;
  }

  const res = await fetch(url);
  const data = await res.json();
  renderTable(data);
}

function renderTable(entretiens) {
  const container = document.getElementById("table-container");

  if (entretiens.length === 0) {
    container.innerHTML = "<p class='text-white'>Aucun entretien trouvé.</p>";
    return;
  }

  let html = `
  <table class="w-full table-auto border-collapse rounded-xl overflow-hidden shadow-lg">
    <thead class="bg-red-800 text-white text-base font-bold uppercase tracking-wide border-b border-white/20">
      <tr>
        <th class="px-4 py-2 text-left">Mois</th>
        <th class="px-4 py-2 text-left">Date</th>
        <th class="px-4 py-2 text-left">Type</th>
        <th class="px-4 py-2 text-left">Nom</th>
        <th class="px-4 py-2 text-left">Prénom</th>
        <th class="px-4 py-2 text-left">Thèmes</th>
        <th class="px-4 py-2 text-left">Notes</th>
      </tr>
    </thead>
    <tbody>`;

  entretiens.forEach(e => {
    const date = new Date(e.date);
    const mois = date.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });

    html += `
      <tr class="hover:bg-white/10 transition">
        <td class="border-t border-white/10 px-4 py-2">${mois}</td>
        <td class="border-t border-white/10 px-4 py-2">${date.toLocaleDateString()}</td>
        <td class="border-t border-white/10 px-4 py-2">${e.type_entretien}</td>
        <td class="border-t border-white/10 px-4 py-2">${e.nom || ''}</td>
        <td class="border-t border-white/10 px-4 py-2">${e.prenom || ''}</td>
        <td class="border-t border-white/10 px-4 py-2">${(e.themes_abordes || []).join(", ")}</td>
        <td class="border-t border-white/10 px-4 py-2 whitespace-pre-wrap break-words max-w-2xl">
          ${e.notes}
        </td>
      </tr>`;
  });

  html += "</tbody></table>";
  container.innerHTML = html;
}

function changePage(step) {
  currentPage += step;
  if (currentPage < 1) currentPage = 1;
  document.getElementById("page-number").textContent = `Page ${currentPage}`;
  loadData();
}

window.onload = () => {
  fetchResidents();
  loadData();
};