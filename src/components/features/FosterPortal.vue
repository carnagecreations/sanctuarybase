<template>
  <PageContainer>
    <div class="space-y-4">
      <div class="text-center mb-4">
        <div class="text-2xl mb-2">👨‍👩‍👧‍👦</div>
        <h2 class="font-bold text-lg">Foster Home Portal</h2>
        <p class="text-xs text-gray-400 mt-1">Welcome, {{ fosterName }}!</p>
      </div>

      <!-- Current Animals in Care -->
      <div>
        <SectionLabel>Animals in Your Care</SectionLabel>
        <div v-if="currentAnimals.length === 0" class="mt-3">
          <EmptyState icon="🐾" title="No Animals Yet" message="You don't have any animals in foster care right now." />
        </div>
        <div v-else class="space-y-3 mt-3">
          <AppCard v-for="animal in currentAnimals" :key="animal.id" noPad>
            <div class="p-4 space-y-3">
              <div class="flex items-center gap-3">
                <div class="text-3xl">{{ animal.emoji }}</div>
                <div class="flex-1">
                  <div class="font-bold">{{ animal.name }}</div>
                  <div class="text-xs text-gray-400">{{ animal.breed }} • {{ animal.age }}</div>
                </div>
              </div>
              <div class="text-xs space-y-1 pt-2 border-t border-gray-700">
                <div><span class="text-gray-400">Arrival:</span> {{ animal.arrival }}</div>
                <div><span class="text-gray-400">Care Notes:</span> {{ animal.careNotes }}</div>
                <div><span class="text-gray-400">Contact for Questions:</span> {{ animal.contact }}</div>
              </div>
              <div class="flex gap-2 pt-2">
                <AppButton variant="secondary" size="sm" @click="logUpdate(animal.id)">Log Update</AppButton>
                <AppButton variant="secondary" size="sm" @click="requestSupport(animal.id)">Request Support</AppButton>
              </div>
            </div>
          </AppCard>
        </div>
      </div>

      <!-- Log Updates -->
      <div>
        <SectionLabel>Update Log</SectionLabel>
        <div v-if="updateLog.length === 0" class="mt-3">
          <EmptyState icon="📝" title="No Updates Yet" message="Tap Log Update on one of your animals to record how they're doing." />
        </div>
        <div v-else class="space-y-2 mt-3">
          <AppCard v-for="log in updateLog" :key="log.id" flat noPad>
            <div class="p-3 border-l-2 border-mint-400">
              <div class="flex justify-between items-start mb-1">
                <div class="font-bold text-sm">{{ log.animalName }}</div>
                <div class="flex items-center gap-2">
                  <div class="text-xs text-gray-400">{{ formatLogDate(log.createdAt) }}</div>
                  <button class="text-xs text-gray-400 hover:text-white underline" @click="editLog(log)">Edit</button>
                </div>
              </div>
              <div class="text-xs">{{ log.note }}</div>
            </div>
          </AppCard>
        </div>
      </div>

      <!-- Support Resources -->
      <div>
        <SectionLabel>Support & Resources</SectionLabel>
        <div class="space-y-2 mt-3">
          <AppCard flat noPad>
            <a href="#" class="p-3 block text-sm hover:bg-gray-800">
              <div class="font-bold">📞 Foster Support Hotline</div>
              <div class="text-xs text-gray-400">Call anytime: (555) 123-4567</div>
            </a>
          </AppCard>
          <AppCard flat noPad>
            <a href="#" class="p-3 block text-sm hover:bg-gray-800">
              <div class="font-bold">📋 Foster Care Guidelines</div>
              <div class="text-xs text-gray-400">Tips and best practices for foster homes</div>
            </a>
          </AppCard>
          <AppCard flat noPad>
            <a href="#" class="p-3 block text-sm hover:bg-gray-800">
              <div class="font-bold">🏥 Emergency Care Protocol</div>
              <div class="text-xs text-gray-400">What to do in case of emergency</div>
            </a>
          </AppCard>
        </div>
      </div>
    </div>

    <!-- Care Log Modal -->
    <AppModal v-if="showLogModal" :open="true" :title="`${editingLog ? 'Edit Update' : 'Log Update'} — ${logForm.animalName}`" size="sm" @close="closeLogModal">
      <label class="form-label">How is {{ logForm.animalName }} doing?</label>
      <textarea
        v-model="logForm.note"
        class="form-textarea"
        placeholder="Eating habits, behavior, health observations, milestones..."
      ></textarea>
      <template #actions>
        <AppButton variant="secondary" size="sm" :disabled="savingLog" @click="closeLogModal">Cancel</AppButton>
        <AppButton variant="primary" size="sm" :loading="savingLog" @click="submitLog">
          {{ editingLog ? 'Save Changes' : 'Submit Update' }}
        </AppButton>
      </template>
    </AppModal>
  </PageContainer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import PageContainer from '../ui/PageContainer.vue'
import SectionLabel from '../ui/SectionLabel.vue'
import AppCard from '../ui/AppCard.vue'
import AppButton from '../ui/AppButton.vue'
import AppModal from '../ui/AppModal.vue'
import EmptyState from '../ui/EmptyState.vue'
import { useUIStore } from '../../stores/ui'
import { useAuthStore } from '../../stores/auth'
import { useFosterLogsStore } from '../../stores/fosterLogs'
import { useMessagesStore } from '../../stores/messages'
import { usePeopleStore } from '../../stores/people'
import { useAnimalsStore } from '../../stores/animals'
import { personTypeList } from './admin/people/personDisplay'

const ui = useUIStore()
const authStore = useAuthStore()
const fosterLogsStore = useFosterLogsStore()
const messagesStore = useMessagesStore()
const peopleStore = usePeopleStore()
const animalsStore = useAnimalsStore()

const fosterName = computed(() => authStore.user?.name || 'Foster Friend')

// Animals in care come from the admin-managed foster placement: a `people`
// record (type 'foster') matched to this user by email, with animals
// assigned via linkAnimal() in PersonDetailDrawer.
const SPECIES_EMOJI = { dog: '🐕', cat: '🐈', horse: '🐴', rabbit: '🐇', bird: '🦜', chicken: '🐔', goat: '🐐', pig: '🐖', duck: '🦆', reptile: '🦎', turtle: '🐢' }
const speciesEmoji = (species) => SPECIES_EMOJI[(species || '').toLowerCase()] || '🐾'

const formatArrival = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  return isNaN(d.getTime()) ? '' : `Since ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
}

const myFosterRecord = computed(() => {
  const email = (authStore.user?.email || '').toLowerCase()
  if (!email) return null
  return peopleStore.people.find(p =>
    personTypeList(p).includes('foster') && (p.email || '').toLowerCase() === email
  ) || null
})

const currentAnimals = computed(() => {
  const linked = myFosterRecord.value?.linkedAnimals || []
  return linked.map((link) => {
    const animal = animalsStore.animals.find(a => a.id === link.id)
    return {
      id: link.id,
      name: link.name || animal?.name || 'Unnamed',
      breed: animal?.breed || '',
      age: animal?.age || '',
      emoji: speciesEmoji(animal?.species),
      arrival: formatArrival(link.linkedAt),
      careNotes: animal?.description || 'No care notes yet — reach out to the team for details.',
      contact: 'Foster Support: (555) 123-4567',
    }
  })
})

const updateLog = computed(() => fosterLogsStore.logs)

const showLogModal = ref(false)
const savingLog = ref(false)
const editingLog = ref(null)
const logForm = ref({ animalId: null, animalName: '', note: '' })

const formatLogDate = (createdAt) => {
  if (!createdAt) return ''
  const d = new Date(createdAt)
  if (isNaN(d.getTime())) return ''
  const today = new Date()
  const isToday = d.toDateString() === today.toDateString()
  return isToday
    ? `Today ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
    : d.toLocaleDateString()
}

const logUpdate = (id) => {
  const animal = currentAnimals.value.find(a => a.id === id)
  if (!animal) return
  editingLog.value = null
  logForm.value = { animalId: animal.id, animalName: animal.name, note: '' }
  showLogModal.value = true
}

const editLog = (log) => {
  editingLog.value = log
  logForm.value = { animalId: log.animalId, animalName: log.animalName, note: log.note }
  showLogModal.value = true
}

const closeLogModal = () => {
  showLogModal.value = false
  editingLog.value = null
}

const submitLog = async () => {
  const note = logForm.value.note.trim()
  if (!note) {
    ui.showToast('Please write a quick note before submitting', 'error')
    return
  }
  savingLog.value = true
  try {
    if (editingLog.value) {
      await fosterLogsStore.updateLog(editingLog.value.id, note)
      ui.showToast('Update saved!', 'success')
    } else {
      await fosterLogsStore.addLog({
        animalId: logForm.value.animalId,
        animalName: logForm.value.animalName,
        note,
        author: authStore.user,
      })
      ui.showToast(`Update logged for ${logForm.value.animalName}! 🐾`, 'success')
    }
    closeLogModal()
  } catch (e) {
    ui.showToast(`Failed to save update: ${e.message}`, 'error')
  } finally {
    savingLog.value = false
  }
}

const requestSupport = async (id) => {
  const animal = currentAnimals.value.find(a => a.id === id)
  if (!animal) return
  try {
    await messagesStore.sendMessage(
      `🆘 Foster support requested for ${animal.name} by ${fosterName.value} (${authStore.user?.email || 'unknown email'}). Please reach out.`,
      [],
      'all'
    )
    ui.showToast(`Support request sent for ${animal.name} — the team will reach out soon`, 'success')
  } catch (e) {
    ui.showToast(`Failed to send support request: ${e.message}`, 'error')
  }
}

onMounted(async () => {
  if (authStore.user?.id) fosterLogsStore.fetchLogs(authStore.user.id)
  if (!peopleStore.people.length) await peopleStore.fetchPeople()
  if (!animalsStore.animals.length) await animalsStore.fetchAnimals()
})
</script>

<style scoped>
.form-label {
  font-weight: 600;
  color: var(--ink-2);
  font-size: 13px;
}

.form-textarea {
  border: 1px solid var(--border);
  border-radius: var(--r);
  padding: 10px;
  font-family: inherit;
  font-size: 14px;
  color: var(--ink);
  background: var(--bg);
  resize: vertical;
  min-height: 110px;
  transition: border-color 0.15s;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--primary);
}
</style>
