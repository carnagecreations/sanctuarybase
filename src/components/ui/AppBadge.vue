<template>
  <span class="app-badge" :class="[`app-badge--${type}`, `app-badge--${size}`]">
    <slot />
  </span>
</template>

<script setup>
defineProps({
  // vol | adm | staff | high | med | low | success | info
  // animal statuses: intake | quarantine | available | foster | adopted | sanctuary | medical | transferred | deceased
  type: { type: String, default: 'vol' },
  // 'sm' | 'md' | 'lg'
  size: { type: String, default: 'md' },
})
</script>

<style scoped>
.app-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  font-weight: 800;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* Sizes */
.app-badge--sm { padding: 5px 10px; font-size: 11px; font-weight: 700; }
.app-badge--md { padding: 7px 14px; font-size: 12px; font-weight: 800; }
.app-badge--lg { padding: 9px 16px; font-size: 13px; font-weight: 800; }

/* People/role badges */
.app-badge--vol {
  background: linear-gradient(135deg, rgba(78, 255, 197, 0.2) 0%, rgba(78, 255, 197, 0.08) 100%);
  color: var(--mint);
  border: 1px solid rgba(78, 255, 197, 0.3);
}

.app-badge--adm {
  background: linear-gradient(135deg, rgba(196, 181, 253, 0.2) 0%, rgba(196, 181, 253, 0.08) 100%);
  color: var(--lavender);
  border: 1px solid rgba(196, 181, 253, 0.3);
}

.app-badge--staff {
  background: linear-gradient(135deg, rgba(116, 176, 255, 0.2) 0%, rgba(116, 176, 255, 0.08) 100%);
  color: var(--blue);
  border: 1px solid rgba(116, 176, 255, 0.3);
}

.app-badge--high {
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.2) 0%, rgba(255, 107, 107, 0.08) 100%);
  color: var(--coral);
  border: 1px solid rgba(255, 107, 107, 0.3);
}

.app-badge--med {
  background: linear-gradient(135deg, rgba(217, 119, 6, 0.2) 0%, rgba(217, 119, 6, 0.08) 100%);
  color: var(--amber);
  border: 1px solid rgba(217, 119, 6, 0.3);
}

.app-badge--low {
  background: linear-gradient(135deg, rgba(78, 255, 197, 0.15) 0%, rgba(78, 255, 197, 0.05) 100%);
  color: var(--teal);
  border: 1px solid rgba(78, 255, 197, 0.2);
}

.app-badge--success {
  background: linear-gradient(135deg, rgba(78, 255, 197, 0.2) 0%, rgba(78, 255, 197, 0.08) 100%);
  color: var(--mint);
  border: 1px solid rgba(78, 255, 197, 0.3);
}

.app-badge--info {
  background: linear-gradient(135deg, rgba(116, 176, 255, 0.2) 0%, rgba(116, 176, 255, 0.08) 100%);
  color: var(--blue);
  border: 1px solid rgba(116, 176, 255, 0.3);
}

/* Animal status badges */
.app-badge--intake {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(251, 191, 36, 0.08) 100%);
  color: #FBBF24;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.app-badge--quarantine {
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.2) 0%, rgba(255, 107, 107, 0.08) 100%);
  color: var(--coral);
  border: 1px solid rgba(255, 107, 107, 0.3);
}

.app-badge--available {
  background: linear-gradient(135deg, rgba(78, 255, 197, 0.2) 0%, rgba(78, 255, 197, 0.08) 100%);
  color: var(--mint);
  border: 1px solid rgba(78, 255, 197, 0.3);
}

.app-badge--foster {
  background: linear-gradient(135deg, rgba(116, 176, 255, 0.2) 0%, rgba(116, 176, 255, 0.08) 100%);
  color: var(--blue);
  border: 1px solid rgba(116, 176, 255, 0.3);
}

.app-badge--adopted {
  background: linear-gradient(135deg, rgba(196, 181, 253, 0.2) 0%, rgba(196, 181, 253, 0.08) 100%);
  color: var(--lavender);
  border: 1px solid rgba(196, 181, 253, 0.3);
}

.app-badge--sanctuary {
  background: linear-gradient(135deg, rgba(78, 255, 197, 0.15) 0%, rgba(78, 255, 197, 0.05) 100%);
  color: var(--teal-d);
  border: 1px solid rgba(78, 255, 197, 0.2);
}

.app-badge--medical {
  background: linear-gradient(135deg, rgba(255, 122, 69, 0.2) 0%, rgba(255, 122, 69, 0.08) 100%);
  color: var(--brand);
  border: 1px solid rgba(255, 122, 69, 0.3);
}

.app-badge--transferred {
  background: rgba(255, 255, 255, 0.08);
  color: var(--ink-3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.app-badge--deceased {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

/* Hover states */
.app-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}
</style>
