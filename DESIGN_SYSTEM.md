# Modern Design System Documentation

## Overview

This document outlines the comprehensive design system that has been implemented across the SanctuaryBase application. The system provides a unified, premium, and professional design language with modern aesthetics and excellent accessibility.

---

## Table of Contents

1. [Color Palette](#color-palette)
2. [Typography](#typography)
3. [Spacing System](#spacing-system)
4. [Border Radius](#border-radius)
5. [Shadow System](#shadow-system)
6. [Animations & Transitions](#animations--transitions)
7. [Component Usage](#component-usage)
8. [Accessibility](#accessibility)

---

## Color Palette

### Design Token Files

- **design-tokens.css** - Comprehensive CSS custom properties (variables) for the entire system
- **style.css** - Global styles with backwards compatibility mappings

### Primary Colors

#### Dark Mode (Default)

```css
--color-brand: #FF7A45         /* Primary brand orange */
--color-success: #10B981       /* Success/positive state - emerald green */
--color-warning: #D97706       /* Warning/caution - amber */
--color-error: #EF4444         /* Error/destructive - red */
--color-info: #3B82F6          /* Info/neutral - blue */
--color-mint: #4EFFC5          /* Accent/secondary - cyan */
```

#### Background & Surface Colors

```css
/* Backgrounds - progressive depth */
--color-bg-0: #0F0820          /* Deepest (modals, overlays) */
--color-bg-1: #1A1033          /* Main background */
--color-bg-2: #22163F          /* Secondary (nav, headers) */
--color-bg-3: #2C1D52          /* Tertiary (subtle sections) */

/* Surfaces - interactive elements */
--color-surface-0: #1A1033     /* Base */
--color-surface-1: #2E1F5E     /* Default cards */
--color-surface-2: #3A2870     /* Hover states */
--color-surface-3: #442F82     /* Active states */
--color-surface-4: #4E3896     /* Pressed states */
```

#### Text Colors

```css
--color-text-primary: #FFFFFF              /* High contrast */
--color-text-secondary: rgba(255,255,255,.87) /* Secondary text */
--color-text-tertiary: rgba(255,255,255,.64)  /* Muted text */
--color-text-disabled: rgba(255,255,255,.38)  /* Disabled state */
```

#### Borders

```css
--color-border: rgba(255,255,255,.08)           /* Subtle */
--color-border-alt: rgba(255,255,255,.12)       /* Moderate */
--color-border-strong: rgba(255,255,255,.18)    /* Strong */
```

### Semantic Color Variations

Each color has light, dark, faint, and glow variants:

```css
--color-brand-light: #FF9966          /* Lighter shade */
--color-brand-dark: #E05A28           /* Darker shade */
--color-brand-faint: rgba(255,122,69,.12)    /* Background tint */
--color-brand-glow: rgba(255,122,69,.35)     /* Glow effect */
```

### Gradients

```css
--gradient-brand: linear-gradient(135deg, #FF7A45, #FF9966)
--gradient-brand-to-pink: linear-gradient(135deg, #FF7A45, #FF4F9A)
--gradient-success: linear-gradient(135deg, #10B981, #34D399)
--gradient-mint: linear-gradient(135deg, #4EFFC5, #1DC995)
--gradient-warning: linear-gradient(135deg, #D97706, #F59E0B)
--gradient-info: linear-gradient(135deg, #3B82F6, #60A5FA)
```

### Light Mode

Light mode provides inverted color schemes with adjusted contrast for clarity:

```css
[data-theme="light"] {
  --color-bg-1: #F4F1FF
  --color-surface-1: #FFFFFF
  /* ... and more adjustments for light backgrounds */
}
```

---

## Typography

### Font Families

```css
--font-family-primary: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
--font-family-display: 'Fredoka One', 'Nunito', sans-serif
```

### Font Sizes

A complete 10-step scale for flexible typography:

```css
--font-size-xs:    11px
--font-size-sm:    12px
--font-size-base:  13px
--font-size-lg:    14px
--font-size-xl:    15px
--font-size-2xl:   17px
--font-size-3xl:   20px
--font-size-4xl:   24px
--font-size-5xl:   28px
--font-size-6xl:   32px
```

### Font Weights

```css
--font-weight-light:      300
--font-weight-normal:     400
--font-weight-medium:     500
--font-weight-semibold:   600
--font-weight-bold:       700
--font-weight-extrabold:  800
--font-weight-black:      900
```

### Line Heights

```css
--line-height-tight:   1.25
--line-height-normal:  1.5
--line-height-relaxed: 1.65
--line-height-loose:   1.8
```

### Letter Spacing

```css
--letter-spacing-tight:  -0.01em
--letter-spacing-normal: 0em
--letter-spacing-loose:  0.04em
--letter-spacing-extra:  0.08em
```

### Usage Examples

```html
<!-- Large heading -->
<h1 style="font-size: var(--font-size-5xl); font-weight: var(--font-weight-black);">Title</h1>

<!-- Body text with CSS class utilities -->
<p class="text-lg text-secondary">Secondary text</p>

<!-- Utility classes -->
<p class="text-bold text-error">Error message</p>
```

---

## Spacing System

A consistent 2px base unit creating a predictable scale:

```css
--space-0:  0px
--space-1:  2px
--space-2:  4px
--space-3:  8px
--space-4:  12px
--space-5:  16px
--space-6:  20px
--space-7:  24px
--space-8:  28px
--space-9:  32px
--space-10: 40px
--space-11: 48px
--space-12: 56px
--space-13: 64px
--space-14: 80px
--space-15: 96px
```

### Common Combinations

```css
--padding-xs:  var(--space-2)   /* 4px */
--padding-sm:  var(--space-3)   /* 8px */
--padding-md:  var(--space-5)   /* 16px */
--padding-lg:  var(--space-7)   /* 24px */
--padding-xl:  var(--space-9)   /* 32px */
--padding-2xl: var(--space-11)  /* 48px */

--gap-xs: var(--space-2)        /* 4px */
--gap-sm: var(--space-3)        /* 8px */
--gap-md: var(--space-5)        /* 16px */
--gap-lg: var(--space-7)        /* 24px */
--gap-xl: var(--space-9)        /* 32px */
```

### Usage Examples

```html
<!-- Using spacing utilities -->
<div class="p-lg gap-md">Padded container with medium gap</div>
<div class="px-lg py-md">Horizontal lg, vertical md padding</div>

<!-- Using custom properties directly -->
<div style="padding: var(--padding-lg); gap: var(--gap-md);">Container</div>

<!-- Margin utilities -->
<div class="m-lg">All margins</div>
```

---

## Border Radius

Modern, refined radius values (not too sharp, not too rounded):

```css
--radius-none:  0px
--radius-sm:    6px
--radius-md:    10px    /* Default for most elements */
--radius-lg:    14px    /* Cards, modals */
--radius-xl:    18px    /* Large sections */
--radius-2xl:   24px    /* Full-page modals, drawers */
--radius-full:  9999px  /* Fully rounded (badges, avatars) */

/* Legacy compatibility */
--r:   var(--radius-md)
--rl:  var(--radius-lg)
--rxl: var(--radius-xl)
```

### Usage Examples

```css
/* Buttons */
border-radius: var(--radius-md);

/* Cards */
border-radius: var(--radius-lg);

/* Modal drawers */
border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;

/* Badges, pills */
border-radius: var(--radius-full);
```

---

## Shadow System

A sophisticated layered shadow system for depth perception:

```css
/* Layered shadows - sm to 2xl */
--shadow-xs:  0 1px 2px rgba(0,0,0,.12)
--shadow-sm:  0 2px 8px rgba(0,0,0,.24)
--shadow-md:  0 4px 16px rgba(0,0,0,.32)
--shadow-lg:  0 8px 32px rgba(0,0,0,.4)  /* Default card shadow */
--shadow-xl:  0 12px 48px rgba(0,0,0,.48) /* Elevated state */
--shadow-2xl: 0 16px 64px rgba(0,0,0,.55) /* Modal state */

/* Glow effects for interactive elements */
--shadow-glow-brand:  0 0 16px rgba(255,122,69,.35), ...
--shadow-glow-mint:   0 0 16px rgba(78,255,197,.3), ...
--shadow-glow-success: 0 0 16px rgba(16,185,129,.25)
--shadow-glow-warning: 0 0 16px rgba(217,119,6,.25)
--shadow-glow-error:   0 0 16px rgba(239,68,68,.25)

/* Focus state shadow */
--shadow-focus: 0 0 0 3px rgba(78,255,197,.2)
```

### Shadow Hierarchy

- **--shadow-xs**: Text, icons on hover
- **--shadow-sm**: Subtle elevation (buttons, small cards)
- **--shadow-md**: Default cards, form inputs on focus
- **--shadow-lg**: Elevated cards, tooltips
- **--shadow-xl**: Important modals, popovers
- **--shadow-2xl**: Full-page overlays, important dialogs

### Usage Examples

```css
/* Card on hover */
box-shadow: var(--shadow-lg);

/* Interactive element */
box-shadow: var(--shadow-glow-mint);

/* Focused input */
box-shadow: var(--shadow-focus);

/* Stacked effects */
box-shadow: var(--shadow-glow-brand), var(--shadow-md);
```

---

## Animations & Transitions

### Timing

```css
--duration-fast:   150ms
--duration-normal: 300ms
--duration-slow:   500ms
```

### Easing Functions

```css
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)   /* Smooth, natural */
--ease-out:    cubic-bezier(0, 0, 0.2, 1)     /* Enter animations */
--ease-in:     cubic-bezier(0.4, 0, 1, 1)     /* Exit animations */
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55) /* Bounce effect */
```

### Built-in Animations

```css
@keyframes fadeIn    /* Opacity from 0 to 1 */
@keyframes slideUp   /* Translate Y from 100% to 0 */
@keyframes slideDown /* Translate Y from -100% to 0 */
@keyframes slideLeft /* Translate X from 100% to 0 */
@keyframes scaleIn   /* Scale from 0.95 to 1 */
@keyframes bounce    /* Y axis bounce */
@keyframes pulse     /* Opacity pulse */
@keyframes glow      /* Shadow intensity pulse */
@keyframes spin      /* 360° rotation */
```

### Vue Transition Classes

```html
<!-- Fade -->
<Transition name="fade">
  <div v-if="visible">Fades in/out</div>
</Transition>

<!-- Slide up -->
<Transition name="slide-up">
  <div v-if="visible">Slides up from bottom</div>
</Transition>

<!-- Scale -->
<Transition name="scale">
  <div v-if="visible">Scales in from center</div>
</Transition>
```

### Animation Utilities

```html
<!-- Spinning loader -->
<div class="spinning">Loading...</div>

<!-- Pulsing element -->
<div class="pulsing">Pulsing indicator</div>

<!-- Glowing element -->
<div class="glowing">Highlighted element</div>
```

---

## Component Usage

### Buttons

```vue
<!-- Primary button (teal gradient) -->
<AppButton variant="primary" size="md" @click="action">
  Click Me
</AppButton>

<!-- Brand button (orange gradient) -->
<AppButton variant="brand" size="lg">
  Brand Action
</AppButton>

<!-- Secondary button (surface) -->
<AppButton variant="secondary" size="sm">
  Secondary
</AppButton>

<!-- Danger button (red outline) -->
<AppButton variant="danger">
  Delete
</AppButton>

<!-- Ghost button (minimal) -->
<AppButton variant="ghost">
  Minimal
</AppButton>

<!-- Loading state -->
<AppButton :loading="isLoading">
  Submit
</AppButton>
```

### Cards

```vue
<!-- Default card -->
<AppCard title="Card Title">
  <p>Card content goes here</p>
</AppCard>

<!-- Elevated variant -->
<AppCard title="Important Card" variant="elevated">
  <p>More prominent card</p>
</AppCard>

<!-- Outlined variant -->
<AppCard title="Outlined" variant="outlined">
  <p>Border-focused design</p>
</AppCard>

<!-- Gradient variant -->
<AppCard title="Gradient" variant="gradient">
  <p>With subtle gradient background</p>
</AppCard>

<!-- Interactive card -->
<AppCard variant="default" interactive @click="openDetail">
  <p>Clickable card</p>
</AppCard>

<!-- With footer -->
<AppCard title="With Footer">
  <p>Main content</p>
  <template #footer>
    <button>Action 1</button>
    <button>Action 2</button>
  </template>
</AppCard>

<!-- No padding (full-bleed content) -->
<AppCard no-pad>
  <img src="image.jpg" style="width: 100%; border-radius: 14px 14px 0 0;">
</AppCard>
```

### Alert Boxes

```html
<!-- Success -->
<div class="success-box">
  ✓ Operation completed successfully
</div>

<!-- Warning -->
<div class="warn-box">
  ⚠ This action cannot be undone
</div>

<!-- Error -->
<div class="danger-box">
  ✕ An error occurred
</div>

<!-- Info -->
<div class="info-box">
  ℹ Important information
</div>
```

### Badges

```html
<!-- Volunteer badge -->
<span class="badge badge-vol">Volunteer</span>

<!-- Admin badge -->
<span class="badge badge-adm">Admin</span>

<!-- Priority badges -->
<span class="badge badge-high">High</span>
<span class="badge badge-med">Medium</span>
<span class="badge badge-low">Low</span>
```

### Typography

```html
<!-- Headings - all use display font -->
<h1>Page Title</h1>
<h2>Section Heading</h2>
<h3>Subsection</h3>

<!-- Text utilities -->
<p class="text-lg text-secondary">Secondary text</p>
<p class="text-bold text-error">Error message</p>

<!-- Text colors -->
<p class="text-brand">Brand text</p>
<p class="text-success">Success text</p>
<p class="text-warning">Warning text</p>
<p class="text-error">Error text</p>
<p class="text-info">Info text</p>
```

### Forms

```html
<!-- Input fields get automatic styling -->
<input type="text" placeholder="Type something...">

<!-- Focus states automatically apply teal border + glow shadow -->
<input type="email" value="user@example.com">

<!-- Select with custom arrow -->
<select>
  <option>Select an option</option>
</select>

<!-- Textarea -->
<textarea placeholder="Enter your message"></textarea>
```

---

## Accessibility

### WCAG Compliance

- **Contrast Ratios**: All color combinations meet WCAG AA+ standards
- **Focus States**: All interactive elements have visible focus indicators with shadow elevation
- **Motion**: All animations respect `prefers-reduced-motion` media query
- **Dark Mode**: Dark mode is default with full light mode support

### Focus Management

All buttons, links, and interactive elements automatically receive:

```css
--shadow-focus: 0 0 0 3px rgba(78,255,197,.2)
```

This creates a visible teal ring around focused elements.

### Reduced Motion

Users with `prefers-reduced-motion: reduce` automatically get:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### High Contrast Mode

For users with `prefers-contrast: more`:

```css
@media (prefers-contrast: more) {
  :root {
    --color-text-secondary: rgba(255,255,255,.95);
    --color-text-tertiary: rgba(255,255,255,.75);
    --color-border-strong: rgba(255,255,255,.25);
  }
}
```

### Semantic HTML

Always use semantic HTML for better accessibility:

```html
<!-- Good -->
<button class="btn btn-primary">Click</button>
<nav class="bottom-nav">...</nav>
<section class="page">...</section>

<!-- Avoid -->
<div class="btn" role="button">Click</div>
```

---

## Theme Switching

The design system supports both dark and light modes. Switch themes via the UI store:

```javascript
import { useUIStore } from '@/stores/ui'

const ui = useUIStore()
ui.isDarkMode = false  // Switch to light mode
```

The theme is persisted in localStorage and applied to the document:

```javascript
document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light')
```

---

## Best Practices

### Do's ✓

1. **Use design tokens** instead of hardcoded values
2. **Leverage gradients** for premium feel on primary actions
3. **Stack shadows** for important interactive elements
4. **Animate on hover** for feedback
5. **Use semantic colors** (success, warning, error) for status
6. **Maintain whitespace** using spacing scale

### Don'ts ✗

1. **Don't hardcode colors** - use CSS variables
2. **Don't mix border radius styles** - use the scale
3. **Don't skip animations** - use var(--duration-*) and var(--ease-*)
4. **Don't ignore focus states** - they're essential for accessibility
5. **Don't override shadows** - use the system shadows
6. **Don't break the spacing scale** - it maintains rhythm

---

## Migration Guide

### From Old to New Token Names

| Old Token | New Token | Purpose |
|-----------|-----------|---------|
| `--bg` | `--color-bg-1` | Main background |
| `--surface` | `--color-surface-1` | Default card surface |
| `--ink` | `--color-text-primary` | Primary text |
| `--brand` | `--color-brand` | Brand color |
| `--mint` | `--color-mint` | Accent color |
| `--glow-brand` | `--shadow-glow-brand` | Brand glow effect |

All old tokens are mapped to new ones for backwards compatibility, but new code should use the new names.

---

## Files Reference

- **src/design-tokens.css** - All CSS custom properties
- **src/style.css** - Global styles, animations, utilities
- **src/components/ui/AppButton.vue** - Button component with variants
- **src/components/ui/AppCard.vue** - Card component with variants
- **DESIGN_SYSTEM.md** - This documentation

---

## Questions or Issues?

When building new components:

1. Check if the token/color already exists
2. Use CSS variables, not hardcoded values
3. Follow the spacing scale
4. Add appropriate animations/transitions
5. Test with both dark and light modes
6. Verify accessibility with keyboard navigation and screen readers
