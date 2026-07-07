<template>
  <PageContainer>
    <div class="space-y-4">
      <div class="page-header">
        <h2 class="page-title">Activity Log</h2>
        <div class="header-right">
          <select v-model="filterType" class="mini-select">
            <option value="">All Actions</option>
            <option v-for="t in actionTypes" :key="t.value" :value="t.value">{{ t.label }}</option>
          </select>
          <select v-model="filterEntity" class="mini-select">
            <option value="">All Types</option>
            <option value="person">People</option>
            <option value="animal">Animals</option>
            <option value="safeHouse">Safe Houses</option>
          </select>
        </div>
      </div>

      <!-- Search -->
      <input v-model="search" type="text" placeholder="Search by name, user, or action..." class="search-input" />

      <!-- Stats -->
      <div class="log-stats">
        <div class="log-stat">
          <div class="ls-num">{{ logs.length }}</div>
          <div class="ls-lbl">Total Events</div>
        </div>
        <div class="log-stat">
          <div class="ls-num">{{ todayCount }}</div>
          <div class="ls-lbl">Today</div>
        </div>
        <div class="log-stat">
          <div class="ls-num">{{ uniqueUsers }}</div>
          <div class="ls-lbl">Active Users</div>
        </div>
      </div>

      <!-- Log feed -->
      <SkeletonLoader v-if="loading" :count="6" />
      <div v-else-if="filteredLogs.length" class="log-feed">
        <!-- Group by date -->
        <div v-for="(group, date) in groupedLogs" :key="date" class="log-group">
          <div class="log-date-label">{{ date }}</div>
          <div
            v-for="entry in group"
            :key="entry.id"
            class="log-entry"
          >
            <div class="log-icon" :style="{ background: actionColor(entry.action) }">
              {{ actionIcon(entry.action) }}
            </div>
            <div class="log-body">
              <div class="log-text">
                <span class="log-user">{{ entry.userName }}</span>
                <span class="log-action">{{ actionLabel(entry.action) }}</span>
                <span class="log-entity">{{ entry.entityName }}</span>
              </div>
              <div v-if="entry.details" class="log-detail">{{ entry.details }}</div>
              <div class="log-meta">
                <span class="log-type-chip">{{ entry.entityType }}</span>
                <span class="log-time">{{ formatTime(entry.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <EmptyState v-else icon="📋" title="No activity yet" message="Actions across the app will appear here." />
    </div>
  </PageContainer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { PageContainer, EmptyState } from '../../ui'
import SkeletonLoader from '../../shared/SkeletonLoader.vue'
import { useActivityLogStore } from '../../../stores/activityLog'

const actLog = useActivityLogStore()
const search = ref('')
const filterType = ref('')
const filterEntity = ref('')

const logs = computed(() => actLog.logs)
const loading = computed(() => actLog.loading)

const actionTypes = [
  { label: 'Created', value: 'created' },
  { label: 'Updated', value: 'updated' },
  { label: 'Deleted', value: 'deleted' },
  { label: 'Linked Animal', value: 'linked_animal' },
  { label: 'Donation', value: 'donation' },
  { label: 'Note Added', value: 'note_added' },
  { label: 'Stage Changed', value: 'stage_changed' },
]

const actionIcon = (action) => {
  const map = {
    created: '✚', updated: '✎', deleted: '✕', linked_animal: '🔗',
    donation: '💝', note_added: '📝', stage_changed: '→', default: '•'
  }
  return map[action] || map.default
}

const actionColor = (action) => {
  const map = {
    created: 'rgba(78,255,197,.2)', updated: 'rgba(96,165,250,.2)',
    deleted: 'rgba(255,122,69,.2)', linked_animal: 'rgba(167,139,250,.2)',
    donation: 'rgba(167,139,250,.2)', note_added: 'rgba(251,191,36,.2)',
    stage_changed: 'rgba(78,255,197,.2)',
  }
  return map[action] || 'rgba(255,255,255,.05)'
}

const actionLabel = (action) => {
  const map = {
    created: 'created', updated: 'updated', deleted: 'deleted',
    linked_animal: 'linked animal to', donation: 'recorded donation for',
    note_added: 'added note to', stage_changed: 'moved',
  }
  return map[action] || action
}

const filteredLogs = computed(() => {
  let result = logs.value
  if (filterType.value) result = result.filter(l => l.action === filterType.value)
  if (filterEntity.value) result = result.filter(l => l.entityType === filterEntity.value)
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    result = result.filter(l =>
      l.entityName?.toLowerCase().includes(q) ||
      l.userName?.toLowerCase().includes(q) ||
      l.details?.toLowerCase().includes(q)
    )
  }
  return result
})

const groupedLogs = computed(() => {
  const groups = {}
  for (const entry of filteredLogs.value) {
    const d = new Date(entry.createdAt)
    const today = new Date()
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
    let label
    if (d.toDateString() === today.toDateString()) label = 'Today'
    else if (d.toDateString() === yesterday.toDateString()) label = 'Yesterday'
    else label = d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
    if (!groups[label]) groups[label] = []
    groups[label].push(entry)
  }
  return groups
})

const todayCount = computed(() => {
  const today = new Date().toDateString()
  return logs.value.filter(l => new Date(l.createdAt).toDateString() === today).length
})

const uniqueUsers = computed(() => new Set(logs.value.map(l => l.userId)).size)

const formatTime = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

onMounted(() => actLog.fetchLogs())
</script>

<style scoped>
.space-y-4 > * + * { margin-top: 16px; }
.page-header { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.page-title { font-size: 20px; font-weight: 800; color: var(--ink); margin: 0; }
.header-right { display: flex; gap: 8px; }
.mini-select {
  padding: 6px 10px; background: var(--surface-2); border: 1px solid var(--border);
  border-radius: var(--r); color: var(--ink); font-size: 11px; font-family: 'Nunito', sans-serif; cursor: pointer;
}
.search-input {
  width: 100%; padding: 9px 12px; background: var(--surface-2); border: 1px solid var(--border);
  border-radius: var(--r); color: var(--ink); font-family: 'Nunito', sans-serif; font-size: 12px;
}
.search-input::placeholder { color: var(--ink-3); }

.log-stats { display: flex; gap: 8px; }
.log-stat {
  flex: 1; padding: 12px; background: var(--surface-2); border: 1px solid var(--border);
  border-radius: var(--r); text-align: center;
}
.ls-num { font-family: 'Fredoka One', sans-serif; font-size: 22px; color: var(--mint); }
.ls-lbl { font-size: 10px; text-transform: uppercase; color: var(--ink-3); font-weight: 700; letter-spacing: .04em; }

.log-feed { display: flex; flex-direction: column; gap: 20px; }
.log-group { display: flex; flex-direction: column; gap: 4px; }
.log-date-label {
  font-size: 10px; font-weight: 800; text-transform: uppercase;
  color: var(--ink-3); letter-spacing: .06em; padding: 4px 0; margin-bottom: 4px;
  border-bottom: 1px solid var(--border);
}

.log-entry {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 10px; background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--r); transition: all .15s;
}
.log-entry:hover { border-color: var(--mint); }

.log-icon {
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; flex-shrink: 0; font-weight: 800;
}

.log-body { flex: 1; }
.log-text { font-size: 12px; color: var(--ink); margin-bottom: 2px; }
.log-user { font-weight: 800; }
.log-action { color: var(--ink-2); margin: 0 4px; }
.log-entity { font-weight: 700; color: var(--mint); }
.log-detail { font-size: 11px; color: var(--ink-3); margin-bottom: 4px; }
.log-meta { display: flex; gap: 8px; align-items: center; }
.log-type-chip {
  font-size: 9px; padding: 1px 6px; background: var(--surface-2);
  border: 1px solid var(--border); border-radius: 8px; color: var(--ink-3); font-weight: 700; text-transform: uppercase;
}
.log-time { font-size: 10px; color: var(--ink-3); }
</style>
