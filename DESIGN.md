---

## name: NegosyoNav Core

# NegosyoNav Design System — Guided Journey UI

---

## Brand Direction

NegosyoNav follows a **Guided Journey UI** approach — calm, step-by-step, emotionally reassuring.

It blends:

* **Warm clarity** — every screen has one clear next action
* **Breathing room** — generous spacing signals safety, not urgency
* **Progressive guidance** — show only what the user needs right now
* **Human tone** — Taglish-friendly copy that feels like a trusted friend, not a government form

Personality:

> A **Digital Alalay** that feels *calm, organized, and deeply human* — like the most helpful neighbour you've ever had.

Shift from the previous identity:

| Before | After |
|---|---|
| Fintech dashboard | Guided journey |
| Data-forward | Human-forward |
| Card-dense screens | One focus per screen |
| "Stripe meets Barangay" | "Headspace meets your barangay hall" |

---

## Color System

### Philosophy

* **Unchanged tokens** — all `index.css` CSS variables are preserved exactly
* Blue is **trust and action**, not decoration
* Teal gradient is reserved for milestone moments only (not everyday surfaces)
* Warm neutrals create psychological safety; avoid high-contrast noise

The palette doesn't change — only *how much* of each color is used per screen shifts.

---

### Core Palette (unchanged)

```yaml
background: oklch(0.98 0.003 240)   # #f8fafc — primary page background
surface:    oklch(1 0 0)             # white — card surface
muted:      oklch(0.97 0.005 240)   # #f1f5f9 — gentle section background
border:     oklch(0.93 0.007 240)   # #e2e8f0 — hairline only

text-primary:   oklch(0.13 0.02 250)  # #0f172a — headings
text-secondary: oklch(0.52 0.04 245)  # #64748b — supporting copy
text-muted:     oklch(0.65 0.03 240)  # #94a3b8 — placeholders, captions
```

---

### Brand Colors (unchanged)

```yaml
primary:       oklch(0.47 0.27 264)   # #293ff5 — blue, CTAs and key actions
primary-soft:  oklch(0.94 0.06 264)   # #e0e7ff — blue tint surface
brand-teal:    oklch(0.82 0.14 186)   # #01dbca — gradient accent only
neutral-dark:  oklch(0.18 0.05 250)   # #141d3a — deep gradient terminus
```

---

### Gradient System — Use More Sparingly

Gradients are reserved for **milestone moments** only. Every other surface uses flat color.

```yaml
gradient-primary:  linear-gradient(135deg, #01dbca, #293ff5)
  → Use: completion banners, onboarding hero, PDF download success

gradient-soft:     linear-gradient(135deg, #ffffff, #e6fefe)
  → Use: empty state illustrations, welcome screen only

gradient-deep:     linear-gradient(135deg, #293ff5, #141d3a)
  → Use: roadmap progress header only
```

Avoid gradients on:
* Card backgrounds in lists
* Form sections
* Navigation elements
* Any repeated/scrollable pattern

---

### Semantic Colors (unchanged)

```yaml
success: oklch(0.55 0.15 145)   # #16a34a
warning: oklch(0.74 0.16 75)    # #f59e0b
error:   oklch(0.56 0.22 25)    # #dc2626
```

---

## Typography

### Font (unchanged)

* **Plus Jakarta Sans** — display headings and body
* **JetBrains Mono** — costs, codes, step numbers only

---

### Scale — Revised Line Heights for Breathing Room

The font sizes are preserved. Line heights and spacing between text blocks increase.

```yaml
headline-lg:
  fontSize:   28px
  fontWeight: 700
  lineHeight: 40px   # was 36px — +4px for calm
  letterSpacing: -0.02em

headline-md:
  fontSize:   22px   # was 24px — pulled back to reduce visual weight
  fontWeight: 600
  lineHeight: 32px

headline-sm:
  fontSize:   18px   # was 20px
  fontWeight: 600
  lineHeight: 28px

body-lg:
  fontSize:   16px
  fontWeight: 400    # was 500 — lighter weight reads softer
  lineHeight: 26px   # was 24px

body-md:
  fontSize:   15px   # was 14px — slightly easier to read on phone
  fontWeight: 400
  lineHeight: 24px

label-md:
  fontSize:   13px
  fontWeight: 500
  lineHeight: 20px

caption:
  fontSize:   12px
  fontWeight: 400
  lineHeight: 18px
```

---

### Rules — Updated

* Heading + first body line spacing: minimum `mt-2` (`8px`) — never collapse
* Between sections: `mt-8` or `mt-10` (`32–40px`) — let content breathe
* Body copy max-width: `max-w-prose` (`65ch`) — avoid wide lines on tablet
* Use weight contrast (700 vs 400) rather than size contrast for hierarchy
* Taglish copy: sentence case always, no ALL CAPS except badge labels

---

## Layout & Spacing

### Guiding Principle — One Focus Per Screen

Each screen should surface one primary question the user needs to answer, or one action they need to take. Everything else is secondary and can be progressive-disclosed.

**Before:** Multiple cards visible at once, all at equal visual weight.
**After:** One card/section dominant; others recede until needed.

---

### Spacing Scale — Shifted Up

```yaml
space-xs:  4px    # micro gaps inside chips/badges
space-sm:  8px    # between icon and label, between related items
space-md:  16px   # between list items
space-lg:  24px   # between card sections
space-xl:  32px   # between major page sections
space-2xl: 48px   # page-level breathing room (hero to first content)
space-3xl: 64px   # only between independent page areas
```

In Tailwind: default to `gap-6` between stacked cards, `py-8` for section separators, `mb-10` before primary CTAs.

**Before:** `space-y-4`, `mb-5` was standard.
**After:** `space-y-6`, `mb-8` is the new standard. Use `space-y-4` only inside dense lists.

---

### Containers

```yaml
edge-padding:       20px  (px-5)
card-padding:       20px  (p-5)
section-gap:        32px  (mt-8)
page-top-padding:   24px  (pt-6)
bottom-clearance:   88px  (pb-22) — clears BottomNav + safe area
```

---

### Layout Pattern: Vertical Journey Stack

All pages use a single-column vertical stack. No horizontal scroll for core content.

```
[Page Header — title + optional subtitle]
   ↓  mt-6
[Primary Section / Active Step]
   ↓  mt-6
[Secondary Content — collapsed by default]
   ↓  mt-8
[Primary CTA — full width, pinned or inline]
```

Progressive disclosure rule: sections below the fold don't need to render visually until the user has completed the section above. Use `<details>` or accordion patterns.

---

### Touch Targets

```yaml
minimum:   44px   (h-11 min-h-11)
preferred: 56px   (h-14) for primary CTAs
list-rows: 56px   minimum height for tappable list items
```

---

## Elevation & Depth

### Philosophy

* Elevation signals **focus**, not decoration
* The active/current card is elevated; completed/upcoming cards flatten
* No border + shadow on the same element — choose one

---

### Card Tiers

```yaml
card-resting:
  background: white
  border: 1px solid oklch(0.93 0.007 240)
  shadow: none
  radius: 16px    # slightly up from 14px
  padding: 20px

card-active:
  background: white
  border: none
  shadow: 0 4px 16px rgba(0,0,0,0.08)
  radius: 16px
  padding: 20px

card-completed:
  background: oklch(0.97 0.005 240)   # muted
  border: 1px solid oklch(0.93 0.007 240)
  shadow: none
  opacity: 0.85
  radius: 16px
  padding: 16px
```

Tailwind utility classes for the above:

```
card-resting:   bg-card rounded-2xl border border-border p-5
card-active:    bg-card rounded-2xl shadow-md p-5
card-completed: bg-muted rounded-2xl border border-border p-4 opacity-85
```

---

### Hover / Focus

Touch devices never hover — do not rely on `:hover` for visual feedback.
Pair every hover state with `:active` and `focus-visible`:

```css
/* Tailwind pattern for touch-safe interaction */
active:scale-[0.98] active:shadow-sm focus-visible:ring-2 focus-visible:ring-primary/50
```

Remove hover shadows from card lists — they create visual noise on mobile scroll.

---

## Shapes

```yaml
radius-sm:   8px    # tags, badges (was 6px)
radius-md:   12px   # inputs, chips (was 10px)
radius-lg:   16px   # cards (was 14px)
radius-xl:   24px   # modal sheets (was 20px)
radius-full: 9999px # pill buttons, avatars
```

All radius values increase by 2px across the board. Softer corners = calmer feel.
These are design-doc values — the CSS `--radius` variable stays at `0.875rem` for shadcn compatibility; reference card/input components use `rounded-2xl`/`rounded-xl` directly.

---

## Microcopy System (New)

Microcopy is a first-class design element. Every screen has:

1. **Screen title** — what this screen is for (1 sentence, action-oriented)
2. **Lead-in** — reassurance that sets expectations ("This takes about 2 minutes.")
3. **Field helpers** — inline, beneath the label, light text
4. **Progress acknowledgement** — confirmation that a step completed ("Done! Isang hakbang na ang natapos mo.")
5. **Error guidance** — tell the user what to do, not just what went wrong

### Tone Rules

* Use "tayo" and "mo" — second person, warm
* "Huwag mag-alala" — use sparingly, only when genuinely reassuring
* No bureaucratic language ("Please ensure", "Input required", "Submit")
* Replace: "Submit" → "I-save na" or "Ituloy"
* Replace: "Error" → "May mali" with a next step
* Replace: "Loading..." → "Sandali lang..."

### Placement Patterns

```
Screen title:   text-xl font-semibold text-foreground
Lead-in:        text-sm text-muted-foreground mt-1 max-w-xs
Field helper:   text-xs text-muted-foreground mt-1
Progress ack:   text-sm text-success font-medium mt-3
Error guidance: text-sm text-destructive mt-1
```

---

## Components

### Primary Button — Guided CTA

Full width. One per screen (or one dominant + one ghost).

```
Tailwind: w-full h-14 rounded-xl bg-primary text-primary-foreground
          font-semibold text-base tracking-wide
          active:scale-[0.98] transition-transform duration-100
          focus-visible:ring-2 focus-visible:ring-primary/50
```

Do NOT stack two solid primary buttons. Use ghost or outline for the secondary action.

---

### Cards — Guided Journey Pattern

Cards in a list are **not equal**. The "current" card is visually distinct:

```
Active step:    bg-card shadow-md rounded-2xl p-5 border-0
Next steps:     bg-muted rounded-2xl p-4 border border-border text-muted-foreground
Completed:      bg-muted rounded-2xl p-4 border border-border opacity-80
                → show a checkmark icon, keep collapsed by default
```

Card internal structure:

```
[Icon or step number — 40px, rounded-xl, muted background]
[Title — text-base font-semibold mt-3]
[Body — text-sm text-muted-foreground mt-1 leading-relaxed]
[CTA or expand link — mt-4]
```

---

### Inputs

Height and radius increase slightly. Labels are always above (never placeholder-only).

```yaml
height:       52px   (h-13 — was 48px)
radius:       12px   (rounded-xl)
background:   oklch(0.97 0.005 240)   (bg-muted)
border:       none by default; 1px border-border on focus
focus-ring:   2px ring primary/30
label:        text-sm font-medium text-foreground mb-1
helper:       text-xs text-muted-foreground mt-1
```

Tailwind pattern:

```
label:  block text-sm font-medium text-foreground mb-1
input:  w-full h-13 rounded-xl bg-muted px-4 text-base
        border border-transparent
        focus:border-primary/40 focus:ring-2 focus:ring-primary/20
        outline-none transition
```

---

### Progress Indicators

Replace numeric progress bars with **named step indicators**:

```
Step 1 of 4: Impormasyon
● ○ ○ ○
[Current step name, friendly]
```

Use a simple 4-dot or 4-line indicator, not a percentage bar. Percentages feel like a test.

---

### Chips & Badges — Softened

```yaml
neutral:   bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs
active:    bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium
success:   bg-success/10 text-success rounded-full px-3 py-1 text-xs font-medium
warning:   bg-warning/10 text-warning rounded-full px-3 py-1 text-xs font-medium
```

---

### Section Intros (New Pattern)

Before each major content section, add a 1–2 line intro:

```tsx
<div className="mb-6">
  <h2 className="text-lg font-semibold text-foreground">Mga Hakbang Mo</h2>
  <p className="text-sm text-muted-foreground mt-1">
    Isa-isang gagawin natin ito. Huwag kang mag-alala — nandito tayo.
  </p>
</div>
```

---

## Feature-Specific Refactor Guide

---

### Chat (Home.tsx)

**Before:** Blank white screen with a hero title and horizontal-scroll suggestion pills. Input bar fixed at bottom. No guidance on what to say.

**After — Guided Onboarding State:**

When chat history is empty, show a warm welcome instead of a blank slate:

```
[Greeting — "Kumusta! Ako si Nav."]
[1–2 line lead-in — "Tulungan kita mag-rehistro ng negosyo. Sabihin mo lang kahit brief."]
[3 suggestion pills — vertical stack on mobile, not horizontal scroll]
[Subtle illustration or icon — 64px, teal soft tint circle]
```

Remove horizontal scroll from suggestion chips on empty state — use `flex-col gap-2` instead of `flex-row overflow-x-auto`.

Input area:
* Increase textarea min-height to `48px`
* Add placeholder: "Halimbawa: 'Sari-sari store sa Tondo, 5 years na'"
* Send button: labeled "Ipadala" on first message, icon-only after

**Message bubbles:**
* Increase padding from `px-3 py-2` to `px-4 py-3`
* Increase gap between messages from `space-y-4` to `space-y-6`
* Bot messages: `bg-muted rounded-2xl rounded-bl-md` — remove any blue tint, keep neutral
* User messages: `bg-primary text-primary-foreground rounded-2xl rounded-br-md`

**Do not change:** message data, chat history logic, streaming behavior, profile extraction trigger.

---

### Roadmap (Roadmap.tsx)

**Before:** Dense timeline with all 5 steps visible at once. Status badges, progress bars, and collapsible cards all compete for attention. Sticky header compresses the viewport.

**After — Step-at-a-Time Focus:**

Show one "active" step prominently; collapse all others.

```
[Sticky header — simplified]
  "Lakad Mo" + step count only (e.g. "Hakbang 2 ng 5")
  No progress bar — dots instead

[Active step card — card-active style]
  Large step number (font-mono text-3xl, teal tint)
  Step name (text-xl font-semibold)
  Lead-in microcopy (1 sentence, muted)
  Expanded requirements + cost
  [Primary CTA — "Tapos na ito →"]

[Upcoming steps — card-resting, collapsed]
  Step name + estimated time only
  "Pag tapos ka sa itaas, dito tayo pupunta"
  Tap to preview requirements

[Completed steps — card-completed]
  Step name + checkmark
  "Natapos mo na ito" in success color
  Collapse by default; tap to review
```

Timeline connector: single `border-l-2 border-border ml-5` line — no animated dots. Calm, not busy.

Section intro above the list:

```tsx
<div className="mb-8 px-5">
  <p className="text-sm text-muted-foreground leading-relaxed">
    Lima lang ang hakbang. Isa-isa nating gagawin — simula sa pinakamadali.
  </p>
</div>
```

**Do not change:** step data, cost data, status logic, collapsible behavior.

---

### Forms (Forms.tsx)

**Before:** Three form cards listed together, each expandable. Step counter badge uses `text-[10px]` monospace — too small. FAB floats over content.

**After — One Form at a Time:**

Show only the first incomplete form prominently:

```
[Section header]
  "I-fill out ang iyong mga papeles"
  Microcopy: "Auto-fill na ang mga detalye mo mula sa iyong profile."

[Active form card — card-active]
  Form name (text-lg font-semibold)
  "X sa Y fields ang kumpleto" — progress in plain words
  Expanded fields inline (no accordion)
  [Primary CTA — "I-download ang PDF"]

[Upcoming forms — card-resting]
  Form name + field count
  Locked until the form above is downloaded
  Tap to preview what's needed
```

Step counter: replace `text-[10px]` badge with plain text label:

```
"Form 1 ng 3" — text-sm text-muted-foreground
```

FAB (chat button): move from `fixed bottom-20 right-4` to inline at the top of the form, as a ghost button:

```
"May tanong? Makipag-chat kay Nav →" — ghost button, top of page
```

This removes the overlap issue with sticky inputs.

**Do not change:** PDF generation logic, form field mapping, profile auto-fill, tRPC calls.

---

### Empty States (All Pages)

Every empty state needs three elements:

```
[Illustration — 80px icon in a 120px muted circle]
[Title — text-lg font-semibold — what this page is for]
[CTA — primary button — the one thing to do from here]
```

No multiple CTAs. No long explanatory copy. One button, one next step.

Example for empty Roadmap:

```
[Map icon in teal-soft circle]
"Wala pa kaming roadmap para sa'yo"
[Button: "Makipag-chat para magsimula"]
```

---

## Visual Rules

### Gradient Usage — Tightened

Gradients are now limited to **three contexts only**:

1. Roadmap header (gradient-deep) — announces the journey
2. Completion/success banners (gradient-primary) — celebrates milestones
3. Onboarding welcome screen (gradient-soft) — warm first impression

Everything else uses flat color from the palette. No gradient borders, gradient chips, or gradient cards.

---

### Animation — Purposeful Only

Animations should communicate state, not perform:

```yaml
page-enter:     opacity 0→1, translateY 8px→0, duration 200ms ease-out
card-expand:    height auto, duration 250ms ease-in-out (use CSS grid trick)
step-complete:  checkmark scale 0→1, duration 150ms ease-out
loading-pulse:  opacity 0.4→1 (only on skeleton screens, not live content)
```

Remove: spinning loaders on content that has already loaded, bounce animations on static elements, hover animations on touch targets.

---

### Icons

* Use a single icon library consistently (Lucide, already in use)
* Size: `16px` inline, `20px` list items, `24px` section headers, `32px` hero/empty states
* Color: match text color of the context — don't use icon color as decoration
* Always pair with a text label on mobile — icon-only is only acceptable for the send button

---

## UX Philosophy — Revised

Designed for Filipinos navigating a government process for the first time:

* **Guided, not self-serve** — every screen tells the user what to do next
* **One thing at a time** — progressive disclosure over information density
* **Celebrate small wins** — "Natapos mo na ang unang hakbang" feels earned
* **Forgive mistakes** — editable fields, clear back navigation, no data loss on exit
* **Accessible under pressure** — 3G connections, bright sunlight, one-handed use

---

## Final Design Identity

NegosyoNav feels like:

> **A calm, steady guide who has done this a hundred times and knows you can do it too.**

Or simply:

> **Headspace meets your barangay hall.**

---
