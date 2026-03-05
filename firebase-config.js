/* ============================================================
   FIREBASE CONFIGURATION — Elexsiya 26
   ============================================================
   ⚠️  IMPORTANT: Replace all placeholder values below with
   your actual Firebase project config.
   
   How to get your config:
     1. Go to https://console.firebase.google.com
     2. Open your project → Project Settings (gear icon ⚙️)
     3. Scroll to "Your apps" → Web app → SDK setup
     4. Copy the values from the firebaseConfig object shown
   ============================================================ */

const firebaseConfig = {
  apiKey: "AIzaSyDiU3cklV89XEeAmcFWMg1PAGL_-SDN8bo",
  authDomain: "elexsiya-26-2b815.firebaseapp.com",
  projectId: "elexsiya-26-2b815",
  storageBucket: "elexsiya-26-2b815.firebasestorage.ap",
  messagingSenderId: "1022603880984",
  appId: "1:1022603880984:web:b6b592175646b6f6e1b16d"
};

// Initialize Firebase App
const app = firebase.initializeApp(firebaseConfig);
window.db = app.firestore();
window.storage = app.storage();

// Poll for Auth SDK (it can take a moment to attach to the firebase object)
let authRetryCount = 0;
const maxRetries = 20; // 20 * 500ms = 10 seconds

function checkAuthAndInit() {
  if (typeof firebase.auth === 'function') {
    try {
      window.auth = app.auth();
      window.googleProvider = new firebase.auth.GoogleAuthProvider();
      window.firebaseReady = true;
      console.log("✅ Firebase Auth & Services Initialized.");
    } catch (e) {
      console.error("❌ Error during Auth initialization:", e);
      window.firebaseReady = false;
    }
  } else if (authRetryCount < maxRetries) {
    authRetryCount++;
    if (authRetryCount % 4 === 0) console.log(`⏳ Waiting for Firebase Auth SDK... (${authRetryCount / 2}s)`);
    setTimeout(checkAuthAndInit, 500);
  } else {
    console.error("❌ Firebase Auth SDK failed to load within 10 seconds.");
    window.firebaseReady = false;
  }
}

// Start polling
checkAuthAndInit();


