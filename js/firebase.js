// ✅ Initialisation Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDf8hbsFHQ5MAEssfM6SeF2s1Glc0JTS7U",
  authDomain: "suivimediateuras.firebaseapp.com",
  projectId: "suivimediateuras",
  storageBucket: "suivimediateuras.appspot.com",
  messagingSenderId: "385344535314",
  appId: "1:385344535314:web:019fb10e56e4a408a491cb"
};

firebase.initializeApp(firebaseConfig);

firebase.auth().signInAnonymously()
  .then(() => {
    console.log("✅ [Firebase] Connecté anonymement");
  })
  .catch((error) => {
    console.error("❌ [Firebase] Erreur d'authentification :", error.message);
  });









