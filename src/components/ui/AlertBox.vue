<template>
  <div class="alert-box" :class="`alert-box--${type}`" role="alert">
    <div class="alert-box__icon">
      <slot name="icon">
        <svg v-if="type === 'danger'" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        <svg v-else-if="type === 'warn'" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
        </svg>
        <svg v-else-if="type === 'success'" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
        </svg>
      </slot>
    </div>
    <div class="alert-box__content">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  // 'danger' | 'warn' | 'info' | 'success'
  type: { type: String, default: 'info' },
})
</script>

<style scoped>
.alert-box {
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.6;
  margin-bottom: 12px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  backdrop-filter: blur(4px);
  animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.alert-box__icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-top: 2px;
}

.alert-box__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Danger variant */
.alert-box--danger {
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.15) 0%, rgba(255, 107, 107, 0.05) 100%);
  border: 1.5px solid rgba(255, 107, 107, 0.3);
  color: var(--coral);
}

.alert-box--danger .alert-box__icon {
  color: var(--coral);
}

/* Warning variant */
.alert-box--warn {
  background: linear-gradient(135deg, rgba(217, 119, 6, 0.15) 0%, rgba(217, 119, 6, 0.05) 100%);
  border: 1.5px solid rgba(217, 119, 6, 0.3);
  color: var(--amber);
}

.alert-box--warn .alert-box__icon {
  color: var(--amber);
}

/* Success variant */
.alert-box--success {
  background: linear-gradient(135deg, rgba(78, 255, 197, 0.15) 0%, rgba(78, 255, 197, 0.05) 100%);
  border: 1.5px solid rgba(78, 255, 197, 0.3);
  color: var(--mint);
}

.alert-box--success .alert-box__icon {
  color: var(--mint);
}

/* Info variant */
.alert-box--info {
  background: linear-gradient(135deg, rgba(116, 176, 255, 0.15) 0%, rgba(116, 176, 255, 0.05) 100%);
  border: 1.5px solid rgba(116, 176, 255, 0.3);
  color: var(--blue);
}

.alert-box--info .alert-box__icon {
  color: var(--blue);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .alert-box {
    animation: none;
  }
}
</style>
