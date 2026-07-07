# Design System Quick Reference

A quick guide to the most commonly used design tokens and components.

## Color Palette at a Glance

### Semantic Colors (Dark Mode)

```
Brand    #FF7A45  ●●●●●●●●●●  Orange gradient actions
Success  #10B981  ●●●●●●●●●●  Green for positive states
Warning  #D97706  ●●●●●●●●●●  Amber for caution
Error    #EF4444  ●●●●●●●●●●  Red for destructive actions
Info     #3B82F6  ●●●●●●●●●●  Blue for information
Mint     #4EFFC5  ●●●●●●●●●●  Cyan for accent highlights
```

### Background Hierarchy

```
--color-bg-0       #0F0820  ← Deepest (modals)
--color-bg-1       #1A1033  ← Main background
--color-bg-2       #22163F  ← App bar, bottom nav
--color-bg-3       #2C1D52  ← Subtle sections
```

### Surface States

```
--color-surface-0  #1A1033  ← Base
--color-surface-1  #2E1F5E  ← Default cards (hover)
--color-surface-2  #3A2870  ← Hover state
--color-surface-3  #442F82  ← Active/focused
--color-surface-4  #4E3896  ← Pressed state
```

---

## Typography Quick Guide

### Headings

```
h1: 28px, weight 900, display font  → Page titles
h2: 24px, weight 800, display font  → Section headings
h3: 20px, weight 700, display font  → Subsections
h4: 17px, weight 700                → Small headings
h5: 15px, weight 600                → Labels
h6: 14px, weight 600                → Small labels
```

### Body Text

```
Base:      13px, weight 400         → Default body text
Secondary: 13px, weight 400 (87%)   → Secondary text
Tertiary:  13px, weight 400 (64%)   → Muted/meta text
Disabled:  13px, weight 400 (38%)   → Disabled state
```

### Text Utilities

```html
<p class="text-bold">Bold text</p>
<p class="text-semibold">Semibold text</p>
<p class="text-xs">Extra small</p>
<p class="text-lg">Large text</p>
<p class="text-error">Error message</p>
<p class="text-success">Success message</p>
```

---

## Spacing Scale

Use this 2px-based scale consistently:

```
xs:   4px    (space-2)
sm:   8px    (space-3)
md:  16px    (space-5)   ← Most common
lg:  24px    (space-7)   ← Cards, sections
xl:  32px    (space-9)
2xl: 48px    (space-11)
```

### Usage Patterns

```css
/* Padding */
padding: var(--padding-md);      /* 16px */
padding-x: var(--padding-lg);    /* 24px left/right */
padding-top: var(--padding-sm);  /* 8px top */

/* Gaps */
gap: var(--gap-md);              /* 16px between items */

/* Margins */
margin-bottom: var(--space-5);   /* 16px bottom */
```

---

## Border Radius

```
sm:   6px   → Small buttons, inputs
md:  10px   → Default buttons, cards
lg:  14px   ← Most cards and modals
xl:  18px   → Large sections
2xl: 24px   → Full-page modals
full: 9999px → Badges, avatars
```

---

## Shadow Hierarchy

```
xs:  Subtle (text hover)
sm:  Light (button hover)
md:  ← Cards default
lg:  ← Cards hover
xl:  ← Elevated modals
2xl: ← Important overlays
```

### Glow Effects

```css
--shadow-glow-brand:  Orange brand glow
--shadow-glow-mint:   Cyan accent glow
--shadow-glow-success: Green glow
--shadow-glow-warning: Amber glow
--shadow-glow-error:   Red glow
```

---

## Animations

### Timing

```
fast:   150ms  → Quick feedback
normal: 300ms  ← Most animations
slow:   500ms  → Subtle/background
```

### Built-in Transitions

```css
transition: all var(--duration-fast) var(--ease-out);
```

### Common Animations

```
fadeIn   → Opacity 0 → 1
slideUp  → Bottom to top
slideDown → Top to bottom
scaleIn  → Center scale
bounce   → Bounce effect
pulse    → Opacity pulse
```

---

## Component Quick Snippets

### Button Variants

```vue
<!-- Primary (teal gradient) - Main CTAs -->
<AppButton variant="primary" size="md">Submit</AppButton>

<!-- Brand (orange gradient) - Brand actions -->
<AppButton variant="brand">Brand Action</AppButton>

<!-- Secondary (surface) - Default button -->
<AppButton variant="secondary">Cancel</AppButton>

<!-- Danger (red outline) - Destructive -->
<AppButton variant="danger">Delete</AppButton>

<!-- Ghost (minimal) - Subtle actions -->
<AppButton variant="ghost">Learn More</AppButton>
```

### Button Sizes

```vue
<AppButton size="sm">Small</AppButton>    <!-- 12px, 7x12px -->
<AppButton size="md">Medium</AppButton>   <!-- 13px, 10x16px (default) -->
<AppButton size="lg">Large</AppButton>    <!-- 16px, 16x28px -->
```

### Card Variants

```vue
<!-- Default - Standard card -->
<AppCard title="Standard Card">Content</AppCard>

<!-- Elevated - More prominent -->
<AppCard title="Elevated" variant="elevated">Content</AppCard>

<!-- Outlined - Border focused -->
<AppCard title="Outlined" variant="outlined">Content</AppCard>

<!-- Gradient - Subtle background tint -->
<AppCard title="Gradient" variant="gradient">Content</AppCard>

<!-- Interactive - Clickable -->
<AppCard interactive @click="action">Content</AppCard>
```

### Alert Boxes

```html
<div class="success-box">✓ Success message</div>
<div class="warn-box">⚠ Warning message</div>
<div class="danger-box">✕ Error message</div>
<div class="info-box">ℹ Information message</div>
```

### Badges

```html
<span class="badge badge-vol">Volunteer</span>
<span class="badge badge-adm">Admin</span>
<span class="badge badge-high">High</span>
<span class="badge badge-med">Medium</span>
<span class="badge badge-low">Low</span>
```

---

## Interactive States

### Hover States (All Interactive Elements)

```css
/* Standard button hover */
transform: translateY(-2px);        /* Lift up */
box-shadow: var(--shadow-lg);       /* Elevation */

/* Card hover */
transform: translateY(-4px);        /* More lift */
box-shadow: var(--shadow-xl);       /* Higher elevation */

/* With glow hover */
filter: brightness(1.12);           /* Brighten */
box-shadow: var(--shadow-glow-*), var(--shadow-md);
```

### Focus States (Accessibility)

All interactive elements show:
```css
box-shadow: 0 0 0 3px rgba(78,255,197,.2);  /* Teal ring */
```

### Active/Pressed States

```css
transform: scale(0.97);             /* Slight scale down */
filter: brightness(0.95);           /* Darken slightly */
```

---

## Themes

### Dark Mode (Default)

```javascript
ui.isDarkMode = true
// document.documentElement has [data-theme="dark"]
```

### Light Mode

```javascript
ui.isDarkMode = false
// document.documentElement has [data-theme="light"]
```

Colors automatically adjust via CSS:

```css
:root { /* dark mode */ }
[data-theme="light"] { /* light mode overrides */ }
```

---

## Common Patterns

### Full-Width Button

```vue
<AppButton variant="primary" size="lg" style="width: 100%">
  Submit Form
</AppButton>
```

### Horizontal Button Group

```html
<div style="display: flex; gap: var(--gap-md);">
  <AppButton variant="secondary">Cancel</AppButton>
  <AppButton variant="primary">Confirm</AppButton>
</div>
```

### Section with Alert

```vue
<div class="page">
  <div class="sec-label">Settings Section</div>
  <div class="warn-box">Changing these settings affects your account</div>
  <AppCard title="Settings">...</AppCard>
</div>
```

### Stat Card Highlight

```vue
<div class="stat">
  <div class="stat-n">{{ count }}</div>
  <div class="stat-l">Items</div>
</div>
```

---

## Accessibility Features Built-in

✓ **WCAG AA+ Contrast** - All colors tested for readability  
✓ **Focus Indicators** - Teal shadow ring on all interactive elements  
✓ **Reduced Motion Support** - Respects `prefers-reduced-motion`  
✓ **High Contrast Mode** - Supports `prefers-contrast: more`  
✓ **Dark Mode Default** - Can toggle to light mode  
✓ **Semantic HTML** - All components use proper HTML semantics  

---

## Performance Tips

1. **Use CSS variables** - They're performant and enable dynamic theming
2. **Reuse classes** - `.text-lg`, `.p-md`, etc. reduce CSS size
3. **Leverage transitions** - Use `var(--duration-fast)` consistently
4. **Stack shadows** - Multiple shadows enhance depth without extra elements
5. **Minimize overrides** - Design system covers 95% of use cases

---

## Design System Files

```
src/
  ├── design-tokens.css          ← All CSS variables
  ├── style.css                  ← Global styles & animations
  └── components/ui/
      ├── AppButton.vue          ← Button component
      ├── AppCard.vue            ← Card component
      └── ...other components
```

---

## Getting Help

- **Color Question?** Check the semantic color table above
- **Spacing Question?** Use the spacing scale (xs, sm, md, lg, xl, 2xl)
- **Shadow Question?** Use the shadow hierarchy (xs through 2xl)
- **New Component?** Start with a card or button as reference
- **Full Details?** See DESIGN_SYSTEM.md

---

## Common Mistakes to Avoid

❌ Hardcoding colors like `#FF7A45`  
✅ Use `var(--color-brand)` instead

❌ Custom spacing like `padding: 23px`  
✅ Use `padding: var(--padding-lg)` (24px)

❌ Custom shadows  
✅ Use `box-shadow: var(--shadow-lg)`

❌ Ignoring focus states  
✅ Add `box-shadow: var(--shadow-focus)` to interactive elements

❌ Different border radius everywhere  
✅ Use the 6 standard values (sm through full)

---

## Quick CSS Template

Copy this for new components:

```vue
<style scoped>
.my-component {
  background: var(--color-surface-1);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-lg);
  padding: var(--padding-lg);
  box-shadow: var(--shadow-md);
  transition: all var(--duration-fast);
  gap: var(--gap-md);
}

.my-component:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.my-component--active {
  border-color: var(--color-mint);
  box-shadow: var(--shadow-glow-mint);
}

/* Responsive or state variants */
.my-component--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
```

---

Last updated: 2025-06-28  
Design System Version: 2.0
