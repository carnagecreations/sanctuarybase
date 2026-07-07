<template>
  <div>
    <!-- Health Vitals Section -->
    <div class="section">
      <div class="section-header">
        <SectionLabel>Health Vitals</SectionLabel>
        <AppButton size="sm" variant="secondary" @click="showVitalModal = true">+ Add Vital</AppButton>
      </div>
      <AppCard :flat="true">
        <div v-if="vitals.length" class="vitals-list">
          <div v-for="v in vitals" :key="v.id" class="vital-item">
            <div class="vital-info">
              <div class="vital-date">{{ formatDate(v.date) }}</div>
              <div class="vital-data">
                <span v-if="v.temp">🌡 {{ v.temp }}°F</span>
                <span v-if="v.hr">❤️ {{ v.hr }} bpm</span>
                <span v-if="v.rr">💨 {{ v.rr }} brpm</span>
              </div>
              <div v-if="v.notes" class="vital-notes">{{ v.notes }}</div>
            </div>
            <div class="vital-actions">
              <button class="action-btn" @click="editVital(v)" title="Edit">✏️</button>
              <button class="action-btn danger" @click="deleteVital(v.id)" title="Delete">🗑</button>
            </div>
          </div>
        </div>
        <EmptyState v-else icon="🌡" title="No vitals" message="Log temperature, heart rate, respiration." />
      </AppCard>
    </div>

    <!-- Vet Visits Section -->
    <div class="section">
      <div class="section-header">
        <SectionLabel>Vet Visits</SectionLabel>
        <AppButton size="sm" variant="secondary" @click="showVisitModal = true">+ Add Visit</AppButton>
      </div>
      <AppCard :flat="true">
        <div v-if="vetVisits.length" class="divide-list">
          <div v-for="v in vetVisits" :key="v.id" class="visit-card">
            <div class="visit-info">
              <div class="visit-date">{{ formatDate(v.date) }}</div>
              <div class="visit-reason">{{ v.reason }}</div>
              <div v-if="v.findings" class="visit-findings">{{ v.findings }}</div>
              <div class="visit-meta">
                <span v-if="v.temp">🌡 {{ v.temp }}°F</span>
                <span v-if="v.weight">⚖️ {{ v.weight }} lbs</span>
                <span v-if="v.recheck">📅 Recheck: {{ v.recheck }}</span>
              </div>
            </div>
            <div class="visit-actions">
              <button class="action-btn" @click="editVet(v)" title="Edit">✏️</button>
              <button class="action-btn danger" @click="deleteVet(v.id)" title="Delete">🗑</button>
            </div>
          </div>
        </div>
        <EmptyState v-else icon="🏥" title="No vet visits" message="Log veterinary visits." />
      </AppCard>
    </div>

    <!-- Medical Events Section -->
    <div class="section">
      <div class="section-header">
        <SectionLabel>Medical Events</SectionLabel>
        <AppButton size="sm" variant="secondary" @click="showEventModal = true">+ Add Event</AppButton>
      </div>
      <AppCard :flat="true">
        <div v-if="medicalEvents.length" class="divide-list">
          <div v-for="e in medicalEvents" :key="e.id" class="med-event">
            <div class="med-event-info">
              <div class="med-event__header">
                <span class="med-event__type">{{ e.typeIcon }} {{ e.type }}</span>
                <span class="med-event__date">{{ formatDate(e.date) }}</span>
              </div>
              <div class="med-event__title">{{ e.title }}</div>
              <div v-if="e.description" class="med-event__desc">{{ e.description }}</div>
            </div>
            <div class="med-event-actions">
              <button class="action-btn" @click="editEvent(e)" title="Edit">✏️</button>
              <button class="action-btn danger" @click="deleteEvent(e.id)" title="Delete">🗑</button>
            </div>
          </div>
        </div>
        <EmptyState v-else icon="📋" title="No medical events" message="Log health events." />
      </AppCard>
    </div>

    <!-- Edit Vital Modal -->
    <AppModal v-if="showVitalModal" :open="true" :title="editingVital ? 'Edit Vital' : 'New Vital'" size="sm" @close="closeVitalModal">
      <div class="form-field">
        <label>Date *</label>
        <AppInput v-model="vitalForm.date" type="date" />
      </div>
      <div class="form-row">
        <div class="form-field">
          <label>Temperature (°F)</label>
          <AppInput v-model="vitalForm.temp" type="number" placeholder="101.5" step="0.1" />
        </div>
        <div class="form-field">
          <label>Heart Rate (bpm)</label>
          <AppInput v-model="vitalForm.hr" type="number" placeholder="120" />
        </div>
      </div>
      <div class="form-field">
        <label>Respiration Rate (brpm)</label>
        <AppInput v-model="vitalForm.rr" type="number" placeholder="25" />
      </div>
      <div class="form-field">
        <label>Notes</label>
        <AppInput v-model="vitalForm.notes" placeholder="Optional observations..." />
      </div>
      <template #actions>
        <AppButton @click="closeVitalModal">Cancel</AppButton>
        <AppButton variant="primary" @click="saveVital" :loading="loading">{{ editingVital ? 'Update' : 'Add' }} Vital</AppButton>
      </template>
    </AppModal>

    <!-- Edit Visit Modal -->
    <AppModal v-if="showVisitModal" :open="true" :title="editingVet ? 'Edit Vet Visit' : 'New Vet Visit'" size="sm" @close="closeVisitModal">
      <div class="form-field">
        <label>Date *</label>
        <AppInput v-model="vetForm.date" type="date" />
      </div>
      <div class="form-field">
        <label>Reason for Visit *</label>
        <AppInput v-model="vetForm.reason" placeholder="Initial exam, follow-up..." />
      </div>
      <div class="form-field">
        <label>Findings</label>
        <AppInput v-model="vetForm.findings" placeholder="Diagnosis, observations..." />
      </div>
      <div class="form-row">
        <div class="form-field">
          <label>Temperature (°F)</label>
          <AppInput v-model="vetForm.temp" type="number" placeholder="101.5" step="0.1" />
        </div>
        <div class="form-field">
          <label>Weight</label>
          <AppInput v-model="vetForm.weight" type="number" placeholder="8.5" step="0.1" />
        </div>
      </div>
      <div class="form-field">
        <label>Recheck Date</label>
        <AppInput v-model="vetForm.recheck" type="date" />
      </div>
      <template #actions>
        <AppButton @click="closeVisitModal">Cancel</AppButton>
        <AppButton variant="primary" @click="saveVet" :loading="loading">{{ editingVet ? 'Update' : 'Add' }} Visit</AppButton>
      </template>
    </AppModal>

    <!-- Edit Event Modal -->
    <AppModal v-if="showEventModal" :open="true" :title="editingEvent ? 'Edit Medical Event' : 'New Medical Event'" size="sm" @close="closeEventModal">
      <div class="form-field">
        <label>Event Type *</label>
        <select v-model="eventForm.type" class="form-select">
          <option value="">Select type...</option>
          <option v-for="t in medEventTypes" :key="t.id" :value="t.id">{{ t.icon }} {{ t.label }}</option>
        </select>
      </div>
      <div class="form-field">
        <label>Date *</label>
        <AppInput v-model="eventForm.date" type="date" />
      </div>
      <div class="form-field">
        <label>Title *</label>
        <AppInput v-model="eventForm.title" placeholder="Brief summary..." />
      </div>
      <div class="form-field">
        <label>Description</label>
        <AppInput v-model="eventForm.description" placeholder="Detailed notes..." />
      </div>
      <template #actions>
        <AppButton @click="closeEventModal">Cancel</AppButton>
        <AppButton variant="primary" @click="saveEvent" :loading="loading">{{ editingEvent ? 'Update' : 'Add' }} Event</AppButton>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { AppCard, SectionLabel, AppButton, EmptyState, AppInput, AppModal } from '../../ui'
import { useUIStore } from '../../../stores/ui'
import { useMedicalRecordsStore } from '../../../stores/medicalRecords'

const props = defineProps({
  animal: { type: Object, required: true }
})

const ui = useUIStore()
const medicalStore = useMedicalRecordsStore()

const loading = ref(false)

// All three sections live in the `animalMedical` collection, discriminated
// by `recordType` ('vital' | 'visit' | 'event').
const records = ref([])

onMounted(async () => {
  if (!props.animal?.id) return
  loading.value = true
  try {
    records.value = await medicalStore.fetchByAnimalId(props.animal.id)
  } finally {
    loading.value = false
  }
})

// Modal states
const showVitalModal = ref(false)
const showVisitModal = ref(false)
const showEventModal = ref(false)

const editingVital = ref(null)
const editingVet = ref(null)
const editingEvent = ref(null)

// Form states
const vitalForm = ref({ date: '', temp: '', hr: '', rr: '', notes: '' })
const vetForm = ref({ date: '', reason: '', findings: '', temp: '', weight: '', recheck: '' })
const eventForm = ref({ date: '', type: '', title: '', description: '' })

const medEventTypes = [
  { id: 'vet', icon: '🏥', label: 'Vet Visit' },
  { id: 'proc', icon: '🔪', label: 'Procedure' },
  { id: 'note', icon: '📝', label: 'Health Note' },
  { id: 'dental', icon: '🦷', label: 'Dental' },
  { id: 'injury', icon: '🩹', label: 'Injury' },
  { id: 'other', icon: '📋', label: 'Other' },
]

const vitals = computed(() => records.value.filter(r => r.recordType === 'vital'))
const vetVisits = computed(() => records.value.filter(r => r.recordType === 'visit'))
const medicalEvents = computed(() => records.value.filter(r => r.recordType === 'event'))

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const getTypeLabel = (typeId) => {
  const t = medEventTypes.find(e => e.id === typeId)
  return t ? t.label : 'Event'
}

const getTypeIcon = (typeId) => {
  const t = medEventTypes.find(e => e.id === typeId)
  return t ? t.icon : '📋'
}

// Date objects come back from the store; date inputs need YYYY-MM-DD strings
const toDateInput = (d) => {
  if (!d) return ''
  const date = d instanceof Date ? d : new Date(d)
  return isNaN(date) ? '' : date.toISOString().split('T')[0]
}

// Vital handlers
const editVital = (vital) => {
  editingVital.value = vital
  vitalForm.value = { date: toDateInput(vital.date), temp: vital.temp || '', hr: vital.hr || '', rr: vital.rr || '', notes: vital.notes || '' }
  showVitalModal.value = true
}

const closeVitalModal = () => {
  showVitalModal.value = false
  editingVital.value = null
  vitalForm.value = { date: '', temp: '', hr: '', rr: '', notes: '' }
}

const saveVital = async () => {
  if (!vitalForm.value.date) {
    ui.showToast('Date is required', 'error')
    return
  }
  if (!props.animal?.id) {
    ui.showToast('Select a real animal first', 'error')
    return
  }
  loading.value = true
  try {
    if (editingVital.value) {
      await medicalStore.updateRecord(editingVital.value.id, { ...vitalForm.value })
      const idx = records.value.findIndex(r => r.id === editingVital.value.id)
      if (idx !== -1) records.value[idx] = { ...records.value[idx], ...vitalForm.value }
      ui.showToast('Vital updated')
    } else {
      const created = await medicalStore.addRecord({ ...vitalForm.value, animalId: props.animal.id, recordType: 'vital' })
      records.value.unshift(created)
      ui.showToast('Vital added')
    }
    closeVitalModal()
  } catch (err) {
    ui.showToast('Error saving vital', 'error')
  } finally {
    loading.value = false
  }
}

const deleteVital = async (id) => {
  if (!confirm('Delete this vital?')) return
  loading.value = true
  try {
    await medicalStore.deleteRecord(id)
    records.value = records.value.filter(r => r.id !== id)
    ui.showToast('Vital deleted')
  } catch (err) {
    ui.showToast('Error deleting vital', 'error')
  } finally {
    loading.value = false
  }
}

// Vet visit handlers
const editVet = (visit) => {
  editingVet.value = visit
  vetForm.value = { date: toDateInput(visit.date), reason: visit.reason || '', findings: visit.findings || '', temp: visit.temp || '', weight: visit.weight || '', recheck: visit.recheck || '' }
  showVisitModal.value = true
}

const closeVisitModal = () => {
  showVisitModal.value = false
  editingVet.value = null
  vetForm.value = { date: '', reason: '', findings: '', temp: '', weight: '', recheck: '' }
}

const saveVet = async () => {
  if (!vetForm.value.date || !vetForm.value.reason) {
    ui.showToast('Date and reason are required', 'error')
    return
  }
  if (!props.animal?.id) {
    ui.showToast('Select a real animal first', 'error')
    return
  }
  loading.value = true
  try {
    if (editingVet.value) {
      await medicalStore.updateRecord(editingVet.value.id, { ...vetForm.value })
      const idx = records.value.findIndex(r => r.id === editingVet.value.id)
      if (idx !== -1) records.value[idx] = { ...records.value[idx], ...vetForm.value }
      ui.showToast('Vet visit updated')
    } else {
      const created = await medicalStore.addRecord({ ...vetForm.value, animalId: props.animal.id, recordType: 'visit' })
      records.value.unshift(created)
      ui.showToast('Vet visit added')
    }
    closeVisitModal()
  } catch (err) {
    ui.showToast('Error saving vet visit', 'error')
  } finally {
    loading.value = false
  }
}

const deleteVet = async (id) => {
  if (!confirm('Delete this vet visit?')) return
  loading.value = true
  try {
    await medicalStore.deleteRecord(id)
    records.value = records.value.filter(r => r.id !== id)
    ui.showToast('Vet visit deleted')
  } catch (err) {
    ui.showToast('Error deleting vet visit', 'error')
  } finally {
    loading.value = false
  }
}

// Event handlers
const editEvent = (event) => {
  editingEvent.value = event
  eventForm.value = { date: toDateInput(event.date), type: event.type || '', title: event.title || '', description: event.description || '' }
  showEventModal.value = true
}

const closeEventModal = () => {
  showEventModal.value = false
  editingEvent.value = null
  eventForm.value = { date: '', type: '', title: '', description: '' }
}

const saveEvent = async () => {
  if (!eventForm.value.date || !eventForm.value.type || !eventForm.value.title) {
    ui.showToast('Date, type, and title are required', 'error')
    return
  }
  if (!props.animal?.id) {
    ui.showToast('Select a real animal first', 'error')
    return
  }
  loading.value = true
  try {
    const typeInfo = medEventTypes.find(t => t.id === eventForm.value.type)
    const newData = { ...eventForm.value, typeIcon: typeInfo?.icon, type: typeInfo?.id }
    if (editingEvent.value) {
      await medicalStore.updateRecord(editingEvent.value.id, newData)
      const idx = records.value.findIndex(r => r.id === editingEvent.value.id)
      if (idx !== -1) records.value[idx] = { ...records.value[idx], ...newData }
      ui.showToast('Event updated')
    } else {
      const created = await medicalStore.addRecord({ ...newData, animalId: props.animal.id, recordType: 'event' })
      records.value.unshift(created)
      ui.showToast('Event added')
    }
    closeEventModal()
  } catch (err) {
    ui.showToast('Error saving event', 'error')
  } finally {
    loading.value = false
  }
}

const deleteEvent = async (id) => {
  if (!confirm('Delete this event?')) return
  loading.value = true
  try {
    await medicalStore.deleteRecord(id)
    records.value = records.value.filter(r => r.id !== id)
    ui.showToast('Event deleted')
  } catch (err) {
    ui.showToast('Error deleting event', 'error')
  } finally {
    loading.value = false
  }
}

</script>

<style scoped>
.section { margin-bottom: 16px; }

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.divide-list > * + * { border-top: 1px solid var(--border); }

/* Vitals */
.vitals-list { display: flex; flex-direction: column; gap: 0; }
.vital-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
}
.vital-item:last-child { border-bottom: none; }
.vital-info { flex: 1; }
.vital-date { font-size: 13px; font-weight: 800; color: var(--ink); }
.vital-data {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 4px;
  font-size: 12px;
  color: var(--mint);
  font-weight: 700;
}
.vital-notes { font-size: 11px; color: var(--ink-3); margin-top: 4px; }
.vital-actions { display: flex; gap: 4px; flex-shrink: 0; }

/* Visits */
.visit-card {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
}
.visit-card:last-child { border-bottom: none; }
.visit-info { flex: 1; }
.visit-date { font-size: 13px; font-weight: 800; color: var(--ink); }
.visit-reason { font-size: 12px; color: var(--mint); font-weight: 700; margin-top: 2px; }
.visit-findings { font-size: 11px; color: var(--ink-3); margin-top: 4px; line-height: 1.5; }
.visit-meta {
  display: flex;
  gap: 10px;
  margin-top: 6px;
  flex-wrap: wrap;
  font-size: 11px;
  color: var(--ink-3);
  font-weight: 600;
}
.visit-actions { display: flex; gap: 4px; flex-shrink: 0; }

/* Medical Events */
.med-event {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
}
.med-event:last-child { border-bottom: none; }
.med-event-info { flex: 1; }
.med-event__header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 4px;
}
.med-event__type { font-size: 12px; font-weight: 800; color: var(--ink); }
.med-event__date { font-size: 11px; color: var(--ink-3); font-weight: 600; }
.med-event__title { font-size: 13px; font-weight: 700; color: var(--ink); margin-bottom: 4px; }
.med-event__desc { font-size: 11px; color: var(--ink-3); line-height: 1.5; }
.med-event-actions { display: flex; gap: 4px; flex-shrink: 0; }

/* Action buttons */
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

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.form-field label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--ink-3);
  letter-spacing: .03em;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}

.form-row .form-field { margin-bottom: 0; }

.form-select {
  padding: 9px 12px;
  background: var(--surface-2);
  border: 1.5px solid var(--border);
  border-radius: var(--r);
  color: var(--ink);
  font-family: 'Nunito', sans-serif;
  font-size: 13px;
  cursor: pointer;
  transition: border .15s;
}

.form-select:focus { outline: none; border-color: var(--mint); }
</style>
