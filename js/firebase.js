// ✅ Initialisation Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDFuy1uG_BFe_Grwivxm-32fQgX2zrgsjo",
  authDomain: "suivimediateuras.firebaseapp.com",
  projectId: "suivimediateuras",
  storageBucket: "suivimediateuras.appspot.com",
  messagingSenderId: "385344535314",
  appId: "1:385344535314:web:d5f12ee231ac55aca491cb"
};

firebase.initializeApp(firebaseConfig);

firebase.auth().signInAnonymously()
  .then(() => {
    console.log("✅ [Firebase] Connecté anonymement");
  })
  .catch((error) => {
    console.error("❌ [Firebase] Erreur d'authentification :", error.message);
  });









