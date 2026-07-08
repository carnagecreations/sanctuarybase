<template>
  <PageContainer>

    <!-- Alerts -->
    <AlertBox v-if="overdueCount > 0" type="danger">
      🚨 {{ overdueCount }} overdue vaccine{{ overdueCount !== 1 ? 's' : '' }} · {{ followUpCount }} follow-ups due
    </AlertBox>

    <!-- Species quick-stats -->
    <div class="species-strip">
      <div v-for="s in speciesStats" :key="s.name" class="species-chip">
        <span class="species-chip__emoji">{{ s.emoji }}</span>
        <span class="species-chip__count">{{ s.count }}</span>
        <span class="species-chip__label">{{ s.name }}</span>
      </div>
    </div>

    <!-- Action buttons -->
    <div class="action-row">
      <AppButton variant="primary" @click="openAdd">+ Add Animal</AppButton>
      <AppButton variant="secondary" @click="exportCSV">Export CSV</AppButton>
    </div>

    <!-- Add Animal modal -->
    <AppModal v-if="showAdd" :open="true" title="Add Animal" size="sm" @close="showAdd = false">
      <div class="form-row">
        <AppInput v-model="form.name"   label="Name *"   placeholder="Luna" />
        <AppSelect v-model="form.species" label="Species *" :options="speciesOptions" />
      </div>
      <div class="form-row">
        <AppInput v-model="form.breed"  label="Breed"    placeholder="Mixed" />
        <AppInput v-model="form.age"    label="Age"      placeholder="2 years" />
      </div>
      <div class="form-row">
        <AppSelect v-model="form.sex"    label="Sex"      :options="sexOptions" />
        <AppSelect v-model="form.status" label="Status *" :options="statusOptions" />
      </div>
      <AppInput v-model="form.location" label="Location" placeholder="Kennel A-3, Barn, Foster home…" />
      <AppInput v-model="form.weight"   label="Weight"   placeholder="45 lbs" style="margin-top:8px" />
      <AppInput v-model="form.notes"    label="Notes"    placeholder="Any relevant intake notes…" style="margin-top:8px" />
      <template #actions>
        <AppButton @click="showAdd = false">Cancel</AppButton>
        <AppButton variant="primary" :disabled="!form.name || !form.species || saving" @click="submitAdd">
          {{ saving ? 'Saving…' : 'Add Animal' }}
        </AppButton>
      </template>
    </AppModal>

    <!-- Species filter pills -->
    <div class="filter-row">
      <button
        v-for="f in speciesFilters"
        :key="f.value"
        class="filter-pill"
        :class="{ active: speciesFilter === f.value }"
        @click="speciesFilter = f.value"
      >{{ f.label }}</button>
    </div>

    <!-- Status filter pills -->
    <div class="filter-row">
      <button
        v-for="f in statusFilters"
        :key="f.value"
        class="filter-pill"
        :class="{ active: statusFilter === f.value }"
        @click="statusFilter = f.value"
      >{{ f.label }}</button>
    </div>

    <!-- Search -->
    <AppInput
      v-model="search"
      placeholder="Search name, breed, location..."
    />

    <!-- List header -->
    <div class="list-header">Animals ({{ filtered.length }})</div>

    <!-- Animal cards -->
    <template v-if="filtered.length > 0">
      <AppCard
        v-for="a in filtered"
        :key="a.id"
        :flat="true"
        :class="{ 'alert-card': a.alert }"
        class="animal-card"
        @click="ui.selectAnimal(a)"
      >
        <div class="animal-row">
          <div class="animal-photo">
            <img v-if="a.photos?.length" :src="siteMediaUrl(a.photos[0])" :alt="a.name" />
            <span v-else class="animal-emoji">{{ a.emoji }}</span>
          </div>
          <div class="animal-info">
            <div class="animal-name-row">
              <span class="animal-name">{{ a.name }}</span>
              <AppBadge :type="a.status">{{ statusLabel(a.status) }}</AppBadge>
              <AppBadge v-if="a.alert" type="high">!</AppBadge>
            </div>
            <div class="animal-meta">
              {{ a.species }}<template v-if="a.breed"> · {{ a.breed }}</template>
            </div>
            <div class="animal-meta">
              📍 {{ a.location }} · {{ daysInCare(a) }}d in care
            </div>
            <div v-if="a.activeMeds" class="animal-meds">
              💊 {{ a.activeMeds }} active medication{{ a.activeMeds !== 1 ? 's' : '' }}
            </div>
          </div>
          <span class="animal-arrow">›</span>
        </div>
      </AppCard>
    </template>
    <EmptyState v-else icon="🔍" title="No animals found" message="Try a different filter or search term." />

  </PageContainer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { PageContainer, AppCard, AppBadge, AppButton, AppInput, AppSelect, AlertBox, EmptyState, AppModal } from '../ui'
import { useUIStore } from '../../stores/ui'
import { useAnimalsStore } from '../../stores/animals'
import { siteMediaUrl } from '../../services/siteApi'

const ui = useUIStore()
const animalsStore = useAnimalsStore()
const search        = ref('')
const speciesFilter = ref('all')
const statusFilter  = ref('active')
const showAdd       = ref(false)
const saving        = ref(false)

const defaultForm = () => ({
  name: '', species: '', breed: '', age: '', sex: '', status: 'intake', location: '', weight: '', notes: '',
})
const form = ref(defaultForm())

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

const openAdd = () => {
  form.value = defaultForm()
  showAdd.value = true
}

const submitAdd = async () => {
  if (!form.value.name.trim() || !form.value.species) return
  saving.value = true
  try {
    await animalsStore.addAnimal({
      ...form.value,
      healthStatus: 'unknown',
      intakeDate: new Date().toISOString().slice(0, 10),
    })
    ui.showToast(`${form.value.name} added successfully`)
    showAdd.value = false
    await animalsStore.fetchAnimals()
  } catch (err) {
    console.error('Submit error:', err.message)
    ui.showToast('Failed to add animal — check Firestore rules & browser console', 'error')
  } finally {
    saving.value = false
  }
}

const exportCSV = () => {
  const rows = [['Name','Species','Breed','Age','Sex','Status','Location','Weight']]
  animals.value.forEach(a => rows.push([a.name, a.species, a.breed||'', a.age||'', a.sex||'', a.status||'', a.location||'', a.weight||'']))
  const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  a.download = 'animals.csv'
  a.click()
}

const overdueCount  = computed(() => animals.value.filter(a => a.overdueVaccines || a.overdue).length)
const followUpCount = computed(() => animals.value.filter(a => a.followUpDue).length)

const speciesFilters = [
  { value: 'all',     label: 'All' },
  { value: 'cat',     label: '🐱 Cats' },
  { value: 'dog',     label: '🐶 Dogs' },
  { value: 'rabbit',  label: '🐰 Rabbits' },
  { value: 'horse',   label: '🐴 Horses' },
  { value: 'other',   label: '🐾 Other' },
]

const statusFilters = [
  { value: 'active',     label: 'Active' },
  { value: 'all',        label: 'All' },
  { value: 'intake',     label: 'Intake' },
  { value: 'quarantine', label: 'Quarantine' },
  { value: 'available',  label: 'Available' },
  { value: 'foster',     label: 'In Foster' },
  { value: 'adopted',    label: 'Adopted' },
  { value: 'sanctuary',  label: 'Sanctuary' },
  { value: 'medical',    label: 'Medical Hold' },
  { value: 'transferred', label: 'Transferred' },
  { value: 'deceased',   label: 'Deceased' },
]

const getSpeciesKey = (species) => {
  const map = { Cat: 'cat', Dog: 'dog', Rabbit: 'rabbit', Horse: 'horse', Goat: 'goat', Pig: 'pig', Bird: 'bird' }
  return map[species] || 'other'
}

const getSpeciesEmoji = (species) => {
  const map = { Cat: '🐱', Dog: '🐶', Rabbit: '🐰', Horse: '🐴', Goat: '🐐', Pig: '🐷', Bird: '🦅' }
  return map[species] || '🐾'
}

// daysInCare used to be a static field set once at intake and never
// updated (always 0, or missing on animals that predate the field
// entirely — either way the wrong number). Compute it live from
// intakeDate, falling back to createdAt (a Firestore Timestamp after
// the first reload, not a plain Date).
const daysInCare = (animal) => {
  const raw = animal.intakeDate || animal.createdAt
  if (!raw) return 0
  const d = typeof raw?.toDate === 'function' ? raw.toDate() : new Date(raw)
  if (isNaN(d)) return 0
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000))
}

const animals = computed(() => {
  const storeAnimals = animalsStore.animals || []
  const mapped = Array.isArray(storeAnimals) ? storeAnimals.map(a => ({
    ...a,
    emoji: getSpeciesEmoji(a.species),
    speciesKey: getSpeciesKey(a.species),
  })) : []
  // Log animals with photos for debugging
  mapped.forEach(a => {
    if (a.photos?.length) {
      console.log(`Animal ${a.name} has ${a.photos.length} photos:`, a.photos)
    }
  })
  return mapped
})

const speciesStats = computed(() => {
  const counts = {}
  const list = Array.isArray(animals.value) ? animals.value : []
  for (let i = 0; i < list.length; i++) {
    const a = list[i]
    const key = a.speciesKey
    if (!counts[key]) counts[key] = { count: 0, emoji: a.emoji, name: a.species }
    counts[key].count++
  }
  return Object.values(counts)
})

const activeStatuses = ['intake', 'quarantine', 'available', 'foster', 'sanctuary', 'medical']

const filtered = computed(() => {
  let list = animals.value
  if (speciesFilter.value !== 'all')  list = list.filter(a => a.speciesKey === speciesFilter.value)
  if (statusFilter.value === 'active') list = list.filter(a => activeStatuses.includes(a.status))
  else if (statusFilter.value !== 'all') list = list.filter(a => a.status === statusFilter.value)
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(a =>
      (a.name || '').toLowerCase().includes(q) ||
      (a.species || '').toLowerCase().includes(q) ||
      (a.breed || '').toLowerCase().includes(q) ||
      (a.location || '').toLowerCase().includes(q)
    )
  }
  // Sort: quarantine → medical → intake → rest
  const priority = { quarantine: 0, medical: 1, intake: 2 }
  return [...list].sort((a, b) => (priority[a.status] ?? 3) - (priority[b.status] ?? 3))
})

const statusLabel = s => ({
  intake: 'Intake', quarantine: 'Quarantine', available: 'Available',
  foster: 'In Foster', adopted: 'Adopted', sanctuary: 'Sanctuary',
  medical: 'Medical Hold', transferred: 'Transferred', deceased: 'Deceased',
}[s] || s)

onMounted(() => animalsStore.fetchAnimals())
</script>

<style scoped>
/* Species strip */
.species-strip {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 8px;
  margin-bottom: 20px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.species-strip::-webkit-scrollbar { display: none; }

.species-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
  background: linear-gradient(135deg, var(--surface), var(--surface-2));
  border: 1.5px solid var(--border-2);
  border-radius: var(--r);
  min-width: 64px;
  flex-shrink: 0;
  transition: all .2s;
  cursor: pointer;
}
.species-chip:hover {
  border-color: var(--mint);
  background: var(--surface-3);
  transform: translateY(-2px);
}
.species-chip__emoji { font-size: 24px; }
.species-chip__count { font-size: 18px; font-weight: 900; color: var(--mint); font-family: 'Fredoka One', sans-serif; }
.species-chip__label { font-size: 11px; font-weight: 700; color: var(--ink-2); text-transform: uppercase; letter-spacing: .04em; }

/* Action row */
.action-row {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

/* Filter pills */
.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}
.filter-row::-webkit-scrollbar { display: none; }

.filter-pill {
  flex-shrink: 0;
  padding: 7px 14px;
  border-radius: 20px;
  border: 1.5px solid var(--border-2);
  background: var(--surface);
  color: var(--ink-3);
  font-size: 13px;
  font-weight: 700;
  font-family: 'Nunito', sans-serif;
  cursor: pointer;
  transition: all .2s;
  white-space: nowrap;
}
.filter-pill:hover { border-color: var(--border-2); color: var(--ink-2); }
.filter-pill.active {
  background: var(--teal-l);
  border-color: var(--mint);
  color: var(--mint);
  font-weight: 800;
}

/* List header */
.list-header {
  font-size: 12px;
  font-weight: 900;
  color: var(--ink-2);
  text-transform: uppercase;
  letter-spacing: .08em;
  margin-bottom: 12px;
  margin-top: 8px;
}

/* Animal card */
.animal-card { cursor: pointer; margin-bottom: 12px; transition: all .2s; }
.alert-card { border-left: 2px solid var(--coral) !important; }

.animal-row {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.animal-photo { width: 56px; height: 56px; border-radius: 8px; overflow: hidden; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: var(--surface-2); border: 1px solid var(--border); }
.animal-photo img { width: 100%; height: 100%; object-fit: cover; }
.animal-emoji { font-size: 36px; }

.animal-info { flex: 1; min-width: 0; }

.animal-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}

.animal-name {
  font-size: 17px;
  font-weight: 800;
  color: var(--ink);
}

.animal-meta {
  font-size: 13px;
  color: var(--ink-2);
  font-weight: 600;
  margin-bottom: 4px;
}

.animal-meds {
  font-size: 12px;
  color: var(--brand);
  font-weight: 700;
  margin-top: 6px;
  background: var(--brand-l);
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
}

.animal-arrow {
  font-size: 24px;
  color: var(--ink-3);
  align-self: center;
  flex-shrink: 0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
</style>
