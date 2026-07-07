<template>
  <PageContainer>
    <div class="rounds-page">
      <div class="page-header">
        <h1>🌅 Morning Rounds</h1>
        <AppInput v-model="selectedDate" type="date" />
      </div>

      <!-- Checklist Form -->
      <AppCard class="form-card">
        <div class="form-title">Rounds for {{ formatDate(selectedDate) }}</div>
        <div v-if="animals.length && form.rounds.length === animals.length" class="animals-checklist">
          <div v-for="(animal, idx) in animals" :key="animal.id" class="animal-check">
            <div class="animal-name">
              <strong>{{ animal.name }}</strong> <span class="animal-type">({{ animal.species || 'Animal' }})</span>
            </div>
            <div class="tasks-grid">
              <label><input type="checkbox" v-model="form.rounds[idx].tasks.fed" /> Fed</label>
              <label><input type="checkbox" v-model="form.rounds[idx].tasks.water" /> Water</label>
              <label><input type="checkbox" v-model="form.rounds[idx].tasks.meds" /> Meds</label>
              <label><input type="checkbox" v-model="form.rounds[idx].tasks.healthCheck" /> Health</label>
            </div>
            <AppInput v-model="form.rounds[idx].notes" placeholder="Notes for this animal..." />
            <AppSelect v-model="form.rounds[idx].priority" :options="priorityOptions" />
          </div>
        </div>
        <EmptyState v-else icon="🐾" title="No animals" message="Load animals to begin rounds." />
        <AppButton variant="primary" :loading="saving" @click="saveRounds" style="margin-top: 16px;">Submit Rounds</AppButton>
      </AppCard>

      <!-- History -->
      <SectionLabel>History</SectionLabel>
      <div v-if="history.length" class="history-list">
        <AppCard v-for="round in history" :key="round.id" class="history-card">
          <div class="round-date">{{ formatDate(round.date) }} — <strong>{{ round.completedBy }}</strong></div>
          <div v-for="r in round.rounds" :key="`${r.animalId}`" class="round-item">
            <div class="item-name">{{ r.animalName }}</div>
            <div class="item-tasks">
              <span v-if="r.tasks?.fed" class="task-done">✓ Fed</span>
              <span v-if="r.tasks?.water" class="task-done">✓ Water</span>
              <span v-if="r.tasks?.meds" class="task-done">✓ Meds</span>
              <span v-if="r.tasks?.healthCheck" class="task-done">✓ Health</span>
            </div>
            <div v-if="r.notes" class="item-notes">{{ r.notes }}</div>
            <div v-if="r.priority" class="item-priority" :class="`priority-${r.priority?.toLowerCase()}`">{{ r.priority }}</div>
          </div>
        </AppCard>
      </div>
      <EmptyState v-else icon="📋" title="No history" message="Complete your first morning round!" />
    </div>
  </PageContainer>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '../../../services/firebase'
import { useAnimalsStore } from '../../../stores/animals'
import { useAuthStore } from '../../../stores/auth'
import { useUIStore } from '../../../stores/ui'
import { PageContainer, AppCard, AppButton, AppInput, AppSelect, SectionLabel, EmptyState } from '../../ui'

const animalsStore = useAnimalsStore()
const authStore = useAuthStore()
const ui = useUIStore()

const priorityOptions = [
  { value: '', label: 'None' },
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Urgent', label: 'Urgent' }
]

const selectedDate = ref(new Date().toISOString().split('T')[0])
const saving = ref(false)
const history = ref([])

const animals = computed(() => animalsStore.animals || [])

const form = ref({
  rounds: []
})

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

const initForm = () => {
  form.value.rounds = animals.value.map(a => ({
    animalId: a.id,
    animalName: a.name,
    tasks: { fed: false, water: false, meds: false, healthCheck: false },
    notes: '',
    priority: ''
  }))
}

// Dashboard.vue also fetches animals on its own mount, unconditionally — if
// that fetch resolves after this page has already built `form.rounds` once,
// the two could briefly disagree on length and crash the checklist template
// (`form.rounds[idx]` undefined). Keeping this reactive instead of a single
// imperative build in onMounted keeps them in sync no matter which fetch
// finishes last.
watch(animals, initForm, { immediate: true })

const saveRounds = async () => {
  saving.value = true
  try {
    await addDoc(collection(db, 'morningRounds'), {
      date: selectedDate.value,
      rounds: form.value.rounds,
      completedBy: authStore.user?.name || 'Unknown',
      completedAt: new Date().toISOString()
    })
    ui.showToast('Rounds saved!')
    initForm()
    await fetchHistory()
  } catch (e) {
    ui.showToast(`Error: ${e.message}`, 'error')
  } finally {
    saving.value = false
  }
}

const fetchHistory = async () => {
  try {
    const q = query(collection(db, 'morningRounds'), orderBy('date', 'desc'))
    const snap = await getDocs(q)
    history.value = snap.docs.map(d => ({ id: d.id, ...d.data() })).slice(0, 7)
  } catch (e) {
    console.error('Fetch error:', e)
  }
}

onMounted(async () => {
  await animalsStore.fetchAnimals()
  await fetchHistory()
})
</script>

<style scoped>
.rounds-page { display: flex; flex-direction: column; gap: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
.page-header h1 { font-size: 28px; font-weight: 900; margin: 0; flex: 1; }
.page-header input { padding: 8px 12px; border: 1px solid var(--border); border-radius: 6px; }
.form-card { padding: 24px; }
.form-title { font-size: 16px; font-weight: 700; margin-bottom: 16px; }
.animals-checklist { display: flex; flex-direction: column; gap: 20px; }
.animal-check { padding: 16px; background: var(--surface-2); border-radius: 8px; }
.animal-name { font-size: 14px; font-weight: 700; margin-bottom: 8px; }
.animal-type { font-size: 12px; color: var(--ink-3); font-weight: normal; }
.tasks-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 8px; }
.tasks-grid label { font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 4px; }
.history-list { display: flex; flex-direction: column; gap: 12px; }
.history-card { padding: 16px; }
.round-date { font-size: 12px; color: var(--ink-3); margin-bottom: 8px; }
.round-item { padding: 8px; background: var(--surface-2); border-radius: 4px; margin-bottom: 6px; }
.item-name { font-size: 12px; font-weight: 700; }
.item-tasks { display: flex; gap: 8px; flex-wrap: wrap; margin: 4px 0; }
.task-done { font-size: 11px; color: var(--mint); font-weight: 700; }
.item-notes { font-size: 11px; color: var(--ink-2); margin-top: 2px; }
.item-priority { font-size: 10px; display: inline-block; padding: 1px 6px; border-radius: 4px; }
.priority-low { background: rgba(155, 200, 220, 0.2); color: #5B8DEF; }
.priority-medium { background: rgba(255, 193, 7, 0.2); color: #FFB300; }
.priority-urgent { background: rgba(255, 82, 82, 0.2); color: #FF5252; }
</style>
