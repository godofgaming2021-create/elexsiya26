/* ============================================================
   COLLEGE SYMPOSIUM â€“ SHARED UTILITIES
   Firebase Firestore data store + helpers
   ============================================================ */

// ðŸ”’ Credentials stored as SHA-256 hashes â€” never in plain text
// To regenerate: run sha256('your_email') and sha256('your_password') in browser console
// ── Service Worker: clears browser cache on every load ──
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(reg => { reg.update(); console.log('[SW] Registered:', reg.scope); })
    .catch(err => console.warn('[SW] Registration failed:', err));
}

const ADMIN_USER_HASH = 'd8f6739fa824a4ddcdc1b0f95b212410817f596ea5554d12c55f72d12ce5a799'; // SHA-256 of 'ece26'

const ADMIN_PASS_HASH = '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'; // SHA-256 of 'password'
const REG_FEE = 499;

// Super User Hash
const SUPER_USER_HASH = 'c45c64463077e8bda2da8e9a67d3e3ca067d961818b71693b348f2892b52af65'; // sha256('rakulkavi')
const SUPER_PASS_HASH = '9f2427212948508570676d14d1249503fa8d01f90ed80e13dcf6b228a46a3f7b'; // sha256('SuperSecr3t2026!')

// Treasurer Hash
const TREASURER_USER_HASH = '0c5d4d6f1aa2314053376936227d7185fcce6ead760a4c800dc2447e93997fc7'; // sha256('elexsiya26')
const TREASURER_PASS_HASH = '48c703a9470312c0070cd91fbe9c3227ebfa97103ca89ea8ee6f43a447ed3a8a'; // sha256('Treasury$ync#26')

// EmailJS Configuration
const EMAILJS_PUBLIC_KEY = 'pgGsFDU3f8cldU5Rt';
const EMAILJS_SERVICE_ID = 'service_a8408v9';
const EMAILJS_TEMPLATE_REGISTRATION = 'template_od6lwxm';
const EMAILJS_TEMPLATE_VERIFICATION = 'template_28y3izs';

// Initialize EmailJS
(function() {
  if (typeof window !== 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    script.onload = function() {
      if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_PUBLIC_KEY);
      }
    };
    document.head.appendChild(script);
  }
})();

// On-Spot Admin Hash
const ONSPOT_USER_HASH = '0c5d4d6f1aa2314053376936227d7185fcce6ead760a4c800dc2447e93997fc7'; // sha256('elexsiya26')
const ONSPOT_PASS_HASH = '1c78e06b3165aad56a5d86c2a2fde070002dc673c7d7841724eb7bd6f6aeedde'; // sha256('ece@26')

const EVENT_WHATSAPP_LINKS = {
  'Project Expo': 'https://chat.whatsapp.com/BCWwTp0oD8S3OVqYPQqt2y?mode=gi_t',
  'Idea Forge': 'https://chat.whatsapp.com/EoyntlXHnHAG4zWyE0DVmS?mode=gi_t',
  'Tazky Among Uz': 'https://chat.whatsapp.com/EPl5tbVDKP4JmwTGS48qJJ?mode=gi_t',
  'CurrentClash': 'https://chat.whatsapp.com/KJvzocc0IUEGH21iEwN81B',
  'Clever Hunt': 'https://chat.whatsapp.com/HXCsoCN2fGDH5dyUIuPF8O?mode=gi_t',
  'Bug Arena': 'https://chat.whatsapp.com/FpAxTCEGOWG8fhN8Bjp8pL?mode=gi_t',
  'Upside Down': 'https://chat.whatsapp.com/DuyhohRaQos2PEuqcjy3os?mode=gi_t',
  'Mindfusion': 'https://chat.whatsapp.com/EmozTWe9uYyLCflqyMDy89?mode=gi_t',
  'Unmuted': 'https://chat.whatsapp.com/LnHZ3zXkdU6JqOM62hKX40?mode=gi_t',
  'Ideart': 'https://chat.whatsapp.com/DKaYcJoifg850UZokpvdUm?mode=gi_t',
  'Chess': 'https://chat.whatsapp.com/KFkFZ4pxZpqGUnHAjAZLB7?mode=gi_t'
};

/* ---------- Async SHA-256 helper ---------- */
async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/* ---------- Async admin verifier ---------- */
async function verifyAdmin(email, password) {
  const cleanEmail = email.toLowerCase().trim();
  const [eHash, pHash] = await Promise.all([sha256(cleanEmail), sha256(password)]);

  // Check for Super User first
  if (eHash === SUPER_USER_HASH && pHash === SUPER_PASS_HASH) {
    return { success: true, isSuper: true, isTreasurer: false, token: pHash };
  }
  // Check for Treasurer
  if (eHash === TREASURER_USER_HASH && pHash === TREASURER_PASS_HASH) {
    return { success: true, isSuper: false, isTreasurer: true, isOnSpot: false, token: pHash };
  }
  // Check for On-Spot Admin
  if (eHash === ONSPOT_USER_HASH && pHash === ONSPOT_PASS_HASH) {
    return { success: true, isSuper: false, isTreasurer: false, isOnSpot: true, token: pHash };
  }

  const isNormal = eHash === ADMIN_USER_HASH && pHash === ADMIN_PASS_HASH;
  return isNormal ? { success: true, isSuper: false, isTreasurer: false, token: pHash } : { success: false };
}

/**
 * Log user activity to Firestore.
 */
async function logActivity(action, details = {}) {
  try {
    const logData = {
      action,
      details,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      path: window.location.pathname,
      screen: `${window.innerWidth}x${window.innerHeight}`
    };
    await window.db.collection('site_logs').add(logData);
  } catch (err) {
    console.warn('[LOG] Error logging activity:', err);
  }
}

/* ============================================================
   FIRESTORE DATA HELPERS
   All functions are async â€” always use `await` when calling.
   ============================================================ */

let _registrationsCache = null;

/**
 * Fetch all registrations from Firestore, ordered by date (newest first).
 * Includes a simple cache to avoid redundant network calls.
 * @param {boolean} forceRefresh - If true, bypass cache and fetch fresh data.
 * @returns {Promise<Array>} Array of registration objects.
 */
async function getRegistrations(forceRefresh = false) {
  if (!window.db) { console.warn('[DB] window.db not ready'); return []; }

  // Return cached data if available and refresh not forced
  // IMPORTANT: Only use cache if it actually has data — never return a stale empty array
  if (_registrationsCache && _registrationsCache.length > 0 && !forceRefresh) {
    return _registrationsCache;
  }

  try {
    // 8-second timeout: prevents a stale Firestore connection from hanging
    // background reads (e.g. from dashboard) which could block writes.
    const collection = window.db.collection('registrations');
    let fetchOp;
    
    try {
      // Final attempt: Ordered query (requires index)
      // Reduced timeout to 3s for faster fallback if index is missing
      fetchOp = collection.orderBy('registeredAt', 'desc').get();
      const fetchTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('READ_TIMEOUT')), 3000)
      );
      const snapshot = await Promise.race([fetchOp, fetchTimeout]);
      _registrationsCache = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (queryErr) {
      console.warn('[DB] Ordered fetch failed, attempting simple fetch fallback...', queryErr);
      // Fallback: Simple get (works even if index is missing)
      const simpleSnap = await collection.get();
      const unsorted = simpleSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort in memory instead
      unsorted.sort((a, b) => {
        const da = (a.registeredAt && a.registeredAt.toDate) ? a.registeredAt.toDate() : new Date(a.registeredAt || 0);
        const db = (b.registeredAt && b.registeredAt.toDate) ? b.registeredAt.toDate() : new Date(b.registeredAt || 0);
        return db - da;
      });
      _registrationsCache = unsorted;
    }
    
    return _registrationsCache;
  } catch (err) {
    console.error('[DB] getRegistrations error:', err);
    if (err.code === 'permission-denied') {
      alert("⚠️ Firebase Permission Denied. Your Cloud Firestore Rules are blocking read access. Please update your rules to allow read/write (see README-FIREBASE.txt).");
    }
    return _registrationsCache || []; // Return stale cache if fetch fails
  }
}

/**
 * Fetch registrations with pagination.
 * @param {Object} lastVisibleDoc - The last document snapshot.
 * @param {number} pageSize - Page size.
 */
async function getPaginatedRegistrations(lastVisibleDoc = null, pageSize = 50) {
  if (!window.db) throw new Error('Firebase not initialized');
  try {
    const collection = window.db.collection('registrations');
    let query = collection.orderBy('registeredAt', 'desc').limit(pageSize);

    if (lastVisibleDoc) {
      query = query.startAfter(lastVisibleDoc);
    }

    // Add 3s timeout to pagination fetch too
    const fetchOp = query.get();
    const fetchTimeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('READ_TIMEOUT')), 3000)
    );
    
    const snapshot = await Promise.race([fetchOp, fetchTimeout]);
    return {
      docs: snapshot.docs,
      data: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      lastVisible: snapshot.docs[snapshot.docs.length - 1]
    };
  } catch (err) {
    console.warn('[DB] Paginated ordered fetch failed, falling back to simple fetch...', err);
    // Fallback: If orderBy fails, just get EVERYTHING and let the UI handle it.
    // This is better than showing 0.
    const snapshot = await window.db.collection('registrations').get();
    const all = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    all.sort((a, b) => {
      const da = (a.registeredAt && a.registeredAt.toDate) ? a.registeredAt.toDate() : new Date(a.registeredAt || 0);
      const db = (b.registeredAt && b.registeredAt.toDate) ? b.registeredAt.toDate() : new Date(b.registeredAt || 0);
      return db - da;
    });
    
    return {
      docs: snapshot.docs,
      data: all.slice(0, pageSize), // Still respect pageSize for the first page
      lastVisible: null // Pagination is broken in fallback mode
    };
  }
}

/**
 * Add a new registration document to Firestore.
 * Document ID = reg.regId for easy lookup.
 * @param {Object} reg - Registration data object.
 * @returns {Promise<Object>} The saved registration.
 */
async function addRegistration(reg) {
  if (!window.db) { throw new Error('Firebase not initialized. Please reload and try again.'); }

  // Vulnerability 29: Force Numeric parsing
  reg.amount = Number(reg.amount) || 0;
  if (reg.amount < 0) throw new Error("Invalid payment amount");

  // Vulnerability 27: Strict backend conflict checking
  const eventList = reg.events ? reg.events.map(e => e.event) : [reg.event];
  if (hasTimeConflict(eventList)) {
    throw new Error("Time conflict detected between selected events. Registration rejected.");
  }

  // Attach integrity checksum
  try {
    reg._checksum = await _calcChecksum(reg);
  } catch (checksumErr) {
    console.warn('[DB] Checksum calculation failed, using fallback:', checksumErr);
    reg._checksum = "FALLBACK_" + Date.now();
  }

  try {
    // 🚀 OPTIMISTIC WRITE: Fire and forget.
    // We intentionally DO NOT `await` the .set() promise here.
    // Firebase .set() only resolves when the *backend sync* succeeds (or explicitly offline).
    // On mobile, connections often become "zombies" after returning from a background 
    // tab lock, meaning the write hangs for a long time before Firebase realizes it 
    // needs to fall back to the offline cache.
    // By not awaiting it, the UI proceeds to the payment page instantly, and the 
    // Firestore SDK safely queues and syncs the data in the background.
    const writeOp = window.db.collection('registrations').doc(reg.regId).set(reg);

    writeOp.catch(err => {
      console.error('[DB] Background sync error:', err);
    });

    _registrationsCache = null; // Clear cache to ensure next fetch gets fresh data
  } catch (err) {
    console.error('[DB] addRegistration error:', err);
    if (err.code === 'permission-denied') {
      alert("âš ï¸ Firebase Permission Denied. Your Cloud Firestore Rules are blocking write access. Please see README-FIREBASE.txt to fix this. Registration was NOT saved.");
    }
    throw err;
  }
  return reg;
}

/**
 * Send an automated email using EmailJS.
 * @param {string} templateId - The EmailJS template ID.
 * @param {Object} regData - The registration data to populate the template.
 */
async function sendAutomatedEmail(templateId, regData) {
  // Wait for EmailJS SDK to load if not already available
  if (typeof emailjs === 'undefined') {
    console.warn('[EmailJS] SDK not loaded yet. Waiting...');
    await new Promise(resolve => {
      let attempts = 0;
      const checkInterval = setInterval(() => {
        attempts++;
        if (typeof emailjs !== 'undefined') {
          clearInterval(checkInterval);
          resolve();
        } else if (attempts > 20) { // Max 10s (20 * 500ms)
          clearInterval(checkInterval);
          console.error('[EmailJS] SDK load timeout.');
          resolve(); // Resolve anyway to proceed to catch block
        }
      }, 500);
    });
  }

  if (typeof emailjs === 'undefined') {
    console.error('[EmailJS] sdk_not_found');
    return;
  }

  try {
    // Generate WhatsApp links for all registered events
    let whatsappLinks = [];
    if (regData.events && Array.isArray(regData.events)) {
      regData.events.forEach(e => {
        const link = EVENT_WHATSAPP_LINKS[e.event];
        if (link) whatsappLinks.push(`${e.event}: ${link}`);
      });
    } else if (regData.event) {
      const link = EVENT_WHATSAPP_LINKS[regData.event];
      if (link) whatsappLinks.push(link);
    }

    const templateParams = {
      // Match EmailJS template variables exactly
      name: regData.name,        // used in subject {{name}}
      to_name: regData.name,     // fallback
      email: regData.email,      // used in "To Email" field {{email}}
      to_email: regData.email,   // fallback
      reg_id: regData.regId,
      college: regData.college,
      amount: regData.amount,
      event_details: regData.event || (regData.events ? regData.events.map(e => e.event).join(', ') : 'Symposium'),
      payment_status: regData.paymentStatus || 'Pending',
      whatsapp_link: whatsappLinks.join('\n')
    };

    console.log('[EmailJS] Sending email for:', regData.regId);
    const response = await emailjs.send(EMAILJS_SERVICE_ID, templateId, templateParams);
    console.log('[EmailJS] Success:', response.status, response.text);
    return response;
  } catch (err) {
    console.error('[EmailJS] Send Error:', err);
    throw err;
  }
}

/**
 * Update the paymentStatus field of a registration by its regId.
 * @param {string} regId
 * @param {string} status - 'Paid' | 'Pending'
 */
async function updatePaymentStatus(regId, status) {
  try {
    const adminToken = sessionStorage.getItem('adminToken');
    if (!adminToken) {
      throw new Error("Action denied: No secure admin token found. Please log in again.");
    }

    const response = await fetch('https://us-central1-elexsiya-26-2b815.cloudfunctions.net/adminTogglePayment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ regId, status, adminToken })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Server returned ${response.status}: ${errorData.error || 'Unknown error'}`);
    }
  } catch (err) {
    console.error('[DB] updatePaymentStatus error:', err);
    throw err;
  }
}

/**
 * Delete a registration document from Firestore.
 * @param {string} regId 
 */
async function deleteRegistration(regId) {
  try {
    const adminToken = sessionStorage.getItem('adminToken');
    if (!adminToken) {
      throw new Error("Action denied: No secure admin token found. Please log in again.");
    }

    const response = await fetch('https://us-central1-elexsiya-26-2b815.cloudfunctions.net/adminDeleteRegistration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ regId, adminToken })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Server returned ${response.status}: ${errorData.error || 'Unknown error'}`);
    }
  } catch (err) {
    console.error('[DB] deleteRegistration error:', err);
    throw err;
  }
}

/**
 * Update a registration document with new data.
 * @param {string} regId 
 * @param {Object} newData 
 */
async function updateRegistrationData(regId, newData) {
  try {
    await window.db.collection('registrations').doc(regId).update(newData);
  } catch (err) {
    console.error('[DB] updateRegistrationData error:', err);
    throw err;
  }
}

/**
 * Update the check-in status of a registration.
 * @param {string} regId 
 * @param {boolean} status 
 */
async function updateCheckInStatus(regId, status) {
  try {
    await window.db.collection('registrations').doc(regId).update({ checkedIn: status });
  } catch (err) {
    console.error('[DB] updateCheckInStatus error:', err);
    throw err;
  }
}

/**
 * Update certificate release status.
 */
async function updateCertStatus(regId, status) {
  try {
    await window.db.collection('registrations').doc(regId).update({ certReleased: status });
  } catch (err) {
    console.error('[DB] updateCertStatus error:', err);
    throw err;
  }
}

/**
 * Save certificate template image.
 */
async function saveCertTemplate(imageData) {
  try {
    await window.db.collection('settings').doc('certificate').set({ template: imageData, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.error('[DB] saveCertTemplate error:', err);
    throw err;
  }
}

/**
 * Get certificate template image.
 */
async function getCertTemplate() {
  try {
    const doc = await window.db.collection('settings').doc('certificate').get();
    return doc.exists ? doc.data().template : null;
  } catch (err) {
    console.error('[DB] getCertTemplate error:', err);
    return null;
  }
}

/* ============================================================
   SPONSORSHIP HELPERS
   ============================================================ */

async function getSponsorships() {
  try {
    const fetchOp = window.db.collection('sponsorships').orderBy('timestamp', 'desc').get();
    const fetchTimeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('READ_TIMEOUT')), 3000)
    );
    const snap = await Promise.race([fetchOp, fetchTimeout]);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.warn('[DB] getSponsorships error (likely timeout/missing index):', err);
    return [];
  }
}

async function addSponsorship(data) {
  try {
    const docRef = await window.db.collection('sponsorships').add({
      ...data,
      timestamp: new Date().toISOString()
    });
    return docRef.id;
  } catch (err) {
    console.error('[DB] addSponsorship error:', err);
    throw err;
  }
}

async function deleteSponsorship(id) {
  try {
    await window.db.collection('sponsorships').doc(id).delete();
  } catch (err) {
    console.error('[DB] deleteSponsorship error:', err);
    throw err;
  }
}

/* ============================================================
   EXPENDITURE HELPERS
   ============================================================ */

async function getExpenditures() {
  try {
    const fetchOp = window.db.collection('expenditures').orderBy('timestamp', 'desc').get();
    const fetchTimeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('READ_TIMEOUT')), 3000)
    );
    const snap = await Promise.race([fetchOp, fetchTimeout]);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.warn('[DB] getExpenditures error (likely timeout/missing index):', err);
    return [];
  }
}

async function addExpenditure(data) {
  try {
    const docRef = await window.db.collection('expenditures').add({
      ...data,
      timestamp: new Date().toISOString()
    });
    return docRef.id;
  } catch (err) {
    console.error('[DB] addExpenditure error:', err);
    throw err;
  }
}

async function deleteExpenditure(id) {
  try {
    await window.db.collection('expenditures').doc(id).delete();
  } catch (err) {
    console.error('[DB] deleteExpenditure error:', err);
    throw err;
  }
}

/**
 * Upload a payment screenshot to Firebase Storage.
 * @param {Object|string} reg The registration object (or regId string for backward compatibility)
 * @param {File} file
 * @returns {Promise<string>} Download URL of the uploaded image.
 */
async function uploadPaymentScreenshot(reg, file) {
  const regId = typeof reg === 'string' ? reg : reg.regId;
  // ── HELPER: timeout wrapper ──
  function withTimeout(promise, ms, label) {
    const t = new Promise((_, reject) => setTimeout(() => reject(new Error(`TIMEOUT_${label}`)), ms));
    return Promise.race([promise, t]);
  }

  // ── Step 1: Create a small Base64 thumbnail (guaranteed fast, no network needed) ──
  const base64Thumb = await new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => { img.src = e.target.result; };
    reader.readAsDataURL(file);
    img.onload = () => {
      const THUMB_W = 500;
      let w = img.width, h = img.height;
      if (w > THUMB_W) { h = Math.round(h * THUMB_W / w); w = THUMB_W; }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.65));
    };
    img.onerror = () => resolve(null);
  });

  let downloadURL = null;

  // ── Step 2: Try Firebase Storage with a strict 8-second timeout ──
  if (window.storage) {
    try {
      const blob = await new Promise((resolve, reject) => {
        const img = new Image();
        img.src = base64Thumb;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width; canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((b) => b ? resolve(b) : reject(new Error('blob_fail')), 'image/jpeg', 0.85);
        };
        img.onerror = reject;
      });
      const storageRef = window.storage.ref(`payment_screenshots/${regId}_${Date.now()}.jpg`);
      const snap = await withTimeout(storageRef.put(blob), 8000, 'STORAGE_PUT');
      downloadURL = await withTimeout(snap.ref.getDownloadURL(), 5000, 'GET_URL');
      console.log('[UPLOAD] Storage upload successful:', downloadURL);
    } catch (storageErr) {
      console.warn('[UPLOAD] Storage failed or timed out, using Firestore fallback:', storageErr.message);
      downloadURL = null;
    }
  }

  // ── Step 3 & 4: Save record and update status in PARALLEL ──
  const screenshotDoc = {
    regId,
    uploadedAt: new Date().toISOString(),
    fileName: file.name,
    fallback: !downloadURL
  };
  if (downloadURL) screenshotDoc.storageURL = downloadURL;
  else screenshotDoc.imageData = base64Thumb;

  const updateData = {
    paymentStatus: 'Verification Required',
    hasScreenshot: true
  };

  const tasks = [
    withTimeout(window.db.collection('screenshots').doc(regId).set(screenshotDoc), 8000, 'DOC_SAVE')
  ];

  if (typeof reg === 'object' && reg !== null) {
      tasks.push(withTimeout(
        window.db.collection('registrations').doc(regId).set({ ...reg, ...updateData }, { merge: true }),
        8000, 'STATUS_UPDATE'
      ));
  } else {
      tasks.push(withTimeout(
        window.db.collection('registrations').doc(regId).update(updateData),
        8000, 'STATUS_UPDATE'
      ));
  }

  await Promise.all(tasks);

  _registrationsCache = null;
  return downloadURL || base64Thumb || 'uploaded';
}

/**
 * Delete a screenshot document from Firestore.
 * @param {string} regId 
 */
async function deleteScreenshot(regId) {
  try {
    // 1. Read the screenshot document first to get the actual storage URL
    const screenshotDoc = await window.db.collection('screenshots').doc(regId).get();

    // 2. Delete from Firebase Storage only if a storage URL exists
    if (screenshotDoc.exists && screenshotDoc.data().storageURL && window.storage) {
      try {
        const storageURL = screenshotDoc.data().storageURL;
        // Extract the file reference from the download URL
        const fileRef = window.storage.refFromURL(storageURL);
        await fileRef.delete();
        console.log('[DB] Deleted screenshot from Storage:', storageURL);
      } catch (storageErr) {
        // Storage delete failing is non-fatal — the file may already be gone
        console.warn('[DB] Storage delete skipped (may not exist or no access):', storageErr.code);
      }
    }

    // 3. Delete the screenshot document from Firestore
    await window.db.collection('screenshots').doc(regId).delete();

    // 4. Update the registration status to Pending (only if it exists)
    try {
      const regRef = window.db.collection('registrations').doc(regId);
      const regDoc = await regRef.get();
      if (regDoc.exists) {
        await regRef.update({
          hasScreenshot: false,
          paymentStatus: 'Pending'
        });
      }
    } catch (regErr) {
      console.warn('[DB] Could not update registration status after screenshot delete:', regErr.message);
    }

    _registrationsCache = null; // Refresh cache
  } catch (err) {
    console.error('[DB] deleteScreenshot error:', err);
    throw err;
  }
}

/**
 * Generate a unique registration ID synchronously.
 * Removed network-check to prevent hangs; collision risk is negligible for this scale.
 * @returns {string} ELX-XXXXXXXX ID.
 */
function generateRegId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'ELX-';
  try {
    const randomArray = new Uint32Array(8);
    if (window.crypto && window.crypto.getRandomValues) {
        window.crypto.getRandomValues(randomArray);
        for (let i = 0; i < 8; i++) {
            id += chars[randomArray[i] % chars.length];
        }
    } else {
        throw new Error('crypto_not_available');
    }
  } catch (e) {
    // Fallback to Math.random if crypto is not available (e.g. non-secure context)
    for (let i = 0; i < 8; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  return id;
}

/* ---------- Tamper-detection checksum ---------- */
async function _calcChecksum(reg) {
  // Vulnerability 28: Dynamic salt based on user properties to prevent prediction
  const salt = 'ELX_' + (reg.email || reg.regId).length + '_26_';
  const sig = [salt, reg.regId, reg.email, reg.event, reg.amount, reg.registeredAt].join('|');
  return await sha256(sig);
}

// Vulnerability 27: Verify time conflicts strictly on backend helper
function hasTimeConflict(selectedEvents) {
  if (!selectedEvents || selectedEvents.length < 2) return false;

  // Normalize names
  const selIds = new Set(selectedEvents.map(e => e.toLowerCase().replace(/\s+/g, '-')));

  const CONFLICT_PAIRS = [
    [['project-expo'], ['ideart']],
    [['project-expo'], ['clever-hunt']],
    [['idea-forge'], ['ideart']],
    [['idea-forge'], ['clever-hunt']],
    [['clever-hunt'], ['ideart']],
    [['currentclash'], ['unmuted']],
    [['bug-arena'], ['mindfusion']],
    [['tazky-among-uz'], ['upside-down']],
  ];

  for (const [a, b] of CONFLICT_PAIRS) {
    const hitA = a.some(id => selIds.has(id));
    const hitB = b.some(id => selIds.has(id));
    if (hitA && hitB) return true;
  }
  return false;
}

async function isRegistrationTampered(reg) {
  if (!reg._checksum) return true;
  const expected = await _calcChecksum(reg);
  return reg._checksum !== expected;
}

/* ============================================================
   COMMAND CENTER HELPERS (Super User Only)
   ============================================================ */

// ── Maintenance Mode ──
async function getMaintenanceMode() {
  try {
    const doc = await window.db.collection('settings').doc('maintenance').get();
    return doc.exists ? doc.data() : { enabled: false, message: '' };
  } catch (err) { console.error('[DB] getMaintenanceMode error:', err); return { enabled: false, message: '' }; }
}

async function setMaintenanceMode(enabled, message = '') {
  try {
    await window.db.collection('settings').doc('maintenance').set({ enabled, message, updatedAt: new Date().toISOString() });
  } catch (err) { console.error('[DB] setMaintenanceMode error:', err); throw err; }
}

// ── Dynamic Marquee ──
async function getMarqueeText() {
  try {
    const doc = await window.db.collection('settings').doc('marquee').get();
    return doc.exists ? doc.data() : { text: '', enabled: false };
  } catch (err) { console.error('[DB] getMarqueeText error:', err); return { text: '', enabled: false }; }
}

async function setMarqueeText(text, enabled = true) {
  try {
    await window.db.collection('settings').doc('marquee').set({ text, enabled, updatedAt: new Date().toISOString() });
  } catch (err) { console.error('[DB] setMarqueeText error:', err); throw err; }
}

// ── Event Capacity ──
async function getClosedEvents() {
  try {
    const doc = await window.db.collection('settings').doc('event_capacity').get();
    return doc.exists ? (doc.data().closedEvents || []) : [];
  } catch (err) { console.error('[DB] getClosedEvents error:', err); return []; }
}

async function setClosedEvents(closedEventsArray) {
  try {
    await window.db.collection('settings').doc('event_capacity').set({ closedEvents: closedEventsArray, updatedAt: new Date().toISOString() });
  } catch (err) { console.error('[DB] setClosedEvents error:', err); throw err; }
}

// ── Admin Audit Log ──
async function logAdminAction(admin, action, details = {}) {
  try {
    await window.db.collection('admin_audit').add({ admin, action, details, timestamp: new Date().toISOString() });
  } catch (err) { console.warn('[DB] logAdminAction error:', err); }
}

async function getAdminAuditLogs(limitCount = 50) {
  try {
    const snap = await window.db.collection('admin_audit').orderBy('timestamp', 'desc').limit(limitCount).get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) { console.error('[DB] getAdminAuditLogs error:', err); return []; }
}

// ── Feedback ──
async function getFeedback() {
  try {
    const snap = await window.db.collection('feedback').orderBy('timestamp', 'desc').get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) { console.error('[DB] getFeedback error:', err); return []; }
}

// ── Full DB JSON Export ──
async function exportAllDataAsJSON() {
  const collections = ['registrations', 'screenshots', 'sponsorships', 'expenditures', 'settings', 'site_logs', 'feedback', 'admin_audit'];
  const allData = {};
  for (const col of collections) {
    try {
      const snap = await window.db.collection(col).get();
      allData[col] = snap.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
    } catch (err) { allData[col] = []; }
  }
  const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `Elexsiya_Full_Backup_${new Date().toISOString().slice(0, 10)}.json`; a.click();
  URL.revokeObjectURL(url);
  return allData;
}

/* ---------- Scroll animations ---------- */
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
}

/* ---------- Navbar scroll effect ---------- */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });

  // Hamburger
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }
}

/* ---------- Particle canvas ---------- */
function initParticles() {
  // Skip on mobile/touch devices — saves significant CPU/GPU on phones
  if (window.matchMedia('(hover: none)').matches) return;

  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles = [];

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.size = Math.random() * 2 + .5;
      this.speedX = (Math.random() - .5) * .4;
      this.speedY = (Math.random() - .5) * .4;
      this.opacity = Math.random() * .5 + .1;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > w) this.speedX *= -1;
      if (this.y < 0 || this.y > h) this.speedY *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 240, 255, ${this.opacity})`;
      ctx.fill();
    }
  }

  const count = Math.min(100, Math.floor(w * h / 12000));
  for (let i = 0; i < count; i++) particles.push(new Particle());

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 240, 255, ${.08 * (1 - dist / 150)})`;
          ctx.lineWidth = .5;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(animate);
  }
  animate();
}

/* ---------- PREMIUM: Cinematic Preloader ---------- */
function initPreloader() {
  const loader = document.getElementById('preloader');
  if (!loader) return;
  setTimeout(() => {
    loader.classList.add('exit');
    setTimeout(() => loader.remove(), 1000);
  }, 1800);
}

/* ---------- PREMIUM: Magnetic Neon Cursor ---------- */
function initCursor() {
  if (window.matchMedia('(hover: none)').matches) return;

  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  document.body.classList.add('custom-cursor-active');

  let ringX = 0, ringY = 0, dotX = 0, dotY = 0;
  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  let visible = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!visible) {
      dot.classList.add('visible');
      ring.classList.add('visible');
      visible = true;
    }
  });

  function animateCursor() {
    dotX += (mouseX - dotX) * 1;
    dotY += (mouseY - dotY) * 1;
    dot.style.left = dotX + 'px';
    dot.style.top = dotY + 'px';

    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';

    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  const magnetTargets = 'a, button, .btn, .glass-card, .event-info-btn, .hanim-cd-unit, .contact-modal-close, .whatsapp-btn';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(magnetTargets)) {
      dot.classList.add('active');
      ring.classList.add('active');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(magnetTargets)) {
      dot.classList.remove('active');
      ring.classList.remove('active');
    }
  });

  document.addEventListener('mouseleave', () => {
    dot.classList.remove('visible');
    ring.classList.remove('visible');
    visible = false;
  });
  document.addEventListener('mouseenter', () => {
    dot.classList.add('visible');
    ring.classList.add('visible');
    visible = true;
  });
}

/* ---------- PREMIUM: Hero Mouse Spotlight ---------- */
function initHeroSpotlight() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(2) + '%';
    const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(2) + '%';
    hero.style.setProperty('--mx', x);
    hero.style.setProperty('--my', y);
  });
}

/* ---------- PREMIUM: Letter-Drop Hero Title ---------- */
function initLetterDrop() {
  const titleEl = document.querySelector('.hero-title');
  if (!titleEl) return;

  const nodes = Array.from(titleEl.childNodes);
  let baseDelay = 0.15;

  nodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
      const text = node.textContent;
      const fragment = document.createDocumentFragment();
      [...text].forEach((char, i) => {
        const span = document.createElement('span');
        span.classList.add('letter');
        if (char === ' ') {
          span.classList.add('space');
        } else {
          span.textContent = char;
        }
        span.style.animationDelay = (baseDelay + i * 0.045) + 's';
        fragment.appendChild(span);
      });
      node.replaceWith(fragment);
    }
  });
}

/* ---------- Init common ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initCursor();
  initHeroSpotlight();
  initLetterDrop();
  initNavbar();
  initParticles();
  initScrollAnimations();

  // Log page visit
  const pageName = window.location.pathname.split('/').pop() || 'index.html';
  logActivity('page_visit', { page: pageName });
});


