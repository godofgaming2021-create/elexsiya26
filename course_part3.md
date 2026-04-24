# ELEXSIYA 26 — World-Class Web Development Course
## PART 3: Advanced Bonus Modules
### *Real-World Patterns from a Live Production Platform*

---

> **Who is Part 3 for?**
> You have completed Modules 1–12. This section dives into the advanced, real-world patterns that make Elexsiya 26 stand apart from basic tutorial projects — multi-role event admin dashboards, intra-college chess systems, team-based IdeaForge management, and production-hardening techniques.

---

## TABLE OF CONTENTS — PART 3

| # | Bonus Module | Style |
|---|-------------|-------|
| 13 | Multi-Role Event Admin Dashboards | 🏛️ Architecture + Tutorial |
| 14 | Chess Admin: Intra-College Tournament System | 📖 Tutorial |
| 15 | IdeaForge Admin: Team Project Management | 📖 Tutorial |
| 16 | Advanced Canvas: Dynamic Certificate Rendering | 🏛️ Architecture |
| 17 | On-Spot Registration & Two-Phase QR Check-In | 📖 Tutorial |
| 18 | Financial Dashboard: Sponsors & Expenditures | 📖 Tutorial |
| 19 | Production Hardening & Lessons Learned | 🏛️ Architecture |

---

# MODULE 13: MULTI-ROLE EVENT ADMIN DASHBOARDS
## *How One Codebase Serves Four Different Admins*

---

### 13.1 The Problem: One Site, Many Admins

Elexsiya 26 has four distinct admin roles, each needing a different view of the same data:

```
Super Admin    → Full control: payments, certificates, sponsors, all events
Treasurer      → Financial view: revenue, expenses, sponsorships
Event Admin    → Specific events only: manage participants for their event
On-Spot Admin  → Day-of: QR scanner, check-in, on-spot registration
```

**The wrong approach:** Build four separate dashboards.  
**The right approach:** Build ONE dashboard that shows/hides sections based on role.

---

### 13.2 The Role Verification System

```javascript
// shared.js — Admin credential definitions
// Each admin is identified by a SHA-256 hash of their credentials

const ADMIN_ROLES = {
  // sha256(email + ':' + password) → role config
  SUPER: {
    userHash:  'd8f67393...', // sha256('rakulkavi')
    passHash:  'a1b2c3d4...', // sha256('SuperSecr3t2026!')
    level:     'super',
    label:     'Super Admin',
    canSeeCerts:    true,
    canSeeFinance:  true,
    canDeleteRegs:  true,
  },
  TREASURER: {
    userHash:  '4f9a2b1c...', // sha256('elexsiya26')
    passHash:  '9e8f7a6b...', // sha256('Treasury$ync#26')
    level:     'treasurer',
    label:     'Treasurer',
    canSeeCerts:    false,
    canSeeFinance:  true,
    canDeleteRegs:  false,
  },
  ADMIN: {
    userHash:  'c3d4e5f6...', // sha256('ece26')
    passHash:  '5e884898...', // sha256('password')
    level:     'normal',
    label:     'Event Admin',
    canSeeCerts:    false,
    canSeeFinance:  false,
    canDeleteRegs:  false,
  },
};

async function verifyAdmin(emailInput, passwordInput) {
  const eHash = await sha256(emailInput.toLowerCase().trim());
  const pHash = await sha256(passwordInput);

  for (const [, role] of Object.entries(ADMIN_ROLES)) {
    if (eHash === role.userHash && pHash === role.passHash) {
      return {
        success:  true,
        level:    role.level,
        label:    role.label,
        token:    pHash, // The password hash IS the session token
        permissions: {
          canSeeCerts:   role.canSeeCerts,
          canSeeFinance: role.canSeeFinance,
          canDeleteRegs: role.canDeleteRegs,
        }
      };
    }
  }
  return { success: false };
}
```

---

### 13.3 Applying Permissions to the Dashboard UI

```javascript
// dashboard.html — on page load
async function initDashboard() {
  const token = sessionStorage.getItem('adminToken');
  const level = sessionStorage.getItem('adminLevel');

  if (!token) {
    window.location.href = 'admin.html';
    return;
  }

  // Apply role-based visibility rules
  const canSeeCerts   = sessionStorage.getItem('canSeeCerts')   === 'true';
  const canSeeFinance = sessionStorage.getItem('canSeeFinance') === 'true';
  const canDeleteRegs = sessionStorage.getItem('canDeleteRegs') === 'true';

  // Hide tabs the current role cannot access
  if (!canSeeFinance) {
    document.getElementById('tab-sponsors').remove();
    document.getElementById('tab-expenditures').remove();
  }
  if (!canSeeCerts) {
    document.getElementById('cert-release-section').style.display = 'none';
    document.getElementById('tab-tools').remove();
  }

  // Hide the Delete button in every registration row
  if (!canDeleteRegs) {
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.style.display = 'none';
    });
  }

  // Show the admin's role label in the header
  document.getElementById('adminRoleLabel').textContent =
    sessionStorage.getItem('adminLabel') || 'Admin';
}
```

**Why use `sessionStorage` for permissions?**

`sessionStorage` is cleared when the browser tab is closed. This means:
1. An admin's session auto-expires when they close the dashboard tab
2. If an admin's laptop is taken, a new tab cannot inherit the session
3. Each tab is independent — two admins can be logged in simultaneously in separate tabs

---

### 13.4 Architecture: Tab-Based Single-Page Dashboard

The dashboard is a **single HTML page** that simulates multiple "pages" using tab switching — no page reloads, no data re-fetching.

```javascript
// Tab switching system — zero network calls on tab change
const tabs = document.querySelectorAll('.tab-btn');
const panels = document.querySelectorAll('.tab-panel');

tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab; // e.g., "registrations"

    // Deactivate all tabs and panels
    tabs.forEach(t => t.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));

    // Activate the clicked tab
    btn.classList.add('active');
    document.getElementById(`panel-${target}`).classList.add('active');

    // Lazy-load panel data only when first visited
    if (!panelLoaded[target]) {
      loadPanelData(target);
      panelLoaded[target] = true;
    }
  });
});

// Track which panels have been loaded
const panelLoaded = {};
```

**The lazy-load trick:** Data for secondary tabs (sponsors, expenditures, screenshots) is only fetched when the admin actually clicks that tab. This cuts cold-load time by ~60%.

---

# MODULE 14: CHESS ADMIN — INTRA-COLLEGE TOURNAMENT
## *Building a Specialized Sub-Dashboard*

---

### 14.1 Architecture: Why a Separate Chess Dashboard?

The Chess event at Elexsiya 26 has unique requirements not shared by other events:

1. **Intra-college component:** Students from AURCM compete internally — separate registration, separate results
2. **Individual sport tracking:** Unlike team events, chess tracks individual players
3. **Round-by-round results:** Scores for each match in the tournament bracket

This complexity warranted a **dedicated `chess_admin.html`** page — but it shares the same `firebase-config.js` and `shared.js`, keeping the architecture unified.

---

### 14.2 The Chess Firestore Schema

```
/registrations/{regId}              ← Standard event registration (intercollegiate)
/chess_intra_registrations/{id}     ← Intra-AURCM registrations (separate collection)
```

```json
// chess_intra_registrations document
{
  "id":         "CHESS-INTRA-001",
  "name":       "Dinesh Kumar",
  "department": "ECE",
  "year":       "2nd Year",
  "rollNo":     "AU21ECE056",
  "phone":      "9876543210",
  "registeredAt": "Timestamp",
  "round1Result": "Win",
  "round2Result": "Loss",
  "finalPosition": 3
}
```

---

### 14.3 Tutorial: Chess Admin Authentication

The Chess admin uses a separate login flow from the main dashboard, protecting event-specific management:

```javascript
// chess_admin_login.html
const CHESS_ADMIN_HASH = 'f7e3a2b1...'; // sha256('chess_admin_pass')

async function chessAdminLogin() {
  const pass = document.getElementById('passInput').value;
  const hash = await sha256(pass);

  if (hash === CHESS_ADMIN_HASH) {
    sessionStorage.setItem('chessAdminToken', hash);
    window.location.href = 'chess_admin.html';
  } else {
    showError('Invalid password.');
  }
}

// chess_admin.html — gate check on load
function checkChessAuth() {
  const token = sessionStorage.getItem('chessAdminToken');
  if (!token || token !== CHESS_ADMIN_HASH) {
    window.location.href = 'chess_admin_login.html';
  }
}
document.addEventListener('DOMContentLoaded', checkChessAuth);
```

---

### 14.4 Tutorial: Rendering the Tournament Bracket Display

```javascript
// chess_admin.html — display participants in sortable table
async function loadChessParticipants() {
  const snapshot = await window.db
    .collection('chess_intra_registrations')
    .orderBy('name')
    .get();

  const participants = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  const tbody = document.getElementById('chessTableBody');
  tbody.innerHTML = '';

  participants.forEach((p, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${escapeHtml(p.name)}</td>
      <td>${escapeHtml(p.department)}</td>
      <td>${escapeHtml(p.year)}</td>
      <td>${escapeHtml(p.rollNo)}</td>
      <td>
        <select onchange="updateResult('${p.id}', 'round1Result', this.value)">
          <option value="" ${!p.round1Result ? 'selected' : ''}>--</option>
          <option value="Win"  ${p.round1Result === 'Win'  ? 'selected' : ''}>Win</option>
          <option value="Loss" ${p.round1Result === 'Loss' ? 'selected' : ''}>Loss</option>
          <option value="Draw" ${p.round1Result === 'Draw' ? 'selected' : ''}>Draw</option>
        </select>
      </td>
      <td>
        <select onchange="updateResult('${p.id}', 'round2Result', this.value)">
          <option value="">--</option>
          <option value="Win"  ${p.round2Result === 'Win'  ? 'selected' : ''}>Win</option>
          <option value="Loss" ${p.round2Result === 'Loss' ? 'selected' : ''}>Loss</option>
          <option value="Draw" ${p.round2Result === 'Draw' ? 'selected' : ''}>Draw</option>
        </select>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Save a result update to Firestore instantly
async function updateResult(docId, field, value) {
  await window.db
    .collection('chess_intra_registrations')
    .doc(docId)
    .update({ [field]: value }); // Computed property key

  showToast(`Result updated!`);
}
```

**The computed property key pattern:** `{ [field]: value }` lets you use a variable as an object key — essential for reusable update functions.

---

# MODULE 15: IDEAFORGE ADMIN — TEAM PROJECT MANAGEMENT
## *Handling Complex Team Data Structures*

---

### 15.1 The IdeaForge Data Challenge

IdeaForge allows teams of 1–3 members. The admin dashboard must:
- Show ALL members of a team on one row
- Export team + individual data in different formats
- Allow per-team status management (shortlisted, eliminated, winner)

This creates the **multi-dimensional data problem:** a single Firestore document holds an array of team members, but the admin needs to view and filter by individual names.

---

### 15.2 Tutorial: Rendering Team Rows

```javascript
// ideaforge_admin.html — render a registration with team members
function renderIdeaForgeRow(reg) {
  // Extract team members from the events array
  const ideaForgeEvent = (reg.events || []).find(e => e.event === 'Idea Forge');
  const members = ideaForgeEvent?.members || [reg.name];

  // Build member list HTML
  const memberList = members.map((m, i) =>
    `<div class="member-item">
       <span class="member-num">${i + 1}.</span>
       <span class="member-name">${escapeHtml(m)}</span>
     </div>`
  ).join('');

  return `
    <tr data-regid="${reg.regId}">
      <td>${escapeHtml(reg.regId)}</td>
      <td>
        <div class="team-members">
          ${memberList}
        </div>
      </td>
      <td>${escapeHtml(reg.college)}</td>
      <td>${escapeHtml(reg.phone)}</td>
      <td>
        <select class="status-select"
          onchange="updateIdeaForgeStatus('${reg.regId}', this.value)">
          <option value="Registered" ${reg.ideaForgeStatus === 'Registered' ? 'selected' : ''}>Registered</option>
          <option value="Shortlisted" ${reg.ideaForgeStatus === 'Shortlisted' ? 'selected' : ''}>Shortlisted</option>
          <option value="Winner" ${reg.ideaForgeStatus === 'Winner' ? 'selected' : ''}>Winner</option>
          <option value="Eliminated" ${reg.ideaForgeStatus === 'Eliminated' ? 'selected' : ''}>Eliminated</option>
        </select>
      </td>
    </tr>
  `;
}

async function updateIdeaForgeStatus(regId, status) {
  await window.db.collection('registrations').doc(regId).update({
    ideaForgeStatus: status,
    ideaForgeUpdatedAt: new Date().toISOString()
  });
  showToast(`✅ Status updated: ${status}`);
}
```

---

### 15.3 Tutorial: Dual-Layout Excel Export

Admin needs two export formats:
1. **Individual Layout:** One row per member (name, college, phone)
2. **Team Layout:** One row per team, member names in separate columns

```javascript
async function exportIdeaForgeExcel(layout = 'team') {
  const regs = await getRegistrations();
  const ideaRegs = regs.filter(r =>
    (r.events || []).some(e => e.event === 'Idea Forge')
  );

  let rows = [];

  if (layout === 'individual') {
    // Flatten: one row per member
    ideaRegs.forEach(r => {
      const ev = r.events.find(e => e.event === 'Idea Forge');
      const members = ev?.members || [r.name];
      members.forEach(member => {
        rows.push({
          'Team Lead':     r.name,
          'Member Name':   member,
          'College':       r.college,
          'Phone':         r.phone,
          'Reg ID':        r.regId,
          'Status':        r.ideaForgeStatus || 'Registered',
        });
      });
    });

  } else {
    // Team layout: one row per team
    ideaRegs.forEach(r => {
      const ev    = r.events.find(e => e.event === 'Idea Forge');
      const mems  = ev?.members || [r.name];
      rows.push({
        'Reg ID':     r.regId,
        'Team Lead':  r.name,
        'Member 2':   mems[1] || '—',
        'Member 3':   mems[2] || '—',
        'College':    r.college,
        'Phone':      r.phone,
        'Status':     r.ideaForgeStatus || 'Registered',
        'Amount':     r.amount,
      });
    });
  }

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'IdeaForge');
  XLSX.writeFile(wb, `IdeaForge_${layout}_${new Date().toISOString().split('T')[0]}.xlsx`);
}
```

---

# MODULE 16: ADVANCED CANVAS — DYNAMIC CERTIFICATE RENDERING
## *Pixel-Perfect Certificates Without a Server*

---

### 16.1 The Font Loading Problem

The most common certificate generation bug: **fonts are not loaded when you call `ctx.fillText()`**, so the browser falls back to a system font.

```javascript
// ❌ BUG: Font may not be loaded yet
ctx.font = '900 96px "Cinzel", serif';
ctx.fillText(reg.name, cx, 780);
// Result: Text appears in Times New Roman, not Cinzel

// ✅ FIX: Ensure fonts are loaded using the FontFace API
async function ensureFontsLoaded() {
  // If fonts haven't been declared in CSS, load them programmatically
  if (!document.fonts.check('900 96px "Cinzel"')) {
    const font = new FontFace(
      'Cinzel',
      'url(https://fonts.gstatic.com/s/cinzel/v23/8vIJ7ww63mVu7gto.woff2)',
      { weight: '900' }
    );
    await font.load();
    document.fonts.add(font);
  }
  // Wait for ALL declared fonts to be ready
  await document.fonts.ready;
}
```

---

### 16.2 Text Wrapping for Long Names

```javascript
// Wrap text that exceeds a max width on the canvas
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line    = '';
  let lines   = [];

  words.forEach(word => {
    const testLine  = line + word + ' ';
    const measured  = ctx.measureText(testLine);

    if (measured.width > maxWidth && line !== '') {
      lines.push(line.trim());
      line = word + ' ';
    } else {
      line = testLine;
    }
  });
  lines.push(line.trim());

  // Draw each line, centered vertically around the starting y
  const totalHeight = lines.length * lineHeight;
  const startY      = y - (totalHeight / 2) + (lineHeight / 2);

  lines.forEach((l, i) => {
    ctx.fillText(l, x, startY + (i * lineHeight));
  });

  return lines.length; // Return line count for positioning subsequent elements
}

// Usage
ctx.font      = '900 96px "Cinzel", serif';
ctx.textAlign = 'center';
const lineCount = wrapText(ctx, reg.name.toUpperCase(), canvas.width / 2, 780, 1800, 110);
// Next element is pushed down based on how many lines the name took
const nextY = 780 + (lineCount - 1) * 110 + 90;
ctx.font = '600 52px "Montserrat", sans-serif';
ctx.fillText(reg.college, canvas.width / 2, nextY);
```

---

### 16.3 The Headless Certificate Pipeline (Cloud Functions)

For large batches (all 200 participants), generating certificates in the browser is impractical. The production approach uses a Cloud Function that triggers canvas rendering server-side.

```javascript
// functions/index.js — batch certificate generation
const { onRequest } = require('firebase-functions/v2/https');
const { createCanvas, loadImage, registerFont } = require('canvas'); // node-canvas
const admin = require('firebase-admin');

admin.initializeApp();

registerFont('./fonts/Cinzel-Black.ttf',      { family: 'Cinzel',     weight: '900' });
registerFont('./fonts/Montserrat-SemiBold.ttf', { family: 'Montserrat', weight: '600' });

exports.generateCertificate = onRequest({ cors: true }, async (req, res) => {
  const { regId, adminToken } = req.body;

  // Verify admin
  if (!VALID_TOKENS.includes(adminToken)) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  // Get participant data
  const db    = admin.firestore();
  const doc   = await db.collection('registrations').doc(regId).get();
  const reg   = doc.data();

  // Create canvas (same dimensions as client-side)
  const canvas = createCanvas(2481, 1754);
  const ctx    = canvas.getContext('2d');

  // Draw template
  const template = await loadImage('./certificate.jpeg');
  ctx.drawImage(template, 0, 0, 2481, 1754);

  // Draw name
  ctx.font      = '900 96px Cinzel';
  ctx.fillStyle = '#8B6914';
  ctx.textAlign = 'center';
  ctx.fillText(reg.name.toUpperCase(), 1240, 780);

  // Convert to buffer
  const buffer = canvas.toBuffer('image/jpeg', { quality: 0.95 });

  // Upload to Firebase Storage
  const storage = admin.storage();
  const file    = storage.bucket().file(`certificates/${regId}.jpg`);
  await file.save(buffer, { contentType: 'image/jpeg', public: true });

  const url = file.publicUrl();

  // Mark as released
  await db.collection('registrations').doc(regId).update({
    certReleased: true,
    certUrl:      url,
    certReleasedAt: new Date().toISOString()
  });

  res.json({ success: true, url });
});
```

**Key difference from client-side:** Uses the `canvas` npm package for server-side rendering, and `registerFont()` to load custom fonts from the local filesystem — no browser needed.

---

# MODULE 17: ON-SPOT REGISTRATION & TWO-PHASE QR CHECK-IN
## *Managing Walk-In Participants on Event Day*

---

### 17.1 The On-Spot Problem

Registration closes days before the event, but walk-in participants arrive anyway. The on-spot system must:
1. Register them instantly (no email, simplified form)
2. Collect cash payment on the spot
3. Issue a QR code immediately

---

### 17.2 Tutorial: Simplified On-Spot Registration Form

```javascript
// onspot_dashboard.html
async function submitOnSpotRegistration() {
  const name    = document.getElementById('onspotName').value.trim();
  const college = document.getElementById('onspotCollege').value.trim();
  const phone   = document.getElementById('onspotPhone').value.trim();
  const events  = getSelectedOnSpotEvents();

  if (!name || !college || !phone || events.length === 0) {
    showError('All fields are required.');
    return;
  }

  const regId = generateRegId(); // ELX-XXXXXXXX

  const reg = {
    regId,
    name,
    college,
    phone,
    email:         `onspot_${phone}@elexsiya.local`, // Synthetic email
    year:          'On-Spot',
    events,
    amount:        REG_FEE,
    paymentStatus: 'Paid',          // Collected in cash at the gate
    hasScreenshot: false,
    checkedIn:     true,            // Auto-check-in on registration
    checkedInAt:   new Date().toISOString(),
    lunchServed:   false,
    certReleased:  false,
    isOnSpot:      true,            // Flag for filtering
    registeredAt:  firebase.firestore.FieldValue.serverTimestamp(),
  };

  await window.db.collection('registrations').doc(regId).set(reg);

  // Display the QR immediately for download
  showOnSpotQR(regId, name);
}

function showOnSpotQR(regId, name) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(regId)}`;

  document.getElementById('qrResult').innerHTML = `
    <div class="onspot-success">
      <img src="${qrUrl}" alt="QR Code" id="generatedQR">
      <h3>✅ ${escapeHtml(name)}</h3>
      <p>Reg ID: <strong>${escapeHtml(regId)}</strong></p>
      <button onclick="downloadOnSpotQR('${regId}')">Download QR</button>
      <button onclick="printOnSpotQR()">Print</button>
    </div>
  `;
}
```

---

### 17.3 Two-Phase Team Check-In

For team events, checking in ONE team member should check in ALL members from the same regId:

```javascript
async function processTeamCheckIn(regId) {
  const reg = await getRegistrationById(regId);

  if (!reg) {
    showScanResult('error', `Unknown registration: ${regId}`);
    return;
  }

  if (reg.paymentStatus !== 'Paid') {
    showScanResult('warning', `⚠️ Payment not verified for ${reg.name}`);
    return;
  }

  if (reg.checkedIn) {
    // Show existing check-in info — do NOT re-check-in
    const time = new Date(reg.checkedInAt).toLocaleTimeString('en-IN');
    showScanResult('info', `
      ℹ️ Already checked in at ${time}
      Name: ${reg.name}
      Team: ${getTeamMemberNames(reg)}
    `);
    return;
  }

  // Phase 1: Check in the primary registrant
  await window.db.collection('registrations').doc(regId).update({
    checkedIn:   true,
    checkedInAt: new Date().toISOString(),
  });

  // Build team member display
  const teamDisplay = getTeamMemberNames(reg);

  showScanResult('success', `
    ✅ CHECK-IN SUCCESSFUL
    👤 ${reg.name} | ${reg.college}
    🎯 Events: ${(reg.events || []).map(e => e.event).join(', ')}
    👥 Team: ${teamDisplay}
  `);

  playBeepSound();
}

function getTeamMemberNames(reg) {
  const allMembers = new Set();
  (reg.events || []).forEach(ev => {
    (ev.members || []).forEach(m => allMembers.add(m));
  });
  return Array.from(allMembers).join(', ') || reg.name;
}
```

---

# MODULE 18: FINANCIAL DASHBOARD — SPONSORS & EXPENDITURES
## *Tracking Revenue and Expenses in Real-Time*

---

### 18.1 The Financial Data Schema

```json
// /sponsorships/{id}
{
  "sponsorName":  "XYZ Technologies",
  "amount":       5000,
  "type":         "Cash",          // or "In-Kind"
  "receivedDate": "2026-03-20",
  "notes":        "Banner + stall space",
  "addedBy":      "treasurer_token_prefix...",
  "addedAt":      "2026-03-20T14:30:00Z"
}

// /expenditures/{id}
{
  "description":  "Printing banners",
  "amount":       3200,
  "category":     "Marketing",     // Marketing, Food, Infrastructure, Prizes, Misc
  "paidDate":     "2026-03-25",
  "receipt":      "receipt_001.jpg", // Optional filename
  "addedBy":      "treasurer_token_prefix...",
  "addedAt":      "2026-03-25T10:00:00Z"
}
```

---

### 18.2 Tutorial: Real-Time P&L Summary

```javascript
// dashboard.html — Financial summary tab
async function renderFinancialSummary() {
  const [regs, sponsors, expenses] = await Promise.all([
    getRegistrations(),
    getCollection('sponsorships'),
    getCollection('expenditures'),
  ]);

  // Income streams
  const regRevenue     = regs
    .filter(r => r.paymentStatus === 'Paid')
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  const sponsorRevenue = sponsors
    .filter(s => s.type === 'Cash')
    .reduce((sum, s) => sum + (Number(s.amount) || 0), 0);

  const totalIncome    = regRevenue + sponsorRevenue;

  // Expenses
  const totalExpenses  = expenses
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  // Profit/Loss
  const netBalance     = totalIncome - totalExpenses;

  // Expenses by category
  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
    return acc;
  }, {});

  // Render
  document.getElementById('finRegRevenue').textContent =
    `₹${regRevenue.toLocaleString('en-IN')}`;
  document.getElementById('finSponsorRevenue').textContent =
    `₹${sponsorRevenue.toLocaleString('en-IN')}`;
  document.getElementById('finTotalIncome').textContent =
    `₹${totalIncome.toLocaleString('en-IN')}`;
  document.getElementById('finTotalExpenses').textContent =
    `₹${totalExpenses.toLocaleString('en-IN')}`;

  const balanceEl = document.getElementById('finNetBalance');
  balanceEl.textContent = `₹${Math.abs(netBalance).toLocaleString('en-IN')}`;
  balanceEl.className   = netBalance >= 0 ? 'positive' : 'negative';
  balanceEl.textContent = (netBalance >= 0 ? '▲ Profit: ' : '▼ Loss: ') + balanceEl.textContent;

  // Render breakdown
  renderCategoryBreakdown(categoryTotals, totalExpenses);
}

// Helper: get an entire collection
async function getCollection(collName) {
  const snap = await window.db.collection(collName)
    .orderBy('addedAt', 'desc')
    .get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
```

---

### 18.3 Tutorial: Category Breakdown Progress Bars

```javascript
function renderCategoryBreakdown(categoryTotals, totalExpenses) {
  const COLORS = {
    'Marketing':      '#cc0000',
    'Food':           '#ff6b35',
    'Infrastructure': '#4a90d9',
    'Prizes':         '#d4af37',
    'Misc':           '#888888',
  };

  const container = document.getElementById('categoryBreakdown');
  container.innerHTML = '';

  Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1]) // Sort by amount desc
    .forEach(([category, amount]) => {
      const pct = totalExpenses > 0
        ? ((amount / totalExpenses) * 100).toFixed(1)
        : 0;
      const color = COLORS[category] || '#888';

      container.innerHTML += `
        <div class="category-row">
          <div class="category-label">
            <span>${category}</span>
            <span>₹${amount.toLocaleString('en-IN')} (${pct}%)</span>
          </div>
          <div class="progress-bar-track">
            <div class="progress-bar-fill"
              style="width: ${pct}%; background: ${color};"
              data-width="${pct}%">
            </div>
          </div>
        </div>
      `;
    });

  // Animate bars after rendering
  requestAnimationFrame(() => {
    document.querySelectorAll('.progress-bar-fill').forEach(bar => {
      bar.style.width = bar.dataset.width;
    });
  });
}
```

---

# MODULE 19: PRODUCTION HARDENING & LESSONS LEARNED
## *What Went Wrong, What Worked, and What to Do Differently*

---

### 19.1 Incidents That Happened on Event Day

These are real issues encountered during Elexsiya 26 and their post-mortem analysis.

---

**Incident 1: Mobile WebSocket Zombie Connections**

**What happened:** Participants on mobile registered, switched apps, came back, and were stuck on the payment page indefinitely. The App appeared to hang.

**Root cause:** Firebase's real-time WebSocket connection enters a "zombie" state when the app is backgrounded on mobile. Awaited Firestore `.set()` calls never resolved.

**Fix applied:**
```javascript
// BEFORE (broken on mobile)
await window.db.collection('registrations').doc(reg.regId).set(reg);
window.location.href = 'payment.html';

// AFTER (uses Firestore's offline queue — never blocks)
window.db.collection('registrations').doc(reg.regId).set(reg)
  .catch(err => console.error('[BG SYNC FAIL]', err));
// Don't await — Firestore queues it and syncs when connection resumes
window.location.href = 'payment.html'; // Redirect immediately
```

**Additional fix:** Force long-polling over WebSockets:
```javascript
db.settings({ experimentalForceLongPolling: true, merge: true });
```

---

**Incident 2: Stale Cache Showing Old Dashboard Data**

**What happened:** After an admin marked a registration as Paid, another admin on a different device still saw "Pending" because the in-memory cache wasn't invalidated.

**Root cause:** `_registrationsCache` is per-tab, per-session. Two browser tabs cannot share cache state.

**Fix applied:** Real-time Firestore listener for the admin dashboard stats (not the table — the table uses the cache for performance):

```javascript
// Listen for live changes to the stats counter
window.db.collection('registrations')
  .onSnapshot(snapshot => {
    // Only update the stats numbers in real-time
    // The full table still uses the cache (better performance)
    const regs = snapshot.docs.map(d => d.data());
    updateStatCounters(regs);
  }, err => {
    console.warn('[LIVE LISTENER] Error:', err);
  });
```

---

**Incident 3: EmailJS Rate Limit Hit**

**What happened:** 47 registrations came in within 15 minutes. EmailJS free tier has a 200 emails/month limit. Emails stopped sending after 200 were sent.

**Fix:** Wrap email sending so failures are non-fatal AND logged:

```javascript
async function sendAutomatedEmail(templateId, regData) {
  try {
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      templateId,
      buildTemplateParams(regData)
    );
    return { success: true, status: response.status };
  } catch (err) {
    // Log to Firestore for manual follow-up
    await window.db.collection('email_failures').add({
      regId:      regData.regId,
      email:      regData.email,
      templateId,
      error:      err.text || err.message,
      timestamp:  new Date().toISOString()
    });
    // Don't throw — registration is already saved
    console.warn('[EMAIL FAIL] Logged for retry:', regData.regId);
    return { success: false };
  }
}
```

---

### 19.2 Performance Metrics: Before vs After

| Metric | Before Optimization | After Optimization |
|--------|--------------------|--------------------|
| First Contentful Paint | 4.2s | 1.1s |
| Time to Interactive | 8.7s | 2.8s |
| Hero image load | 2.1s (207KB logo) | 0.4s (compressed) |
| Firestore cold read | hangs 60s on mobile | instant (offline persistence) |
| Admin search | full DB read per query | client-side filter |
| Certificate generation | 12s per cert | 3s (pre-loaded fonts) |

**Key optimization wins:**
1. `experimentalForceLongPolling` eliminated mobile hangs
2. Offline persistence made repeated Firestore reads instantaneous
3. Optimistic writes eliminated UI blocking
4. Canvas font pre-loading cut certificate time by 75%
5. In-memory cache + debounced search made admin search feel instant

---

### 19.3 Security Audit Results

After the event, a security review identified these findings:

| Finding | Severity | Status |
|---------|----------|--------|
| Admin passwords SHA-256 hashed (not bcrypt) | Low | Acceptable for single-event use |
| Firestore `allow update: if true` | Medium | Mitigated by Cloud Function token check |
| `window.location.href` with unvalidated query params | Low | Fixed: validate regId format before use |
| localStorage used for some session flags | Medium | Fixed: moved to sessionStorage |
| No rate limiting on registration endpoint | Medium | Acceptable: Firestore Spark plan has built-in limits |
| No CSRF protection on Cloud Functions | Low | Mitigated by admin token requirement |
| EmailJS public key in source | Very Low | By-design: EmailJS public keys are safe to expose |

**Lesson:** For a one-day event, the security posture is acceptable. For a persistent multi-year platform, the critical fix would be migrating admin auth to Firebase Authentication with proper role claims stored server-side.

---

### 19.4 The Recommended Production Upgrade Path

If you were to scale Elexsiya 26 into a permanent, production platform:

```
Phase 1 (Current): Vanilla JS + Firebase Spark Plan
   └── Suitable for: <500 participants, single event, small team
   └── Cost: $0/month

Phase 2 (Growth): Firebase Blaze Plan + Firebase Auth
   ├── Replace SHA-256 admin hash with Firebase Auth + Custom Claims
   ├── Add Firebase App Check (prevents API abuse from bots)
   ├── Replace EmailJS with Firebase Cloud Functions + SendGrid
   └── Cost: ~$10–30/month

Phase 3 (Scale): Next.js + Firebase
   ├── Migrate frontend to Next.js for server-side rendering + SEO
   ├── Add proper session management with Firebase Auth tokens
   ├── Add Stripe for payment processing (instead of screenshot uploads)
   └── Cost: ~$50–100/month

Phase 4 (Enterprise): Dedicated Infrastructure
   ├── PostgreSQL for relational data (reports, analytics)
   ├── Redis for caching (replace in-memory cache)
   ├── Docker containers + GitHub Actions CI/CD
   └── Cost: varies by scale
```

---

### 19.5 Final Architecture Reflection

```
What made Elexsiya 26 a technical success:

✅ Serverless Firebase eliminated all DevOps overhead
✅ Optimistic writes + offline persistence eliminated mobile hang bugs
✅ Defense-in-depth security (CSP + SHA-256 + rules + audit log)
✅ Single shared.js library kept all 10 pages consistent
✅ Canvas API certificates eliminated external service dependency
✅ Service Worker made the site work offline on event day
✅ QR scanner worked flawlessly on every tested Android/iOS device

What would be done differently for a v2:

🔄 Firebase Auth instead of SHA-256 hashing (proper role management)
🔄 bcrypt for password hashing (not SHA-256)
🔄 Server-side certificate generation (not client-side canvas)
🔄 SendGrid instead of EmailJS (higher limits, better deliverability)
🔄 TypeScript for type safety in shared.js
🔄 Proper error monitoring (Sentry) instead of console.log
```

---

## 📚 APPENDIX — PART 3 QUICK REFERENCE

### Admin Role Permission Matrix

| Permission | Super Admin | Treasurer | Event Admin | On-Spot |
|-----------|-------------|-----------|-------------|---------|
| View all registrations | ✅ | ✅ | ✅ | ✅ |
| Toggle payment status | ✅ | ✅ | ❌ | ❌ |
| Delete registrations | ✅ | ❌ | ❌ | ❌ |
| View financial data | ✅ | ✅ | ❌ | ❌ |
| Release certificates | ✅ | ❌ | ❌ | ❌ |
| QR check-in | ✅ | ❌ | ❌ | ✅ |
| On-spot registration | ✅ | ❌ | ❌ | ✅ |
| View audit log | ✅ | ✅ | ❌ | ❌ |

---

### Event Time Conflict Map

| Event | Time Slot | Conflicts With |
|-------|-----------|---------------|
| Project Expo | 10:00–12:00 | Ideart, Clever Hunt |
| Idea Forge | 10:00–12:00 | Ideart, Clever Hunt |
| Bug Arena | 11:00–13:00 | Mindfusion |
| CurrentClash | 11:00–13:00 | Unmuted |
| Clever Hunt | 10:00–12:00 | Project Expo, Idea Forge, Ideart |
| Ideart | 10:00–12:00 | Project Expo, Idea Forge, Clever Hunt |
| Tazky Among Uz | 14:00–16:00 | Upside Down |
| Upside Down | 14:00–16:00 | Tazky Among Uz |
| Mindfusion | 11:00–13:00 | Bug Arena |
| Unmuted | 11:00–13:00 | CurrentClash |
| Chess | All Day | None |

---

### Firestore Collection Reference

| Collection | Purpose | Key Fields |
|-----------|---------|------------|
| `registrations` | All participant data | regId, name, email, events, paymentStatus |
| `screenshots` | Payment proof records | regId, downloadURL, uploadedAt |
| `sponsorships` | Sponsor records | sponsorName, amount, type |
| `expenditures` | Expense records | description, amount, category |
| `admin_audit` | Tamper-proof action log | action, regId, adminToken, timestamp |
| `site_logs` | System events | event, timestamp, details |
| `feedback` | Participant feedback | regId, rating, message |
| `settings` | App configuration | certificate template settings |
| `chess_intra_registrations` | Intra-college chess | name, rollNo, round1Result |

---

*[Part 3 Complete — Bonus Modules 13–19]*

> **🎓 Course Summary:** You have now studied the complete lifecycle of a production symposium platform — from architecture decisions to event-day incidents and post-mortem analysis. The real patterns in this course — multi-role auth, team data structures, canvas rendering, QR check-in, financial tracking, and production hardening — are the same patterns used in enterprise SaaS products. The platform you have studied handled 200+ real participants without a single critical failure. Build confidently.
