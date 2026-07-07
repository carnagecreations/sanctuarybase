<template>
  <div class="space-y-4">
    <!-- Add Medical Record -->
    <div>
      <SectionLabel>Add Medical Record</SectionLabel>
      <AppCard>
        <div class="form-grid">
          <AppInput v-model="newRecord.description" placeholder="Description (e.g., Vet visit, diagnosis)" />
          <AppSelect v-model="newRecord.type" :options="recordTypeOptions" />
          <AppInput v-model="newRecord.veterinarian" placeholder="Veterinarian name" />
          <AppInput v-model="newRecord.date" type="date" />
          <AppInput v-model="newRecord.notes" placeholder="Additional notes" style="grid-column: span 2" />
          <AppInput v-model="newRecord.cost" type="number" placeholder="Cost (optional)" />
          <AppButton variant="primary" @click="addMedicalRecord" style="grid-column: span 2" :disabled="loading">
            {{ loading ? 'Saving…' : '✓ Add Record' }}
          </AppButton>
        </div>
      </AppCard>
    </div>

    <!-- Medical History -->
    <div>
      <SectionLabel>Medical History</SectionLabel>
      <template v-if="records.length > 0">
        <div v-for="r in records" :key="r.id" class="med-card">
          <AppCard noPad>
            <div class="med-card-content">
              <div class="med-main">
                <div class="med-header">
                  <span class="med-name">{{ getTypeEmoji(r.type) }} {{ r.description }}</span>
                  <AppBadge :type="getTypeVariant(r.type)">{{ r.type }}</AppBadge>
                </div>
                <div class="med-details">
                  <div><span class="label">Date:</span> {{ formatDate(r.date) }}</div>
                  <div v-if="r.veterinarian"><span class="label">Vet:</span> {{ r.veterinarian }}</div>
                  <div v-if="r.notes"><span class="label">Notes:</span> {{ r.notes }}</div>
                  <div v-if="r.cost"><span class="label">Cost:</span> ${{ r.cost }}</div>
                </div>
              </div>
              <div class="med-actions">
                <AppButton size="sm" variant="secondary" @click="editRecord(r)">Edit</AppButton>
                <AppButton size="sm" variant="secondary" @click="deleteRecordItem(r.id)">Delete</AppButton>
              </div>
            </div>
          </AppCard>
        </div>
      </template>
      <EmptyState v-else icon="📋" title="No medical records" message="Add a record to track vet visits, diagnoses, and treatments." />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { AppCard, SectionLabel, AppButton, EmptyState, AppInput, AppSelect, AppBadge } from '../../ui'
import { useMedicalRecordsStore } from '../../../stores/medicalRecords'

const props = defineProps({
  animal: { type: Object, required: true }
})

const medicalStore = useMedicalRecordsStore()
const loading = ref(false)
const records = ref([])
const editingId = ref(null)

const recordTypeOptions = [
  { label: 'Vet Visit', value: 'vet visit' },
  { label: 'Diagnosis', value: 'diagnosis' },
  { label: 'Treatment', value: 'treatment' },
  { label: 'Examination', value: 'examination' },
  { label: 'Procedure', value: 'procedure' },
  { label: 'Vaccination', value: 'vaccination' },
  { label: 'Lab Work', value: 'lab work' },
]

const newRecord = ref({
  description: '',
  type: 'vet visit',
  veterinarian: '',
  date: new Date().toISOString().split('T')[0],
  notes: '',
  cost: '',
})

const getTypeEmoji = (type) => {
  const map = {
    'vet visit': '🏥',
    'diagnosis': '📋',
    'treatment': '💊',
    'examination': '👀',
    'procedure': '🔧',
    'vaccination': '💉',
    'lab work': '🔬',
  }
  return map[type] || '📋'
}

const getTypeVariant = (type) => {
  const map = {
    'vet visit': 'info',
    'diagnosis': 'warning',
    'treatment': 'success',
    'examination': 'info',
    'procedure': 'warning',
    'vaccination': 'success',
    'lab work': 'info',
  }
  return map[type] || 'info'
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const loadRecords = async () => {
  if (!props.animal || !props.animal.id) return
  records.value = await medicalStore.fetchByAnimalId(props.animal.id)
}

const addMedicalRecord = async () => {
  if (!newRecord.value.description.trim() || !props.animal?.id) return

  loading.value = true
  try {
    await medicalStore.addRecord({
      animalId: props.animal.id,
      description: newRecord.value.description,
      type: newRecord.value.type,
      veterinarian: newRecord.value.veterinarian,
      date: new Date(newRecord.value.date),
      notes: newRecord.value.notes,
      cost: newRecord.value.cost ? parseFloat(newRecord.value.cost) : null,
      prescriptions: [],
    })

    // Reset form
    newRecord.value = {
      description: '',
      type: 'vet visit',
      veterinarian: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
      cost: '',
    }

    // Reload records
    await loadRecords()
  } catch (error) {
    console.error('Failed to add record:', error)
  } finally {
    loading.value = false
  }
}

const editRecord = (record) => {
  newRecord.value = {
    description: record.description,
    type: record.type,
    veterinarian: record.veterinarian || '',
    date: record.date instanceof Date ? record.date.toISOString().split('T')[0] : record.date,
    notes: record.notes || '',
    cost: record.cost || '',
  }
  editingId.value = record.id
}

const deleteRecordItem = async (id) => {
  if (!confirm('Delete this medical record?')) return
  loading.value = true
  try {
    await medicalStore.deleteRecord(id)
    await loadRecords()
  } catch (error) {
    console.error('Failed to delete record:', error)
  } finally {
    loading.value = false
  }
}

onMounted(loadRecords)
</script>

<style scoped>
.space-y-4 > * + * { margin-top: 16px; }

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.med-card {
  margin-bottom: 8px;
}

.med-card-content {
  padding: 14px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.med-main {
  flex: 1;
}

.med-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.med-name {
  font-size: 14px;
  font-weight: 800;
  color: var(--ink);
}

.med-details {
  font-size: 11px;
  color: var(--ink-3);
  font-weight: 600;
  line-height: 1.8;
  space-y: 2px;
}

.label {
  font-weight: 700;
  color: var(--ink-2);
}

.med-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
}

.med-card-past {
  margin-bottom: 8px;
  opacity: 0.7;
}

.past-med-content {
  padding: 12px;
}

.med-details-past {
  font-size: 11px;
  color: var(--ink-3);
  font-weight: 600;
  margin-top: 2px;
}

.med-dates {
  font-size: 10px;
  color: var(--ink-3);
  margin-top: 4px;
}

.divide-list > * + * { border-top: 1px solid var(--border); padding-top: 12px; }
.divide-list > *:first-child { padding-top: 0; }

.log-entry {
  padding: 12px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.log-med {
  font-size: 12px;
  font-weight: 700;
  color: var(--ink);
}

.log-time {
  font-size: 11px;
  color: var(--ink-3);
  font-weight: 600;
}

.log-by {
  font-size: 10px;
  color: var(--ink-3);
}
</style>
