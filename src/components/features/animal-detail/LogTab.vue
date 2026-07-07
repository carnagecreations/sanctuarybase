<template>
  <div class="space-y-4">
    <!-- Quick Log Entry -->
    <div>
      <SectionLabel>Quick Log</SectionLabel>
      <AppCard>
        <div class="quick-buttons">
          <button v-for="btn in quickButtons" :key="btn.type" class="quick-btn" @click="addQuickLog(btn)">
            <span class="btn-icon">{{ btn.icon }}</span>
            <span class="btn-label">{{ btn.label }}</span>
          </button>
        </div>
        <div class="divider"></div>
        <div class="form-grid">
          <AppSelect v-model="newLog.type" :options="logTypeOptions" label="Type" />
          <AppInput v-model="newLog.details" placeholder="Details (optional)" />
          <AppButton variant="primary" @click="addLog" style="grid-column: span 2">✓ Add Log Entry</AppButton>
        </div>
      </AppCard>
    </div>

    <!-- Activity Log -->
    <div>
      <SectionLabel>Activity Log</SectionLabel>
      <AppCard :flat="true">
        <div v-if="timeline.length" class="divide-list">
          <div v-for="entry in timeline" :key="entry.id" class="log-entry">
            <div class="log-time-icon">
              <div class="log-icon">{{ iconFor(entry.action) }}</div>
              <div class="log-time">{{ formatTime(new Date(entry.createdAt)) }}</div>
            </div>
            <div class="log-content">
              <div class="log-action">{{ entry.action }}</div>
              <div v-if="entry.details" class="log-details">{{ entry.details }}</div>
              <div class="log-by">{{ entry.userName }}</div>
            </div>
          </div>
        </div>
        <EmptyState v-else icon="📝" title="No activity" message="Care logs and daily notes will appear here." />
      </AppCard>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { AppCard, SectionLabel, EmptyState, AppButton, AppInput, AppSelect } from '../../ui'
import { useUIStore } from '../../../stores/ui'
import { useActivityLogStore } from '../../../stores/activityLog'

const props = defineProps({
  animal: { type: Object, required: true }
})

const ui = useUIStore()
const activityLog = useActivityLogStore()

const logTypeOptions = [
  { label: 'Health note', value: 'health' },
  { label: 'Medication', value: 'med' },
  { label: 'Vet visit', value: 'vet' },
  { label: 'Behavior', value: 'behavior' },
  { label: 'Feeding', value: 'feeding' },
  { label: 'Other', value: 'other' },
]

const quickButtons = [
  { type: 'health', icon: '📝', label: 'Health' },
  { type: 'med', icon: '💊', label: 'Medication' },
  { type: 'feeding', icon: '🍖', label: 'Feeding' },
  { type: 'behavior', icon: '🐾', label: 'Behavior' },
]

const newLog = ref({
  type: 'health',
  details: '',
})

const timeline = ref([])

onMounted(async () => {
  if (!props.animal?.id) return
  await activityLog.fetchLogs({ entityId: props.animal.id })
  timeline.value = activityLog.logs
})

const typeIcons = {
  health: '📝',
  med: '💊',
  vet: '🏥',
  behavior: '🐾',
  feeding: '🍖',
  other: '📌',
}

const typeLabels = {
  health: 'Health note',
  med: 'Medication administered',
  vet: 'Vet visit',
  behavior: 'Behavior note',
  feeding: 'Feeding',
  other: 'Other',
}

const formatTime = (date) => {
  const now = new Date()
  const diff = now - date
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const iconFor = (actionLabel) => {
  const byLabel = Object.fromEntries(Object.entries(typeLabels).map(([k, v]) => [v, typeIcons[k]]))
  return byLabel[actionLabel] || '📌'
}

const addQuickLog = (btn) => {
  newLog.value.type = btn.type
  newLog.value.details = ''
}

const addLog = async () => {
  if (!newLog.value.type) return
  if (!props.animal?.id) {
    ui.showToast('Select a real animal first', 'error')
    return
  }
  try {
    await activityLog.log(
      typeLabels[newLog.value.type] || 'Other',
      'animal',
      props.animal.id,
      props.animal.name || '',
      newLog.value.details,
    )
    timeline.value = activityLog.logs
    newLog.value = { type: 'health', details: '' }
    ui.showToast('Log entry added')
  } catch (err) {
    ui.showToast('Failed to add log entry', 'error')
  }
}
</script>

<style scoped>
.space-y-4 > * + * { margin-top: 16px; }

.quick-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.quick-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--r);
  color: var(--ink);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all .15s;
  text-transform: uppercase;
  letter-spacing: .03em;
}

.quick-btn:hover {
  background: var(--surface-3);
  border-color: var(--mint);
}

.btn-icon { font-size: 18px; }

.divider {
  height: 1px;
  background: var(--border);
  margin: 12px 0;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.divide-list > * + * { border-top: 1px solid var(--border); padding-top: 12px; }
.divide-list > *:first-child { padding-top: 0; }

.log-entry {
  padding: 12px 0;
  display: flex;
  gap: 12px;
}

.log-time-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.log-icon {
  font-size: 20px;
}

.log-time {
  font-size: 9px;
  color: var(--ink-3);
  text-align: center;
  font-weight: 700;
}

.log-content {
  flex: 1;
}

.log-action {
  font-size: 12px;
  font-weight: 700;
  color: var(--ink);
}

.log-details {
  font-size: 11px;
  color: var(--ink-3);
  margin-top: 2px;
  font-style: italic;
}

.log-by {
  font-size: 10px;
  color: var(--ink-3);
  margin-top: 4px;
  font-weight: 600;
}
</style>

<style scoped>
.divide-list > * + * { border-top: 1px solid var(--border); }

.log-entry {
  padding: 10px 0;
  display: flex;
  gap: 10px;
}
.log-entry:first-child { padding-top: 0; }
.log-entry:last-child { padding-bottom: 0; }

.log-date {
  font-size: 10px;
  color: var(--ink-3);
  font-weight: 600;
  min-width: 120px;
  flex-shrink: 0;
}

.log-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.log-content {
  flex: 1;
  min-width: 0;
}

.log-action {
  font-size: 12px;
  font-weight: 700;
  color: var(--ink);
}

.log-details {
  font-size: 11px;
  color: var(--ink-3);
  margin-top: 2px;
}

.log-by {
  font-size: 10px;
  color: var(--ink-3);
  margin-top: 2px;
}
</style>
