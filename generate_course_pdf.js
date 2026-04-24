/**
 * Elexsiya 26 Course PDF Generator
 * Merges all 3 course parts into a stunning, print-ready HTML → PDF
 * Run: node generate_course_pdf.js
 */

const fs   = require('fs');
const path = require('path');

const BASE = __dirname;

// ─── 1. Read the three source files ───────────────────────────────────────────
const part1 = fs.readFileSync(path.join(BASE, 'course_part1.md'), 'utf8');
const part2 = fs.readFileSync(path.join(BASE, 'course_part2.md'), 'utf8');
const part3 = fs.readFileSync(path.join(BASE, 'course_part3.md'), 'utf8');

// ─── 2. Strip part-headers from part2/3 so merged doc has a clean flow ────────
function stripPartHeader(md) {
  // Remove first 3–5 lines that are repetitive title/subtitle
  return md.replace(/^#[^\n]*\n(##[^\n]*\n)?(###[^\n]*\n)?(\*[^\n]*\*\n)?(\n)?---\n?/, '');
}

// ─── 3. Minimal Markdown → HTML converter (handles the subset we use) ─────────
function mdToHtml(md) {
  let html = md;

  // ── Escape HTML entities first (but preserve code blocks) ──
  const codeBlocks = [];
  html = html.replace(/```([\w-]*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const idx = codeBlocks.length;
    const escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const langClass = lang ? ` class="language-${lang}"` : '';
    codeBlocks.push(`<pre><code${langClass}>${escaped}</code></pre>`);
    return `%%CODE_BLOCK_${idx}%%`;
  });

  // Inline code
  const inlineCodes = [];
  html = html.replace(/`([^`]+)`/g, (_, code) => {
    const idx = inlineCodes.length;
    const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    inlineCodes.push(`<code>${escaped}</code>`);
    return `%%INLINE_${idx}%%`;
  });

  // ── Horizontal rules ──
  html = html.replace(/^---$/gm, '<hr>');

  // ── Headings (must be processed h1→h6 in order) ──
  html = html.replace(/^######\s(.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^#####\s(.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^####\s(.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^###\s(.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^##\s(.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^#\s(.+)$/gm, '<h1>$1</h1>');

  // ── Block quotes ──
  html = html.replace(/^>\s(.+)$/gm, '<blockquote>$1</blockquote>');

  // ── Tables ──
  html = html.replace(/(\|.+\|\n)+/g, (tableBlock) => {
    const rows = tableBlock.trim().split('\n');
    const headerRow = rows[0];
    const bodyRows  = rows.slice(2); // skip separator row
    const cells = (row) => row.split('|').filter((c, i, a) => i > 0 && i < a.length - 1);

    const thead = `<thead><tr>${cells(headerRow).map(c => `<th>${c.trim()}</th>`).join('')}</tr></thead>`;
    const tbody = `<tbody>${bodyRows.map(r => `<tr>${cells(r).map(c => `<td>${c.trim()}</td>`).join('')}</tr>`).join('')}</tbody>`;
    return `<table>${thead}${tbody}</table>`;
  });

  // ── Unordered lists ──
  html = html.replace(/(^[-*]\s.+\n?)+/gm, (block) => {
    const items = block.trim().split('\n')
      .map(l => `<li>${l.replace(/^[-*]\s/, '').trim()}</li>`).join('');
    return `<ul>${items}</ul>`;
  });

  // ── Ordered lists ──
  html = html.replace(/(^\d+\.\s.+\n?)+/gm, (block) => {
    const items = block.trim().split('\n')
      .map(l => `<li>${l.replace(/^\d+\.\s/, '').trim()}</li>`).join('');
    return `<ol>${items}</ol>`;
  });

  // ── Checkboxes ──
  html = html.replace(/- \[ \] /g, '<li class="checklist unchecked">☐ ');
  html = html.replace(/- \[x\] /gi, '<li class="checklist checked">☑ ');

  // ── Bold & Italic ──
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // ── Links ──
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // ── Paragraphs: wrap lone text lines ──
  const lines = html.split('\n');
  const result = [];
  let inPara = false;

  for (const line of lines) {
    const trimmed = line.trim();
    const isBlock = /^<(h[1-6]|ul|ol|li|table|thead|tbody|tr|th|td|blockquote|hr|pre|%%CODE)/.test(trimmed)
                 || trimmed === '<hr>'
                 || trimmed.startsWith('%%CODE_BLOCK_')
                 || trimmed === '';

    if (isBlock) {
      if (inPara) { result.push('</p>'); inPara = false; }
      result.push(line);
    } else {
      if (!inPara) { result.push('<p>'); inPara = true; }
      result.push(line);
    }
  }
  if (inPara) result.push('</p>');
  html = result.join('\n');

  // ── Restore code blocks and inline codes ──
  codeBlocks.forEach((block, i) => {
    html = html.replace(`%%CODE_BLOCK_${i}%%`, block);
  });
  inlineCodes.forEach((code, i) => {
    html = html.replace(`%%INLINE_${i}%%`, code);
  });

  return html;
}

// ─── 4. Build the merged markdown ─────────────────────────────────────────────
const SEPARATOR = '\n\n---\n\n';
const mergedMd = [
  part1,
  stripPartHeader(part2),
  stripPartHeader(part3),
].join(SEPARATOR);

// ─── 5. Build the full HTML document ──────────────────────────────────────────
const contentHtml = mdToHtml(mergedMd);

const HTML = /* html */`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Elexsiya 26 — World-Class Web Development Course</title>
<style>
/* ═══════════════════════════════════════════════════
   DESIGN SYSTEM
════════════════════════════════════════════════════ */
:root {
  --red:       #cc0000;
  --red-dark:  #990000;
  --gold:      #c9a227;
  --gold-lt:   #f0d080;
  --ink:       #1a1a2e;
  --ink-soft:  #2e2e4a;
  --gray:      #4a4a6a;
  --gray-lt:   #8888aa;
  --bg:        #ffffff;
  --bg-alt:    #f7f8fc;
  --bg-code:   #0f1117;
  --border:    #e0e0ee;
  --shadow:    0 2px 12px rgba(0,0,0,0.08);
  --font-head: 'Georgia', 'Times New Roman', serif;
  --font-body: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  --font-mono: 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
  --radius:    8px;
}

/* ═══════════════════════════════════════════════════
   RESET & BASE
════════════════════════════════════════════════════ */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { font-size: 11pt; }

body {
  font-family: var(--font-body);
  color: var(--ink);
  background: var(--bg);
  line-height: 1.75;
  -webkit-font-smoothing: antialiased;
}

/* ═══════════════════════════════════════════════════
   COVER PAGE
════════════════════════════════════════════════════ */
.cover {
  page-break-after: always;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  background: linear-gradient(135deg, #0f1117 0%, #1a1a2e 50%, #2a0000 100%);
  color: white;
  padding: 80px 60px;
  position: relative;
  overflow: hidden;
}
.cover::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 20% 30%, rgba(204,0,0,0.18) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 70%, rgba(201,162,39,0.12) 0%, transparent 55%);
}
.cover-badge {
  position: relative;
  display: inline-block;
  background: rgba(204,0,0,0.2);
  border: 1px solid rgba(204,0,0,0.5);
  color: #ff8080;
  font-size: 10pt;
  font-weight: 700;
  letter-spacing: 3px;
  text-transform: uppercase;
  padding: 8px 24px;
  border-radius: 50px;
  margin-bottom: 40px;
}
.cover-title {
  position: relative;
  font-family: var(--font-head);
  font-size: 52pt;
  font-weight: 900;
  line-height: 1.05;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #ffffff 30%, var(--gold-lt) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.cover-subtitle {
  position: relative;
  font-size: 16pt;
  color: rgba(255,255,255,0.75);
  font-style: italic;
  margin-bottom: 60px;
  max-width: 600px;
}
.cover-divider {
  position: relative;
  width: 80px;
  height: 3px;
  background: linear-gradient(90deg, var(--red), var(--gold));
  margin: 0 auto 60px;
  border-radius: 2px;
}
.cover-meta {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
  max-width: 700px;
  margin-bottom: 60px;
}
.cover-stat {
  text-align: center;
}
.cover-stat-num {
  display: block;
  font-size: 28pt;
  font-weight: 900;
  color: var(--gold-lt);
  font-family: var(--font-head);
  line-height: 1;
}
.cover-stat-label {
  display: block;
  font-size: 9pt;
  color: rgba(255,255,255,0.5);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-top: 6px;
}
.cover-footer {
  position: relative;
  margin-top: auto;
  font-size: 9pt;
  color: rgba(255,255,255,0.35);
  letter-spacing: 1px;
}

/* ═══════════════════════════════════════════════════
   TABLE OF CONTENTS PAGE
════════════════════════════════════════════════════ */
.toc-page {
  page-break-after: always;
  padding: 60px 70px;
}
.toc-heading {
  font-family: var(--font-head);
  font-size: 28pt;
  color: var(--ink);
  border-bottom: 3px solid var(--red);
  padding-bottom: 12px;
  margin-bottom: 40px;
}
.toc-section-label {
  font-size: 8pt;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--red);
  margin: 32px 0 12px;
}
.toc-item {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px dotted var(--border);
}
.toc-num {
  font-weight: 700;
  color: var(--red);
  font-size: 10pt;
  min-width: 30px;
}
.toc-title { flex: 1; font-size: 10.5pt; }
.toc-tag {
  font-size: 8pt;
  padding: 2px 8px;
  border-radius: 50px;
  font-weight: 600;
}
.toc-tag.arch  { background: #fff0f0; color: var(--red); border: 1px solid #ffd0d0; }
.toc-tag.tut   { background: #f0f7ff; color: #0066cc; border: 1px solid #c0d8ff; }
.toc-tag.mixed { background: #fff8e0; color: #996600; border: 1px solid #ffe0a0; }

/* ═══════════════════════════════════════════════════
   CONTENT AREA
════════════════════════════════════════════════════ */
.content {
  max-width: 180mm;
  margin: 0 auto;
  padding: 0 0 40px;
}

/* ═══════════════════════════════════════════════════
   HEADINGS
════════════════════════════════════════════════════ */
h1 {
  font-family: var(--font-head);
  font-size: 26pt;
  color: var(--ink);
  line-height: 1.15;
  margin: 60px 0 8px;
  padding: 24px 28px;
  background: linear-gradient(135deg, #fff0f0, #fff8f8);
  border-left: 6px solid var(--red);
  border-radius: 0 var(--radius) var(--radius) 0;
  page-break-before: always;
  page-break-after: avoid;
}
h1:first-of-type { page-break-before: avoid; }

h2 {
  font-family: var(--font-head);
  font-size: 18pt;
  color: var(--red-dark);
  margin: 44px 0 6px;
  padding-bottom: 10px;
  border-bottom: 2px solid #ffd0d0;
  page-break-after: avoid;
}

h3 {
  font-size: 14pt;
  font-weight: 700;
  color: var(--ink);
  margin: 36px 0 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  page-break-after: avoid;
}
h3::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 18px;
  background: linear-gradient(180deg, var(--red), var(--gold));
  border-radius: 2px;
  flex-shrink: 0;
}

h4 {
  font-size: 11.5pt;
  font-weight: 700;
  color: var(--gray);
  margin: 24px 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  page-break-after: avoid;
}

/* ═══════════════════════════════════════════════════
   BODY TEXT
════════════════════════════════════════════════════ */
p {
  font-size: 10.5pt;
  line-height: 1.8;
  margin-bottom: 14px;
  color: var(--ink);
}

strong { color: var(--ink); font-weight: 700; }
em     { color: var(--gray); }

/* ═══════════════════════════════════════════════════
   CODE BLOCKS
════════════════════════════════════════════════════ */
pre {
  background: var(--bg-code);
  border-radius: var(--radius);
  padding: 20px 22px;
  margin: 18px 0 22px;
  overflow-x: auto;
  page-break-inside: avoid;
  border: 1px solid #2a2a3e;
  box-shadow: 0 4px 20px rgba(0,0,0,0.25);
  position: relative;
}
pre::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--red), var(--gold), #4a90e2);
  border-radius: var(--radius) var(--radius) 0 0;
}
code {
  font-family: var(--font-mono);
  font-size: 9pt;
  line-height: 1.65;
  color: #e8eaf6;
}
p code, li code, td code, th code {
  background: #f0f0f8;
  color: var(--red-dark);
  border: 1px solid #e0e0ee;
  border-radius: 4px;
  padding: 1px 6px;
  font-size: 9pt;
}

/* ═══════════════════════════════════════════════════
   SYNTAX HIGHLIGHTING (keyword patterns)
════════════════════════════════════════════════════ */
.language-javascript .kw,
.language-js .kw { color: #c792ea; }
.language-css .kw { color: #80cbc4; }

/* ═══════════════════════════════════════════════════
   TABLES
════════════════════════════════════════════════════ */
table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0 24px;
  font-size: 9.5pt;
  page-break-inside: avoid;
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow);
}
thead { background: linear-gradient(135deg, var(--red), var(--red-dark)); }
th {
  color: white;
  font-weight: 700;
  padding: 10px 14px;
  text-align: left;
  font-size: 9pt;
  letter-spacing: 0.3px;
}
td {
  padding: 9px 14px;
  border-bottom: 1px solid var(--border);
  vertical-align: top;
  color: var(--ink-soft);
}
tr:nth-child(even) td { background: var(--bg-alt); }
tr:last-child td { border-bottom: none; }

/* ═══════════════════════════════════════════════════
   LISTS
════════════════════════════════════════════════════ */
ul, ol {
  margin: 12px 0 16px 22px;
  padding: 0;
}
li {
  font-size: 10.5pt;
  line-height: 1.75;
  margin-bottom: 5px;
  color: var(--ink);
}
ul li::marker { color: var(--red); }
ol li::marker { color: var(--red); font-weight: 700; }

li.checklist {
  list-style: none;
  margin-left: -22px;
  padding-left: 4px;
}
li.checklist.unchecked { color: var(--gray); }
li.checklist.checked   { color: #009944; }

/* ═══════════════════════════════════════════════════
   BLOCKQUOTES
════════════════════════════════════════════════════ */
blockquote {
  background: linear-gradient(135deg, #fff8e0, #fffbf0);
  border-left: 5px solid var(--gold);
  border-radius: 0 var(--radius) var(--radius) 0;
  padding: 16px 20px;
  margin: 20px 0;
  font-style: italic;
  color: var(--ink-soft);
  font-size: 10pt;
  page-break-inside: avoid;
}
blockquote strong { color: var(--ink); }

/* ═══════════════════════════════════════════════════
   HORIZONTAL RULES
════════════════════════════════════════════════════ */
hr {
  border: none;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border), transparent);
  margin: 36px 0;
}

/* ═══════════════════════════════════════════════════
   PRINT STYLES
════════════════════════════════════════════════════ */
@page {
  size: A4;
  margin: 18mm 20mm 20mm 22mm;
}
@page :first  { margin: 0; }
@page :left   { margin-left: 22mm; margin-right: 18mm; }
@page :right  { margin-left: 18mm; margin-right: 22mm; }

@media print {
  body { font-size: 10pt; }
  .cover { min-height: 297mm; }
  h1 { page-break-before: always; font-size: 22pt; }
  h1:first-of-type { page-break-before: avoid; }
  pre  { page-break-inside: avoid; }
  table { page-break-inside: avoid; }
  blockquote { page-break-inside: avoid; }
}

/* ═══════════════════════════════════════════════════
   UTILITY CLASSES
════════════════════════════════════════════════════ */
.part-divider {
  page-break-before: always;
  text-align: center;
  padding: 80px 40px;
  background: linear-gradient(135deg, #0f1117, #1a1a2e);
  color: white;
  margin: 0;
}
.part-divider h2 {
  font-family: var(--font-head);
  font-size: 32pt;
  color: white;
  border: none;
  margin: 0 0 12px;
  padding: 0;
}
.part-divider p { color: rgba(255,255,255,0.6); font-size: 12pt; margin: 0; }
.part-divider .part-num {
  font-size: 11pt;
  font-weight: 700;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--gold-lt);
  margin-bottom: 16px;
  display: block;
}
</style>
</head>
<body>

<!-- ══════════════════════════════════════════════════════
     COVER PAGE
══════════════════════════════════════════════════════ -->
<div class="cover">
  <div class="cover-badge">National Level Technical Symposium Platform</div>
  <div class="cover-title">Elexsiya 26</div>
  <div class="cover-subtitle">World-Class Web Development Course<br>From Zero to Production: Building a Full-Stack Symposium Platform</div>
  <div class="cover-divider"></div>
  <div class="cover-meta">
    <div class="cover-stat">
      <span class="cover-stat-num">19</span>
      <span class="cover-stat-label">Modules</span>
    </div>
    <div class="cover-stat">
      <span class="cover-stat-num">200+</span>
      <span class="cover-stat-label">Real Participants</span>
    </div>
    <div class="cover-stat">
      <span class="cover-stat-num">100%</span>
      <span class="cover-stat-label">Production Code</span>
    </div>
  </div>
  <div class="cover-footer">
    Anna University Regional Campus, Madurai &nbsp;·&nbsp; March 27, 2026<br>
    Department of Electronics &amp; Communication Engineering
  </div>
</div>

<!-- ══════════════════════════════════════════════════════
     TABLE OF CONTENTS
══════════════════════════════════════════════════════ -->
<div class="toc-page">
  <div class="toc-heading">Table of Contents</div>

  <div class="toc-section-label">Part 1 — Foundations (Modules 1–6)</div>
  ${[
    ['1', 'Project Architecture & System Design', 'arch'],
    ['2', 'Modern HTML: Semantic Structure & SEO', 'tut'],
    ['3', 'World-Class CSS: Design Systems & Animation', 'tut'],
    ['4', 'JavaScript Architecture: Async, Modules & Patterns', 'arch'],
    ['5', 'Firebase Backend: Database, Storage & Functions', 'tut'],
    ['6', 'Cybersecurity: Hashing, Rules & Attack Prevention', 'mixed'],
  ].map(([n,t,tag]) => `<div class="toc-item"><span class="toc-num">${n}</span><span class="toc-title">${t}</span><span class="toc-tag ${tag}">${tag === 'arch' ? 'Architecture' : tag === 'tut' ? 'Tutorial' : 'Arch + Tutorial'}</span></div>`).join('')}

  <div class="toc-section-label">Part 2 — Full-Stack Features (Modules 7–12)</div>
  ${[
    ['7', 'Registration & Payment Flow (End-to-End)', 'tut'],
    ['8', 'Admin Dashboard Architecture', 'arch'],
    ['9', 'QR Codes, Certificates & Email Automation', 'tut'],
    ['10', 'Service Workers & PWA', 'mixed'],
    ['11', 'Deployment, Hosting & CI/CD', 'tut'],
    ['12', 'From Zero: Build Your Own World-Class Site', 'tut'],
  ].map(([n,t,tag]) => `<div class="toc-item"><span class="toc-num">${n}</span><span class="toc-title">${t}</span><span class="toc-tag ${tag}">${tag === 'arch' ? 'Architecture' : tag === 'tut' ? 'Tutorial' : 'Arch + Tutorial'}</span></div>`).join('')}

  <div class="toc-section-label">Part 3 — Advanced Production Patterns (Modules 13–19)</div>
  ${[
    ['13', 'Multi-Role Event Admin Dashboards', 'mixed'],
    ['14', 'Chess Admin: Intra-College Tournament System', 'tut'],
    ['15', 'IdeaForge Admin: Team Project Management', 'tut'],
    ['16', 'Advanced Canvas: Dynamic Certificate Rendering', 'arch'],
    ['17', 'On-Spot Registration & Two-Phase QR Check-In', 'tut'],
    ['18', 'Financial Dashboard: Sponsors & Expenditures', 'tut'],
    ['19', 'Production Hardening & Lessons Learned', 'arch'],
  ].map(([n,t,tag]) => `<div class="toc-item"><span class="toc-num">${n}</span><span class="toc-title">${t}</span><span class="toc-tag ${tag}">${tag === 'arch' ? 'Architecture' : tag === 'tut' ? 'Tutorial' : 'Arch + Tutorial'}</span></div>`).join('')}
</div>

<!-- ══════════════════════════════════════════════════════
     PART 1 DIVIDER
══════════════════════════════════════════════════════ -->
<div class="part-divider">
  <span class="part-num">Part One</span>
  <h2>Foundations</h2>
  <p>Modules 1–6: Architecture · HTML · CSS · JavaScript · Firebase · Security</p>
</div>

<!-- ══════════════════════════════════════════════════════
     MAIN CONTENT
══════════════════════════════════════════════════════ -->
<div class="content">
${contentHtml}
</div>

</body>
</html>`;

// ─── 6. Write the HTML file ────────────────────────────────────────────────────
const htmlOut = path.join(BASE, 'course_final.html');
fs.writeFileSync(htmlOut, HTML, 'utf8');
console.log('✅ HTML generated:', htmlOut);
console.log('   Size:', (HTML.length / 1024).toFixed(0) + 'KB');
console.log('');
console.log('📄 To create PDF:');
console.log('   Option A (Chrome/Edge headless):');
console.log('   npx puppeteer-cli print course_final.html course_ELEXSIYA26.pdf');
console.log('');
console.log('   Option B (open in browser):');
console.log('   Start-Process course_final.html');
console.log('   Then: File → Print → Save as PDF → A4, No margins → Save');
