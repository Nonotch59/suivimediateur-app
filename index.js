const express = require('express');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const port = 3000;

// ✅ Cette ligne permet à Express de servir les fichiers comme .jpg, .png, .html, etc.
app.use(express.static(__dirname));

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/getResidents', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('residents')
      .select('id, nom, prenom');

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/resident/:nom/:prenom', async (req, res) => {
  const { nom, prenom } = req.params;

  try {
    const { data, error } = await supabase
      .from('residents')
      .select('id, numero_unique')
      .eq('nom', nom)
      .eq('prenom', prenom)
      .single();

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/entretien', async (req, res) => {
  const { id_resident, type_entretien, themes_abordes, notes } = req.body;

  console.log("📥 Données reçues dans POST /entretien :", req.body);

  try {
    const { data, error } = await supabase
      .from('entretiens')
      .insert([
        {
          id_resident,
          type_entretien,
          themes_abordes,
          notes,
          date: new Date().toISOString().split('T')[0],
          id_utilisateur: null
        }
      ]);

    if (error) {
      console.error("❌ Erreur lors de l'insertion :", error);
      throw error;
    }

    res.status(201).json({ message: 'Entretien enregistré', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/entretiens', async (req, res) => {
  const { limit = 10, offset = 0, resident_id } = req.query;

  let query = supabase
    .from('entretiens')
    .select(`
      *,
      residents (
        nom,
        prenom
      )
    `)
    .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

  if (resident_id) {
    query = query.eq('id_resident', resident_id);
  }

  const { data, error } = await query;

  if (error) {
    console.error("❌ Erreur dans /entretiens :", error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des entretiens.' });
  }

  const resultats = data.map(e => ({
    ...e,
    nom: e.residents?.nom || '',
    prenom: e.residents?.prenom || ''
  }));

  res.json(resultats);
});


app.listen(port, () => {
  console.log(`✅ Serveur lancé sur http://localhost:${port}`);
});