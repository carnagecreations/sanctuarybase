<template>
  <div class="stat-card" :class="{ 'stat-card--clickable': !!tab }" @click="onClick">
    <div class="stat-card__value">{{ value }}</div>
    <div class="stat-card__label">{{ label }}</div>
  </div>
</template>

<script setup>
import { useUIStore } from '../../stores/ui'

const props = defineProps({
  value: [String, Number],
  label: String,
  tab:   String,   // optional — which tab to navigate to on click
})

const ui = useUIStore()
const onClick = () => { if (props.tab) ui.setCurrentTab(props.tab) }
</script>

<style scoped>
.stat-card {
  background: linear-gradient(135deg, var(--surface) 0%, rgba(78, 255, 197, 0.05) 100%);
  border: 1px solid var(--border-2);
  border-radius: 14px;
  padding: 28px 20px;
  text-align: center;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              border-color 0.3s ease;
  box-shadow: var(--shadow);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--teal) 0%, var(--brand) 100%);
  transition: height 0.3s ease;
}

.stat-card--clickable {
  cursor: pointer;
  user-select: none;
}

.stat-card--clickable:hover {
  transform: translateY(-5px) scale(1.03);
  box-shadow: 0 14px 48px rgba(78, 255, 197, 0.18),
              0 0 0 1px rgba(255, 255, 255, 0.08);
  border-color: rgba(78, 255, 197, 0.3);
}

.stat-card--clickable:active {
  transform: translateY(-1px);
  box-shadow: var(--shadow);
}

.stat-card__value {
  font-family: 'Fredoka One', cursive;
  font-size: 44px;
  font-weight: 900;
  color: var(--mint);
  line-height: 1;
  margin-bottom: 10px;
  text-shadow: 0 0 20px rgba(78, 255, 197, 0.25);
  display: block;
}

.stat-card__label {
  font-size: 12px;
  font-weight: 800;
  color: var(--ink-2);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  display: block;
}

@media (prefers-reduced-motion: reduce) {
  .stat-card {
    transition: none;
  }
}
</style>
