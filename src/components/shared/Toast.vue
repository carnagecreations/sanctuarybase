<template>
  <teleport to="body">
    <transition name="toast-slide">
      <div
        v-if="toast.message"
        class="toast"
        :class="toast.type"
        :role="toast.type === 'error' ? 'alert' : 'status'"
        :aria-live="toast.type === 'error' ? 'assertive' : 'polite'"
        aria-atomic="true"
      >
        <span class="toast-icon" aria-hidden="true">{{ icons[toast.type] }}</span>
        <span class="toast-msg">{{ toast.message }}</span>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { useUIStore } from '../../stores/ui'
import { computed } from 'vue'
const ui = useUIStore()
const toast = computed(() => ui.toast)
const icons = { success: '✓', error: '✕', warn: '⚠', info: 'ℹ' }
</script>

<style scoped>
.toast {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 24px;
  font-size: 13px;
  font-weight: 700;
  font-family: 'Nunito', sans-serif;
  z-index: 9998;
  box-shadow: 0 8px 24px rgba(0,0,0,.4);
  white-space: nowrap;
  max-width: calc(100vw - 32px);
}
.toast-icon { font-size: 16px; }
.toast.success { background: var(--mint); color: var(--bg); }
.toast.error { background: var(--coral); color: #fff; }
.toast.warn { background: var(--amber); color: var(--bg); }
.toast.info { background: var(--blue); color: #fff; }

.toast-slide-enter-active, .toast-slide-leave-active { transition: all .25s ease; }
.toast-slide-enter-from, .toast-slide-leave-to { opacity: 0; transform: translateX(-50%) translateY(20px); }
</style>
