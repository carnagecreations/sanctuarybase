<template>
  <div>
    <div class="section-header">
      <SectionLabel>Upcoming appointments</SectionLabel>
      <AppButton size="sm" variant="secondary" @click="openApptModal()">+ Add Appointment</AppButton>
    </div>
    <AppCard v-if="upcoming.length" :flat="true">
      <div class="divide-list">
        <div v-for="a in upcoming" :key="a.id" class="appt-card">
          <div class="appt-date">{{ formatDate(a.date) }}<template v-if="a.time"> at {{ a.time }}</template></div>
          <div class="appt-type">{{ a.type }}</div>
          <div class="appt-actions">
            <button class="action-btn" @click="openApptModal(a)" title="Edit / reschedule">✏️</button>
            <button class="action-btn danger" @click="deleteAppt(a.id)" title="Delete">🗑</button>
          </div>
          <div v-if="a.clinic" class="appt-clinic">{{ a.clinic }}</div>
          <div v-if="a.notes" class="appt-clinic">{{ a.notes }}</div>
        </div>
      </div>
    </AppCard>
    <EmptyState v-else icon="📅" title="No upcoming appointments" message="Add vet appointments with the button above." />

    <template v-if="past.length">
      <SectionLabel>Past appointments</SectionLabel>
      <AppCard :flat="true">
        <div class="divide-list">
          <div v-for="a in past" :key="a.id" class="appt-card past">
            <div class="appt-date">{{ formatDate(a.date) }}<template v-if="a.time"> at {{ a.time }}</template></div>
            <div class="appt-type">{{ a.type }}</div>
            <div class="appt-actions">
              <button class="action-btn danger" @click="deleteAppt(a.id)" title="Delete">🗑</button>
            </div>
            <div v-if="a.clinic" class="appt-clinic">{{ a.clinic }}</div>
          </div>
        </div>
      </AppCard>
    </template>

    <div class="section-header">
      <SectionLabel>Vet information</SectionLabel>
      <AppButton size="sm" variant="secondary" @click="openVetInfoModal">✏️ Edit</AppButton>
    </div>
    <AppCard title="Primary vet">
      <p class="info-text">{{ animal.vetName || 'No primary vet on file' }}</p>
      <p v-if="animal.vetPhone" class="info-text">Phone: {{ animal.vetPhone }}</p>
    </AppCard>

    <!-- Add / Edit Appointment Modal -->
    <AppModal v-if="showApptModal" :open="true" :title="editingAppt ? 'Edit Appointment' : 'New Appointment'" size="sm" @close="closeApptModal">
      <div class="form-field">
        <label>Date *</label>
        <AppInput v-model="apptForm.date" type="date" />
      </div>
      <div class="form-field">
        <label>Time</label>
        <AppInput v-model="apptForm.time" type="time" />
      </div>
      <div class="form-field">
        <label>Type / reason *</label>
        <AppInput v-model="apptForm.type" placeholder="Recheck, vaccines, dental..." />
      </div>
      <div class="form-field">
        <label>Clinic</label>
        <AppInput v-model="apptForm.clinic" placeholder="Clinic name..." />
      </div>
      <div class="form-field">
        <label>Notes</label>
        <AppInput v-model="apptForm.notes" placeholder="Anything the vet should know..." />
      </div>
      <template #actions>
        <AppButton @click="closeApptModal">Cancel</AppButton>
        <AppButton variant="primary" @click="saveAppt">{{ editingAppt ? 'Update' : 'Add' }} Appointment</AppButton>
      </template>
    </AppModal>

    <!-- Edit Vet Info Modal -->
    <AppModal v-if="showVetInfoModal" :open="true" title="Primary Vet" size="sm" @close="showVetInfoModal = false">
      <div class="form-field">
        <label>Vet / clinic name</label>
        <AppInput v-model="vetInfoForm.vetName" placeholder="Dr. Chen at County Animal Hospital" />
      </div>
      <div class="form-field">
        <label>Phone</label>
        <AppInput v-model="vetInfoForm.vetPhone" placeholder="(555) 123-4567" />
      </div>
      <template #actions>
        <AppButton @click="showVetInfoModal = false">Cancel</AppButton>
        <AppButton variant="primary" @click="saveVetInfo">Save</AppButton>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { AppCard, SectionLabel, AppButton, EmptyState, AppInput, AppModal } from '../../ui'
import { useUIStore } from '../../../stores/ui'
import { useVetVisitsStore } from '../../../stores/vetVisits'
import { useAnimalsStore } from '../../../stores/animals'

const props = defineProps({
  animal: { type: Object, required: true }
})

const ui = useUIStore()
const vetVisits = useVetVisitsStore()
const animalsStore = useAnimalsStore()

const appointments = ref([])

onMounted(async () => {
  if (!props.animal?.id) return
  appointments.value = await vetVisits.fetchByAnimalId(props.animal.id)
})

const today = new Date().toISOString().split('T')[0]
const upcoming = computed(() => appointments.value.filter(a => (a.date || '') >= today))
const past = computed(() => appointments.value.filter(a => (a.date || '') < today).reverse())

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/* Appointments */
const showApptModal = ref(false)
const editingAppt = ref(null)
const apptForm = ref({ date: '', time: '', type: '', clinic: '', notes: '' })

const openApptModal = (appt = null) => {
  editingAppt.value = appt
  apptForm.value = appt
    ? { date: appt.date || '', time: appt.time || '', type: appt.type || '', clinic: appt.clinic || '', notes: appt.notes || '' }
    : { date: '', time: '', type: '', clinic: '', notes: '' }
  showApptModal.value = true
}

const closeApptModal = () => {
  showApptModal.value = false
  editingAppt.value = null
}

const saveAppt = async () => {
  if (!apptForm.value.date || !apptForm.value.type.trim()) {
    ui.showToast('Date and type are required', 'error')
    return
  }
  if (!props.animal?.id) {
    ui.showToast('Select a real animal first', 'error')
    return
  }
  try {
    if (editingAppt.value) {
      await vetVisits.updateVisit(editingAppt.value.id, { ...apptForm.value })
      const idx = appointments.value.findIndex(a => a.id === editingAppt.value.id)
      if (idx !== -1) appointments.value[idx] = { ...appointments.value[idx], ...apptForm.value }
      ui.showToast('Appointment updated')
    } else {
      const created = await vetVisits.addVisit({ ...apptForm.value, animalId: props.animal.id })
      appointments.value.push(created)
      appointments.value.sort((a, b) => (a.date || '').localeCompare(b.date || ''))
      ui.showToast('Appointment added')
    }
    closeApptModal()
  } catch (err) {
    ui.showToast('Failed to save appointment', 'error')
  }
}

const deleteAppt = async (id) => {
  if (!confirm('Delete this appointment?')) return
  try {
    await vetVisits.deleteVisit(id)
    appointments.value = appointments.value.filter(a => a.id !== id)
    ui.showToast('Appointment deleted')
  } catch (err) {
    ui.showToast('Failed to delete appointment', 'error')
  }
}

/* Primary vet info (stored on the animal document) */
const showVetInfoModal = ref(false)
const vetInfoForm = ref({ vetName: '', vetPhone: '' })

const openVetInfoModal = () => {
  vetInfoForm.value = { vetName: props.animal.vetName || '', vetPhone: props.animal.vetPhone || '' }
  showVetInfoModal.value = true
}

const saveVetInfo = async () => {
  if (!props.animal?.id) {
    ui.showToast('Select a real animal first', 'error')
    return
  }
  try {
    await animalsStore.updateAnimal(props.animal.id, { ...vetInfoForm.value })
    ui.selectAnimal({ ...props.animal, ...vetInfoForm.value })
    ui.showToast('Vet info saved')
    showVetInfoModal.value = false
  } catch (err) {
    ui.showToast('Failed to save vet info', 'error')
  }
}
</script>

<style scoped>
.divide-list > * + * { border-top: 1px solid var(--border); }

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.appt-card {
  padding: 10px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.appt-card:first-child { padding-top: 0; }
.appt-card:last-child { padding-bottom: 0; }
.appt-card.past { opacity: .65; }

.appt-date {
  font-size: 12px;
  font-weight: 700;
  color: var(--ink);
  min-width: 140px;
}

.appt-type {
  font-size: 11px;
  color: var(--mint);
  font-weight: 700;
  flex: 1;
}

.appt-clinic {
  font-size: 11px;
  color: var(--ink-3);
  flex-basis: 100%;
}

.appt-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.action-btn {
  width: 24px;
  height: 24px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all .15s;
}
.action-btn:hover { background: var(--surface-3); border-color: var(--mint); }
.action-btn.danger:hover { border-color: var(--coral); }

.info-text {
  font-size: 12px;
  color: var(--ink-3);
  margin: 4px 0;
}

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
</style>
