<template>
  <div class="sort-menu-container">
    <button class="sort-toggle" @click="toggle">
      ⬍ Sort
    </button>

    <div v-if="showMenu" class="sort-menu">
      <button
        v-for="option in sortOptions"
        :key="option.value"
        :class="['sort-item', { active: modelValue === option.value }]"
        @click="selectSort(option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: 'deadline',
  },
})

const emit = defineEmits(['update:modelValue'])

const showMenu = ref(false)

const sortOptions = [
  { label: '📅 Deadline (Soonest)', value: 'deadline' },
  { label: '💰 Amount (Highest)', value: 'amount' },
  { label: '⭐ Best Match', value: 'priority' },
  { label: '📝 Recently Added', value: 'recent' },
]

const toggle = () => {
  showMenu.value = !showMenu.value
}

const selectSort = (value) => {
  emit('update:modelValue', value)
  showMenu.value = false
}
</script>

<style scoped>
.sort-menu-container {
  position: relative;
}

.sort-toggle {
  padding: 8px 16px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--r);
  color: var(--ink);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.sort-toggle:hover {
  background: var(--surface-3);
  border-color: var(--mint);
  color: var(--mint);
}

.sort-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 6px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--r);
  box-shadow: var(--shadow-lg);
  min-width: 200px;
  z-index: 10;
}

.sort-item {
  display: block;
  width: 100%;
  padding: 10px 14px;
  background: none;
  border: none;
  color: var(--ink-2);
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s;
  font-weight: 600;
}

.sort-item:hover {
  background: var(--surface-3);
  color: var(--mint);
}

.sort-item.active {
  background: rgba(78, 255, 197, 0.1);
  color: var(--mint);
  border-left: 3px solid var(--mint);
  padding-left: 11px;
}

.sort-item:first-child {
  border-radius: var(--r) var(--r) 0 0;
}

.sort-item:last-child {
  border-radius: 0 0 var(--r) var(--r);
}
</style>
