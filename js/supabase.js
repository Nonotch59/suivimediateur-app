// ✅ Initialisation Supabase
const supabaseUrl = 'https://tuxynuxopgepzdpffvfo.supabase.co';
const supabaseKey = 'TON_CLE_PUBLIC_SUPABASE'; // 🔐 Remplace ici ta vraie clé

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

console.log("✅ [Supabase] Client initialisé");




