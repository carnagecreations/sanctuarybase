<template>
  <div class="history-card">
    <div class="history-header">
      <h2 class="history-title">Message History</h2>
      <span class="message-count">{{ messages.length }}</span>
    </div>

    <div v-if="loading" class="loading-state full-height">
      <div class="loading-spinner"></div>
      <span>Loading messages...</span>
    </div>

    <div v-else-if="messages.length === 0" class="empty-state full-height">
      <div class="empty-icon">📨</div>
      <div class="empty-title">No messages yet</div>
      <div class="empty-hint">Messages you send will appear here</div>
    </div>

    <div v-else class="messages-list">
      <div v-for="msg in messages" :key="msg.id" class="message-card">
        <div class="message-top">
          <div class="recipient-badge" :class="`badge-${msg.recipientType}`">
            {{ getRecipientBadge(msg) }}
          </div>
          <div class="message-time">{{ formatDate(msg.sentAt) }}</div>
          <button
            @click="$emit('delete', msg.id)"
            class="delete-btn"
            title="Delete message"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>
        <div class="message-body">{{ msg.text }}</div>
        <div v-if="msg.recipients && msg.recipients.length > 0" class="message-recipients">
          {{ msg.recipients.length }} recipient{{ msg.recipients.length !== 1 ? 's' : '' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  messages: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

defineEmits(['delete'])

const getRecipientBadge = (msg) => {
  if (msg.recipientType === 'all') {
    return 'All Volunteers'
  } else if (msg.recipientType === 'online') {
    return 'Online'
  } else if (msg.recipientType === 'staff-admin') {
    return 'Staff & Admin'
  } else {
    return 'Specific'
  }
}

const formatDate = (date) => {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date.seconds * 1000 || date)
  const now = new Date()
  const diffMs = now - d
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 1) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  return d.toLocaleDateString()
}
</script>

<style scoped>
/* History Card */
.history-card {
  background: var(--surface);
  border: 1px solid var(--border-2);
  border-radius: var(--rl);
  overflow: hidden;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  height: fit-content;
  max-height: calc(100vh - 180px);
}

.history-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--brand), var(--mint));
}

.history-header {
  padding: 20px 20px 0;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  position: relative;
  z-index: 1;
}

.history-title {
  font-size: 16px;
  font-weight: 800;
  color: var(--ink);
  margin: 0;
}

.message-count {
  font-size: 12px;
  font-weight: 700;
  color: var(--ink-3);
  background: var(--surface-2);
  padding: 4px 8px;
  border-radius: 4px;
}

/* Messages List */
.messages-list {
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
}

.message-card {
  padding: 14px;
  background: var(--surface-2);
  border: 1px solid var(--border-2);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: all 0.15s;
}

.message-card:hover {
  border-color: var(--border);
  background: var(--surface-3);
}

.message-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.delete-btn {
  background: none;
  border: none;
  color: var(--ink-3);
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 4px;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-btn:hover {
  background: rgba(255, 107, 107, 0.1);
  color: var(--coral);
}

.delete-btn svg {
  width: 16px;
  height: 16px;
}

.recipient-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  white-space: nowrap;
}

.badge-all {
  background: rgba(116, 176, 255, 0.2);
  color: var(--blue);
}

.badge-online {
  background: rgba(78, 255, 197, 0.2);
  color: var(--mint);
}

.badge-specific {
  background: rgba(196, 181, 253, 0.2);
  color: var(--lavender);
}

.message-time {
  font-size: 11px;
  color: var(--ink-3);
  white-space: nowrap;
}

.message-body {
  font-size: 13px;
  color: var(--ink-2);
  line-height: 1.5;
  word-wrap: break-word;
}

.message-recipients {
  font-size: 11px;
  color: var(--ink-3);
  padding-top: 6px;
  border-top: 1px solid var(--border);
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px;
  color: var(--ink-3);
  font-size: 13px;
}

.loading-state.full-height {
  min-height: 300px;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--border-2);
  border-top-color: var(--mint);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px;
  text-align: center;
  color: var(--ink-3);
}

.empty-state.full-height {
  min-height: 300px;
}

.empty-icon {
  font-size: 40px;
  opacity: 0.5;
}

.empty-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--ink-2);
  margin: 0;
}

.empty-hint {
  font-size: 12px;
  color: var(--ink-3);
  margin: 0;
}
</style>
