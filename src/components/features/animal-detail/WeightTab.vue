<template>
  <div class="space-y-4">
    <!-- Log New Weight -->
    <div>
      <SectionLabel>Log Weight</SectionLabel>
      <AppCard>
        <div class="form-grid">
          <AppInput v-model="newWeight.weight" type="number" placeholder="Weight" step="0.1" />
          <AppSelect v-model="newWeight.unit" :options="unitOptions" />
          <AppInput v-model="newWeight.date" type="date" label="Date" style="grid-column: span 2" />
          <AppInput v-model="newWeight.notes" placeholder="Notes (optional)" style="grid-column: span 2" />
          <AppButton variant="primary" @click="addWeight" style="grid-column: span 2">✓ Log Weight</AppButton>
        </div>
      </AppCard>
    </div>

    <!-- Current Weight & Trend -->
    <div>
      <SectionLabel>Current Weight</SectionLabel>
      <AppCard v-if="weightHistory.length" :flat="true">
        <div class="current-weight">
          <div>
            <div class="weight-value">{{ weightHistory[0].weight }}</div>
            <div class="weight-label">{{ weightHistory[0].unit }}</div>
          </div>
          <div v-if="trend" class="weight-trend">
            <span class="trend-icon" :class="`trend-${trend.direction}`">{{ trend.direction === 'up' ? '△' : trend.direction === 'down' ? '▼' : '=' }}</span>
            <div>
              <div class="trend-change" :class="`trend-${trend.direction}`">{{ trend.change }} {{ weightHistory[0].unit }}</div>
              <div class="trend-period">from previous</div>
            </div>
          </div>
        </div>
      </AppCard>
    </div>

    <!-- Weight Chart -->
    <div v-if="weightHistory.length > 1">
      <SectionLabel>Weight Trend</SectionLabel>
      <AppCard>
        <div class="chart">
          <div v-for="(w, i) in weightHistory" :key="w.id" class="chart-bar" :title="`${w.weight}${w.unit}`">
            <div class="bar-container">
              <div class="bar" :style="{ height: (parseFloat(w.weight) / maxWeight * 100) + '%' }" />
            </div>
            <div class="bar-label">{{ formatDate(w.date) }}</div>
          </div>
        </div>
      </AppCard>
    </div>

    <!-- Weight History -->
    <div>
      <SectionLabel>History</SectionLabel>
      <AppCard :flat="true">
        <div v-if="weightHistory.length" class="divide-list">
          <div v-for="w in weightHistory" :key="w.id" class="weight-entry">
            <div>
              <div class="entry-weight">{{ w.weight }} {{ w.unit }}</div>
              <div v-if="w.notes" class="entry-notes">{{ w.notes }}</div>
            </div>
            <div class="entry-date">{{ formatDate(w.date) }}</div>
            <div class="entry-actions">
              <button class="action-btn" @click="editWeight(w)" title="Edit">✏️</button>
              <button class="action-btn danger" @click="deleteWeight(w.id)" title="Delete">🗑</button>
            </div>
          </div>
        </div>
        <EmptyState v-else icon="⚖️" title="No records" message="Log weights above." />
      </AppCard>
    </div>

    <!-- Edit Weight Modal -->
    <AppModal v-if="showEditModal" :open="true" title="Edit Weight" size="sm" @close="closeEditModal">
      <div class="form-grid">
        <AppInput v-model="editForm.weight" type="number" placeholder="Weight" step="0.1" />
        <AppSelect v-model="editForm.unit" :options="unitOptions" />
        <AppInput v-model="editForm.date" type="date" style="grid-column: span 2" />
        <AppInput v-model="editForm.notes" placeholder="Notes (optional)" style="grid-column: span 2" />
      </div>
      <template #actions>
        <AppButton @click="closeEditModal">Cancel</AppButton>
        <AppButton variant="primary" @click="saveEdit">✓ Update Weight</AppButton>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { AppCard, SectionLabel, EmptyState, AppButton, AppInput, AppSelect, AppModal } from '../../ui'
import { useUIStore } from '../../../stores/ui'
import { useHealthMetricsStore } from '../../../stores/healthMetrics'

const props = defineProps({
  animal: { type: Object, required: true }
})

const ui = useUIStore()
const healthMetrics = useHealthMetricsStore()

const unitOptions = [
  { label: 'lbs', value: 'lbs' },
  { label: 'kg', value: 'kg' },
]

const newWeight = ref({
  weight: '',
  unit: 'lbs',
  date: new Date().toISOString().split('T')[0],
  notes: '',
})

const weightHistory = ref([])

onMounted(async () => {
  if (!props.animal?.id) return
  const metrics = await healthMetrics.fetchByAnimalId(props.animal.id)
  weightHistory.value = metrics.filter(m => m.weight)
})

const showEditModal = ref(false)
const editingWeight = ref(null)
const editForm = ref({ weight: '', unit: 'lbs', date: '', notes: '' })

const maxWeight = computed(() => {
  if (!weightHistory.value.length) return 10
  return Math.max(...weightHistory.value.map(w => parseFloat(w.weight))) * 1.1
})

const trend = computed(() => {
  if (weightHistory.value.length < 2) return null
  const current = parseFloat(weightHistory.value[0].weight)
  const prev = parseFloat(weightHistory.value[1].weight)
  const change = (current - prev).toFixed(1)
  const direction = current > prev ? 'up' : current < prev ? 'down' : 'stable'
  return { change: Math.abs(change), direction }
})

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const addWeight = async () => {
  if (!newWeight.value.weight) {
    ui.showToast('Weight is required', 'error')
    return
  }
  if (!props.animal?.id) {
    ui.showToast('Select a real animal first', 'error')
    return
  }
  try {
    const created = await healthMetrics.addMetric({
      animalId: props.animal.id,
      weight: newWeight.value.weight,
      unit: newWeight.value.unit,
      date: newWeight.value.date,
      notes: newWeight.value.notes,
    })
    weightHistory.value.unshift(created)
    weightHistory.value.sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    newWeight.value = { weight: '', unit: 'lbs', date: new Date().toISOString().split('T')[0], notes: '' }
    ui.showToast('Weight logged')
  } catch (err) {
    ui.showToast('Failed to log weight', 'error')
  }
}

const editWeight = (weight) => {
  editingWeight.value = weight
  editForm.value = { ...weight }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editingWeight.value = null
  editForm.value = { weight: '', unit: 'lbs', date: '', notes: '' }
}

const saveEdit = async () => {
  if (!editForm.value.weight) {
    ui.showToast('Weight is required', 'error')
    return
  }
  try {
    const data = { weight: editForm.value.weight, unit: editForm.value.unit, date: editForm.value.date, notes: editForm.value.notes }
    await healthMetrics.updateMetric(editingWeight.value.id, data)
    const idx = weightHistory.value.findIndex(w => w.id === editingWeight.value.id)
    if (idx !== -1) weightHistory.value[idx] = { ...weightHistory.value[idx], ...data }
    weightHistory.value.sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    ui.showToast('Weight updated')
    closeEditModal()
  } catch (err) {
    ui.showToast('Failed to update weight', 'error')
  }
}

const deleteWeight = async (id) => {
  if (!confirm('Delete this weight entry?')) return
  try {
    await healthMetrics.deleteMetric(id)
    weightHistory.value = weightHistory.value.filter(w => w.id !== id)
    ui.showToast('Weight deleted')
  } catch (err) {
    ui.showToast('Failed to delete weight', 'error')
  }
}
</script>

<style scoped>
.space-y-4 > * + * { margin-top: 16px; }

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.current-weight {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: var(--surface-2);
  border-radius: var(--r);
}

.weight-value {
  font-size: 32px;
  font-weight: 900;
  color: var(--mint);
  font-family: 'Fredoka One', sans-serif;
}

.weight-label {
  font-size: 12px;
  font-weight: 800;
  color: var(--ink-3);
  text-transform: uppercase;
  margin-top: 2px;
}

.weight-trend {
  display: flex;
  align-items: center;
  gap: 8px;
}

.trend-icon {
  font-size: 20px;
}

.trend-up { color: var(--amber); }
.trend-down { color: var(--coral); }
.trend-stable { color: var(--ink-3); }

.trend-change {
  font-size: 14px;
  font-weight: 700;
}

.trend-period {
  font-size: 10px;
  color: var(--ink-3);
  margin-top: 2px;
}

.chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 100px;
  gap: 8px;
  padding: 12px 0;
}

.chart-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.bar-container {
  display: flex;
  align-items: flex-end;
  height: 80px;
  width: 100%;
  border-bottom: 2px solid var(--border);
}

.bar {
  width: 100%;
  background: linear-gradient(to top, var(--mint), var(--teal));
  border-radius: 2px 2px 0 0;
  min-height: 2px;
}

.bar-label {
  font-size: 9px;
  color: var(--ink-3);
  text-align: center;
}

.divide-list > * + * { border-top: 1px solid var(--border); padding-top: 12px; }
.divide-list > *:first-child { padding-top: 0; }

.weight-entry {
  padding: 12px 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.entry-weight {
  font-size: 13px;
  font-weight: 800;
  color: var(--ink);
}

.entry-notes {
  font-size: 11px;
  color: var(--ink-3);
  font-style: italic;
  margin-top: 2px;
}

.entry-date {
  font-size: 11px;
  color: var(--ink-3);
  font-weight: 600;
  white-space: nowrap;
}

.entry-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.action-btn {
  width: 28px;
  height: 28px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  transition: all .15s;
}

.action-btn:hover { background: var(--surface-3); border-color: var(--mint); }
.action-btn.danger:hover { border-color: var(--coral); }

</style>

<style scoped>
.mt-4 { margin-top: 12px; }

.current-weight {
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 14px;
  background: var(--surface-2);
  border-radius: var(--r);
  margin-bottom: 10px;
}

.weight-value {
  font-size: 28px;
  font-weight: 900;
  color: var(--ink);
  font-family: 'Fredoka One', sans-serif;
}

.weight-label {
  font-size: 13px;
  font-weight: 800;
  color: var(--ink-3);
  text-transform: uppercase;
}

.weight-date {
  font-size: 10px;
  color: var(--ink-3);
  margin-left: auto;
}

.weight-trend {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
}

.trend-icon { font-size: 16px; }
.trend-up { color: var(--amber); }
.trend-down { color: var(--coral); }
.trend-stable { color: var(--ink-3); }
.trend-period { color: var(--ink-3); }

.divide-list > * + * { border-top: 1px solid var(--border); }

.weight-entry {
  padding: 10px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}
.weight-entry:first-child { padding-top: 0; }
.weight-entry:last-child { padding-bottom: 0; }

.entry-weight {
  font-size: 13px;
  font-weight: 800;
  color: var(--ink);
  min-width: 60px;
}

.entry-date {
  font-size: 11px;
  color: var(--ink-3);
  font-weight: 600;
  margin-left: auto;
}

.entry-notes {
  font-size: 10px;
  color: var(--ink-3);
  font-style: italic;
  width: 100%;
}
</style>
