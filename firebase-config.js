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
  storageBucket: "elexsiya-26-2b815.firebasestorage.app", // Fixed truncated bucket path
  messagingSenderId: "1022603880984",
  appId: "1:1022603880984:web:b6b592175646b6f6e1b16d"
};

// Prevent duplicate initialization
if (!firebase.apps.length) {
  try {
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase App Initialized.');
  } catch (e) {
    console.error('❌ Firebase App Init Error:', e);
  }
}

// Initialize Firestore and globally expose it
var db;
try {
  db = firebase.firestore();

  // FIX FOR MOBILE DISCONNECTS: Use Long-Polling instead of WebSockets.
  // Mobile browsers aggressively kill WebSockets when a tab is backgrounded.
  // When users return for a second registration, the dead WebSocket causes
  // the 'timeout' error. Long-polling prevents this hang completely.
  db.settings({ experimentalForceLongPolling: true, merge: true });

  window.db = db;

  // Enable offline persistence — writes succeed from local cache even on flaky mobile connections.
  // We use synchronizeTabs: true so if the user has a background tab open from the first
  // registration, the second registration tab can still use the local cache instead of failing
  // and reverting to direct network writes (which hang on mobile).
  db.enablePersistence({ synchronizeTabs: true })
    .then(() => console.log('✅ Firestore offline persistence enabled.'))
    .catch(err => {
      if (err.code === 'failed-precondition') {
        console.warn('⚠️ Firestore persistence unavailable: multiple tabs open and browser does not support tab sync.');
      } else if (err.code === 'unimplemented') {
        // Older browser that doesn't support IndexedDB.
        console.warn('⚠️ Firestore persistence not supported in this browser.');
      } else {
        console.warn('⚠️ Firestore persistence error:', err);
      }
    });
} catch (e) { console.error('❌ Firestore Init Error:', e); }

// Initialize Storage and globally expose it
var storage;
try {
  storage = firebase.storage();
  window.storage = storage;
} catch (e) { console.error('❌ Storage Init Error:', e); }

// Initialize Auth with a small retry loop
window.authInitError = null;
function tryInitAuth(attempts = 0) {
  if (typeof firebase.auth === 'function') {
    try {
      window.auth = firebase.auth();
      window.googleProvider = new firebase.auth.GoogleAuthProvider();
      window.firebaseReady = true;
      console.log('✅ Firebase Auth ready.');
    } catch (e) {
      console.error('❌ Firebase Auth initialization failed inside function:', e);
      window.authInitError = e.message;
      window.firebaseReady = false;
    }
  } else if (attempts < 50) {
    setTimeout(() => tryInitAuth(attempts + 1), 100);
  } else {
    console.warn('⚠️ firebase.auth is not a function after 5s.');
    window.firebaseReady = false;
  }
}
tryInitAuth();
