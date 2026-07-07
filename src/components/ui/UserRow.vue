<template>
  <div class="user-row">
    <div class="user-row__avatar">{{ initials }}</div>
    <div class="user-row__info">
      <div class="user-row__name">{{ name }}</div>
      <div v-if="sub" class="user-row__sub">{{ sub }}</div>
    </div>
    <slot name="badge">
      <AppBadge v-if="badge" :type="badgeType">{{ badge }}</AppBadge>
    </slot>
    <slot name="actions" />
  </div>
</template>

<script setup>
import AppBadge from './AppBadge.vue'

const props = defineProps({
  name:      { type: String, required: true },
  sub:       String,
  badge:     String,
  badgeType: { type: String, default: 'vol' },
})

const initials = props.name
  .split(' ')
  .map(n => n[0])
  .join('')
  .toUpperCase()
  .slice(0, 2)
</script>

<style scoped>
.user-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  border-left: 4px solid var(--mint);
  padding-left: 16px;
  border-radius: 10px;
  background: rgba(78, 255, 197, 0.04);
  border: 1px solid rgba(78, 255, 197, 0.1);
  border-left: 4px solid var(--mint);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.user-row:hover {
  background: rgba(78, 255, 197, 0.08);
  border-color: rgba(78, 255, 197, 0.15);
}

.user-row__avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--brand) 0%, #FF4F9A 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Fredoka One', cursive;
  font-size: 15px;
  font-weight: 900;
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(255, 122, 69, 0.3);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.user-row:hover .user-row__avatar {
  transform: scale(1.08);
  box-shadow: 0 6px 16px rgba(255, 122, 69, 0.4);
}

.user-row__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-row__name {
  font-size: 14px;
  font-weight: 800;
  color: var(--ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.user-row__sub {
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-3);
}
</style>
