<template>
  <PageContainer>
    <div class="availability-page">
      <div class="page-header">
        <h1>📅 Volunteer Availability</h1>
        <StatCard :number="String(activeVolunteers)" label="Available This Week" />
      </div>

      <AppCard class="form-card">
        <div class="form-title">Log Your Availability</div>
        <div class="form-group">
          <label>Volunteer</label>
          <AppSelect v-model="form.volunteerId" :options="volunteerOptions" placeholder="Select..." />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Start Date</label>
            <AppInput v-model="form.startDate" type="date" />
          </div>
          <div class="form-group">
            <label>End Date</label>
            <AppInput v-model="form.endDate" type="date" />
          </div>
        </div>
        <div class="form-group">
          <label>Days Available</label>
          <div class="days-grid">
            <label v-for="day in days" :key="day" class="day-checkbox">
              <input type="checkbox" :value="day" v-model="form.daysAvailable" />
              {{ day }}
            </label>
          </div>
        </div>
        <div class="form-group">
          <label>Notes</label>
          <AppInput v-model="form.notes" placeholder="e.g., Only mornings..." />
        </div>
        <AppButton variant="primary" :loading="saving" @click="saveAvailability">Save</AppButton>
      </AppCard>

      <SectionLabel>Submitted Availabilities</SectionLabel>
      <div v-if="availabilities.length" class="list">
        <AppCard v-for="avail in availabilities" :key="avail.id">
          <div class="avail-header">
            <div>
              <div class="name">{{ avail.name }}</div>
              <div class="email">{{ avail.email }}</div>
            </div>
            <div class="dates">{{ formatDate(avail.startDate) }} → {{ formatDate(avail.endDate) }}</div>
          </div>
          <div class="days">
            <span v-for="day in avail.daysAvailable" :key="day" class="day-badge">{{ day }}</span>
          </div>
          <div v-if="avail.notes" class="notes">📝 {{ avail.notes }}</div>
          <AppButton size="sm" variant="secondary" @click="deleteAvailability(avail.id)">Delete</AppButton>
        </AppCard>
      </div>
      <EmptyState v-else icon="📅" title="None yet" message="No availabilities submitted." />
    </div>
  </PageContainer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { collection, addDoc, deleteDoc, doc, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '../../../services/firebase'
import { usePeopleStore } from '../../../stores/people'
import { useUIStore } from '../../../stores/ui'
import { personTypeList } from './people/personDisplay'
import { PageContainer, AppCard, AppButton, AppInput, AppSelect, StatCard, SectionLabel, EmptyState } from '../../ui'

const peopleStore = usePeopleStore()
const ui = useUIStore()

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const availabilities = ref([])
const saving = ref(false)

const form = ref({
  volunteerId: '',
  startDate: '',
  endDate: '',
  daysAvailable: [],
  notes: ''
})

const volunteerOptions = computed(() => {
  return peopleStore.people
    .filter(p => personTypeList(p).includes('volunteer'))
    .map(v => ({ value: v.id, label: v.name }))
})

const activeVolunteers = computed(() => {
  const now = new Date()
  return availabilities.value.filter(a => {
    const start = new Date(a.startDate)
    const end = new Date(a.endDate)
    return now >= start && now <= end
  }).length
})

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const saveAvailability = async () => {
  if (!form.value.volunteerId || !form.value.startDate || !form.value.endDate || !form.value.daysAvailable.length) {
    ui.showToast('Fill all required fields', 'error')
    return
  }
  const volunteer = peopleStore.people.find(p => p.id === form.value.volunteerId)
  saving.value = true
  try {
    await addDoc(collection(db, 'availability'), {
      volunteerId: form.value.volunteerId,
      name: volunteer.name,
      email: volunteer.email || '',
      startDate: form.value.startDate,
      endDate: form.value.endDate,
      daysAvailable: form.value.daysAvailable,
      notes: form.value.notes,
      createdAt: new Date().toISOString()
    })
    ui.showToast('Saved!')
    form.value = { volunteerId: '', startDate: '', endDate: '', daysAvailable: [], notes: '' }
    await fetchAvailabilities()
  } catch (e) {
    ui.showToast(`Error: ${e.message}`, 'error')
  } finally {
    saving.value = false
  }
}

const deleteAvailability = async (id) => {
  if (!confirm('Delete?')) return
  try {
    await deleteDoc(doc(db, 'availability', id))
    await fetchAvailabilities()
  } catch (e) {
    ui.showToast(`Error: ${e.message}`, 'error')
  }
}

const fetchAvailabilities = async () => {
  try {
    const q = query(collection(db, 'availability'), orderBy('startDate', 'desc'))
    const snap = await getDocs(q)
    availabilities.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.error(e)
  }
}

onMounted(async () => {
  await peopleStore.fetchPeople()
  await fetchAvailabilities()
})
</script>

<style scoped>
.availability-page { display: flex; flex-direction: column; gap: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; }
.page-header h1 { font-size: 28px; font-weight: 900; margin: 0; }
.form-card { padding: 20px; }
.form-title { font-size: 14px; font-weight: 700; margin-bottom: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
.form-group label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--ink-3); }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.days-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 8px; }
.day-checkbox { display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 12px; }
.list { display: flex; flex-direction: column; gap: 10px; }
.avail-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
.name { font-size: 13px; font-weight: 700; }
.email { font-size: 11px; color: var(--ink-3); }
.dates { font-size: 11px; color: var(--ink-2); text-align: right; }
.days { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 6px; }
.day-badge { display: inline-block; padding: 2px 6px; background: rgba(78, 255, 197, 0.12); border: 1px solid rgba(78, 255, 197, 0.3); border-radius: 8px; font-size: 9px; color: var(--mint); font-weight: 700; }
.notes { font-size: 11px; color: var(--ink-2); margin-bottom: 8px; }
</style>
