<template>
  <PageContainer>
    <button class="back-btn" @click="ui.setCurrentTab('admin-hub')">← Admin Hub</button>

    <div class="page-header">
      <h1>💌 Messages</h1>
      <AppButton variant="primary">+ New message</AppButton>
    </div>

    <SectionLabel>Conversations</SectionLabel>
    <AppCard :flat="true">
      <div class="divide-list">
        <div v-for="c in conversations" :key="c.id" class="conversation-item">
          <div class="conversation-header">
            <span class="conversation-name">{{ c.name }}</span>
            <span class="conversation-time">{{ c.time }}</span>
          </div>
          <div class="conversation-preview">{{ c.lastMessage }}</div>
          <div v-if="c.unread" class="unread-badge">{{ c.unread }} new</div>
        </div>
      </div>
    </AppCard>

    <SectionLabel>Broadcast messages</SectionLabel>
    <AppCard v-for="b in broadcasts" :key="b.id" :flat="true">
      <div class="broadcast-row">
        <div class="broadcast-info">
          <span class="broadcast-title">{{ b.title }}</span>
          <span class="broadcast-audience">{{ b.audience }} volunteers</span>
        </div>
        <span class="broadcast-date">{{ b.date }}</span>
      </div>
    </AppCard>
  </PageContainer>
</template>

<script setup>
import { PageContainer, AppCard, SectionLabel, AppButton } from '../../ui'
import { useUIStore } from '../../../stores/ui'

const ui = useUIStore()

const conversations = [
  { id: 1, name: 'Sarah Johnson', time: '2h ago', lastMessage: "Luna's doing great, appetite is back to normal", unread: 1 },
  { id: 2, name: 'Mike Chen', time: 'Yesterday', lastMessage: 'Question about the feeding schedule change', unread: 0 },
  { id: 3, name: 'Emma Davis', time: '3d ago', lastMessage: 'Thanks for the cover! See you next week', unread: 0 },
]

const broadcasts = [
  { id: 1, title: 'Schedule change notice', audience: '28', date: 'Mar 18' },
  { id: 2, title: 'Thank you message', audience: '28', date: 'Mar 15' },
  { id: 3, title: 'Orientation reminder', audience: '5', date: 'Mar 10' },
]
</script>

<style scoped>
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: transparent;
  border: 1.5px solid var(--border);
  border-radius: var(--r);
  color: var(--ink-3);
  font-size: 12px;
  font-weight: 700;
  font-family: 'Nunito', sans-serif;
  cursor: pointer;
  transition: all .15s;
  margin-bottom: 16px;
}
.back-btn:hover { color: var(--ink); border-color: var(--border-2); }

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.page-header h1 {
  font-size: 22px;
  font-weight: 900;
  color: var(--ink);
  margin: 0;
  font-family: 'Fredoka One', sans-serif;
}

.divide-list > * + * { border-top: 1px solid var(--border); }

.conversation-item {
  padding: 10px 0;
  cursor: pointer;
  transition: opacity .15s;
}
.conversation-item:hover { opacity: 0.8; }
.conversation-item:first-child { padding-top: 0; }
.conversation-item:last-child { padding-bottom: 0; }

.conversation-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 4px;
}

.conversation-name {
  font-size: 13px;
  font-weight: 800;
  color: var(--ink);
}

.conversation-time {
  font-size: 10px;
  color: var(--ink-3);
}

.conversation-preview {
  font-size: 12px;
  color: var(--ink-3);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.unread-badge {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  color: var(--mint);
  background: var(--teal-l);
  padding: 2px 6px;
  border-radius: 4px;
}

.broadcast-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
  gap: 10px;
}
.broadcast-row:last-child { border-bottom: none; }

.broadcast-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.broadcast-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--ink);
}

.broadcast-audience {
  font-size: 10px;
  color: var(--ink-3);
}

.broadcast-date {
  font-size: 10px;
  color: var(--ink-3);
  flex-shrink: 0;
}
</style>
