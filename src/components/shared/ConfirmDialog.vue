<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="dialog.visible" class="confirm-overlay" @click.self="cancel">
        <div class="confirm-box">
          <div class="confirm-icon">{{ dialog.icon || '⚠️' }}</div>
          <div class="confirm-title">{{ dialog.title || 'Are you sure?' }}</div>
          <div class="confirm-message">{{ dialog.message }}</div>
          <div class="confirm-actions">
            <button class="btn-cancel" @click="cancel">{{ dialog.cancelText || 'Cancel' }}</button>
            <button class="btn-confirm" :class="dialog.danger ? 'danger' : ''" @click="confirm">
              {{ dialog.confirmText || 'Confirm' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { useUIStore } from '../../stores/ui'
import { computed } from 'vue'

const ui = useUIStore()
const dialog = computed(() => ui.dialog)

const confirm = () => ui.resolveDialog(true)
const cancel = () => ui.resolveDialog(false)
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
}

.confirm-box {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  max-width: 320px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,.5);
}

.confirm-icon { font-size: 36px; margin-bottom: 12px; }
.confirm-title { font-size: 16px; font-weight: 800; color: var(--ink); margin-bottom: 8px; }
.confirm-message { font-size: 13px; color: var(--ink-2); line-height: 1.5; margin-bottom: 20px; }

.confirm-actions { display: flex; gap: 8px; }
.btn-cancel, .btn-confirm {
  flex: 1;
  padding: 10px;
  border-radius: var(--r);
  font-size: 13px;
  font-weight: 700;
  font-family: 'Nunito', sans-serif;
  cursor: pointer;
  border: none;
  transition: all .15s;
}
.btn-cancel {
  background: var(--surface-2);
  color: var(--ink-2);
  border: 1px solid var(--border);
}
.btn-cancel:hover { background: var(--surface-3); }
.btn-confirm { background: var(--mint); color: var(--bg); }
.btn-confirm:hover { opacity: .9; }
.btn-confirm.danger { background: var(--coral); color: #fff; }

.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
