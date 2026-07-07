<template>
  <PageContainer>
    <!-- Add to Quarantine Button -->
    <div class="page-header">
      <h1>Animal Quarantine</h1>
      <button class="btn-primary" @click="toggleAddForm">
        {{ addFormModal.showModal.value ? '✕ Cancel' : '➕ Add to Quarantine' }}
      </button>
    </div>

    <!-- Add Quarantine Form -->
    <AppCard v-if="addFormModal.showModal.value" class="form-card">
      <h2>Isolate Animal</h2>
      <form @submit.prevent="handleAddSubmit">
        <div class="form-group">
          <label>Animal *</label>
          <AppSelect v-model="addFormModal.formData.value.animalId" :options="animalOptions" required />
        </div>

        <div class="form-group">
          <label>Reason for Quarantine *</label>
          <AppSelect
            v-model="addFormModal.formData.value.reason"
            :options="reasonOptions"
            required
          />
        </div>

        <div class="form-group">
          <label>Expected End Date *</label>
          <input
            v-model="addFormModal.formData.value.expectedEndDate"
            type="date"
            class="input-field"
            required
          />
        </div>

        <div class="form-group">
          <label>Notes</label>
          <textarea
            v-model="addFormModal.formData.value.notes"
            class="textarea-field"
            placeholder="Additional notes..."
            rows="4"
          ></textarea>
        </div>

        <button type="submit" class="btn-primary" :disabled="addFormModal.isSubmitting.value">
          {{ addFormModal.isSubmitting.value ? 'Adding...' : 'Add to Quarantine' }}
        </button>
      </form>
    </AppCard>

    <!-- Active Quarantines -->
    <SectionLabel>Currently Quarantined ({{ activeQuarantines.length }})</SectionLabel>
    <div v-if="activeQuarantines.length === 0" class="empty-state">
      <p>No animals in quarantine</p>
    </div>
    <div v-else class="quarantine-grid">
      <AppCard v-for="q in activeQuarantines" :key="q.id" class="quarantine-card">
        <div class="card-header">
          <h3>{{ getAnimalName(q.animalId) }}</h3>
          <span class="status-badge active">Active</span>
        </div>

        <div class="card-content">
          <div class="info-row">
            <span class="label">Species:</span>
            <span class="value">{{ getAnimalSpecies(q.animalId) }}</span>
          </div>
          <div class="info-row">
            <span class="label">Reason:</span>
            <span class="value">{{ q.reason }}</span>
          </div>
          <div class="info-row">
            <span class="label">Start Date:</span>
            <span class="value">{{ formatDate(q.startDate) }}</span>
          </div>
          <div class="info-row">
            <span class="label">Expected End:</span>
            <span class="value">{{ formatDate(q.expectedEndDate) }}</span>
          </div>

          <div v-if="q.notes" class="notes-section">
            <strong>Notes:</strong>
            <p>{{ q.notes }}</p>
          </div>

          <div class="days-remaining">
            <span :class="{ overdue: daysRemaining(q.expectedEndDate) < 0 }">
              {{ daysRemaining(q.expectedEndDate) < 0 ? '⚠️ Overdue' : `${daysRemaining(q.expectedEndDate)} days remaining` }}
            </span>
          </div>
        </div>

        <div class="card-actions">
          <button class="btn-secondary" @click="openCompleteForm(q.id)">
            ✓ Complete Quarantine
          </button>
        </div>
      </AppCard>
    </div>

    <!-- Complete Quarantine Modal -->
    <div v-if="completeFormModal.showModal.value" class="modal-overlay" @click.self="completeFormModal.closeModal">
      <AppCard class="modal-card">
        <h2>Complete Quarantine</h2>
        <p>Are you sure the animal can be released from quarantine?</p>
        <textarea
          v-model="completeFormModal.formData.value.notes"
          class="textarea-field"
          placeholder="Final notes (optional)..."
          rows="3"
        ></textarea>
        <div class="modal-actions">
          <button class="btn-secondary" @click="completeFormModal.closeModal">Cancel</button>
          <button class="btn-primary" @click="handleCompleteSubmit" :disabled="completeFormModal.isSubmitting.value">
            {{ completeFormModal.isSubmitting.value ? 'Completing...' : 'Confirm' }}
          </button>
        </div>
      </AppCard>
    </div>

    <!-- Completed Quarantines History -->
    <SectionLabel>Quarantine History</SectionLabel>
    <div v-if="completedQuarantines.length === 0" class="empty-state">
      <p>No completed quarantines</p>
    </div>
    <div v-else class="history-list">
      <AppCard
        v-for="q in completedQuarantines"
        :key="q.id"
        class="history-item"
        :flat="true"
      >
        <div class="history-header">
          <div>
            <h4>{{ getAnimalName(q.animalId) }}</h4>
            <span class="history-meta">{{ q.reason }}</span>
          </div>
          <span class="status-badge completed">Completed</span>
        </div>
        <div class="history-dates">
          <span>{{ formatDate(q.startDate) }} → {{ formatDate(q.actualEndDate) }}</span>
        </div>
      </AppCard>
    </div>
  </PageContainer>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useQuarantineStore } from '../../../stores/quarantine'
import { useAnimalsStore } from '../../../stores/animals'
import { useFormModal } from '../../../composables/useFormModal'
import { PageContainer, AppCard, SectionLabel, AppSelect } from '../../ui'

const quarantineStore = useQuarantineStore()
const animalsStore = useAnimalsStore()

// Add to Quarantine form modal
const addFormModal = useFormModal()

// Complete Quarantine form modal
const completeFormModal = useFormModal()

const reasonOptions = [
  { value: 'infectious-disease', label: 'Infectious Disease' },
  { value: 'injury-treatment', label: 'Injury Treatment' },
  { value: 'behavioral', label: 'Behavioral Issues' },
  { value: 'medical-observation', label: 'Medical Observation' },
  { value: 'parasites', label: 'Parasites' },
  { value: 'respiratory', label: 'Respiratory Issues' },
  { value: 'new-intake', label: 'New Intake' },
  { value: 'other', label: 'Other' }
]

const addFormTemplate = {
  animalId: '',
  reason: '',
  expectedEndDate: '',
  notes: '',
  approvedBy: 'Admin' // Set current user in real app
}

const completeFormTemplate = {
  notes: ''
}

const animalOptions = computed(() => {
  return animalsStore.animals.map(a => ({
    value: a.id,
    label: `${a.name} (${a.species})`
  }))
})

const activeQuarantines = computed(() => {
  return quarantineStore.quarantines.filter(q => q.status === 'active')
})

const completedQuarantines = computed(() => {
  return quarantineStore.quarantines.filter(q => q.status === 'completed')
})

onMounted(async () => {
  await animalsStore.fetchAnimals()
  await quarantineStore.fetchAll()
})

const getAnimalName = (animalId) => {
  const animal = animalsStore.animals.find(a => a.id === animalId)
  return animal?.name || 'Unknown'
}

const getAnimalSpecies = (animalId) => {
  const animal = animalsStore.animals.find(a => a.id === animalId)
  return animal?.species || 'Unknown'
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  if (date instanceof Date) return date.toLocaleDateString()
  if (date.toDate) return date.toDate().toLocaleDateString()
  return new Date(date).toLocaleDateString()
}

const daysRemaining = (expectedEndDate) => {
  if (!expectedEndDate) return 0
  const end = expectedEndDate instanceof Date
    ? expectedEndDate
    : expectedEndDate.toDate?.() || new Date(expectedEndDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)
  return Math.ceil((end - today) / (1000 * 60 * 60 * 24))
}

const toggleAddForm = () => {
  if (addFormModal.showModal.value) {
    addFormModal.closeModal()
  } else {
    addFormModal.openAdd(addFormTemplate)
  }
}

const handleAddSubmit = async () => {
  if (!addFormModal.formData.value.animalId || !addFormModal.formData.value.reason || !addFormModal.formData.value.expectedEndDate) {
    alert('Please fill in all required fields')
    return
  }

  try {
    await addFormModal.submitForm(async (formData) => {
      await quarantineStore.addQuarantine({
        ...formData,
        expectedEndDate: new Date(formData.expectedEndDate)
      })
      await quarantineStore.fetchAll()
    })
  } catch (err) {
    alert('Error adding quarantine: ' + err.message)
  }
}

const openCompleteForm = (id) => {
  completeFormModal.openAdd(completeFormTemplate)
  completeFormModal.formData.value.quarantineId = id
}

const handleCompleteSubmit = async () => {
  try {
    await completeFormModal.submitForm(async (formData) => {
      await quarantineStore.completeQuarantine(
        formData.quarantineId,
        formData.notes
      )
      await quarantineStore.fetchAll()
    })
  } catch (err) {
    alert('Error completing quarantine: ' + err.message)
  }
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0;
  font-size: 28px;
}

.form-card {
  margin-bottom: 24px;
}

.form-card h2 {
  margin-top: 0;
  margin-bottom: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 6px;
  font-size: 14px;
}

.input-field,
.textarea-field {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-family: inherit;
  font-size: 14px;
  background: var(--color-input-bg);
  color: var(--color-text);
}

.textarea-field {
  resize: vertical;
}

.quarantine-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.quarantine-card {
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 12px;
  gap: 8px;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.status-badge.active {
  background: var(--color-success-bg);
  color: var(--color-success-text);
}

.status-badge.completed {
  background: var(--color-muted-bg);
  color: var(--color-muted-text);
}

.card-content {
  flex: 1;
  margin-bottom: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
  border-bottom: 1px solid var(--color-border);
}

.info-row .label {
  font-weight: 500;
  color: var(--color-text-secondary);
}

.info-row .value {
  color: var(--color-text);
}

.notes-section {
  margin-top: 12px;
  padding: 10px;
  background: var(--color-muted-bg);
  border-radius: 4px;
  font-size: 13px;
}

.notes-section strong {
  display: block;
  margin-bottom: 6px;
}

.notes-section p {
  margin: 0;
  color: var(--color-text);
  line-height: 1.4;
}

.days-remaining {
  margin-top: 12px;
  padding: 8px;
  background: var(--color-warning-bg);
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-warning-text);
}

.days-remaining .overdue {
  color: var(--color-error);
}

.card-actions {
  display: flex;
  gap: 8px;
}

.card-actions button {
  flex: 1;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-card {
  max-width: 400px;
  width: 90%;
}

.modal-card h2 {
  margin-top: 0;
  margin-bottom: 12px;
}

.modal-card p {
  margin: 0 0 16px 0;
  color: var(--color-text-secondary);
}

.modal-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.modal-actions button {
  flex: 1;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 32px;
}

.history-item {
  padding: 12px 16px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.history-header h4 {
  margin: 0;
  font-size: 15px;
}

.history-meta {
  display: block;
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-top: 2px;
}

.history-dates {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.empty-state {
  text-align: center;
  padding: 32px 16px;
  color: var(--color-text-secondary);
}

.empty-state p {
  margin: 0;
}
</style>
