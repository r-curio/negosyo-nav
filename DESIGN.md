---

## name: NegosyoNav Core

# NegosyoNav Design System — Soft Analytics UI

---

## 🎯 Brand Direction

NegosyoNav follows a **Soft Analytics UI** approach — a modern SaaS-inspired system tailored for Filipino micro-entrepreneurs.

It blends:

* **Clean fintech UI (Stripe-like clarity)**
* **Soft depth and card-based layouts**
* **Gradient-driven highlights**
* **Accessible, MSME-friendly UX**

Personality:

> A **Digital Kapitbahay** that feels *smart, modern, and approachable* — not bureaucratic, not intimidating.

---

## 🎨 Color System

### Philosophy

* Neutral base UI
* Gradients used **sparingly for emphasis**
* Blue = trust, Teal = energy, Dark = depth

---

### Core Palette

```yaml
background: #f8fafc
surface: #ffffff
surface-muted: #f1f5f9
surface-subtle: #f8fafc

border: #e2e8f0
border-soft: #eef2f7

text-primary: #0f172a
text-secondary: #475569
text-muted: #94a3b8
```

---

### Brand Colors

```yaml
primary: #293ff5
primary-hover: #1f2fd1
primary-soft: #e0e7ff

accent: #01dbca
accent-soft: #ccfbf7

neutral-dark: #141d3a
white: #ffffff
```

---

### Gradient System (Key Identity)

```yaml
gradient-primary: linear-gradient(135deg, #01dbca, #293ff5)
gradient-deep: linear-gradient(135deg, #293ff5, #141d3a)
gradient-soft: linear-gradient(135deg, #ffffff, #e6fefe)
```

---

### Semantic Colors

```yaml
success: #16a34a
warning: #f59e0b
error: #dc2626
info: #0ea5e9
```

---

## 🔤 Typography

### Font Family

* Primary: **Plus Jakarta Sans**
* Fallback: **Noto Sans Filipino**

---

### Scale

```yaml
headline-lg:
  fontSize: 28px
  fontWeight: 700
  lineHeight: 36px

headline-md:
  fontSize: 24px
  fontWeight: 600
  lineHeight: 32px

headline-sm:
  fontSize: 20px
  fontWeight: 600
  lineHeight: 28px

body-lg:
  fontSize: 16px
  fontWeight: 500
  lineHeight: 24px

body-md:
  fontSize: 14px
  fontWeight: 400
  lineHeight: 22px

label-md:
  fontSize: 13px
  fontWeight: 500
  lineHeight: 18px

label-sm:
  fontSize: 12px
  fontWeight: 500
  lineHeight: 16px
```

---

### Rules

* Minimum weight: **400**
* Avoid oversized body text
* Use **weight + spacing** for hierarchy, not just size
* Optimize for **Taglish readability**

---

## 📐 Layout & Spacing

### Principles

* Airy and uncluttered
* Grid-based layout
* Clear visual hierarchy

---

### Spacing System

```yaml
base-unit: 4px

stack-xs: 4px
stack-sm: 8px
stack-md: 16px
stack-lg: 24px
stack-xl: 32px
```

---

### Containers

```yaml
edge-padding: 16px - 20px
card-padding: 16px - 20px
```

---

### Touch Targets

```yaml
minimum: 44px
preferred: 48px - 56px
```

---

## 🧱 Elevation & Depth

### Philosophy

* No heavy shadows
* No hard neumorphism
* Depth through layering

---

### Card Style

```yaml
background: #ffffff
border: 1px solid #e2e8f0
shadow: 0 1px 2px rgba(0,0,0,0.04)
radius: 14px
```

---

### Hover State

```yaml
shadow: 0 4px 12px rgba(0,0,0,0.06)
```

---

### Optional Frosted Layer

```yaml
background: rgba(255,255,255,0.8)
backdrop-blur: sm
```

---

## 🔷 Shapes

```yaml
radius-sm: 6px
radius-md: 10px
radius-lg: 14px
radius-xl: 20px
radius-full: 9999px
```

---

### Usage

* Cards: 14–16px
* Buttons: 10–14px
* Chips: full radius

---

## 🧩 Components

---

### Buttons

**Primary**

* Solid: `#293ff5`
* Optional: gradient for emphasis
* Text: white
* Height: 48–56px

**Secondary**

* Light background + border

**Ghost**

* Text-only

---

### Cards (Negosyo Container)

```yaml
background: white
border: soft
radius: 14px
padding: 16–20px
```

Optional enhancements:

* Gradient header
* Icon highlight
* Data preview

---

### Data Blocks (Analytics UI)

Used for:

* Sales tracking
* Insights
* Progress

Elements:

* Charts
* Bars
* Trend indicators

---

### Inputs

```yaml
height: 48–56px
radius: 10px
background: #f1f5f9
border: transparent
focus-ring: #293ff5
```

Rules:

* Always visible labels
* No heavy borders

---

### Chips & Badges

```yaml
neutral: gray background
active: blue soft background
success: green tint
accent: teal tint
```

---

### Lists

* 16px vertical padding
* Subtle bottom divider
* Minimum 48px tap area

---

## ✨ Visual Rules

### Gradient Usage

Use ONLY for:

* Hero sections
* Feature highlights
* CTA emphasis

Avoid:

* Full backgrounds
* Forms
* Dense content areas

---

### Layout Behavior

* Prefer **grid over horizontal scroll**
* Stable, readable UI
* Avoid carousel-heavy interactions

---

### Icons & Graphics

* Soft, slightly dimensional
* Minimal but not outline-only
* Avoid sharp edges

---

## 🧠 UX Philosophy

Designed for MSMEs:

* Visual-first, not text-heavy
* Cards over complex forms
* Clear primary actions
* Friendly but not childish

---

## 🔥 Final Design Identity

NegosyoNav feels like:

> **“Modern fintech intelligence with a local, human touch”**

Or simply:

> **Stripe meets Barangay**

---
