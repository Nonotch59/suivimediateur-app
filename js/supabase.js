// ✅ Initialisation Supabase propre
const supabaseUrl = 'https://bmanspqauleydsxdvtpy.supabase.co';
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtYW5zcHFhdWxleWRzeGR2dHB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwNjgwNzEsImV4cCI6MjA1ODY0NDA3MX0.-m80mGof0FL3pFU0m1_UOGcNVpo9xm1WD037ZtFAy-w";

const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
console.log("✅ [Supabase] Client initialisé");
