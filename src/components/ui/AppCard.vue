<template>
  <div class="app-card" :class="[`app-card--${variant}`, { 'app-card--no-pad': noPad, 'app-card--flat': flat, 'app-card--interactive': interactive }]">
    <!-- Header section with background -->
    <div v-if="title || $slots.header" class="app-card__header">
      <slot name="header">
        <div class="app-card__title">{{ title }}</div>
      </slot>
    </div>
    <!-- Main content -->
    <div :class="{ 'app-card__content': title || $slots.header }">
      <slot />
    </div>
    <!-- Footer section -->
    <div v-if="$slots.footer" class="app-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title:       String,
  variant:     { type: String, default: 'default' }, // 'default' | 'elevated' | 'outlined' | 'gradient'
  noPad:       Boolean,   // removes padding (for full-bleed content)
  flat:        Boolean,   // no hover lift
  interactive: Boolean,   // adds hover/active states
})
</script>

<style scoped>
.app-card {
  background: var(--color-surface-1);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  position: relative;
  transition: all var(--duration-normal) var(--ease-out);
}

/* Gradient top stripe accent */
.app-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--gradient-mint);
  opacity: 0.8;
  transition: opacity var(--duration-fast), height var(--duration-normal);
  z-index: 1;
}

/* Default variant */
.app-card--default {
  padding: var(--space-7);
}

.app-card--default:not(.app-card--flat):hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
  border-color: var(--color-border-alt);
}

.app-card--default:not(.app-card--flat):hover::before {
  opacity: 1;
}

/* Elevated variant - stronger shadow */
.app-card--elevated {
  padding: var(--space-7);
  box-shadow: var(--shadow-lg);
}

.app-card--elevated:not(.app-card--flat):hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-2xl);
  border-color: var(--color-border-alt);
}

.app-card--elevated:not(.app-card--flat):hover::before {
  opacity: 1;
  height: 4px;
}

/* Outlined variant - thicker border */
.app-card--outlined {
  padding: var(--space-7);
  border: 1.5px solid var(--color-border-strong);
  box-shadow: var(--shadow-xs);
}

.app-card--outlined:not(.app-card--flat):hover {
  border-color: var(--color-mint);
  transform: translateY(-2px);
  box-shadow: var(--shadow-glow-mint);
}

.app-card--outlined:not(.app-card--flat):hover::before {
  opacity: 1;
}

/* Gradient variant - colored background */
.app-card--gradient {
  padding: var(--space-7);
  background: var(--gradient-bg-subtle);
  border: 1px solid var(--color-mint-faint);
}

.app-card--gradient:not(.app-card--flat):hover {
  transform: translateY(-4px);
  background: linear-gradient(135deg, var(--color-surface-1) 0%, var(--color-mint-faint) 100%);
  box-shadow: var(--shadow-lg), var(--shadow-glow-mint);
  border-color: var(--color-mint);
}

.app-card--gradient:not(.app-card--flat):hover::before {
  opacity: 1;
}

/* Interactive variant - clickable cards */
.app-card--interactive {
  cursor: pointer;
  user-select: none;
}

.app-card--interactive:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
}

.app-card--interactive:active {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* Header section with background */
.app-card__header {
  padding: var(--space-5) var(--space-7);
  background: var(--gradient-bg-subtle);
  border-bottom: 1px solid var(--color-border);
  margin: -24px -24px var(--space-5) -24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.app-card--default .app-card__header {
  margin: calc(var(--space-7) * -1) calc(var(--space-7) * -1) var(--space-5) calc(var(--space-7) * -1);
}

.app-card--no-pad .app-card__header {
  margin: 0 0 var(--space-5) 0;
}

.app-card__title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-extra);
  margin: 0;
  flex: 1;
}

.app-card__content {
  display: flex;
  flex-direction: column;
  gap: var(--gap-md);
}

/* Footer section */
.app-card__footer {
  padding: var(--space-5) var(--space-7);
  border-top: 1px solid var(--color-border);
  margin: var(--space-5) calc(var(--space-7) * -1) calc(var(--space-7) * -1) calc(var(--space-7) * -1);
  background: var(--color-bg-3);
  display: flex;
  gap: var(--gap-md);
  align-items: center;
}

.app-card--no-pad {
  padding: 0;
}

.app-card--no-pad .app-card__footer {
  margin: var(--space-5) 0 0 0;
}

.app-card--flat {
  box-shadow: var(--shadow-sm);
}

.app-card--flat::before {
  opacity: 0.5;
}

.app-card--flat:hover {
  box-shadow: var(--shadow-md);
}

/* Smooth transitions for accessibility */
@media (prefers-reduced-motion: reduce) {
  .app-card {
    transition: none;
  }

  .app-card::before {
    transition: none;
  }
}
</style>
