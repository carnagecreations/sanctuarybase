<template>
  <button
    class="app-btn"
    :class="[`app-btn--${variant}`, `app-btn--${size}`, { 'app-btn--disabled': disabled, 'app-btn--loading': loading }]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="app-btn__spinner"></span>
    <slot v-else />
  </button>
</template>

<script setup>
defineProps({
  // 'primary' (mint) | 'secondary' (surface) | 'brand' (orange) | 'danger' (coral) | 'ghost'
  variant:  { type: String, default: 'secondary' },
  // 'sm' | 'md' | 'lg'
  size:     { type: String, default: 'md' },
  disabled: Boolean,
  loading:  Boolean,
})
defineEmits(['click'])
</script>

<style scoped>
.app-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--gap-md);
  font-family: var(--font-family-primary);
  font-weight: var(--font-weight-bold);
  border-radius: var(--radius-md);
  cursor: pointer;
  border: none;
  transition: all var(--duration-fast) var(--ease-out);
  white-space: nowrap;
  font-size: var(--font-size-base);
  position: relative;
  overflow: hidden;
  user-select: none;
  outline: none;
}

.app-btn:active {
  transform: scale(0.97);
}

.app-btn:focus-visible {
  box-shadow: var(--shadow-focus);
}

.app-btn--primary:focus-visible {
  box-shadow: var(--shadow-glow-mint), var(--shadow-focus);
}

.app-btn--brand:focus-visible {
  box-shadow: var(--shadow-glow-brand), var(--shadow-focus);
}

/* Sizes */
.app-btn--lg {
  padding: var(--space-5) var(--space-7);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-extrabold);
}

.app-btn--md {
  padding: var(--space-4) var(--space-6);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
}

.app-btn--sm {
  padding: var(--space-3) var(--space-4);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
}

/* Primary variant - mint/teal gradient with glow */
.app-btn--primary {
  background: var(--gradient-mint);
  color: #0A1F18;
  box-shadow: var(--shadow-glow-mint);
  font-weight: var(--font-weight-bold);
}

.app-btn--primary:hover {
  filter: brightness(1.12);
  transform: translateY(-2px);
  box-shadow: var(--shadow-glow-mint), var(--shadow-md);
}

.app-btn--primary:active {
  filter: brightness(0.95);
  transform: translateY(0);
  box-shadow: var(--shadow-glow-mint), var(--shadow-xs);
}

/* Secondary variant - surface with subtle depth */
.app-btn--secondary {
  background: var(--color-surface-2);
  border: 1.5px solid var(--color-border-strong);
  color: var(--color-text-secondary);
  transition: all var(--duration-fast);
}

.app-btn--secondary:hover {
  background: var(--color-surface-3);
  border-color: var(--color-border-alt);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.app-btn--secondary:active {
  transform: translateY(0);
  box-shadow: var(--shadow-xs);
}

/* Brand variant - orange gradient */
.app-btn--brand {
  background: var(--gradient-brand-to-pink);
  color: #fff;
  box-shadow: var(--shadow-glow-brand);
  font-weight: var(--font-weight-bold);
}

.app-btn--brand:hover {
  filter: brightness(1.12);
  transform: translateY(-2px);
  box-shadow: var(--shadow-glow-brand), var(--shadow-md);
}

.app-btn--brand:active {
  filter: brightness(0.95);
  transform: translateY(0);
  box-shadow: var(--shadow-glow-brand), var(--shadow-xs);
}

/* Danger variant - red/coral styling */
.app-btn--danger {
  background: transparent;
  border: 1.5px solid var(--color-error);
  color: var(--color-error-light);
  transition: all var(--duration-fast);
}

.app-btn--danger:hover {
  background: var(--color-error-faint);
  border-color: var(--color-error);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.app-btn--danger:active {
  transform: translateY(0);
  box-shadow: var(--shadow-xs);
}

/* Ghost variant - minimal styling */
.app-btn--ghost {
  background: transparent;
  border: 1px solid transparent;
  color: var(--color-text-secondary);
  transition: all var(--duration-fast);
}

.app-btn--ghost:hover {
  background: var(--color-surface-1);
  border-color: var(--color-border-strong);
  transform: translateY(-1px);
}

.app-btn--ghost:active {
  background: var(--color-surface-2);
  transform: translateY(0);
}

/* Disabled state */
.app-btn--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
  transform: none !important;
}

/* Loading spinner animation */
.app-btn--loading {
  pointer-events: none;
}

.app-btn__spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid var(--color-text-tertiary);
  border-top-color: currentColor;
  border-radius: var(--radius-full);
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
