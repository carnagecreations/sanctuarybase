<template>
  <PageContainer>

    <button class="back-btn" @click="ui.setCurrentTab('animals')">← All animals</button>

    <!-- Header -->
    <div class="detail-header">
      <div class="header-avatar">{{ baseAnimal.emoji }}</div>
      <div class="header-info">
        <div class="header-name-row">
          <span class="header-name">{{ baseAnimal.name }}</span>
          <AppBadge :type="baseAnimal.status">{{ statusLabel(baseAnimal.status) }}</AppBadge>
        </div>
        <div class="header-meta">
          {{ baseAnimal.species }}<template v-if="baseAnimal.breed"> · {{ baseAnimal.breed }}</template> · 📍 {{ baseAnimal.location }}
        </div>
        <div class="header-meta">{{ daysInCare(baseAnimal) }}d in care</div>
      </div>
      <div class="header-actions">
        <AppButton size="sm" @click="openEdit">✏️ Edit</AppButton>
        <AppButton size="sm" variant="secondary" @click="openPost">📢 Post</AppButton>
        <AppButton size="sm" variant="secondary" @click="openCard">🏷️ Card</AppButton>
        <AppButton size="sm" variant="primary" @click="openVetChat">💬 Vet Chat</AppButton>
        <AppButton size="sm" variant="secondary" @click="openIncidentReport" class="btn-alert">🚨 Report Incident</AppButton>
      </div>
    </div>

    <!-- Edit Animal Modal -->
    <AppModal v-if="showEdit" :open="true" :title="`Edit ${baseAnimal.name}`" size="sm" @close="showEdit = false">
      <div class="form-row">
        <AppInput v-model="editForm.name" label="Name *" placeholder="Luna" />
        <AppSelect v-model="editForm.species" label="Species *" :options="speciesOptions" />
      </div>
      <div class="form-row">
        <AppInput v-model="editForm.breed" label="Breed" placeholder="Mixed" />
        <AppInput v-model="editForm.age" label="Age" placeholder="2 years" />
      </div>
      <div class="form-row">
        <AppSelect v-model="editForm.sex" label="Sex" :options="sexOptions" />
        <AppSelect v-model="editForm.status" label="Status *" :options="statusOptions" />
      </div>
      <AppInput v-model="editForm.location" label="Location" placeholder="Kennel A-3, Barn, Foster home…" />
      <AppInput v-model="editForm.weight" label="Weight" placeholder="45 lbs" style="margin-top:8px" />
      <AppInput v-model="editForm.notes" label="Notes" placeholder="Any relevant notes…" style="margin-top:8px" />
      <template #actions>
        <AppButton @click="showEdit = false">Cancel</AppButton>
        <AppButton variant="primary" :disabled="!editForm.name || !editForm.species || savingEdit" @click="saveEdit">
          {{ savingEdit ? 'Saving…' : 'Save changes' }}
        </AppButton>
      </template>
    </AppModal>

    <!-- Post / Share Modal -->
    <AppModal v-if="showPost" :open="true" :title="`Post about ${baseAnimal.name}`" size="sm" @close="showPost = false">
      <div class="form-row" style="grid-template-columns: 1fr;">
        <AppInput v-model="postForm.title" label="Title" placeholder="Meet Luna!" />
      </div>
      <div class="edit-field" style="margin-top:8px">
        <label>Caption</label>
        <textarea v-model="postForm.caption" rows="6" placeholder="Write a caption…"></textarea>
      </div>
      <template #actions>
        <AppButton @click="showPost = false">Cancel</AppButton>
        <AppButton variant="secondary" @click="copyCaption">📋 Copy caption</AppButton>
        <AppButton variant="primary" :disabled="!postForm.title || !postForm.caption || savingPost" @click="submitPost">
          {{ savingPost ? 'Posting…' : '📢 Post to Announcements' }}
        </AppButton>
      </template>
    </AppModal>

    <!-- Kennel Card Modal -->
    <AppModal v-if="showCard" :open="true" title="Kennel Card" size="sm" @close="showCard = false">
      <div class="kennel-card-preview">
        <div class="kc-emoji">{{ baseAnimal.emoji }}</div>
        <div class="kc-name">{{ baseAnimal.name }}</div>
        <AppBadge :type="baseAnimal.status">{{ statusLabel(baseAnimal.status) }}</AppBadge>
        <div class="kc-grid">
          <div class="kc-row"><span class="kc-label">Species</span><span>{{ baseAnimal.species || '—' }}</span></div>
          <div class="kc-row"><span class="kc-label">Breed</span><span>{{ baseAnimal.breed || '—' }}</span></div>
          <div class="kc-row"><span class="kc-label">Age</span><span>{{ baseAnimal.age || '—' }}</span></div>
          <div class="kc-row"><span class="kc-label">Sex</span><span>{{ baseAnimal.sex || '—' }}</span></div>
          <div class="kc-row"><span class="kc-label">Weight</span><span>{{ baseAnimal.weight || '—' }}</span></div>
          <div class="kc-row"><span class="kc-label">Location</span><span>{{ baseAnimal.location || '—' }}</span></div>
          <div class="kc-row"><span class="kc-label">Intake date</span><span>{{ baseAnimal.intakeDate || '—' }}</span></div>
        </div>
        <div v-if="baseAnimal.feedingNotes" class="kc-notes"><strong>Feeding:</strong> {{ baseAnimal.feedingNotes }}</div>
        <div v-if="baseAnimal.behaviorNotes" class="kc-notes"><strong>Behavior:</strong> {{ baseAnimal.behaviorNotes }}</div>
        <div v-if="baseAnimal.notes" class="kc-notes"><strong>Notes:</strong> {{ baseAnimal.notes }}</div>
      </div>
      <template #actions>
        <AppButton @click="showCard = false">Close</AppButton>
        <AppButton variant="primary" @click="printKennelCard">🖨️ Print card</AppButton>
      </template>
    </AppModal>

    <!-- Report Incident Modal -->
    <AppModal v-if="showIncidentReport" :open="true" title="🚨 Report Incident" size="sm" @close="showIncidentReport = false">
      <div class="form-group">
        <label>Incident Type *</label>
        <AppSelect v-model="incidentForm.type" :options="[
          { value: 'bite', label: 'Bite' },
          { value: 'scratch', label: 'Scratch' },
          { value: 'aggression', label: 'Aggression' },
          { value: 'injury', label: 'Injury' },
          { value: 'illness', label: 'Illness' },
          { value: 'other', label: 'Other' }
        ]" />
      </div>
      <div class="form-group">
        <label>Victim/Details *</label>
        <textarea v-model="incidentForm.victim" placeholder="Who/what was involved? (e.g., 'Volunteer Jane', 'Dog in neighboring pen')" rows="2"></textarea>
      </div>
      <div class="form-group">
        <label>Description *</label>
        <textarea v-model="incidentForm.description" placeholder="What happened? Any injuries, circumstances, or context?" rows="4"></textarea>
      </div>
      <div class="form-group">
        <label>Date & Time</label>
        <input v-model="incidentForm.datetime" type="datetime-local" />
      </div>
      <template #actions>
        <AppButton @click="showIncidentReport = false">Cancel</AppButton>
        <AppButton variant="primary" :disabled="!incidentForm.type || !incidentForm.victim || !incidentForm.description || submittingIncident" @click="submitIncidentReport">
          {{ submittingIncident ? 'Submitting…' : 'Submit Report' }}
        </AppButton>
      </template>
    </AppModal>

    <!-- Tabs - Vertical Stack -->
    <div class="tab-menu-wrapper">
      <div class="tab-menu">
        <button
          v-for="t in tabs"
          :key="t.id"
          class="tab-menu-btn"
          :class="{ active: currentTab === t.id }"
          @click="currentTab = t.id"
        >
          <span class="tab-label">{{ t.label }}</span>
          <span v-if="currentTab === t.id" class="tab-indicator">→</span>
        </button>
      </div>
    </div>

    <!-- Tab Content: Render Dynamic Component -->
    <ProfileTab   v-if="currentTab === 'profile'"   :animal="baseAnimal" />
    <WebsiteListingTab v-if="currentTab === 'website'" :animal="baseAnimal" />
    <HealthTab    v-if="currentTab === 'health'"    :animal="baseAnimal" />
    <MedsTab      v-if="currentTab === 'meds'"      :animal="baseAnimal" />
    <VaccinesTab  v-if="currentTab === 'vaccines'"  :animal="baseAnimal" />
    <WeightTab    v-if="currentTab === 'weight'"    :animal="baseAnimal" />
    <DietAndHealthTab v-if="currentTab === 'diet-health'" :animal="baseAnimal" />
    <RecordsTab   v-if="currentTab === 'records'"   :animal="baseAnimal" />
    <DocsTab      v-if="currentTab === 'docs'"      :animal="baseAnimal" />
    <VetTab       v-if="currentTab === 'vet'"       :animal="baseAnimal" />
    <LogTab       v-if="currentTab === 'log'"       :animal="baseAnimal" />
    <MetTab       v-if="currentTab === 'met'"       :animal="baseAnimal" />
    <TraitsTab    v-if="currentTab === 'traits'"    :animal="baseAnimal" />
    <MemoryTab    v-if="currentTab === 'memory'"    :animal="baseAnimal" />
    <SOSTab       v-if="currentTab === 'sos'"       :animal="baseAnimal" />
    <AssessTab    v-if="currentTab === 'assess'"    :animal="baseAnimal" />

  </PageContainer>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { PageContainer, AppButton, AppBadge, AppInput, AppSelect, AppModal } from '../ui'
import { useUIStore } from '../../stores/ui'
import { useAnimalsStore } from '../../stores/animals'
import { useAnnouncementsStore } from '../../stores/announcements'
import { useBiteReportsStore } from '../../stores/biteReports'
import { useAuthStore } from '../../stores/auth'

// Import tab components
import ProfileTab   from './animal-detail/ProfileTab.vue'
import WebsiteListingTab from './animal-detail/WebsiteListingTab.vue'
import HealthTab    from './animal-detail/HealthTab.vue'
import MedsTab      from './animal-detail/MedsTab.vue'
import VaccinesTab  from './animal-detail/VaccinesTab.vue'
import WeightTab    from './animal-detail/WeightTab.vue'
import DietAndHealthTab from './animal-detail/DietAndHealthTab.vue'
import RecordsTab   from './animal-detail/RecordsTab.vue'
import DocsTab      from './animal-detail/DocsTab.vue'
import VetTab       from './animal-detail/VetTab.vue'
import LogTab       from './animal-detail/LogTab.vue'
import MetTab       from './animal-detail/MetTab.vue'
import TraitsTab    from './animal-detail/TraitsTab.vue'
import MemoryTab    from './animal-detail/MemoryTab.vue'
import SOSTab       from './animal-detail/SOSTab.vue'
import AssessTab    from './animal-detail/AssessTab.vue'

const ui = useUIStore()
const auth = useAuthStore()
const animalsStore = useAnimalsStore()
const announcementsStore = useAnnouncementsStore()
const route = useRoute()
const currentTab = ref('profile')
const loadingAnimal = ref(false)

// A refresh or a direct link (e.g. /animals/abc123) loses ui.selectedAnimal,
// since it's only in-memory Pinia state. Look the animal up by the route's
// :id instead of falling back to fabricated placeholder data — this used to
// silently show a fake animal named "Luna" on every refresh, which is a
// real safety issue in a medical-records context.
onMounted(async () => {
  if (ui.selectedAnimal || !route.params.id) return
  loadingAnimal.value = true
  try {
    let found = animalsStore.animals.find(a => a.id === route.params.id)
    if (!found && !animalsStore.animals.length) {
      await animalsStore.fetchAnimals()
      found = animalsStore.animals.find(a => a.id === route.params.id)
    }
    if (!found) found = await animalsStore.getAnimalById(route.params.id)
    if (found) ui.selectedAnimal = found
  } finally {
    loadingAnimal.value = false
  }
})

const tabs = [
  { id: 'profile',   label: 'Profile' },
  { id: 'website',   label: 'Website' },
  { id: 'health',    label: 'Health' },
  { id: 'meds',      label: 'Meds' },
  { id: 'vaccines',  label: 'Vaccines' },
  { id: 'weight',    label: 'Weight' },
  { id: 'diet-health', label: 'Diet & Health' },
  { id: 'records',   label: 'Records' },
  { id: 'docs',      label: 'Docs' },
  { id: 'vet',       label: 'Vet' },
  { id: 'log',       label: 'Log' },
  { id: 'met',       label: 'Met' },
  { id: 'traits',    label: 'Traits' },
  { id: 'memory',    label: 'Memory' },
  { id: 'sos',       label: 'SOS' },
  { id: 'assess',    label: 'Assess' },
]

// No `id` on this placeholder is intentional — every edit/save/post guard in
// this file checks `baseAnimal.value?.id` to decide whether a real animal is
// loaded, so leaving it unset is what keeps those actions correctly disabled
// here instead of silently operating on fake data.
const baseAnimal = computed(() => ui.selectedAnimal || {
  emoji: loadingAnimal.value ? '⏳' : '❓',
  name: loadingAnimal.value ? 'Loading…' : 'Animal not found',
  species: '',
  breed: '',
  status: 'unknown',
  location: '—',
})

// Same fix as Animals.vue: daysInCare was a static field set once at
// intake and never updated. Compute it live from intakeDate, falling
// back to createdAt (a Firestore Timestamp after the first reload).
const daysInCare = (animal) => {
  const raw = animal?.intakeDate || animal?.createdAt
  if (!raw) return 0
  const d = typeof raw?.toDate === 'function' ? raw.toDate() : new Date(raw)
  if (isNaN(d)) return 0
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000))
}

const statusLabel = s => ({
  intake: 'Intake', quarantine: 'Quarantine', available: 'Available',
  foster: 'In Foster', adopted: 'Adopted', sanctuary: 'Sanctuary',
  medical: 'Medical Hold', transferred: 'Transferred', deceased: 'Deceased',
}[s] || s)

const speciesOptions = [
  { value: '',        label: 'Select species' },
  { value: 'Dog',     label: '🐶 Dog' },
  { value: 'Cat',     label: '🐱 Cat' },
  { value: 'Horse',   label: '🐴 Horse' },
  { value: 'Goat',    label: '🐐 Goat' },
  { value: 'Pig',     label: '🐷 Pig' },
  { value: 'Rabbit',  label: '🐰 Rabbit' },
  { value: 'Bird',    label: '🦅 Bird' },
  { value: 'Donkey',  label: '🫏 Donkey' },
  { value: 'Chicken', label: '🐔 Chicken' },
  { value: 'Duck',    label: '🦆 Duck' },
  { value: 'Other',   label: '🐾 Other' },
]
const sexOptions = [
  { value: '',       label: 'Unknown' },
  { value: 'Male',   label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Male (neutered)',   label: 'Male (neutered)' },
  { value: 'Female (spayed)',   label: 'Female (spayed)' },
]
const statusOptions = [
  { value: 'intake',     label: 'Intake' },
  { value: 'quarantine', label: 'Quarantine' },
  { value: 'medical',    label: 'Medical Hold' },
  { value: 'available',  label: 'Available' },
  { value: 'foster',     label: 'In Foster' },
  { value: 'sanctuary',  label: 'Sanctuary' },
  { value: 'adopted',    label: 'Adopted' },
  { value: 'transferred', label: 'Transferred' },
  { value: 'deceased',   label: 'Deceased' },
]

const speciesEmoji = (species) => {
  const map = { Dog: '🐶', Cat: '🐱', Horse: '🐴', Goat: '🐐', Pig: '🐷', Rabbit: '🐰', Bird: '🦅', Donkey: '🫏', Chicken: '🐔', Duck: '🦆' }
  return map[species] || '🐾'
}

const openVetChat = () => {
  ui.setCurrentTab('vet-hub')
}

/* ---------------- Edit ---------------- */
const showEdit = ref(false)
const savingEdit = ref(false)
const editForm = reactive({
  name: '', species: '', breed: '', age: '', sex: '', status: 'intake', location: '', weight: '', notes: '',
})

const openEdit = () => {
  if (!baseAnimal.value?.id) {
    ui.showToast('Select a real animal to edit', 'error')
    return
  }
  Object.assign(editForm, {
    name: baseAnimal.value.name || '',
    species: baseAnimal.value.species || '',
    breed: baseAnimal.value.breed || '',
    age: baseAnimal.value.age || '',
    sex: baseAnimal.value.sex || '',
    status: baseAnimal.value.status || 'intake',
    location: baseAnimal.value.location || '',
    weight: baseAnimal.value.weight || '',
    notes: baseAnimal.value.notes || '',
  })
  showEdit.value = true
}

const saveEdit = async () => {
  if (!editForm.name.trim() || !editForm.species) return
  savingEdit.value = true
  try {
    const updates = { ...editForm }
    await animalsStore.updateAnimal(baseAnimal.value.id, updates)
    ui.selectAnimal({ ...baseAnimal.value, ...updates, emoji: speciesEmoji(updates.species) })
    ui.showToast(`${editForm.name} updated`, 'success')
    showEdit.value = false
  } catch (err) {
    ui.showToast('Failed to save changes', 'error')
  } finally {
    savingEdit.value = false
  }
}

/* ---------------- Post ---------------- */
const showPost = ref(false)
const savingPost = ref(false)
const postForm = reactive({ title: '', caption: '' })

const buildCaption = (a) => {
  const bits = [`Meet ${a.name}!`]
  const descriptor = [a.age, a.sex, a.breed || a.species].filter(Boolean).join(' ')
  if (descriptor) bits.push(`A ${descriptor} looking for a loving home.`)
  if (a.notes) bits.push(a.notes)
  bits.push(`📍 ${a.location || 'Ask us for details'}`)
  return bits.join('\n\n')
}

const openPost = () => {
  if (!baseAnimal.value?.id) {
    ui.showToast('Select a real animal to post about', 'error')
    return
  }
  postForm.title = `Meet ${baseAnimal.value.name}!`
  postForm.caption = buildCaption(baseAnimal.value)
  showPost.value = true
}

const copyCaption = async () => {
  try {
    await navigator.clipboard.writeText(`${postForm.title}\n\n${postForm.caption}`)
    ui.showToast('Caption copied to clipboard 📋', 'success')
  } catch (err) {
    ui.showToast('Could not copy — select and copy manually', 'error')
  }
}

const submitPost = async () => {
  if (!postForm.title.trim() || !postForm.caption.trim()) return
  savingPost.value = true
  try {
    await announcementsStore.createAnnouncement({
      title: postForm.title,
      message: postForm.caption,
      body: postForm.caption,
      animalId: baseAnimal.value.id,
      active: true,
    })
    ui.showToast('Posted to Announcements 📢', 'success')
    showPost.value = false
  } catch (err) {
    ui.showToast('Failed to post', 'error')
  } finally {
    savingPost.value = false
  }
}

/* ---------------- Kennel Card ---------------- */
const showCard = ref(false)

const openCard = () => {
  showCard.value = true
}

const printKennelCard = () => {
  const a = baseAnimal.value
  const rows = [
    ['Species', a.species], ['Breed', a.breed], ['Age', a.age], ['Sex', a.sex],
    ['Weight', a.weight], ['Location', a.location], ['Intake date', a.intakeDate],
  ].filter(([, v]) => v)

  const notesHtml = [
    a.feedingNotes && `<p><strong>Feeding:</strong> ${a.feedingNotes}</p>`,
    a.behaviorNotes && `<p><strong>Behavior:</strong> ${a.behaviorNotes}</p>`,
    a.notes && `<p><strong>Notes:</strong> ${a.notes}</p>`,
  ].filter(Boolean).join('')

  const html = `<!doctype html><html><head><title>${a.name} — Kennel Card</title>
    <style>
      body { font-family: 'Nunito', Arial, sans-serif; padding: 32px; color: #1a1a1a; }
      .card { max-width: 420px; margin: 0 auto; border: 3px solid #1a1a1a; border-radius: 16px; padding: 24px; text-align: center; }
      .emoji { font-size: 64px; }
      .name { font-size: 32px; font-weight: 900; margin: 8px 0; }
      .status { display: inline-block; padding: 4px 14px; border-radius: 20px; background: #eee; font-weight: 700; margin-bottom: 16px; }
      table { width: 100%; border-collapse: collapse; text-align: left; margin-top: 12px; }
      td { padding: 6px 4px; border-bottom: 1px solid #ddd; font-size: 14px; }
      td.label { font-weight: 700; width: 40%; }
      .notes { text-align: left; margin-top: 14px; font-size: 13px; }
      .notes p { margin: 4px 0; }
    </style>
  </head><body>
    <div class="card">
      <div class="emoji">${a.emoji || '🐾'}</div>
      <div class="name">${a.name || ''}</div>
      <div class="status">${statusLabel(a.status)}</div>
      <table>${rows.map(([k, v]) => `<tr><td class="label">${k}</td><td>${v}</td></tr>`).join('')}</table>
      <div class="notes">${notesHtml}</div>
    </div>
    <script>window.onload = () => { window.print(); }<\/script>
  </body></html>`

  const win = window.open('', '_blank')
  if (!win) {
    ui.showToast('Please allow pop-ups to print the card', 'error')
    return
  }
  win.document.write(html)
  win.document.close()
}

/* -------- Incident Reporting -------- */
const showIncidentReport = ref(false)
const submittingIncident = ref(false)
const incidentForm = ref({
  type: 'bite',
  victim: '',
  description: '',
  datetime: new Date().toISOString().slice(0, 16)
})

const openIncidentReport = () => {
  incidentForm.value = {
    type: 'bite',
    victim: '',
    description: '',
    datetime: new Date().toISOString().slice(0, 16)
  }
  showIncidentReport.value = true
}

const submitIncidentReport = async () => {
  if (!incidentForm.value.type || !incidentForm.value.victim || !incidentForm.value.description) return

  submittingIncident.value = true
  try {
    const biteStore = useBiteReportsStore()
    const now = new Date(incidentForm.value.datetime || Date.now())

    await biteStore.addBiteReport({
      animalId: baseAnimal.value?.id,
      animalName: baseAnimal.value?.name,
      emoji: baseAnimal.value?.emoji,
      type: incidentForm.value.type,
      victim: incidentForm.value.victim,
      description: incidentForm.value.description,
      status: 'Pending',
      reportedAt: now,
      reportedBy: auth.user?.name || auth.user?.email || 'Anonymous',
      date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    })

    ui.showToast('🚨 Incident report submitted for admin review', 'success')
    showIncidentReport.value = false
  } catch (err) {
    console.error('Failed to submit incident report:', err)
    ui.showToast('Failed to submit report — please try again', 'error')
  } finally {
    submittingIncident.value = false
  }
}

// Analytics: track when an animal detail is viewed
watch(() => baseAnimal.value?.id, (animalId) => {
  if (animalId) {
    try {
      if (typeof window.plausible === 'function') {
        window.plausible('View Animal', { props: { animalId: animalId, animalName: baseAnimal.value?.name || 'unknown' } })
      }
    } catch (e) { /* analytics must never break the page */ }
  }
})
</script>

<style scoped>
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: transparent;
  border: 1.5px solid var(--border);
  border-radius: var(--r);
  color: var(--ink-3);
  font-size: 12px;
  font-weight: 700;
  font-family: 'Nunito', sans-serif;
  cursor: pointer;
  transition: all .15s;
  margin-bottom: 16px;
}
.back-btn:hover { color: var(--ink); border-color: var(--border-2); }

/* Header */
.detail-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--rl);
  margin-bottom: 16px;
}

.header-avatar { font-size: 40px; flex-shrink: 0; }

.header-info { flex: 1; min-width: 0; }

.header-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.header-name {
  font-size: 18px;
  font-weight: 900;
  color: var(--ink);
  font-family: 'Fredoka One', sans-serif;
}

.header-meta {
  font-size: 12px;
  color: var(--ink-3);
  font-weight: 600;
}

.header-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
}

/* Tab menu wrapper */
.tab-menu-wrapper {
  margin-bottom: 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r);
  overflow: hidden;
}

.tab-menu {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0;
  padding: 8px;
}

.tab-menu-btn {
  padding: 10px 12px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: calc(var(--r) - 2px);
  color: var(--ink-3);
  font-size: 11px;
  font-weight: 700;
  font-family: 'Nunito', sans-serif;
  cursor: pointer;
  transition: all .15s;
  text-transform: uppercase;
  letter-spacing: .04em;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  white-space: nowrap;
}

.tab-menu-btn:hover {
  background: var(--surface-3);
  color: var(--ink-2);
  border-color: var(--border-2);
}

.tab-menu-btn.active {
  background: linear-gradient(135deg, rgba(78,255,197,0.2), rgba(255,122,69,0.15));
  color: var(--mint);
  border-color: var(--mint);
}

.tab-label {
  flex: 1;
  text-align: left;
}

.tab-indicator {
  font-size: 10px;
  flex-shrink: 0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.edit-field { display: flex; flex-direction: column; gap: 4px; }
.edit-field label {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--ink-3);
  letter-spacing: .05em;
}
.edit-field textarea {
  padding: 9px 12px;
  background: var(--surface-2);
  border: 1.5px solid var(--border);
  border-radius: 8px;
  color: var(--ink);
  font-size: 13px;
  font-family: 'Nunito', sans-serif;
  resize: vertical;
}
.edit-field textarea:focus { outline: none; border-color: var(--mint); }

/* Kennel card preview */
.kennel-card-preview {
  border: 2px solid var(--border-2);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}
.kc-emoji { font-size: 56px; line-height: 1; }
.kc-name { font-size: 24px; font-weight: 900; color: var(--ink); margin: 6px 0 8px; font-family: 'Fredoka One', sans-serif; }
.kc-grid { margin-top: 14px; text-align: left; }
.kc-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
  color: var(--ink);
}
.kc-row:last-child { border-bottom: none; }
.kc-label { font-weight: 700; color: var(--ink-2); }
.kc-notes {
  text-align: left;
  margin-top: 10px;
  font-size: 12px;
  color: var(--ink-2);
  line-height: 1.5;
}

/* Incident report button */
.btn-alert {
  border-color: var(--coral) !important;
  color: var(--coral) !important;
}
.btn-alert:hover {
  background: rgba(255, 107, 107, 0.1);
  border-color: var(--coral-dark, #ff4444) !important;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.form-group label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--ink-2);
  letter-spacing: 0.04em;
}

.form-group textarea,
.form-group input,
.form-group :deep(.select-input) {
  padding: 10px 12px;
  background: var(--surface-2);
  border: 1.5px solid var(--border);
  border-radius: 8px;
  color: var(--ink);
  font-size: 13px;
  font-family: 'Nunito', sans-serif;
}

.form-group textarea:focus,
.form-group input:focus {
  outline: none;
  border-color: var(--mint);
}
</style>
