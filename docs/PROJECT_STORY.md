# NegosyoNav — Project Story

## Inspiration

Every day, thousands of Filipinos dream of starting a small business — a *sari-sari* store on the corner, a *carinderia* that feeds the neighborhood, a home-based *pandesal* bakery. The dream is real. The paperwork is not.

We talked to micro-entrepreneurs in Manila and heard the same story again and again: they gave up, not because the business failed, but because the registration process was too confusing, too expensive to get wrong, and too intimidating to navigate alone. DTI, Barangay, Cedula, Mayor's Permit, BIR — five agencies, five queues, five sets of requirements, and no single guide written *for them*, in the language they actually speak.

That gap is what NegosyoNav was built to close.

The name says it plainly: *Negosyo* (business) + *Nav* (navigate). We wanted to build the friend every aspiring entrepreneur wishes they had — one who speaks Taglish, knows which RDO covers Sampaloc, and can pre-fill your BIR 1901 while you wait in line.

---

## What We Built

NegosyoNav is a mobile-first Progressive Web App (PWA) that guides Filipino micro-entrepreneurs through the entire Manila City business registration process. A user describes their business to a Gemini-powered chatbot in natural Taglish, and the app responds with a personalized **Lakad Roadmap** — a step-by-step, LGU-specific guide from DTI all the way to BIR.

Key features shipped:

- **AI chatbot (Taglish-native)** — powered by Gemini 2.0 Flash via its OpenAI-compatible endpoint; extracts a structured business profile from the conversation automatically.
- **Lakad Roadmap** — 5-step timeline (DTI → Barangay → Cedula → Mayor's Permit → BIR) with real costs, requirements, office hours, and an embedded mini-map per step.
- **Form auto-fill + PDF download** — the MVP anchor. The user's saved profile pre-fills government form templates (Barangay Clearance via AcroForm; DTI and BIR via structured text layout), then generates a real, downloadable PDF using `pdf-lib`.
- **Grant matcher** — pure-logic eligibility check against BMBE, DOLE Kabuhayan (DILP), and SB Corp Micro-Financing, surfacing up to ₱1 million in available programs.
- **Negosyante Hub** — a community board where entrepreneurs share tips, warnings, and experiences tagged by registration step and LGU.
- **Place Finder with Google Maps** — shows the relevant government office for each step, with travel-time directions from the user's current location.
- **Time-based Planner and Renewal Calendar** — estimates total completion time and tracks annual renewal deadlines (Mayor's Permit: January 20; BIR: quarterly).
- **Multi-thread chat history** — every conversation is persisted to Firestore so users can return, pick up where they left off, and re-extract their profile into forms at any time.

The total estimated registration cost that NegosyoNav helps users navigate:

$$C_{\text{total}} = C_{\text{DTI}} + C_{\text{Barangay}} + C_{\text{Cedula}} + C_{\text{Mayor}} + C_{\text{BIR}} \approx ₱5{,}519 \text{ – } ₱12{,}560$$

With BMBE eligibility, a business with total assets $A \leq ₱3{,}000{,}000$ qualifies for income tax exemption — a saving we surface immediately after registration is complete.

---

## How We Built It

The stack was chosen for speed, type safety, and zero-friction deployment:

| Layer | Technology |
|---|---|
| Frontend | React 19 + wouter + shadcn/ui + Tailwind v4 |
| Backend | Express + tRPC (end-to-end type-safe API) |
| Database | Firebase Firestore |
| Auth | Firebase Authentication |
| AI | Gemini 2.0 Flash (OpenAI-compatible endpoint) |
| Maps | Google Maps JavaScript API + Directions API |
| Analytics | Firebase Analytics |
| PDF | `pdf-lib` (AcroForm fill + programmatic layout) |
| PWA | `vite-plugin-pwa` + Workbox runtime caching |

The entire backend surface is a single tRPC router composed of sub-routers for `auth`, `ai`, `profile`, `grants`, `community`, `forms`, and `feedback`. There is no REST layer — every client call is fully typed from server to browser.

The AI pipeline works in two passes:

1. **Conversation pass** — `ai.chat` sends the full thread (capped at 12 messages for LLM payload efficiency) to Gemini with a Manila-specific system prompt encoding all five registration steps, RDO assignments, costs, and grant programs.
2. **Extraction pass** — `ai.extractProfile` sends a structured extraction prompt to Gemini and writes the result directly to `profiles/{uid}` in Firestore, which then pre-populates every form field in the app.

The Barangay Clearance PDF uses `pdf-lib`'s AcroForm API to fill the official government template field-by-field. The form schema (field names, types, required flags) is exported from the server so the client's multi-step form wizard mirrors the PDF structure exactly — what the user fills in the app is what lands in the document.

The design system follows a "Bayanihan Modernism" philosophy: semantic color tokens only (`bg-primary`, `text-foreground`, etc.), Plus Jakarta Sans for headings, a warm-cream background, and a teal-to-blue gradient for primary actions. Every tap target is ≥ 44 px; every text input is `text-base` (16 px minimum) to prevent iOS auto-zoom. The app was designed and tested at 360 × 640 px first.

---

## Challenges

**Getting the AI to stay on task.** Gemini is a powerful general model, which means it wants to answer everything. Early versions of the chatbot would happily discuss business registration in Cebu, Davao, and hypothetical scenarios outside our data. We solved this by encoding the Manila-specific data directly in the system prompt as structured reference material, and by building a `roadmapReady` heuristic on the server — the chatbot only surfaces the Roadmap CTA once it detects both a business keyword and a Manila locality in the conversation, preventing premature escalation.

**Real PDF generation is harder than it looks.** Our first implementation returned base64-encoded plain text with a `.pdf` extension — it looked like it worked until you tried to open it. The fix required learning AcroForm internals: widget annotations, checkbox groups, field dictionaries. The Barangay Clearance template alone has over 30 named fields, some grouped into radio/checkbox arrays that `pdf-lib` handles differently from plain text widgets.

**Firestore query limitations.** Firestore does not support `ORDER BY` on a field without a matching composite index, and `orderBy` + `where` combinations require those indexes to be created in advance. We hit this on the community feed when trying to sort posts by vote count dynamically. The solution was to drop the server-side `orderBy`, fetch posts, and sort in-memory on the server before returning — a pragmatic tradeoff at hackathon scale that the task plan flags for proper indexing post-prototype.

**Mobile-first is a discipline, not a setting.** We initially built several components on a laptop and only tested mobile at the end. Buttons were 36 px. The bottom nav covered the primary CTA. iOS zoomed into every input. Fixing this required a systematic audit — enforcing `min-h-11` on interactive elements, `pb-20` on every page that shows the bottom nav, and `text-base` on all inputs. The lesson: test at 360 × 640 first, every time, not as an afterthought.

**Scope creep is the enemy of the MVP.** The original brief had 8 pillars. We had to constantly ask: *which one feature, if it works perfectly, makes someone register their business?* The answer was always the same — the form auto-fill and PDF download. That became the north star, and every other track was ranked against it.

---

## Accomplishments That We're Proud Of

**A chatbot that actually speaks Filipino.** Most AI tools in the civic-tech space are English-first. NegosyoNav's Gemini integration speaks Taglish natively — mixing Filipino and English the way a real *kababayan* would — and adjusts its tone to match a user who may be filling out a government form for the first time. Getting the system prompt tuned to the right level of warmth, specificity, and local knowledge was one of the most satisfying parts of the build.

**The profile-to-PDF pipeline.** A user describes their business in a casual chat conversation. The app silently extracts their name, address, business type, TIN, and PhilSys number from the transcript. Those fields pre-fill a real AcroForm PDF template — the same document the barangay officer will stamp. That end-to-end arc, from "I'm selling *puto* from home" to a filled, downloadable Barangay Clearance application, is the core value proposition working as designed.

**A design system built for the user, not the designer.** The "Bayanihan Modernism" design language — warm-cream backgrounds, teal-to-blue gradients, Filipino-language microcopy — makes the app feel approachable rather than bureaucratic. The ₱ sign appears where it belongs. Section headers say *"Mga Kinakailangan"* instead of "Requirements." These are small choices that compound into an experience that feels made *for* Filipino micro-entrepreneurs, not adapted from a Western SaaS template.

**End-to-end type safety across the full stack.** tRPC means there is no API contract to maintain separately, no JSON schemas to keep in sync, and no runtime surprises when the server changes a field name. Every procedure from Firestore to the React component is typed. In a hackathon setting where the team is moving fast and the schema is changing constantly, this was not a luxury — it was the only way to stay sane.

**56 passing tests on the AI router.** The chat persistence layer — thread creation, `roadmapReady` heuristic, profile extraction fallback, delete — is covered by a Vitest suite that runs against a mock Firestore store. This gave us confidence to refactor the router twice (singleton session → multi-thread) without regressions.

---

## What We Learned

**LLM prompt engineering is software engineering.** The system prompt in `server/routers.ts` is not documentation — it is executable logic. Every line of Manila RDO data, every cost range, every "Tips:" entry is a constraint on the model's output. We learned to treat the prompt as code: version it, test it with fixture inputs, and never ship a change without checking whether the extraction pass still produces the right field values.

**Firestore's data model forces you to think about access patterns upfront.** Relational databases let you query anything with a `JOIN`. Firestore makes you choose your indexes before you write. We learned this the hard way when our community feed query hit a missing composite index at runtime. Designing collections around the queries you actually need — not the schema you think is "correct" — is a skill that only clicks after you break something in production.

**Progressive Web Apps close the gap for low-end devices.** A significant portion of our target users are on entry-level Android phones with unreliable data connections. Workbox's runtime caching means the app shell and API responses survive a flaky signal. The `manifest.json` means users can add NegosyoNav to their home screen without going through the App Store. We underestimated how much this matters until we tested on a real budget phone.

**Mobile-first means mobile-only in your head.** The temptation to "fix it for mobile later" is constant when you're developing on a 27-inch monitor. We now know: if you don't open Chrome DevTools to 360 × 640 before you write the first JSX, you will spend twice as long fixing it afterward.

**Scope discipline is a technical skill.** Every feature we cut — voice input, multi-LGU support, push notifications, Hub comments — was a features we *wanted* to build. Learning to write the task plan, assign HIGH/LOW priorities, and hold the line on the MVP anchor (PDF download) was as important as any line of code.

---

## What's Next for NegosyoNav

**Multi-LGU expansion.** Manila City is one of 33 cities in Metro Manila. Taguig, Quezon City, Cavite, and Sampaloc are the next targets — each with different barangay fee structures, different BIR RDO assignments, and different Mayor's Permit processing times. The architecture already has an `lguRegistry` pattern ready; the work is data research and prompt tuning per city.

**Push notification renewal reminders.** A business permit expires every January 20. A BIR quarterly filing is due every 90 days. Most micro-entrepreneurs miss these deadlines not because they forgot their business, but because no one told them in time. Firebase Cloud Messaging (FCM) is already in the dependency tree — the next step is a server-side reminder job that pings users two weeks before each deadline.

**Post-registration roadmaps.** Registration is the beginning, not the end. After a business is registered, the next questions are: How do I open a business bank account? How do I enroll as an SSS employer? How do I file my first BIR quarterly return? NegosyoNav's roadmap architecture supports multiple flows — we plan to build a "Ano ang susunod?" panel that surfaces these follow-up guides the moment the last registration step is checked off.

**AcroForm templates for DTI and BIR 1901.** The Barangay Clearance is the only form that currently fills a real government AcroForm template. DTI Form FM-BN-01 and BIR Form 1901 are next — once the official PDF templates are sourced, the `pdf-lib` dispatcher already has a slot for them.

**Voice input for lower-literacy users.** The Web Speech API supports `lang="fil-PH"` with an English fallback. A microphone button on the chat input would make NegosyoNav accessible to users who find typing in Taglish slower than speaking it — a real barrier for some of the entrepreneurs we spoke to during research.

**Accessibility and screen-reader support.** WCAG AA compliance, Tagalog VoiceOver labels, and a contrast audit of the warm-cream palette are on the roadmap. Civic tech that is inaccessible is not truly public.

---

*NegosyoNav is a hackathon prototype. Current scope: Manila City only. All data is accurate as of April 2026; registration fees and requirements are subject to change by the issuing agencies.*
