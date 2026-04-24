/**
 * Node.js PDF Generator — uses Chrome or Edge headless
 * No npm packages required — uses built-in child_process + fs
 */
const { execFileSync, spawnSync } = require('child_process');
const fs   = require('fs');
const path = require('path');
const os   = require('os');

const BASE    = __dirname;
const HTML    = path.join(BASE, 'course_final.html');
const PDF_OUT = path.join(BASE, 'course_ELEXSIYA26.pdf');
const FILE_URI = 'file:///' + HTML.replace(/\\/g, '/');

console.log('\n══════════════════════════════════════════════');
console.log('  Elexsiya 26 — PDF Generator');
console.log('══════════════════════════════════════════════\n');

// ── 1. Find a browser ──────────────────────────────────────────────────────
const BROWSER_CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
  process.env.USERPROFILE  + '\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
];

let browser = null;
for (const p of BROWSER_CANDIDATES) {
  try {
    if (p && fs.existsSync(p)) { browser = p; break; }
  } catch(_) {}
}

if (!browser) {
  console.error('❌  Cannot find Chrome or Edge. Please print manually:');
  console.error('    1. Open course_final.html in your browser');
  console.error('    2. Press Ctrl+P → Save as PDF → A4 → Background graphics ON');
  console.error('    3. Save as course_ELEXSIYA26.pdf\n');
  process.exit(1);
}

const name = browser.includes('chrome') ? 'Google Chrome' : 'Microsoft Edge';
console.log('  Browser :', name);
console.log('  Input   :', HTML);
console.log('  Output  :', PDF_OUT);
console.log('\n  Generating PDF (may take 15-20 seconds)...\n');

// ── 2. Create temp user-data dir ─────────────────────────────────────────────
const tmpDir = path.join(os.tmpdir(), 'elx_pdf_' + Date.now());
fs.mkdirSync(tmpDir, { recursive: true });

// ── 3. Run headless Chrome/Edge ───────────────────────────────────────────────
const args = [
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  '--disable-dev-shm-usage',
  '--run-all-compositor-stages-before-draw',
  '--virtual-time-budget=8000',
  '--print-to-pdf-no-header',
  `--user-data-dir=${tmpDir}`,
  `--print-to-pdf=${PDF_OUT}`,
  FILE_URI,
];

try {
  const result = spawnSync(browser, args, {
    timeout: 45000,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  // Give it a moment to flush the file
  const waited = waitForFile(PDF_OUT, 8000);

  if (waited && fs.existsSync(PDF_OUT)) {
    const sizeKB = (fs.statSync(PDF_OUT).size / 1024).toFixed(0);
    console.log(`  ✅  PDF created successfully!`);
    console.log(`  📄  File : ${PDF_OUT}`);
    console.log(`  📦  Size : ${sizeKB} KB\n`);

    // Open the PDF automatically  
    try {
      spawnSync('cmd', ['/c', 'start', '', PDF_OUT], { detached: true });
    } catch(_) {}

  } else {
    // Chrome sometimes writes to cwd instead
    const fallback = path.join(process.cwd(), 'course_final.pdf');
    if (fs.existsSync(fallback)) {
      fs.renameSync(fallback, PDF_OUT);
      console.log(`  ✅  PDF found and moved to: ${PDF_OUT}`);
      spawnSync('cmd', ['/c', 'start', '', PDF_OUT], { detached: true });
    } else {
      console.log('  ⚠️   PDF not detected at expected path.');
      console.log('       Exit code:', result.status);
      if (result.stderr) {
        const errMsg = result.stderr.toString().substring(0, 400);
        if (errMsg.trim()) console.log('       Error:', errMsg);
      }
      console.log('\n  MANUAL STEPS:');
      console.log('  1. Open this file in your browser:');
      console.log('     ' + HTML);
      console.log('  2. Press Ctrl+P');
      console.log('  3. Destination → Save as PDF');
      console.log('  4. Paper: A4 | Margins: None | Background graphics: ON');
      console.log('  5. Save as: course_ELEXSIYA26.pdf\n');
    }
  }
} catch (err) {
  console.error('  ❌  Error:', err.message);
} finally {
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch(_) {}
}

// ── Helper: wait up to `ms` for a file to appear ──────────────────────────────
function waitForFile(filePath, ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (fs.existsSync(filePath) && fs.statSync(filePath).size > 1000) return true;
    // Busy-wait in 500ms chunks
    const until = Date.now() + 500;
    while (Date.now() < until) { /* spin */ }
  }
  return false;
}
