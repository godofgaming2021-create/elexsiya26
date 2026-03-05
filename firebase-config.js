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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore and expose it globally as `db`
const db = firebase.firestore();

// Initialize Storage and expose it globally as `storage`
const storage = firebase.storage();
