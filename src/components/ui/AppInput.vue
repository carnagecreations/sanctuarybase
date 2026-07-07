<template>
  <div class="app-input-wrap">
    <label v-if="label" class="app-input-label" :for="inputId">
      {{ label }}
      <span v-if="optional" class="app-input-optional">optional</span>
    </label>
    <div class="app-input-container">
      <div v-if="prefixIcon" class="app-input-icon app-input-icon--prefix">
        <slot name="prefix-icon" />
      </div>
      <input
        v-if="type !== 'textarea'"
        :id="inputId"
        class="app-input"
        :class="{ 'app-input--error': error, 'app-input--with-prefix': prefixIcon, 'app-input--with-suffix': suffixIcon || clearable }"
        v-bind="$attrs"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :aria-invalid="!!error"
        :aria-describedby="describedBy"
        @input="$emit('update:modelValue', $event.target.value)"
        @focus="focused = true"
        @blur="focused = false"
      />
      <textarea
        v-else
        :id="inputId"
        class="app-input app-input--textarea"
        :class="{ 'app-input--error': error }"
        v-bind="$attrs"
        :value="modelValue"
        :placeholder="placeholder"
        :aria-invalid="!!error"
        :aria-describedby="describedBy"
        @input="$emit('update:modelValue', $event.target.value)"
        @focus="focused = true"
        @blur="focused = false"
      />
      <div v-if="clearable && modelValue" class="app-input-icon app-input-icon--suffix app-input-icon--clear" @click="$emit('update:modelValue', '')">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </div>
      <div v-else-if="suffixIcon" class="app-input-icon app-input-icon--suffix">
        <slot name="suffix-icon" />
      </div>
    </div>
    <div v-if="error" :id="errorId" class="app-input-error" role="alert">{{ error }}</div>
    <div v-else-if="hint" :id="hintId" class="app-input-hint">{{ hint }}</div>
  </div>
</template>

<script setup>
import { ref, computed, useId } from 'vue'

const props = defineProps({
  modelValue:  [String, Number],
  label:       String,
  placeholder: String,
  type:        { type: String, default: 'text' },
  hint:        String,
  error:       String,
  optional:    Boolean,
  prefixIcon:  Boolean,
  suffixIcon:  Boolean,
  clearable:   Boolean,
})
defineEmits(['update:modelValue'])

const focused = ref(false)
const inputId = useId()
const errorId = computed(() => `${inputId}-error`)
const hintId = computed(() => `${inputId}-hint`)
const describedBy = computed(() => {
  if (props.error) return errorId.value
  if (props.hint) return hintId.value
  return undefined
})
</script>

<style scoped>
.app-input-wrap {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.app-input-label {
  font-size: 14px;
  font-weight: 900;
  color: var(--ink);
  display: flex;
  align-items: center;
  gap: 8px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.app-input-optional {
  font-size: 11px;
  font-weight: 700;
  color: var(--ink-3);
  background: rgba(78, 255, 197, 0.1);
  border-radius: 6px;
  padding: 2px 6px;
  border: 1px solid rgba(78, 255, 197, 0.15);
}

.app-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.app-input {
  width: 100%;
  min-height: 44px;
  padding: 12px 16px;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
  color: var(--ink);
  font-family: 'Nunito', sans-serif;
  font-size: 14px;
  font-weight: 600;
  outline: none;
  transition: border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1),
              background-color 0.2s ease;
}

.app-input--with-prefix {
  padding-left: 44px;
}

.app-input--with-suffix {
  padding-right: 44px;
}

.app-input:focus {
  border-color: var(--teal);
  background: var(--surface);
  box-shadow: 0 0 0 3px rgba(78, 255, 197, 0.15), 0 0 0 1px rgba(78, 255, 197, 0.35);
}

.app-input:focus:not(.app-input--error) {
  box-shadow: 0 0 0 3px rgba(78, 255, 197, 0.2), inset 0 0 0 1px rgba(78, 255, 197, 0.1);
}

.app-input--error {
  border-color: var(--coral);
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.15);
}

.app-input--error:focus {
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.2), inset 0 0 0 1px rgba(255, 107, 107, 0.1);
}

.app-input::placeholder {
  color: var(--ink-3);
  font-weight: 500;
}

.app-input--textarea {
  min-height: 100px;
  resize: vertical;
  padding: 12px 16px;
}

.app-input-icon {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ink-3);
  font-size: 18px;
  transition: color 0.2s ease;
}

.app-input-icon--prefix {
  left: 12px;
}

.app-input-icon--suffix {
  right: 12px;
}

.app-input-icon--clear {
  cursor: pointer;
  transition: color 0.2s ease;
}

.app-input-icon--clear:hover {
  color: var(--ink-2);
}

.app-input:focus ~ .app-input-icon {
  color: var(--teal);
}

.app-input-hint {
  font-size: 12px;
  font-weight: 500;
  color: var(--ink-3);
  line-height: 1.5;
  display: flex;
  align-items: center;
  gap: 6px;
}

.app-input-error {
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
