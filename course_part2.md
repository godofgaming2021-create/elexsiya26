# ⚡ ELEXSIYA 26 — World-Class Web Development Course
## PART 2: Advanced Features, Architecture & Building from Scratch
### *Modules 7–12*

---

# MODULE 7: REGISTRATION & PAYMENT FLOW
## *Building the Complete End-to-End User Journey*

---

### 7.1 Architecture: The Multi-Step Form Pattern

Complex forms like registration are split into **steps** — this reduces cognitive load and improves completion rates (a key UX metric).

```
Step 1: Event Selection
   └── User picks events, system checks time conflicts
        ↓
Step 2: Personal Details
   └── Name, email, phone, college, year, gender
        ↓
Step 3: Team Members
   └── Dynamic fields based on event team size
        ↓
Step 4: Summary + Submit
   └── Shows total fee, validate all data
        ↓
Step 5: Payment
   └── Show QR code, collect screenshot
```

The state between steps is held in JavaScript variables and `sessionStorage`. NO page reloads happen between steps.

---

### 7.2 Tutorial: Event Selection with Time-Conflict Detection

```javascript
// Time conflict map — pairs that cannot be selected together
// (They run at the same time according to the event schedule)
const CONFLICT_PAIRS = [
  [['project-expo'], ['ideart']],
  [['project-expo'], ['clever-hunt']],
  [['idea-forge'],   ['ideart']],
  [['idea-forge'],   ['clever-hunt']],
  [['clever-hunt'],  ['ideart']],
  [['currentclash'], ['unmuted']],
  [['bug-arena'],    ['mindfusion']],
  [['tazky-among-uz'], ['upside-down']],
];

function hasTimeConflict(selectedEvents) {
  if (!selectedEvents || selectedEvents.length < 2) return false;

  // Normalize IDs: "Project Expo" → "project-expo"
  const selIds = new Set(
    selectedEvents.map(e => e.toLowerCase().replace(/\s+/g, '-'))
  );

  // Check every conflict pair
  for (const [groupA, groupB] of CONFLICT_PAIRS) {
    const hasA = groupA.some(id => selIds.has(id));
    const hasB = groupB.some(id => selIds.has(id));
    if (hasA && hasB) return true; // Conflict found
  }

  return false;
}

// Usage in event selection UI
function onEventCheckboxChange() {
  const selected = getSelectedEventNames();

  if (hasTimeConflict(selected)) {
    showError('⚠️ Time conflict! These events run at the same time.');
    disableSubmit();
  } else {
    clearError();
    enableSubmit();
  }
}
```

---

### 7.3 Tutorial: Dynamic Team Member Fields

When a user selects "Project Expo (Team of 2 or 3)", additional fields appear for team members. This is dynamic DOM manipulation.

```javascript
// Event team sizes configuration
const EVENT_TEAM_SIZES = {
  'Project Expo':     { min: 1, max: 3 },
  'Idea Forge':       { min: 1, max: 3 },
  'Bug Arena':        { min: 1, max: 3 },
  'CurrentClash':     { min: 1, max: 3 },
  'Clever Hunt':      { min: 1, max: 3 },
  'Tazky Among Uz':   { min: 1, max: 3 },
  'Upside Down':      { min: 1, max: 3 },
  'Mindfusion':       { min: 3, max: 3 },
  'Unmuted':          { min: 3, max: 3 },
  'Ideart':           { min: 3, max: 3 },
  'Chess':            { min: 1, max: 1 }, // Solo
};

function renderTeamMemberFields(eventName, memberCount) {
  const container = document.getElementById('teamMembersContainer');
  container.innerHTML = ''; // Clear previous fields

  const { max } = EVENT_TEAM_SIZES[eventName] || { max: 1 };

  for (let i = 2; i <= max; i++) {
    // Create label
    const label = document.createElement('label');
    label.textContent = `Member ${i} Name:`;

    // Create input
    const input = document.createElement('input');
    input.type        = 'text';
    input.name        = `member${i}`;
    input.placeholder = `Member ${i} full name`;
    input.id          = `member${i}Input`;

    container.appendChild(label);
    container.appendChild(input);
  }
}
```

---

### 7.4 Tutorial: The Registration Submission Flow

This is the most critical function in the project — it coordinates multiple async operations:

```javascript
async function submitRegistration() {
  // ── Step 1: Collect form data ──
  const name    = document.getElementById('nameInput').value.trim();
  const email   = document.getElementById('emailInput').value.trim().toLowerCase();
  const phone   = document.getElementById('phoneInput').value.trim();
  const college = document.getElementById('collegeInput').value.trim();
  const year    = document.getElementById('yearSelect').value;

  // ── Step 2: Client-side validation ──
  if (!name || !email || !phone || !college || !year) {
    showError('Please fill in all required fields.');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showError('Please enter a valid email address.');
    return;
  }
  if (!/^[6-9]\d{9}$/.test(phone)) {
    showError('Please enter a valid 10-digit Indian mobile number.');
    return;
  }

  // ── Step 3: Check for duplicate registrations ──
  const existingRegs = await getRegistrations();
  const duplicate = existingRegs.find(r =>
    r.email === email || r.phone === phone
  );
  if (duplicate) {
    showError(`You are already registered! Your ID is: ${duplicate.regId}`);
    return;
  }

  // ── Step 4: Build the registration object ──
  const regId  = generateRegId(); // ELX-XXXXXXXX
  const events = getSelectedEvents(); // Array of { event, members }

  const reg = {
    regId,
    name,
    email,
    phone,
    college,
    year,
    events,
    amount:        REG_FEE, // 499 from shared.js
    paymentStatus: 'Pending',
    hasScreenshot: false,
    checkedIn:     false,
    lunchServed:   false,
    certReleased:  false,
    registeredAt:  firebase.firestore.FieldValue.serverTimestamp(),
  };

  // ── Step 5: Save to Firestore (optimistic write) ──
  showLoadingState('Saving your registration...');
  await addRegistration(reg); // From shared.js

  // ── Step 6: Send confirmation email ──
  try {
    await sendAutomatedEmail(EMAILJS_TEMPLATE_REGISTRATION, reg);
  } catch (emailErr) {
    console.warn('Email failed, but registration is saved:', emailErr);
    // Non-fatal — don't block the user
  }

  // ── Step 7: Save to sessionStorage and redirect to payment ──
  sessionStorage.setItem('currentRegId',   reg.regId);
  sessionStorage.setItem('currentName',    reg.name);
  sessionStorage.setItem('currentEmail',   reg.email);
  sessionStorage.setItem('currentAmount',  reg.amount);

  window.location.href = 'payment.html';
}
```

---

### 7.5 Tutorial: The Payment Page

```javascript
// payment.html — on page load
document.addEventListener('DOMContentLoaded', () => {
  // Retrieve registration context from sessionStorage
  const regId  = sessionStorage.getItem('currentRegId');
  const name   = sessionStorage.getItem('currentName');
  const amount = sessionStorage.getItem('currentAmount');

  // If no regId, user navigated here directly — redirect away
  if (!regId) {
    window.location.href = 'events.html';
    return;
  }

  // Display dynamic QR code for UPI payment
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=your-upi-id@ybl&pn=${encodeURIComponent('Elexsiya 26')}&am=${amount}&cu=INR&tn=${encodeURIComponent('Reg: ' + regId)}`;
  document.getElementById('paymentQr').src = qrUrl;

  document.getElementById('amountDisplay').textContent = `₹${amount}`;
  document.getElementById('regIdDisplay').textContent = regId;
});

// Handle screenshot upload
document.getElementById('screenshotInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const regId = sessionStorage.getItem('currentRegId');

  // Retrieve the full registration object
  const regs = await getRegistrations();
  const reg = regs.find(r => r.regId === regId);

  showLoadingState('Uploading your payment screenshot...');

  try {
    // uploadPaymentScreenshot compresses + uploads + updates Firestore
    await uploadPaymentScreenshot(reg, file);

    showSuccess('✅ Screenshot uploaded! Redirecting...');
    setTimeout(() => {
      window.location.href = `success.html?regId=${regId}`;
    }, 1500);
  } catch (err) {
    showError('Upload failed. Please try again. Error: ' + err.message);
  }
});
```

---

### 7.6 Tutorial: The Success Page with QR Code

```javascript
// success.html — Display confirmation + downloadable QR code
document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const regId  = params.get('regId') || sessionStorage.getItem('currentRegId');

  if (!regId) {
    document.body.innerHTML = '<h1>Registration not found.</h1>';
    return;
  }

  // Generate QR code image from the regId
  // This QR is scanned at the event gate for check-in
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(regId)}&margin=10&color=000000&bgcolor=ffffff`;

  document.getElementById('confirmationQr').src = qrUrl;
  document.getElementById('regIdConfirm').textContent = regId;

  // Download QR button
  document.getElementById('downloadQrBtn').addEventListener('click', async () => {
    const response = await fetch(qrUrl);
    const blob     = await response.blob();
    const url      = URL.createObjectURL(blob);

    const a  = document.createElement('a');
    a.href   = url;
    a.download = `Elexsiya26_${regId}_QR.png`;
    a.click();

    URL.revokeObjectURL(url); // Free memory
  });
});
```

---

# MODULE 8: ADMIN DASHBOARD ARCHITECTURE
## *Role-Based Access, Real-Time Data & Secure Operations*

---

### 8.1 Multi-Role Authentication Architecture

The project has **4 admin roles**, each with different permissions:

```
Role 1: Super Admin (rakulkavi / SuperSecr3t2026!)
├── See ALL data
├── Manage ALL events
├── Manage sponsors & expenditures
├── Generate & release certificates
└── Access ALL dashboards

Role 2: Treasurer (elexsiya26 / Treasury$ync#26)
├── See ALL data
├── Cannot release certificates
└── Financial view only

Role 3: Regular Admin (ece26 / password)
├── Manage registrations for specific events
└── No financial data

Role 4: On-Spot Admin (elexsiya26 / ece@26)
├── QR scanner for check-in
└── On-spot registration
```

**Implementation in dashboard.html:**
```javascript
// On page load — check if admin is authenticated
function checkAdminAuth() {
  const adminToken  = sessionStorage.getItem('adminToken');
  const adminLevel  = sessionStorage.getItem('adminLevel');

  if (!adminToken) {
    // Not logged in — redirect to login page
    window.location.href = 'admin.html';
    return null;
  }

  return { adminToken, adminLevel };
}

// Role-based UI: Show/hide sections based on role
function applyRoleBasedUI(adminLevel) {
  const isSuper     = adminLevel === 'super';
  const isTreasurer = adminLevel === 'treasurer';

  // Only Super Admin sees financial tabs
  document.getElementById('sponsorTab').style.display =
    (isSuper || isTreasurer) ? 'block' : 'none';

  // Only Super Admin can release certificates
  document.getElementById('certReleaseControls').style.display =
    isSuper ? 'block' : 'none';

  // Certificate tools available to super admins only
  document.getElementById('toolsTab').style.display =
    isSuper ? 'block' : 'none';
}

// Call on page load
const auth = checkAdminAuth();
if (auth) {
  applyRoleBasedUI(auth.adminLevel);
  loadDashboardData();
}
```

---

### 8.2 Dashboard Data Architecture

The admin dashboard loads data in **phases** to keep the UI fast and responsive:

```javascript
async function loadDashboardData() {
  // Phase 1: Load critical stats instantly (from cache if available)
  await loadStats();

  // Phase 2: Render the registrations table
  await renderRegistrationsTable();

  // Phase 3: Load secondary data (screenshots, sponsors) in background
  setTimeout(async () => {
    await loadScreenshots();
    await loadSponsors();
    await loadExpenditures();
  }, 500);
}

async function loadStats() {
  const regs = await getRegistrations(); // Uses cache

  // Calculate derived stats
  const totalRegs   = regs.length;
  const paidCount   = regs.filter(r => r.paymentStatus === 'Paid').length;
  const pendingCount = regs.filter(r => r.paymentStatus === 'Pending').length;
  const totalRevenue = regs
    .filter(r => r.paymentStatus === 'Paid')
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const checkedIn   = regs.filter(r => r.checkedIn === true).length;

  // Update the UI
  document.getElementById('statTotal').textContent   = totalRegs;
  document.getElementById('statPaid').textContent    = paidCount;
  document.getElementById('statPending').textContent = pendingCount;
  document.getElementById('statRevenue').textContent = `₹${totalRevenue.toLocaleString('en-IN')}`;
  document.getElementById('statCheckedIn').textContent = checkedIn;
}
```

---

### 8.3 Tutorial: Real-Time Search & Filter

```javascript
// Client-side search — extremely fast since all data is loaded in memory
let allRegistrations = [];

async function renderRegistrationsTable(filter = '', statusFilter = 'all', eventFilter = 'all') {
  allRegistrations = await getRegistrations(true); // Force fresh data

  // ── Apply filters ──
  let filtered = allRegistrations;

  if (filter) {
    const q = filter.toLowerCase();
    filtered = filtered.filter(r =>
      (r.name    || '').toLowerCase().includes(q) ||
      (r.email   || '').toLowerCase().includes(q) ||
      (r.regId   || '').toLowerCase().includes(q) ||
      (r.college || '').toLowerCase().includes(q) ||
      (r.phone   || '').includes(q)
    );
  }

  if (statusFilter !== 'all') {
    filtered = filtered.filter(r => r.paymentStatus === statusFilter);
  }

  if (eventFilter !== 'all') {
    filtered = filtered.filter(r =>
      (r.events || []).some(e => e.event === eventFilter)
    );
  }

  // ── Render the table ──
  const tbody = document.getElementById('registrationsBody');
  tbody.innerHTML = ''; // Clear old rows

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center; padding: 40px; color:#999;">
          No registrations found.
        </td>
      </tr>`;
    return;
  }

  filtered.forEach(reg => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${escapeHtml(reg.regId)}</td>
      <td>${escapeHtml(reg.name)}</td>
      <td>${escapeHtml(reg.email)}</td>
      <td>${escapeHtml(reg.college)}</td>
      <td>
        <span class="status-badge ${getStatusClass(reg.paymentStatus)}">
          ${escapeHtml(reg.paymentStatus)}
        </span>
      </td>
      <td>${formatEvents(reg.events)}</td>
      <td>₹${reg.amount}</td>
      <td>
        <button onclick="togglePayment('${reg.regId}', '${reg.paymentStatus}')">
          ${reg.paymentStatus === 'Paid' ? 'Mark Pending' : 'Mark Paid'}
        </button>
        <button onclick="deleteReg('${reg.regId}')">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });

  // Update count display
  document.getElementById('regCount').textContent =
    `Showing ${filtered.length} of ${allRegistrations.length}`;
}

// Wire up search input with debounce (prevent firing on every keystroke)
let searchDebounce;
document.getElementById('searchInput').addEventListener('input', (e) => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    renderRegistrationsTable(e.target.value, currentStatusFilter, currentEventFilter);
  }, 300); // Wait 300ms after user stops typing
});
```

---

### 8.4 Tutorial: Secure Payment Toggle with Audit Log

```javascript
async function togglePayment(regId, currentStatus) {
  const newStatus = currentStatus === 'Paid' ? 'Pending' : 'Paid';

  // Confirm before changing
  const confirm = window.confirm(`Change ${regId} to "${newStatus}"?`);
  if (!confirm) return;

  const adminToken = sessionStorage.getItem('adminToken');

  try {
    // ── Option A: Use Cloud Function (most secure) ──
    await fetch('https://us-central1-your-project.cloudfunctions.net/adminTogglePayment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ regId, status: newStatus, adminToken })
    });

    // ── Write to audit log: append-only record of every admin action ──
    await window.db.collection('admin_audit').add({
      action:    'PAYMENT_TOGGLE',
      regId,
      from:      currentStatus,
      to:        newStatus,
      adminToken: adminToken.substring(0, 8) + '...', // Log partial hash only
      timestamp: new Date().toISOString()
    });

    // Refresh the UI
    await renderRegistrationsTable();
    showToast(`✅ ${regId} marked as ${newStatus}`);

  } catch (err) {
    console.error('Toggle payment error:', err);
    showToast('❌ Failed to update payment status.', 'error');
  }
}
```

---

### 8.5 Architecture: The Audit Log Pattern

```javascript
// Every significant admin action is logged to /admin_audit/
// Firestore rules make this APPEND-ONLY:
//   allow create: if true;
//   allow update, delete: if false;  // ← PERMANENT RECORD

// This pattern provides:
// 1. Forensic trail: "Who changed what and when?"
// 2. Accountability: Admins know their actions are logged
// 3. Dispute resolution: If a participant claims they were marked Paid
//    but don't see it, the audit log shows the exact history

// Log format
const auditEntry = {
  action:     'CERT_RELEASED',     // What happened
  regId:      'ELX-K7MXP3QA',    // Who it affected
  adminToken: '5e884898...',       // Which admin did it (by hash)
  timestamp:  '2026-03-27T10:30:00Z',

  // Optional: additional context
  metadata: {
    participantName: 'Karthik Ramasamy',
    event: 'Project Expo'
  }
};
```

---

### 8.6 Tutorial: Excel Export with SheetJS

Admins need to export data for record-keeping. This project uses SheetJS (no backend needed):

```javascript
// Include in HTML: <script src="https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js"></script>

async function exportToExcel() {
  const regs = await getRegistrations();

  // Shape data for export
  const rows = regs.map(r => ({
    'Reg ID':        r.regId,
    'Name':          r.name,
    'Email':         r.email,
    'Phone':         r.phone,
    'College':       r.college,
    'Year':          r.year,
    'Events':        (r.events || []).map(e => e.event).join(', '),
    'Amount (₹)':   r.amount,
    'Status':        r.paymentStatus,
    'Checked In':    r.checkedIn ? 'Yes' : 'No',
    'Registered At': formatDate(r.registeredAt),
  }));

  // Create workbook and worksheet
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Registrations');

  // Style column widths
  ws['!cols'] = [
    { wch: 15 }, // Reg ID
    { wch: 25 }, // Name
    { wch: 30 }, // Email
    { wch: 15 }, // Phone
    { wch: 35 }, // College
    { wch: 10 }, // Year
    { wch: 40 }, // Events
    { wch: 12 }, // Amount
    { wch: 20 }, // Status
    { wch: 12 }, // Checked In
    { wch: 25 }, // Registered At
  ];

  // Download the file
  XLSX.writeFile(wb, `Elexsiya26_Registrations_${new Date().toISOString().split('T')[0]}.xlsx`);
}
```

---

# MODULE 9: QR CODES, CERTIFICATES & EMAIL AUTOMATION
## *Automating the Event Day Experience*

---

### 9.1 Architecture: The QR-Based Attendance System

```
Day of Event:
                                     
Participant shows QR code (their regId)
          ↓
Admin opens onspot_dashboard.html
          ↓
QR Scanner (uses device camera) reads QR code
          ↓
App looks up regId in Firestore
          ↓
Validates: Is payment status "Paid"?
          ↓
If YES → updateCheckInStatus(regId, true) → Marks attendance
         → Shows participant's name, events, team members on screen
          ↓
If NO → Shows red warning: "Payment not verified"
```

---

### 9.2 Tutorial: QR Code Scanner with Browser Camera

```html
<!-- onspot_dashboard.html -->
<video id="qrVideo" autoplay playsinline></video>
<canvas id="qrCanvas" style="display:none;"></canvas>
<div id="scanResult"></div>
```

```javascript
// Include: <script src="https://cdn.jsdelivr.net/npm/jsqr/dist/jsQR.js"></script>

let videoStream = null;
let scanInterval = null;

async function startQRScanner() {
  try {
    // Request camera access — browser will show permission dialog
    videoStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment', // Use back camera on mobile
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    });

    const video = document.getElementById('qrVideo');
    video.srcObject = videoStream;
    await video.play();

    // Scan every 300ms
    const canvas = document.getElementById('qrCanvas');
    const ctx    = canvas.getContext('2d');

    scanInterval = setInterval(() => {
      if (video.readyState !== video.HAVE_ENOUGH_DATA) return;

      canvas.height = video.videoHeight;
      canvas.width  = video.videoWidth;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // jsQR analyzes raw pixel data and finds QR codes
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code) {
        // QR code found!
        const regId = code.data;
        if (regId.startsWith('ELX-')) {
          processCheckIn(regId);
          // Pause scanner briefly to avoid duplicate scans
          clearInterval(scanInterval);
          setTimeout(startQRScanner, 3000);
        }
      }
    }, 300);

  } catch (err) {
    if (err.name === 'NotAllowedError') {
      showError('Camera permission denied. Please allow camera access.');
    } else {
      showError('Camera error: ' + err.message);
    }
  }
}

async function processCheckIn(regId) {
  playBeepSound(); // Auditory feedback

  const regs = await getRegistrations(true);
  const reg  = regs.find(r => r.regId === regId);

  if (!reg) {
    showScanResult('error', `Unknown ID: ${regId}`);
    return;
  }

  if (reg.paymentStatus !== 'Paid') {
    showScanResult('warning', `⚠️ ${reg.name} — Payment NOT verified!`);
    return;
  }

  if (reg.checkedIn) {
    showScanResult('warning', `ℹ️ ${reg.name} — Already checked in at ${formatTime(reg.checkedInAt)}`);
    return;
  }

  // Mark as checked in
  await updateCheckInStatus(regId, true);

  showScanResult('success', `
    ✅ Welcome, ${reg.name}!
    College: ${reg.college}
    Events: ${(reg.events || []).map(e => e.event).join(', ')}
  `);
}
```

---

### 9.3 Architecture: The Certificate Generation Pipeline

Certificates are generated **client-side using the HTML5 Canvas API** — no server or external service needed.

```
Template Image (JPEG)
       ↓  loaded into <canvas>
Canvas Drawing API
       ↓  overlays text: Name, College, Events
       ↓  overlays signatures (images)
       ↓  overlays dynamic quotes
       ↓
Canvas → .toBlob() → JPEG Blob
       ↓
Firebase Storage upload → gets public URL
       ↓
EmailJS sends email with URL
       ↓
Participant downloads certificate
```

---

### 9.4 Tutorial: Canvas-Based Certificate Generation

```javascript
async function generateCertificate(reg) {
  // 1. Create an off-screen canvas at certificate resolution
  const canvas     = document.createElement('canvas');
  canvas.width     = 2481; // A4 landscape at 300 DPI
  canvas.height    = 1754;
  const ctx        = canvas.getContext('2d');

  // 2. Load the certificate template background
  const templateImg = await loadImage('certificate.jpeg');
  ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);

  // 3. Overlay participant's name
  ctx.font      = '900 96px "Cinzel", serif'; // Same font as the website
  ctx.fillStyle = '#8B6914'; // Gold color
  ctx.textAlign = 'center';
  ctx.fillText(reg.name.toUpperCase(), canvas.width / 2, 780);

  // 4. Overlay college name
  ctx.font      = '600 52px "Montserrat", sans-serif';
  ctx.fillStyle = '#2c2c2c';
  ctx.fillText(reg.college, canvas.width / 2, 870);

  // 5. Overlay events
  const eventNames = (reg.events || []).map(e => e.event).join('  ·  ');
  ctx.font      = '600 44px "Montserrat", sans-serif';
  ctx.fillStyle = '#cc0000';
  ctx.fillText(eventNames, canvas.width / 2, 960);

  // 6. Overlay signatures (load and draw signature images)
  const hodSig = await loadImage('hod.png');
  ctx.save();
  // Center the signature at a specific position
  ctx.drawImage(hodSig, 300, 1400, 200, 120);
  ctx.restore();

  // 7. Convert canvas to a Blob (file)
  const blob = await new Promise(resolve => {
    canvas.toBlob(resolve, 'image/jpeg', 0.95); // 95% JPEG quality
  });

  return blob;
}

// Helper: Load an image from a URL into an HTMLImageElement
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Required for CORS (loading from different origins)
    img.onload  = () => resolve(img);
    img.onerror = reject;
    img.src     = src;
  });
}

// Orchestrate: Generate → Upload → Send Email → Update Firestore
async function generateAndSendCertificate(reg) {
  updateProgress(reg.regId, 'Generating certificate...');

  const blob = await generateCertificate(reg);
  updateProgress(reg.regId, 'Uploading...');

  const downloadURL = await uploadCertificateImage(reg.regId, blob);
  updateProgress(reg.regId, 'Sending email...');

  await sendCertificateEmail(reg, downloadURL);

  // Mark certificate as released in Firestore
  await updateCertStatus(reg.regId, true);
  updateProgress(reg.regId, '✅ Done!');
}
```

---

### 9.5 Tutorial: Email Automation with EmailJS

EmailJS lets you send emails directly from the browser — no backend needed.

**Setup:**
```
1. Create account at emailjs.com
2. Connect your email service (Gmail, Outlook, etc.)
3. Create an email template with variables like {{name}}, {{reg_id}}
4. Copy your Public Key, Service ID, and Template ID
```

**Implementation from `shared.js`:**
```javascript
// Constants (set at the top of shared.js)
const EMAILJS_PUBLIC_KEY      = 'pgGsFDU3f8cldU5Rt';
const EMAILJS_SERVICE_ID      = 'service_a8408v9';
const EMAILJS_TEMPLATE_REG    = 'template_od6lwxm'; // On registration
const EMAILJS_TEMPLATE_VERIF  = 'template_28y3izs'; // On payment verification
const EMAILJS_TEMPLATE_CERT   = 'template_certificate'; // On cert release

async function sendAutomatedEmail(templateId, regData) {
  // Wait for SDK to load (loaded asynchronously via CDN)
  if (typeof emailjs === 'undefined') {
    await waitForEmailJS();
  }

  // Build template params matching the variables in your EmailJS template
  const templateParams = {
    name:           regData.name,
    to_name:        regData.name,
    email:          regData.email,
    to_email:       regData.email,
    reg_id:         regData.regId,
    college:        regData.college,
    amount:         regData.amount,
    event_details:  (regData.events || []).map(e => e.event).join(', '),
    payment_status: regData.paymentStatus || 'Pending',
    // WhatsApp group links for each registered event
    whatsapp_link:  buildWhatsAppLinks(regData.events),
  };

  const response = await emailjs.send(
    EMAILJS_SERVICE_ID,
    templateId,
    templateParams
  );

  console.log('[EmailJS] Sent:', response.status);
  return response;
}

// Helper: Build formatted WhatsApp group links
function buildWhatsAppLinks(events = []) {
  return events
    .map(e => {
      const link = EVENT_WHATSAPP_LINKS[e.event];
      return link ? `${e.event}: ${link}` : null;
    })
    .filter(Boolean)
    .join('\n');
}
```

**Sample EmailJS Template (HTML):**
```html
<!-- Configure in EmailJS Dashboard -->
Subject: 🎉 You're Registered for Elexsiya 26! [{{reg_id}}]

Dear {{name}},

Congratulations! Your registration for Elexsiya 26 has been confirmed.

📋 Registration ID: {{reg_id}}
🏛️ College: {{college}}
🎯 Events: {{event_details}}
💰 Amount: ₹{{amount}}
📦 Status: {{payment_status}}

Your WhatsApp Groups:
{{whatsapp_link}}

See you on March 27, 2026!
Team Elexsiya
```

---

# MODULE 10: SERVICE WORKERS & PWA
## *Making Your Site Work Offline and Feel Native*

---

### 10.1 Architecture: What is a Service Worker?

A Service Worker is a JavaScript file that runs in the **background**, separate from the main browser thread. Think of it as a programmable proxy between your app and the network.

```
Normal request flow:
Browser → Server → Response

With Service Worker:
Browser → Service Worker → (cache OR network) → Response
```

The Service Worker from `sw.js` implements three lifecycle events:

```
INSTALL → ACTIVATE → FETCH

INSTALL:  Pre-cache critical assets (index.html, styles.css)
ACTIVATE: Delete old caches from previous versions
FETCH:    Intercept every network request and decide: cache or network?
```

---

### 10.2 Tutorial: The Complete Service Worker

```javascript
// sw.js — full implementation

const CACHE_VERSION = 'v4';
const CACHE_NAME    = `elexsiya-${CACHE_VERSION}`;

// Assets to pre-cache on install (critical path)
const PRECACHE_ASSETS = ['/', '/index.html', '/styles.css'];

// ── INSTALL: Pre-cache critical assets ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .catch(() => {}) // Non-fatal: proceed even if precache fails
  );
  self.skipWaiting(); // Activate immediately, don't wait for old tabs to close
});

// ── ACTIVATE: Delete stale caches ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE_NAME) // Keep only current version
            .map(key => caches.delete(key))    // Delete everything else
        )
      )
      .then(() => self.clients.claim()) // Take control of open tabs immediately
  );
});

// ── FETCH: Smart routing strategy ──
self.addEventListener('fetch', event => {
  const { request } = event;

  // Skip: Non-GET requests (POST/PUT/DELETE)
  if (request.method !== 'GET') return;

  // Skip: Cross-origin requests (Firebase, Google Fonts, EmailJS)
  const url = new URL(request.url);
  if (url.origin !== location.origin) return;

  const isHTML = request.headers.get('Accept')?.includes('text/html')
              || url.pathname.endsWith('.html')
              || url.pathname === '/';

  if (isHTML) {
    // HTML: Network-first → Always get fresh pages
    // Falls back to cache only when offline
    event.respondWith(
      fetch(request, { cache: 'no-store' })
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request)) // Offline fallback
    );
  } else {
    // Static assets (JS/CSS/images): Cache-first + background revalidation
    event.respondWith(
      caches.open(CACHE_NAME).then(async cache => {
        const cached = await cache.match(request);

        // Still fetch in the background to update the cache
        const fetchPromise = fetch(request, { cache: 'no-cache' })
          .then(response => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          })
          .catch(() => null);

        // Return cached version immediately (fast!)
        // Fetch updates the cache for next time
        return cached || fetchPromise;
      })
    );
  }
});

// ── MESSAGE: Force cache clear on demand ──
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
  if (event.data === 'CLEAR_CACHE') {
    caches.keys().then(keys => keys.forEach(key => caches.delete(key)));
  }
});
```

---

### 10.3 Registering the Service Worker from Your Page

```javascript
// shared.js — registers the service worker on every page
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(reg => {
      // Force update check on every load (important for event-day updates)
      reg.update();
      console.log('[SW] Registered:', reg.scope);
    })
    .catch(err => console.warn('[SW] Registration failed:', err));
}
```

---

### 10.4 Cache Busting Strategy

The project uses a **two-layer cache-busting strategy**:

**Layer 1: Service Worker version string**
```javascript
// Change this in sw.js to force all clients to clear their cache
const CACHE_VERSION = 'v4'; // ← bump to v5 after a deploy
const CACHE_NAME    = `elexsiya-${CACHE_VERSION}`;
```

When this changes, the ACTIVATE event deletes all old caches.

**Layer 2: App version in localStorage**
```javascript
// Runs inline in <head> — BEFORE any CSS or JS loads
const currentVersion = 'v1.1'; // ← bump after major changes
const storedVersion  = localStorage.getItem('app_version');

if (storedVersion !== currentVersion) {
  localStorage.clear();
  sessionStorage.clear();
  localStorage.setItem('app_version', currentVersion);
  
  // Also clear service worker caches
  if ('caches' in window) {
    caches.keys().then(names => {
      for (let name of names) caches.delete(name);
    });
  }
  window.location.reload(true); // Force fresh load
}
```

**Layer 3: CSS/JS query strings**
```html
<link rel="stylesheet" href="styles.css?v=4" />
<script src="shared.js?v=4"></script>
```

The `?v=4` makes the browser treat each version as a **different URL** — it cannot use a cached version from `styles.css?v=3`.

---

# MODULE 11: DEPLOYMENT, HOSTING & DEVOPS
## *Getting Your Site Live on the Internet*

---

### 11.1 Tutorial: Firebase Hosting Deployment

```bash
# Step 1: Install Firebase CLI globally
npm install -g firebase-tools

# Step 2: Login to Firebase
firebase login
# Opens browser → authenticate with Google

# Step 3: Initialize Firebase in your project
# (run in your project root folder)
firebase init
# Select: Hosting, Firestore, Storage, Functions
# Set public directory to: .   (the root folder)
# Configure as single-page app: No
# Overwrite index.html: No

# Step 4: Deploy everything
firebase deploy

# → Your site is live at:
# https://your-project.web.app
# https://your-project.firebaseapp.com
```

---

### 11.2 The firebase.json Configuration

```json
{
  "hosting": {
    "public": ".",
    "ignore": [
      "firebase.json",
      "firestore.rules",
      "storage.rules",
      ".firebaserc",
      "node_modules/**",
      "functions/**",
      "*.md",
      "*.txt"
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [{
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }]
      },
      {
        "source": "**/*.html",
        "headers": [{
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        }]
      }
    ],
    "rewrites": [
      {
        "source": "/app/**",
        "destination": "/index.html"
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  },
  "functions": {
    "source": "functions"
  }
}
```

**Cache-Control strategy explained:**

- **JS/CSS files**: `max-age=31536000, immutable` → cache for 1 year. Since filenames have `?v=4` query strings, a new version is a new URL — no stale file risk.
- **HTML files**: `no-cache` → always check with the server before using a cached version. HTML pages link to different JS/CSS, so they must always be fresh.

---

### 11.3 Deploying Cloud Functions

```bash
# Navigate to functions folder
cd functions

# Install dependencies
npm install

# Deploy only the functions (not hosting)
firebase deploy --only functions

# Functions will be available at:
# https://us-central1-your-project.cloudfunctions.net/adminTogglePayment
# https://us-central1-your-project.cloudfunctions.net/adminDeleteRegistration
```

**functions/package.json:**
```json
{
  "name": "functions",
  "description": "Cloud Functions for Elexsiya 26",
  "scripts": {
    "serve": "firebase emulators:start --only functions",
    "deploy": "firebase deploy --only functions"
  },
  "engines": { "node": "18" },
  "main": "index.js",
  "dependencies": {
    "firebase-admin":    "^12.0.0",
    "firebase-functions": "^5.0.0"
  }
}
```

---

### 11.4 Environment Management

Never commit secrets or API keys directly to git. For this project using the Firebase CDN approach, the `firebase-config.js` file contains the public API key — which is acceptable because:

1. Firebase API keys are **not secrets** — they identify your project, not authenticate you
2. **Firestore security rules** are your actual access controls
3. **Admin tokens** are SHA-256 hashes verified server-side

For real production apps (with Node.js backend), use environment variables:

```bash
# .env file (NEVER commit to git)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
EMAILJS_PRIVATE_KEY=abc123xyz
ADMIN_SECRET=SuperSecretHash

# .gitignore
.env
node_modules/
functions/node_modules/
```

---

# MODULE 12: FROM ZERO — BUILD YOUR OWN WORLD-CLASS SITE
## *A Step-by-Step Blueprint for Your Next Project*

---

### 12.1 Phase 0: Define the Requirements (Before Writing a Line of Code)

Answer these questions first:

```
1. Who are your users?
   → Participants (public), Admins (restricted), Event-day staff (mobile)

2. What are the critical user flows?
   → Registration → Payment → Attendance → Certificate

3. What data do you need to store?
   → Draw your Firestore schema on paper

4. What is your scale?
   → Expect 200-500 users? Firebase Free tier is sufficient.
   → Expect 10,000+ users? Plan for Blaze (Pay-as-you-go) plan.

5. What are your security requirements?
   → Authenticated admin access? Firestore rules? Audit logs?
```

---

### 12.2 Phase 1: Set Up Your Project Structure

```
my-symposium/
├── index.html          ← Landing page
├── events.html         ← Event listing + registration
├── payment.html        ← Payment page
├── success.html        ← Confirmation
├── login.html          ← Participant login
├── admin.html          ← Admin login gate
├── dashboard.html      ← Admin dashboard
│
├── styles.css          ← Global design system (variables, reset, typography)
├── landing.css         ← Page-specific styles
│
├── firebase-config.js  ← Firebase setup
├── shared.js           ← Utilities, Firestore helpers
├── sw.js               ← Service worker
│
├── firebase.json       ← Firebase Hosting & service config
├── firestore.rules     ← Firestore security rules
├── storage.rules       ← Storage security rules
├── .firebaserc         ← Project alias
└── .gitignore
```

---

### 12.3 Phase 2: Build the Design System First

**Always start with `styles.css` — not the HTML.**

```css
/* styles.css — Week 1 goal */
:root {
  /* Your brand colors — pick ONE primary, ONE accent, ONE neutral */
  --primary:   #YOUR_COLOR;
  --accent:    #YOUR_ACCENT;
  --text-dark: #1a1a1a;
  --text-muted: #666;
  --bg-dark:   #0a0a0a;
  --bg-light:  #f8f9fa;

  /* Spacing scale */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 32px;
  --space-xl: 64px;

  /* Typography */
  --font-heading: 'Cinzel', serif;     /* Premium, authoritative */
  --font-body:    'Montserrat', sans-serif; /* Clean, modern */

  /* Effects */
  --radius:     12px;
  --transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --shadow:     0 8px 32px rgba(0,0,0,0.12);
}

/* CSS Reset */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  font-family: var(--font-body);
  color: var(--text-dark);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

/* Typography scale */
h1 { font-size: clamp(2.5rem, 8vw, 5rem); font-family: var(--font-heading); }
h2 { font-size: clamp(1.8rem, 5vw, 3rem); }
h3 { font-size: clamp(1.2rem, 3vw, 1.8rem); }
p  { font-size: clamp(0.9rem, 2vw, 1rem); }
```

---

### 12.4 Phase 3: Build the Firebase Backend

**Checklist:**
- [ ] Create Firebase project
- [ ] Enable Firestore
- [ ] Enable Storage
- [ ] Enable Hosting
- [ ] Copy `firebase-config.js` template (replace values)
- [ ] Write `firestore.rules` (always start with `allow read, write: if false;` then loosen as needed)
- [ ] Write `storage.rules`
- [ ] Install Firebase CLI and run `firebase init`

---

### 12.5 Phase 4: Implement Security from Day 1

**Never add security as an afterthought.**

Security checklist:
- [ ] CSP meta tag in `<head>` of every page
- [ ] Admin passwords stored as SHA-256 hashes
- [ ] Admin token stored in `sessionStorage` (not `localStorage` — clears on browser close)
- [ ] All user-inputted content escaped with `escapeHtml()` before using `innerHTML`
- [ ] Firestore rules set to least-privilege (only what's needed)
- [ ] Storage rules restrict file type and size
- [ ] Audit log for all admin operations (`allow update, delete: if false`)
- [ ] No sensitive data in URL query parameters

---

### 12.6 Phase 5: Implement Core User Flows

Build in this order (simpler → complex):

```
1. Landing page → Hero, Events section, FAQ (No database)
2. Registration form → Collect data, validation, submit
3. Payment page → Show QR, collect screenshot
4. Success page → Show regId and QR code
5. Admin login → Hash verification, sessionStorage
6. Admin dashboard → Read registrations, filter, search
7. Payment verification → Toggle status buttons
8. Attendance → QR scanner, check-in updates
9. Certificate → Canvas generation, Storage upload, email
```

---

### 12.7 Phase 6: Performance Optimization Checklist

- [ ] All images compressed (use TinyPNG or Canvas API compression)
- [ ] Google Fonts loaded non-blocking (the `onload` trick)
- [ ] Service Worker installed for offline support and caching
- [ ] `preconnect` to all third-party origins
- [ ] `loading="lazy"` on all below-fold images
- [ ] `fetchpriority="high"` on the hero image
- [ ] CSS and JS have `?v=X` cache-busting query strings
- [ ] `IntersectionObserver` for scroll animations (not `scroll` events)
- [ ] Search/filter operations are client-side (no DB call on every keystroke)
- [ ] Debounce on search input (300ms delay)

---

### 12.8 Complete Security Hardening Checklist

Copy this into your project README and check every item before going live:

#### Frontend Security
- [ ] CSP header configured and tested (use a CSP evaluator tool)
- [ ] All `innerHTML` insertions escaped with `escapeHtml()`
- [ ] No passwords or API secrets in JavaScript source
- [ ] Admin credentials stored as SHA-256 hashes
- [ ] Admin session uses `sessionStorage` (auto-clears on tab close)
- [ ] All form inputs validated client-side AND server-side
- [ ] Download file names sanitized (no `../` path traversal)

#### Firebase Security
- [ ] Firestore rules: Default-deny (lock everything first, then open what's needed)
- [ ] Storage rules: File size limits + content type validation
- [ ] API key not in `.env` files committed to git
- [ ] Firebase App Check configured (for production apps)
- [ ] Cloud Functions validate admin tokens on every request
- [ ] Firestore audit collection: append-only (`update, delete: if false`)

#### Infrastructure Security
- [ ] HTTPS enforced (Firebase Hosting does this automatically)
- [ ] `X-Content-Type-Options: nosniff` header set
- [ ] `X-Frame-Options: SAMEORIGIN` header set (prevents clickjacking)
- [ ] CORS restricted to your domain only in Cloud Functions

#### Operational Security
- [ ] Admin credentials changed from defaults before event day
- [ ] Test with DevTools open — ensure no sensitive data in console logs
- [ ] Test by opening Firestore console directly — verify rules block malicious writes

---

### 12.9 Common Mistakes to Avoid

| Mistake | Impact | Fix |
|---------|--------|-----|
| Using `innerHTML` with user data | XSS attack | Use `textContent` or `escapeHtml()` |
| `await`-ing Firestore writes on mobile | App hangs for 60+ seconds | Optimistic write pattern |
| Storing admin password in plain text | Account compromise | SHA-256 hash |
| No timeout on Firestore reads | Infinite loading spinner | `Promise.race()` with 15s timeout |
| One `<h1>` per page rule violated | SEO ranking drops | Audit each page |
| Images not compressed | Slow load on mobile | Canvas API compression |
| Firestore rules: `allow read, write: if true` | Anyone can read/write ALL data | Write specific rules |
| No cache invalidation strategy | Users see stale content after a deploy | `?v=X` query strings + SW version bump |
| `Math.random()` for IDs | Predictable, insecure IDs | `crypto.getRandomValues()` |
| No error boundaries | Silent failures, confused users | Always wrap async in try/catch with user feedback |

---

### 12.10 The Progression Path: What to Learn Next

After mastering this project, your learning path:

```
Level 1 (This project): Vanilla JS + Firebase
        ↓
Level 2: React.js or Vue.js (component-based UI)
        ↓
Level 3: Next.js (React + Server-Side Rendering + SEO)
        ↓
Level 4: Node.js + Express (custom backend APIs)
        ↓
Level 5: PostgreSQL/MySQL (relational databases, SQL)
        ↓
Level 6: TypeScript (type safety)
        ↓
Level 7: Docker + CI/CD (DevOps basics)
        ↓
Level 8: Cloud Architecture (AWS/GCP/Azure fundamentals)
```

**Cybersecurity specialization path:**
```
Basics (This project):  SHA-256, CSP, XSS prevention, Firestore rules
        ↓
Authentication:         JWT tokens, OAuth 2.0, session management
        ↓
Cryptography:           Asymmetric encryption (RSA/ECDSA), TLS/SSL
        ↓
Penetration Testing:    OWASP Top 10, Burp Suite, SQL Injection
        ↓
Web Security:           CORS, CSRF tokens, Subresource Integrity (SRI)
        ↓
Infrastructure:         Firewalls, VPNs, WAF (Web Application Firewall)
        ↓
Compliance:             GDPR, ISO 27001, SOC 2
```

---

## 📚 APPENDIX: QUICK REFERENCE

### Key Code Patterns Summary

```javascript
// ── SHA-256 Hash ──
async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

// ── Timeout Wrapper ──
const withTimeout = (p, ms) => Promise.race([p, new Promise((_,r) => setTimeout(r, ms))]);

// ── Secure ID Generator ──
function generateId(prefix='ELX', len=8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const arr   = new Uint32Array(len);
  crypto.getRandomValues(arr);
  return prefix + '-' + Array.from(arr).map(n => chars[n % chars.length]).join('');
}

// ── XSS Escape ──
function escapeHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;');
}

// ── Debounce ──
function debounce(fn, delay) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
}

// ── localStorage with expiry ──
function setWithExpiry(key, value, ms) {
  localStorage.setItem(key, JSON.stringify({ value, expiry: Date.now() + ms }));
}
function getWithExpiry(key) {
  const item = JSON.parse(localStorage.getItem(key) || 'null');
  if (!item || Date.now() > item.expiry) { localStorage.removeItem(key); return null; }
  return item.value;
}
```

---

### Firestore Quick Reference

```javascript
// Read all, ordered
const snap = await db.collection('regs').orderBy('createdAt','desc').get();
const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

// Read one by ID
const doc = await db.collection('regs').doc(id).get();
const data = doc.exists ? doc.data() : null;

// Read with filter
const snap = await db.collection('regs').where('status','==','Paid').get();

// Create / overwrite
await db.collection('regs').doc(id).set(data);

// Update specific fields only
await db.collection('regs').doc(id).update({ status:'Paid', updatedAt: new Date().toISOString() });

// Delete
await db.collection('regs').doc(id).delete();

// Real-time listener
const unsubscribe = db.collection('regs').onSnapshot(snap => {
  const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  renderTable(data);
});
// Stop listening: unsubscribe()
```

---

### CSS Variables Starter Template

```css
:root {
  --primary:    #cc0000;  --primary-light: #ff3333;  --primary-dark: #990000;
  --accent:     #d4af37;  --accent-dark:   #b8860b;
  --bg-dark:    #0a0a0a;  --bg-card:       #111111;   --bg-light: #f8f9fa;
  --text:       #1a1a1a;  --text-muted:    #666666;   --text-light: #ffffff;
  --border:     12px;     --gap:           24px;
  --shadow:     0 8px 32px rgba(0,0,0,.12);
  --transition: .3s cubic-bezier(.4,0,.2,1);
  --font-h:     'Cinzel', serif;
  --font-b:     'Montserrat', sans-serif;
}
```

---

*[Course Complete — All 12 Modules]*

> **🎓 Congratulations!** You have now studied the complete architecture, implementation, and security of a production-grade symposium platform. The patterns you have learned — serverless architecture, async programming, design systems, Firebase, SHA-256 security, Service Workers, Canvas API, and Cloud Functions — form the foundation of modern web development. Build something great.

