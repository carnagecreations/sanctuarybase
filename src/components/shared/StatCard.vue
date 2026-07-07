<template>
  <div class="bg-white border border-border rounded-lg p-4 text-center hover:shadow-md transition">
    <div class="text-3xl mb-2">{{ icon }}</div>
    <p class="text-xs text-ink-3 font-semibold uppercase tracking-wide">{{ label }}</p>
    <p :class="`text-2xl font-bold mt-1 text-${color}`">{{ value }}</p>
  </div>
</template>

<script setup>
defineProps({
  icon: String,
  label: String,
  value: String,
  color: {
    type: String,
    default: 'ink',
  },
})
</script>
