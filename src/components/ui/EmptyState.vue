<template>
  <div class="empty-state">
    <div class="empty-state__icon-wrapper">
      <div class="empty-state__icon">{{ icon }}</div>
    </div>
    <div class="empty-state__title">{{ title }}</div>
    <div v-if="message" class="empty-state__message">{{ message }}</div>
    <div v-if="$slots.default" class="empty-state__actions">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon:    { type: String, default: '🔍' },
  title:   { type: String, required: true },
  message: String,
})
</script>

<style scoped>
.empty-state {
  text-align: center;
  padding: 80px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.empty-state__icon-wrapper {
  width: 88px;
  height: 88px;
  background: linear-gradient(135deg, rgba(78, 255, 197, 0.1) 0%, rgba(255, 122, 69, 0.05) 100%);
  border: 1px solid rgba(78, 255, 197, 0.2);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: float 3s ease-in-out infinite;
}

.empty-state__icon {
  font-size: 48px;
  line-height: 1;
}

.empty-state__title {
  font-size: 20px;
  font-weight: 800;
  color: var(--ink);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.empty-state__message {
  font-size: 14px;
  color: var(--ink-2);
  line-height: 1.6;
  max-width: 340px;
  margin: 0;
}

.empty-state__actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  margin-top: 12px;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-12px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .empty-state__icon-wrapper {
    animation: none;
  }
}
</style>
