# 🇵🇭 NegosyoNav

> The Taglish AI co-pilot that walks Filipino micro-entrepreneurs through Philippine business registration — DTI, Barangay, Cedula, Mayor's Permit, BIR — in one mobile-first PWA.

![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![tRPC](https://img.shields.io/badge/tRPC-11-2596BE?logo=trpc&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-FFCA28?logo=firebase&logoColor=black)
![Gemini](https://img.shields.io/badge/Google-Gemini-4285F4?logo=google&logoColor=white)
![Tailwind v4](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8?logo=pwa&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-green)

<p align="center">
  <img src="roadmap-mobile-top.png" alt="NegosyoNav Lakad Roadmap on mobile" width="320" />
  &nbsp;&nbsp;
  <img src="roadmap-grants-tools.png" alt="Grant matches inside the roadmap" width="320" />
</p>

---

## 💡 The Problem & The Solution

### The Problem
**77% of Filipino micro-enterprises operate informally.** They want to register — to qualify for grants, open a business bank account, sell to corporate buyers — but the path is a maze: 5 agencies, ~12 documents, English-only PDFs, ₱5,000–₱12,000 in fees, and 7–11 days of running between offices. Existing government portals assume a desktop, a printer, and English fluency. A *tindera* with a phone and a sari-sari store has none of those.

### The Solution
**NegosyoNav turns "I want to register my negosyo" into a Taglish chat.** A Gemini-powered intake captures the user's business in their own language, generates a personalized **Lakad Roadmap** (Manila City), auto-fills the actual government PDFs from a saved profile, matches the user to grants they qualify for (BMBE, DOLE Kabuhayan, SB Corp), and surfaces peer tips from a community board — all on a phone, offline-capable as a PWA.

The saved profile is the retention hook: it powers renewals, post-registration roadmaps, and grant alerts long after Day 1.

---

## Features

- **Taglish AI intake** — Gemini conversation extracts business profile from natural code-switched Filipino/English.
- **Lakad Roadmap** — 5-step Manila City registration path (DTI → Barangay → Cedula → Mayor's Permit → BIR) with per-step costs, document checklists, RDO routing, and embedded office maps.
- **Auto-filled government PDFs** — the MVP anchor. The profile fills the real Manila Barangay Clearance AcroForm; DTI + BIR ship as text-fallback PDFs until official templates land.
- **Grant matcher** — pure-logic eligibility for **BMBE, DOLE Kabuhayan, SB Corp Micro-Financing** based on the saved profile.
- **Negosyante Hub** — community board with posts + upvotes, seeded with peer tips per registration step.
- **Place finder** — Manila LGU offices with Google Maps integration, surfaced *inside* the roadmap step that needs them.
- **Renewal calendar** — countdowns for Mayor's Permit + BIR annual filings, persisted per user.
- **Field-level Taglish help** — every form input opens a Gemini-powered drawer that explains *what* and *why* in Taglish.
- **Installable PWA** — offline shell, runtime caching for `/api/`, safe-area aware, 360×640-tested.

---

## 🛠️ Tech Stack & Architecture

Single-process Express app. tRPC is the entire API surface — no REST, no OAuth proxy. Vite middleware in dev, static build in prod.

### ☁️ Google Integrations
- **Google Gemini API** — Taglish conversation, profile extraction, per-field help, all via `server/_core/llm.ts invokeLLM()` (OpenAI-compatible endpoint).
- **Firebase Auth** — email/password sign-in; client sends `Authorization: Bearer <idToken>` to tRPC; server verifies with `firebase-admin`.
- **Firebase Firestore** — `users/{uid}`, `profiles/{uid}`, `posts/{id}` (+ `votes` subcollection), `feedback/{auto}`.
- **Google Maps Platform** — Maps JS + Directions API for the office locator (`client/src/components/Map.tsx`).

### Frontend
- **React 19** + **wouter** (routing) + **shadcn/ui** (Radix primitives, new-york variant) + **Tailwind CSS v4** with brand tokens in `client/src/index.css`.
- **@trpc/react-query** typed end-to-end against `AppRouter`.
- **vite-plugin-pwa** (manifest + Workbox runtimeCaching).
- Mobile-first design system: `font-display` Archivo Black, `font-body` DM Sans, brand palette in oklch (mango, teal, jeepney-red, warm-cream).

### Backend
- **Node.js + Express** on **tRPC v11** — all sub-routers in `server/routers.ts` (~440 LOC, intentionally one file).
- **firebase-admin** for token verification + Firestore access (`server/_core/firebaseAdmin.ts`, `server/db.ts`).
- **pdf-lib + @pdf-lib/fontkit** — real PDF generation, AcroForm filling for Manila templates.
- **Vitest** — tests build a `TrpcContext` and call `appRouter.createCaller(ctx)` directly (no HTTP).

### Data
- **Firestore** (production path) — see `server/db.ts`, the only allowed DB access path.
- Drizzle/MySQL files remain in the repo as legacy scaffolding but are not wired into the runtime.

---

## 🧗 The Hackathon Journey

**Challenges we ran into**
- **PDFs were the trap.** Our v1 "PDF download" was base64-encoded plain text saved with a `.pdf` extension — readers refused to open it. We rebuilt around `pdf-lib`, sourced the actual Manila Barangay Clearance AcroForm template, and added a real text-fallback PDF for templates we couldn't get in time.
- **Single-LGU discipline.** We almost over-scoped to "all of Metro Manila" before realizing one perfectly accurate LGU beats five half-broken ones. We froze scope to **Manila City** and put multi-LGU in `docs/DEV_TASKS.md` for v2.
- **Hub like-button bug at 2 AM.** Seeded posts had non-Firestore IDs, so `community.vote` 404'd. Tracked, fixed, documented as Track P.
- **Mobile-first wasn't optional.** Our target user opens the app on a 360px screen with one thumb. Every layout got designed at 360×640 *first*, then scaled up.

**Accomplishments we're proud of**
- A Taglish AI flow that *actually* extracts structured profile data from messy code-switched Filipino input.
- An end-to-end typed stack (tRPC + Firebase Admin + Zod) with zero REST endpoints.
- A design system with named brand tokens (`bg-primary` = teal, `bg-accent` = mango) — no raw hex anywhere in the UI.
- Real PDF generation for the registration anchor document, not a fake.

**What we learned**
- Filipino micro-entrepreneurs don't need *more* information — they need the *right next step*. Roadmap > directory.
- Taglish isn't bad English. It's a UX requirement.
- The MVP anchor (auto-fill PDF) is also the retention hook (saved profile = reason to come back).

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** ≥ 20
- **pnpm** 10.4.1 (pinned via `packageManager`)
- **Firebase project** with Auth (email/password) and Firestore enabled
- **Service account JSON** at `./serviceAccount.json` (Firebase Console → Project settings → Service accounts → Generate new private key)
- **Google Gemini API key**
- *(optional)* **Google Maps API key** for the office locator

### Installation

```bash
git clone https://github.com/<your-org>/negosyonav.git
cd negosyonav
pnpm install
```

### Environment

Create `.env` at the repo root:

```bash
# Server
GEMINI_API_KEY=your_gemini_key
FIREBASE_PROJECT_ID=your-firebase-project-id
NODE_ENV=development

# Client (Vite — must be prefixed VITE_)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
VITE_GOOGLE_MAPS_API_KEY=...   # optional
```

Drop `serviceAccount.json` in the repo root (gitignored).

### Run

```bash
pnpm dev          # Express + Vite middleware on :3000
pnpm check        # tsc --noEmit
pnpm test         # vitest run
pnpm build        # client → dist/public, server → dist/index.js
pnpm start        # production server from dist/
pnpm seed:hub     # seed Negosyante Hub with peer-tip posts
```

The app boots at <http://localhost:3000>. First visit lands on signup; post-signup routes to Profile.

---

## 📁 Project Structure

```
negosyonav/
├── client/src/
│   ├── pages/              # Home, Roadmap, Forms, Hub, Profile, Grants, Places, Calendar, Planner, Login
│   ├── components/         # AIChatBox, FormHelpDrawer, BottomNav, Map, OfficeMapCard, ui/ (shadcn)
│   ├── data/manilaData.ts  # Hardcoded Manila City registration steps + costs
│   ├── lib/                # firebase.ts, trpc.ts, utils.ts (cn helper)
│   └── index.css           # @theme inline tokens (brand palette, fonts, radii)
├── server/
│   ├── _core/              # index.ts (entry), context.ts, firebaseAdmin.ts, llm.ts, trpc.ts, env.ts
│   ├── routers.ts          # ALL tRPC sub-routers in one file (auth/ai/profile/grants/community/forms/feedback)
│   ├── db.ts               # Only allowed Firestore access path
│   ├── pdf/                # barangayClearance.ts, textFallback.ts (pdf-lib)
│   └── templates/          # Real government PDF templates (AcroForm)
├── shared/                 # const.ts, types.ts (imported by both client + server)
├── docs/DEV_TASKS.md       # Single source of truth for parallel work tracks
└── CLAUDE.md               # Project guide for AI coding assistants
```

---

## 🔮 What's Next — The Retention Engine

Registration is Day 1. The real value is everything after.

| Feature | Why it keeps users coming back |
|---|---|
| **Annual Mayor's Permit renewal** | January every year — pre-filled from saved profile, one tap to download the updated PDF. No brainer. |
| **BIR quarterly filing reminders** | 4 times a year, push-notified to the phone. Most micro-vendors have zero reminder system for this; missed filings mean penalties. |
| **New grant cycle push alerts** | Free money notifications matched to the user's profile — when BMBE, DOLE, or SB Corp opens a new cycle, they hear about it first. |
| **Community replies & upvotes** | Social hooks: reply to a tip, get thanked, come back to check. Reciprocity drives retention more than any push campaign. |
| **Growth roadmaps** | Post-registration tracks for the next stage — business bank account, SSS/PhilHealth/Pag-IBIG as employer, DTI trademark, SEC incorporation if they scale up. |

The saved profile is what powers all of this. Every feature above already has the data it needs — these are activations of what's already stored, not new data collection.

---

## 🤝 Contributing

Active work is tracked in [`docs/DEV_TASKS.md`](docs/DEV_TASKS.md) — pick a track, the file lists owner files and conflict zones so parallel devs don't collide.

Conventions worth knowing before you PR:
- **Don't split `server/routers.ts`** — sub-routers in one file is the convention.
- **Firestore via `server/db.ts` only** — never call `adminDb` directly from a router.
- **Design tokens, not hex** — use `bg-primary`, `text-foreground`, etc. No raw colors, no arbitrary `rounded-[...]`.
- **Mobile-first** — design at 360×640, then scale up with `sm: md: lg:`. Never the reverse.
- **New page** = `<Route>` in `App.tsx` *and* either `navItems` or `hideOn` in `BottomNav`.

---

## 📄 License

MIT — see [`LICENSE`](LICENSE).

---

<p align="center">
  Built with 🥭 for Filipino micro-entrepreneurs.
</p>
