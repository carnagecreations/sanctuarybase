<template>
  <div class="message-list">
    <div class="list-header">
      <h3>Messages ({{ messages.length }})</h3>
      <div class="list-filters">
        <button v-for="status in statuses" :key="status" :class="['filter-btn', {active: activeFilter === status}]" @click="activeFilter = status">
          {{ status }}
        </button>
      </div>
    </div>

    <div class="messages-container">
      <div v-for="msg in filteredMessages" :key="msg.id" class="message-item" :class="msg.status" @click="$emit('select', msg)">
        <div class="message-status" :class="msg.status">●</div>
        <div class="message-content">
          <div class="message-from">{{ msg.from }}</div>
          <div class="message-preview">{{ msg.preview }}</div>
        </div>
        <div class="message-date">{{ formatDate(msg.date) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

defineProps({ messages: Array })
defineEmits(['select'])

const activeFilter = ref('All')
const statuses = ['All', 'Unread', 'Replied']

const filteredMessages = computed(() => {
  if (activeFilter.value === 'All') return messages || []
  return (messages || []).filter(m => m.status === activeFilter.value.toLowerCase())
})

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.message-list { display: flex; flex-direction: column; gap: 12px; }
.list-header { display: flex; justify-content: space-between; align-items: center; }
.list-header h3 { margin: 0; font-size: 14px; font-weight: 700; color: var(--ink); }
.list-filters { display: flex; gap: 8px; }
.filter-btn { padding: 6px 12px; background: var(--surface-2); border: 1px solid var(--border); border-radius: 6px; font-size: 12px; font-weight: 600; color: var(--ink-2); cursor: pointer; transition: all 0.15s; }
.filter-btn.active { background: #4EFFC5; color: white; border-color: #4EFFC5; }
.filter-btn:hover { border-color: #4EFFC5; }
.messages-container { display: flex; flex-direction: column; gap: 8px; max-height: 500px; overflow-y: auto; }
.message-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--surface-2); border: 1px solid var(--border); border-radius: 6px; cursor: pointer; transition: all 0.15s; }
.message-item:hover { border-color: #4EFFC5; background: var(--surface-3); }
.message-status { font-size: 12px; }
.message-status.unread { color: #FF6B9D; }
.message-status.replied { color: #4EFFC5; }
.message-content { flex: 1; min-width: 0; }
.message-from { font-size: 13px; font-weight: 700; color: var(--ink); }
.message-preview { font-size: 12px; color: var(--ink-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.message-date { font-size: 11px; color: var(--ink-3); flex-shrink: 0; }
</style>
