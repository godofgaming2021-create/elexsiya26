/* ============================================================
   COLLEGE SYMPOSIUM – SHARED UTILITIES
   Firebase Firestore data store + helpers
   ============================================================ */

// 🔒 Credentials stored as SHA-256 hashes — never in plain text
// To regenerate: run sha256('your_email') and sha256('your_password') in browser console
const ADMIN_USER_HASH = 'b3ce598dcbeff9dc0445e0bfb8093727036768d9caf03f8ca188fe86ded4a3cc'; // SHA-256 of admin email
const ADMIN_PASS_HASH = 'eda52fd9a8fc52c6cb9a734862360ccd058833dfa750d0e8e7c29ef037ecee70'; // SHA-256 of admin password
const REG_FEE = 499;

/* ---------- Async SHA-256 helper ---------- */
async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/* ---------- Async admin verifier ---------- */
async function verifyAdmin(email, password) {
  const [eHash, pHash] = await Promise.all([sha256(email.toLowerCase().trim()), sha256(password)]);
  return eHash === ADMIN_USER_HASH && pHash === ADMIN_PASS_HASH;
}

/* ============================================================
   FIRESTORE DATA HELPERS
   All functions are async — always use `await` when calling.
   ============================================================ */

/**
 * Fetch all registrations from Firestore, ordered by date (newest first).
 * @returns {Promise<Array>} Array of registration objects.
 */
async function getRegistrations() {
  try {
    const snapshot = await db.collection('registrations')
      .orderBy('registeredAt', 'desc')
      .get();
    return snapshot.docs.map(doc => doc.data());
  } catch (err) {
    console.error('[DB] getRegistrations error:', err);
    if (err.code === 'permission-denied') {
      alert("⚠️ Firebase Permission Denied. Your Cloud Firestore Rules are blocking read access. Please update your rules to allow read/write (see README-FIREBASE.txt).");
    }
    return [];
  }
}

/**
 * Add a new registration document to Firestore.
 * Document ID = reg.regId for easy lookup.
 * @param {Object} reg - Registration data object.
 * @returns {Promise<Object>} The saved registration.
 */
async function addRegistration(reg) {
  // Attach integrity checksum
  reg._checksum = _calcChecksum(reg);
  try {
    await db.collection('registrations').doc(reg.regId).set(reg);
  } catch (err) {
    console.error('[DB] addRegistration error:', err);
    if (err.code === 'permission-denied') {
      alert("⚠️ Firebase Permission Denied. Your Cloud Firestore Rules are blocking write access. Please see README-FIREBASE.txt to fix this. Registration was NOT saved.");
    }
    throw err;
  }
  return reg;
}

/**
 * Update the paymentStatus field of a registration by its regId.
 * @param {string} regId
 * @param {string} status - 'Paid' | 'Pending'
 */
async function updatePaymentStatus(regId, status) {
  try {
    await db.collection('registrations').doc(regId).update({ paymentStatus: status });
  } catch (err) {
    console.error('[DB] updatePaymentStatus error:', err);
    throw err;
  }
}

/**
 * Generate a unique registration ID by checking Firestore for collisions.
 * @returns {Promise<string>} Unique ELX-XXXXXXXX ID.
 */
async function generateRegId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id;
  do {
    id = 'ELX-';
    for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)];
    // Check Firestore for this ID. Catch permissions error so it doesn't hang!
    try {
      const doc = await db.collection('registrations').doc(id).get();
      if (!doc.exists) break;
    } catch (err) {
      console.warn("Could not check reg ID uniqueness (likely permissions):", err);
      break; // Assume it's unique enough for now if we can't read the DB
    }
  } while (true);
  return id;
}

/* ---------- Tamper-detection checksum ---------- */
// ⚠️ NOTE: This checksum is informational — provides a basic integrity layer.
function _calcChecksum(reg) {
  const sig = [reg.regId, reg.email, reg.event, reg.amount, reg.registeredAt].join('|');
  let h = 0;
  for (let i = 0; i < sig.length; i++) { h = (Math.imul(31, h) + sig.charCodeAt(i)) | 0; }
  return h.toString(16);
}

function isRegistrationTampered(reg) {
  if (!reg._checksum) return true;
  return reg._checksum !== _calcChecksum(reg);
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

  const magnetTargets = 'a, button, .btn, .glass-card, .event-info-btn, .hanim-cd-unit';
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
});
