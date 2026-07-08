<template>
  <div>
    <div class="section-actions">
      <SectionLabel>Basic information</SectionLabel>
      <AppButton size="sm" @click="editing = !editing">{{ editing ? 'Cancel' : '✏️ Edit' }}</AppButton>
    </div>

    <AppCard>
      <div v-if="!editing" class="info-grid">
        <div class="info-row"><span class="info-label">Species</span><span>{{ animal.species || '—' }}</span></div>
        <div class="info-row"><span class="info-label">Breed</span><span>{{ animal.breed || '—' }}</span></div>
        <div class="info-row"><span class="info-label">Age</span><span>{{ animal.age || '—' }}</span></div>
        <div class="info-row"><span class="info-label">Sex</span><span>{{ animal.sex || '—' }}</span></div>
        <div class="info-row"><span class="info-label">Microchip</span><span>{{ animal.microchip || '—' }}</span></div>
        <div class="info-row"><span class="info-label">Intake date</span><span>{{ animal.intakeDate || '—' }}</span></div>
        <div class="info-row"><span class="info-label">Intake source</span><span>{{ animal.intakeSource || '—' }}</span></div>
        <div class="info-row"><span class="info-label">Location</span><span>{{ animal.location || '—' }}</span></div>
      </div>

      <div v-else class="edit-grid">
        <div class="edit-field">
          <label>Species</label>
          <input v-model="draft.species" placeholder="Dog, cat, horse..." />
        </div>
        <div class="edit-field">
          <label>Breed</label>
          <input v-model="draft.breed" placeholder="Breed" />
        </div>
        <div class="edit-field">
          <label>Age</label>
          <input v-model="draft.age" placeholder="e.g. 3 years" />
        </div>
        <div class="edit-field">
          <label>Sex</label>
          <select v-model="draft.sex">
            <option value="">Select...</option>
            <option>Male</option>
            <option>Male, Neutered</option>
            <option>Female</option>
            <option>Female, Spayed</option>
            <option>Unknown</option>
          </select>
        </div>
        <div class="edit-field">
          <label>Microchip</label>
          <input v-model="draft.microchip" placeholder="Chip number" />
        </div>
        <div class="edit-field">
          <label>Intake date</label>
          <input v-model="draft.intakeDate" type="date" />
        </div>
        <div class="edit-field">
          <label>Intake source</label>
          <select v-model="draft.intakeSource">
            <option value="">Select...</option>
            <option>Stray / Found</option>
            <option>Owner surrender</option>
            <option>Transfer</option>
            <option>Born on site</option>
            <option>Confiscation</option>
          </select>
        </div>
        <div class="edit-field">
          <label>Location</label>
          <input v-model="draft.location" placeholder="Pen, stall, kennel..." />
        </div>
        <AppButton variant="primary" @click="save" style="margin-top:8px;width:100%">Save changes</AppButton>
      </div>
    </AppCard>

    <SectionLabel>Photos</SectionLabel>
    <AppCard>
      <input type="file" accept="image/*" multiple @change="onFilesSelected" />
      <div class="photo-thumbs" v-if="photos.length">
        <div class="photo-thumb" v-for="(u, i) in photos" :key="u">
          <img :src="siteMediaUrl(u)" alt="" />
          <button title="Remove" @click="removePhoto(i)">&times;</button>
        </div>
      </div>
      <p class="muted photo-msg">{{ photoMsg }}</p>
    </AppCard>

    <SectionLabel>Care notes</SectionLabel>
    <AppCard>
      <div class="note-field">
        <label>Feeding</label>
        <textarea v-model="draft.feedingNotes" placeholder="Special diet, portions, feeding schedule, restrictions, supplements..." rows="3" @change="save"></textarea>
      </div>
    </AppCard>
    <AppCard>
      <div class="note-field">
        <label>Behavior</label>
        <textarea v-model="draft.behaviorNotes" placeholder="Triggers, handling instructions, socialization level, fears..." rows="3" @change="save"></textarea>
      </div>
    </AppCard>
    <AppCard>
      <div class="note-field">
        <label>General notes</label>
        <textarea v-model="draft.generalNotes" placeholder="Any other relevant information..." rows="3" @change="save"></textarea>
      </div>
    </AppCard>
    <div class="notes-save-row">
      <AppButton variant="primary" :disabled="savingNotes" @click="saveNotes">{{ savingNotes ? 'Saving…' : '💾 Save notes' }}</AppButton>
    </div>

    <SectionLabel>Medical Alerts</SectionLabel>
    <div v-if="overdueVaccines.length || dueSoonVaccines.length" class="alert-section">
      <AppCard v-if="overdueVaccines.length" class="alert-card overdue">
        <div class="alert-content">
          <span class="alert-icon">⚠️</span>
          <div class="alert-text">
            <div class="alert-title">{{ overdueVaccines.length }} overdue vaccine{{ overdueVaccines.length !== 1 ? 's' : '' }}</div>
            <div class="alert-items">{{ overdueVaccines.map(v => v.vaccineName).join(', ') }}</div>
          </div>
        </div>
      </AppCard>
      <AppCard v-if="dueSoonVaccines.length" class="alert-card due-soon">
        <div class="alert-content">
          <span class="alert-icon">⏰</span>
          <div class="alert-text">
            <div class="alert-title">{{ dueSoonVaccines.length }} vaccine{{ dueSoonVaccines.length !== 1 ? 's' : '' }} due soon</div>
            <div class="alert-items">{{ dueSoonVaccines.map(v => v.vaccineName).join(', ') }}</div>
          </div>
        </div>
      </AppCard>
    </div>
    <AppCard v-else class="no-alerts">
      <div style="font-size: 12px; color: var(--ink-3); text-align: center;">✓ All vaccinations up to date</div>
    </AppCard>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { AppCard, SectionLabel, AppButton } from '../../ui'
import { useAnimalsStore } from '../../../stores/animals'
import { useVaccinationsStore } from '../../../stores/vaccinations'
import { useAnimalsAdminStore } from '../../../stores/animalsAdmin'
import { useUIStore } from '../../../stores/ui'
import { siteMediaUrl } from '../../../services/siteApi'

const props = defineProps({ animal: { type: Object, required: true } })
const ui = useUIStore()
const animalsStore = useAnimalsStore()
const vaccinationsStore = useVaccinationsStore()
const animalsAdmin = useAnimalsAdminStore()
const editing = ref(false)
const vaccines = ref([])
const photos = ref(props.animal.photos ? [...props.animal.photos] : [])
const photoMsg = ref('')

const draft = reactive({
  species: props.animal.species || '',
  breed: props.animal.breed || '',
  age: props.animal.age || '',
  sex: props.animal.sex || '',
  microchip: props.animal.microchip || '',
  intakeDate: props.animal.intakeDate || '',
  intakeSource: props.animal.intakeSource || '',
  location: props.animal.location || '',
  feedingNotes: props.animal.feedingNotes || '',
  behaviorNotes: props.animal.behaviorNotes || '',
  generalNotes: props.animal.generalNotes || '',
})

const getVaccineStatus = (vaccine) => {
  const nextDue = vaccine.nextDueDate || vaccine.dueDate
  if (!nextDue) return 'current'
  const now = new Date()
  const dueDate = new Date(nextDue)
  const msPerDay = 24 * 60 * 60 * 1000
  const daysUntilDue = Math.floor((dueDate - now) / msPerDay)

  if (daysUntilDue < 0) return 'overdue'
  if (daysUntilDue <= 30) return 'due-soon'
  return 'current'
}

const overdueVaccines = computed(() => {
  return vaccines.value.filter(v => getVaccineStatus(v) === 'overdue')
})

const dueSoonVaccines = computed(() => {
  return vaccines.value.filter(v => getVaccineStatus(v) === 'due-soon')
})

const loadVaccines = async () => {
  if (!props.animal?.id) return
  vaccines.value = await vaccinationsStore.fetchByAnimalId(props.animal.id)
}

const save = async () => {
  await animalsStore.updateAnimal(props.animal.id, { ...draft })
  editing.value = false
}

// Notes already auto-save on blur via @change="save", but that was
// invisible — an explicit button gives staff confirmation it stuck.
const savingNotes = ref(false)
const saveNotes = async () => {
  if (!props.animal?.id) {
    ui.showToast('Select a real animal first', 'error')
    return
  }
  savingNotes.value = true
  try {
    await animalsStore.updateAnimal(props.animal.id, { ...draft })
    ui.showToast('Notes saved', 'success')
  } catch (err) {
    ui.showToast('Failed to save notes', 'error')
  } finally {
    savingNotes.value = false
  }
}

const onFilesSelected = async (e) => {
  const files = e.target.files
  if (!files || !files.length) return
  photoMsg.value = 'Uploading…'
  try {
    const urls = await animalsAdmin.uploadImages(files)
    console.log('Upload response:', urls)
    if (!urls || urls.length === 0) {
      photoMsg.value = 'Upload returned no URLs'
      return
    }
    photos.value.push(...urls)
    console.log('Photos array before update:', photos.value)
    await animalsStore.updateAnimal(props.animal.id, { photos: photos.value })
    console.log('Update complete')
    photoMsg.value = `${urls.length} photo(s) added.`
  } catch (err) {
    console.error('Upload error:', err)
    photoMsg.value = err.message || 'Upload failed.'
  } finally {
    e.target.value = ''
  }
}

const removePhoto = async (i) => {
  photos.value.splice(i, 1)
  await animalsStore.updateAnimal(props.animal.id, { photos: photos.value })
}

onMounted(loadVaccines)
</script>

<style scoped>
.section-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-grid { display: flex; flex-direction: column; }

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--border);
  font-size: 12px;
}
.info-row:last-child { border-bottom: none; }

.info-label { font-weight: 700; color: var(--ink-2); }

.edit-grid { display: flex; flex-direction: column; gap: 10px; }

.edit-field { display: flex; flex-direction: column; gap: 4px; }

.edit-field label {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--ink-3);
  letter-spacing: .05em;
}

.edit-field input,
.edit-field select {
  padding: 9px 12px;
  background: var(--surface-2);
  border: 1.5px solid var(--border);
  border-radius: 8px;
  color: var(--ink);
  font-size: 13px;
  font-family: 'Nunito', sans-serif;
}

.edit-field input:focus,
.edit-field select:focus {
  outline: none;
  border-color: var(--mint);
}

.photo-thumbs { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
.photo-thumb { position: relative; width: 68px; height: 68px; border-radius: 8px; overflow: hidden; border: 1px solid var(--border); }
.photo-thumb img { width: 100%; height: 100%; object-fit: cover; }
.photo-thumb button {
  position: absolute; top: 2px; right: 2px; width: 18px; height: 18px;
  border: 0; border-radius: 50%; background: rgba(0,0,0,.6); color: #fff;
  font-size: 11px; line-height: 18px; cursor: pointer; padding: 0;
}
.photo-msg { font-size: 11px; color: var(--ink-3); min-height: 1.1em; margin: 8px 0 0; }

.note-field { display: flex; flex-direction: column; gap: 4px; }

.notes-save-row { display: flex; justify-content: flex-end; margin: 8px 0 16px; }

.note-field label {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--ink-3);
  letter-spacing: .05em;
}

.note-field textarea {
  padding: 9px 12px;
  background: var(--surface-2);
  border: 1.5px solid var(--border);
  border-radius: 8px;
  color: var(--ink);
  font-size: 12px;
  font-family: 'Nunito', sans-serif;
  resize: vertical;
}

.note-field textarea:focus {
  outline: none;
  border-color: var(--mint);
}

.alert-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.alert-card {
  border-left: 3px solid var(--border);
  padding: 12px !important;
}

.alert-card.overdue {
  border-left-color: var(--coral);
  background: rgba(255, 107, 107, 0.05);
}

.alert-card.due-soon {
  border-left-color: var(--yellow);
  background: rgba(255, 193, 7, 0.05);
}

.no-alerts {
  padding: 12px !important;
}

.alert-content {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.alert-icon {
  font-size: 16px;
  flex-shrink: 0;
  margin-top: 2px;
}

.alert-text {
  flex: 1;
  min-width: 0;
}

.alert-title {
  font-weight: 700;
  font-size: 12px;
  color: var(--ink);
  margin-bottom: 4px;
}

.alert-items {
  font-size: 11px;
  color: var(--ink-3);
  font-weight: 600;
  word-break: break-word;
}
</style>
