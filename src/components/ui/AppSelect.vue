<template>
  <div class="app-select-wrap">
    <label v-if="label" class="app-select-label" :for="selectId">
      {{ label }}
      <span v-if="optional" class="app-select-optional">optional</span>
    </label>
    <div class="app-select-container">
      <select
        :id="selectId"
        class="app-select"
        :value="modelValue"
        :aria-invalid="!!error"
        :aria-describedby="describedBy"
        @change="$emit('update:modelValue', $event.target.value)"
      >
        <option v-if="placeholder" value="" disabled selected>{{ placeholder }}</option>
        <option
          v-for="opt in options"
          :key="opt.value ?? opt"
          :value="opt.value ?? opt"
        >
          {{ opt.label ?? opt }}
        </option>
      </select>
      <svg class="app-select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </div>
    <div v-if="error" :id="errorId" class="app-select-error" role="alert">{{ error }}</div>
    <div v-else-if="hint" :id="hintId" class="app-select-hint">{{ hint }}</div>
  </div>
</template>

<script setup>
import { computed, useId } from 'vue'

const props = defineProps({
  modelValue:  [String, Number],
  label:       String,
  placeholder: String,
  options:     { type: Array, default: () => [] },
  hint:        String,
  error:       String,
  optional:    Boolean,
})
defineEmits(['update:modelValue'])

const selectId = useId()
const errorId = computed(() => `${selectId}-error`)
const hintId = computed(() => `${selectId}-hint`)
const describedBy = computed(() => {
  if (props.error) return errorId.value
  if (props.hint) return hintId.value
  return undefined
})
</script>

<style scoped>
.app-select-wrap {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.app-select-label {
  font-size: 13px;
  font-weight: 800;
  color: var(--ink-2);
  display: flex;
  align-items: center;
  gap: 8px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.app-select-optional {
  font-size: 11px;
  font-weight: 700;
  color: var(--ink-3);
  background: rgba(78, 255, 197, 0.1);
  border-radius: 6px;
  padding: 2px 6px;
  border: 1px solid rgba(78, 255, 197, 0.15);
}

.app-select-container {
  position: relative;
  display: flex;
  align-items: center;
}

.app-select {
  width: 100%;
  min-height: 44px;
  padding: 12px 16px 12px 16px;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
  color: var(--ink);
  font-family: 'Nunito', sans-serif;
  font-size: 14px;
  font-weight: 600;
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1),
              background-color 0.2s ease;
  appearance: none;
  padding-right: 44px;
}

.app-select:focus {
  border-color: var(--teal);
  box-shadow: 0 0 0 3px rgba(78, 255, 197, 0.2), inset 0 0 0 1px rgba(78, 255, 197, 0.1);
  background: var(--surface);
}

.app-select option {
  background: var(--surface);
  color: var(--ink);
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.app-select option:hover {
  background: var(--surface-2);
}

.app-select option:checked {
  background: linear-gradient(135deg, var(--mint) 0%, var(--teal-d) 100%);
  color: #0A1F18;
}

/* Custom arrow icon */
.app-select-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--ink-3);
  pointer-events: none;
  transition: color 0.2s ease, transform 0.3s ease;
}

.app-select:focus ~ .app-select-arrow {
  color: var(--teal);
}

.app-select-hint {
  font-size: 12px;
  font-weight: 500;
  color: var(--ink-3);
  line-height: 1.5;
  display: flex;
  align-items: center;
  gap: 6px;
}

.app-select-error {
  font-size: 12px;
  font-weight: 600;
  color: var(--coral);
  line-height: 1.5;
  display: flex;
  align-items: center;
  gap: 6px;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
