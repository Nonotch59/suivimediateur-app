// ✅ Initialisation Supabase
const supabaseUrl = 'https://bmanspqualeydsxdvtpy.supabase.co';
const supabaseKey = 'ta_clé_publique_ici'; // 🔐 Remplace ici par ta vraie clé publique Supabase

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

console.log("✅ [Supabase] Client initialisé");

