<template>
  <div class="space-y-4">
    <!-- Log New Vaccine -->
    <div>
      <SectionLabel>Add Vaccination</SectionLabel>
      <AppCard>
        <div class="form-grid">
          <AppInput v-model="newVaccine.vaccineName" placeholder="Vaccine name (e.g., FVRCP, Rabies)" />
          <AppInput v-model="newVaccine.completedDate" type="date" label="Date Given" />
          <AppInput v-model="newVaccine.nextDueDate" type="date" label="Next Due" />
          <AppInput v-model="newVaccine.veterinarian" placeholder="Veterinarian name" />
          <AppInput v-model="newVaccine.batchNumber" placeholder="Batch number (optional)" />
          <AppButton variant="primary" @click="addNewVaccine" class="col-span-2" :disabled="loading">
            {{ loading ? 'Saving…' : '✓ Log Vaccine' }}
          </AppButton>
        </div>
      </AppCard>
    </div>

    <!-- Vaccine Status Summary -->
    <div v-if="vaccines.length" class="vaccine-summary">
      <div class="summary-stat">
        <div class="stat-num">{{ vaccines.length }}</div>
        <div class="stat-label">Total Vaccines</div>
      </div>
      <div class="summary-stat">
        <div class="stat-num" style="color: var(--coral)" v-if="overdueCount > 0">{{ overdueCount }}</div>
        <div class="stat-num" v-else style="color: var(--mint)">✓</div>
        <div class="stat-label">{{ overdueCount > 0 ? 'Overdue' : 'Up to date' }}</div>
      </div>
    </div>

    <!-- Vaccines -->
    <div>
      <SectionLabel>Vaccine Record</SectionLabel>
      <template v-if="vaccines.length > 0">
        <AppCard v-for="v in vaccines" :key="v.id" :flat="true" class="vaccine-card" :class="{ overdue: getStatus(v) === 'overdue' }">
          <div class="vaccine-header">
            <div class="vaccine-name">💉 {{ v.vaccineName }}</div>
            <AppBadge :type="getBadgeType(v)">
              {{ getStatusLabel(v) }}
            </AppBadge>
          </div>
          <div class="vaccine-dates">
            <div><span class="label">Given:</span> {{ formatDate(v.completedDate) }}</div>
            <div v-if="v.nextDueDate"><span class="label">Next due:</span> {{ formatDate(v.nextDueDate) }}</div>
          </div>
          <div v-if="v.veterinarian" class="vaccine-by">👨‍⚕️ {{ v.veterinarian }}</div>
          <div v-if="v.batchNumber" class="vaccine-batch">Batch: {{ v.batchNumber }}</div>
          <div class="vaccine-actions">
            <AppButton size="sm" variant="secondary" @click="markComplete(v.id)">Mark Complete</AppButton>
            <AppButton size="sm" variant="secondary" @click="deleteVaccineItem(v.id)">Delete</AppButton>
          </div>
        </AppCard>
      </template>
      <EmptyState v-else icon="💉" title="No vaccinations recorded" message="Add a vaccination record to track vaccine history." />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { AppCard, SectionLabel, EmptyState, AppButton, AppInput, AppBadge } from '../../ui'
import { useVaccinationsStore } from '../../../stores/vaccinations'

const props = defineProps({
  animal: { type: Object, required: true }
})

const vaccinationsStore = useVaccinationsStore()
const loading = ref(false)
const vaccines = ref([])

const newVaccine = ref({
  vaccineName: '',
  completedDate: '',
  nextDueDate: '',
  veterinarian: '',
  batchNumber: '',
})

const getStatus = (vaccine) => {
  if (!vaccine.nextDueDate && !vaccine.dueDate) return 'current'
  const nextDue = vaccine.nextDueDate || vaccine.dueDate
  const now = new Date()
  const dueDate = new Date(nextDue)
  const msPerDay = 24 * 60 * 60 * 1000
  const daysUntilDue = Math.floor((dueDate - now) / msPerDay)

  if (daysUntilDue < 0) return 'overdue'
  if (daysUntilDue <= 30) return 'due-soon'
  return 'current'
}

const getBadgeType = (vaccine) => {
  const status = getStatus(vaccine)
  const map = {
    'overdue': 'danger',
    'due-soon': 'warning',
    'current': 'success',
  }
  return map[status] || 'info'
}

const getStatusLabel = (vaccine) => {
  const status = getStatus(vaccine)
  const map = {
    'overdue': '⚠️ Overdue',
    'due-soon': '⏰ Due Soon',
    'current': '✓ Current',
  }
  return map[status] || 'Current'
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const overdueCount = computed(() => vaccines.value.filter(v => getStatus(v) === 'overdue').length)

const loadVaccines = async () => {
  if (!props.animal || !props.animal.id) return
  vaccines.value = await vaccinationsStore.fetchByAnimalId(props.animal.id)
}

const addNewVaccine = async () => {
  if (!newVaccine.value.vaccineName.trim() || !props.animal?.id) return

  loading.value = true
  try {
    const completedDate = newVaccine.value.completedDate
      ? new Date(newVaccine.value.completedDate)
      : new Date()

    await vaccinationsStore.addVaccine({
      animalId: props.animal.id,
      vaccineName: newVaccine.value.vaccineName,
      dueDate: completedDate,
      completedDate: completedDate,
      nextDueDate: newVaccine.value.nextDueDate ? new Date(newVaccine.value.nextDueDate) : null,
      veterinarian: newVaccine.value.veterinarian,
      batchNumber: newVaccine.value.batchNumber,
    })

    // Reset form
    newVaccine.value = {
      vaccineName: '',
      completedDate: '',
      nextDueDate: '',
      veterinarian: '',
      batchNumber: '',
    }

    // Reload vaccines
    await loadVaccines()
  } catch (error) {
    console.error('Failed to add vaccine:', error)
  } finally {
    loading.value = false
  }
}

const markComplete = async (id) => {
  loading.value = true
  try {
    await vaccinationsStore.markComplete(id, new Date())
    await loadVaccines()
  } catch (error) {
    console.error('Failed to mark vaccine complete:', error)
  } finally {
    loading.value = false
  }
}

const deleteVaccineItem = async (id) => {
  if (!confirm('Delete this vaccination record?')) return
  loading.value = true
  try {
    await vaccinationsStore.deleteVaccine(id)
    await loadVaccines()
  } catch (error) {
    console.error('Failed to delete vaccine:', error)
  } finally {
    loading.value = false
  }
}

onMounted(loadVaccines)
</script>

<style scoped>
.space-y-4 > * + * { margin-top: 16px; }

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.col-span-2 { grid-column: span 2; }

.vaccine-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.summary-stat {
  background: var(--surface);
  padding: 12px;
  border-radius: var(--r);
  border: 1px solid var(--border);
  text-align: center;
}

.stat-num {
  font-size: 24px;
  font-weight: 900;
  color: var(--mint);
}

.stat-label {
  font-size: 11px;
  color: var(--ink-3);
  font-weight: 700;
  text-transform: uppercase;
  margin-top: 4px;
}

.vaccine-card {
  margin-bottom: 8px;
  border-left: 3px solid var(--border);
}

.vaccine-card.overdue {
  border-left-color: var(--coral);
  background: rgba(255, 107, 107, 0.05);
}

.vaccine-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  gap: 8px;
}

.vaccine-name {
  font-size: 13px;
  font-weight: 800;
  color: var(--ink);
}

.vaccine-dates {
  font-size: 11px;
  color: var(--ink-3);
  font-weight: 600;
  margin-bottom: 6px;
  line-height: 1.6;
}

.label {
  color: var(--ink-3);
  font-weight: 700;
}

.vaccine-by {
  font-size: 11px;
  color: var(--ink-3);
  font-weight: 600;
}

.vaccine-batch {
  font-size: 10px;
  color: var(--ink-3);
  font-weight: 600;
  margin-top: 4px;
}

.vaccine-actions {
  display: flex;
  gap: 6px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--border);
}
</style>
