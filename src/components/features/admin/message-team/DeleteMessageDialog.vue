<template>
  <AppModal :open="show" title="Delete Message" size="sm" @close="$emit('cancel')">
    <p class="delete-dialog-text">Are you sure you want to delete this message? This action cannot be undone.</p>
    <template #actions>
      <button @click="$emit('cancel')" class="delete-dialog-btn cancel-btn">
        Cancel
      </button>
      <button
        @click="$emit('confirm')"
        class="delete-dialog-btn delete-confirm-btn"
        :disabled="loading"
      >
        {{ loading ? 'Deleting...' : 'Delete' }}
      </button>
    </template>
  </AppModal>
</template>

<script setup>
import { AppModal } from '../../../ui'

defineProps({
  show: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
})

defineEmits(['cancel', 'confirm'])
</script>

<style scoped>
.delete-dialog-text {
  font-size: 13px;
  color: var(--ink-2);
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.delete-dialog-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.cancel-btn {
  background: var(--surface-2);
  color: var(--ink);
  border: 1px solid var(--border-2);
}

.cancel-btn:hover {
  background: var(--surface-3);
  border-color: var(--border);
}

.delete-confirm-btn {
  background: rgba(255, 107, 107, 0.2);
  color: var(--coral);
  border: 1px solid rgba(255, 107, 107, 0.3);
}

.delete-confirm-btn:hover:not(:disabled) {
  background: rgba(255, 107, 107, 0.3);
  border-color: rgba(255, 107, 107, 0.5);
}

.delete-confirm-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
