<template>
  <PageContainer>
    <div class="header">
      <h1>🐾 Animals</h1>
      <p class="subtitle">Quick reference & incident reporting</p>
    </div>

    <!-- Search -->
    <AppInput v-model="search" placeholder="Search by name or species..." />

    <!-- Animal cards -->
    <div v-if="filtered.length > 0" class="animal-grid">
      <AppCard v-for="a in filtered" :key="a.id" class="animal-card" @click="selectedAnimal = a">
        <div class="card-header">
          <div class="photo-container">
            <img v-if="a.photos?.length" :src="siteMediaUrl(a.photos[0])" :alt="a.name" class="animal-photo" />
            <div v-else class="emoji">{{ a.emoji }}</div>
          </div>
          <div class="info">
            <h3>{{ a.name }}</h3>
            <p class="species">{{ a.species }}<span v-if="a.breed"> · {{ a.breed }}</span></p>
            <p class="location">📍 {{ a.location }}</p>
          </div>
        </div>
        <div class="card-actions">
          <AppButton size="sm" variant="secondary" @click.stop="openKennelCard(a)">🏷️ Card</AppButton>
          <AppButton size="sm" variant="secondary" @click.stop="openIncidentForm(a)" class="btn-report">🚨 Report</AppButton>
        </div>
      </AppCard>
    </div>
    <EmptyState v-else icon="🐾" title="No animals found" message="Try a different search." />

    <!-- Kennel Card Modal -->
    <AppModal v-if="showCard" :open="true" title="Kennel Card" size="sm" @close="showCard = false">
      <div class="kennel-card">
        <div class="kc-emoji">{{ selectedAnimal.emoji }}</div>
        <h2 class="kc-name">{{ selectedAnimal.name }}</h2>
        <div class="kc-status">{{ selectedAnimal.status || 'Unknown' }}</div>
        <table class="kc-grid">
          <tr><td class="label">Species</td><td>{{ selectedAnimal.species || '—' }}</td></tr>
          <tr><td class="label">Breed</td><td>{{ selectedAnimal.breed || '—' }}</td></tr>
          <tr><td class="label">Age</td><td>{{ selectedAnimal.age || '—' }}</td></tr>
          <tr><td class="label">Location</td><td>{{ selectedAnimal.location || '—' }}</td></tr>
          <tr><td class="label">Weight</td><td>{{ selectedAnimal.weight || '—' }}</td></tr>
        </table>
        <div v-if="selectedAnimal.feedingNotes" class="note">
          <strong>Feeding:</strong> {{ selectedAnimal.feedingNotes }}
        </div>
        <div v-if="selectedAnimal.behaviorNotes" class="note">
          <strong>Behavior:</strong> {{ selectedAnimal.behaviorNotes }}
        </div>
      </div>
      <template #actions>
        <AppButton @click="showCard = false">Close</AppButton>
      </template>
    </AppModal>

    <!-- Incident Report Modal -->
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
        <textarea v-model="incidentForm.victim" placeholder="Who/what was involved?" rows="2"></textarea>
      </div>
      <div class="form-group">
        <label>Description *</label>
        <textarea v-model="incidentForm.description" placeholder="What happened?" rows="4"></textarea>
      </div>
      <template #actions>
        <AppButton @click="showIncidentReport = false">Cancel</AppButton>
        <AppButton variant="primary" :disabled="!incidentForm.type || !incidentForm.victim || !incidentForm.description || submitting" @click="submitIncident">
          {{ submitting ? 'Submitting…' : 'Submit Report' }}
        </AppButton>
      </template>
    </AppModal>
  </PageContainer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { PageContainer, AppCard, AppButton, AppInput, AppSelect, AppModal, EmptyState } from '../ui'
import { useAnimalsStore } from '../../stores/animals'
import { useBiteReportsStore } from '../../stores/biteReports'
import { useUIStore } from '../../stores/ui'
import { useAuthStore } from '../../stores/auth'
import { siteMediaUrl } from '../../services/siteApi'

const ui = useUIStore()
const auth = useAuthStore()
const animalsStore = useAnimalsStore()
const biteStore = useBiteReportsStore()

const search = ref('')
const selectedAnimal = ref(null)
const showCard = ref(false)
const showIncidentReport = ref(false)
const submitting = ref(false)
const incidentForm = ref({ type: 'bite', victim: '', description: '' })

const getEmoji = (species) => {
  const map = { Cat: '🐱', Dog: '🐶', Rabbit: '🐰', Horse: '🐴', Goat: '🐐', Pig: '🐷', Bird: '🦅' }
  return map[species] || '🐾'
}

const animals = computed(() => {
  const list = animalsStore.animals || []
  return Array.isArray(list) ? list.map(a => ({
    ...a,
    emoji: getEmoji(a.species)
  })) : []
})

const filtered = computed(() => {
  const list = animals.value
  if (!search.value.trim()) return list
  const q = search.value.toLowerCase()
  return list.filter(a =>
    a.name?.toLowerCase().includes(q) ||
    a.species?.toLowerCase().includes(q) ||
    a.breed?.toLowerCase().includes(q)
  )
})

const openKennelCard = (a) => {
  selectedAnimal.value = a
  showCard.value = true
}

const openIncidentForm = (a) => {
  selectedAnimal.value = a
  incidentForm.value = { type: 'bite', victim: '', description: '' }
  showIncidentReport.value = true
}

const submitIncident = async () => {
  if (!incidentForm.value.type || !incidentForm.value.victim || !incidentForm.value.description) return

  submitting.value = true
  try {
    await biteStore.addBiteReport({
      animalId: selectedAnimal.value?.id,
      animalName: selectedAnimal.value?.name,
      emoji: selectedAnimal.value?.emoji,
      type: incidentForm.value.type,
      victim: incidentForm.value.victim,
      description: incidentForm.value.description,
      status: 'Pending',
      reportedAt: new Date(),
      reportedBy: auth.user?.name || auth.user?.email || 'Volunteer',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    })

    ui.showToast('🚨 Incident report submitted for admin review', 'success')
    showIncidentReport.value = false
  } catch (err) {
    console.error('Failed to submit incident:', err)
    ui.showToast('Failed to submit report', 'error')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  animalsStore.fetchAnimals()
})
</script>

<style scoped>
.header {
  margin-bottom: 20px;
}

.header h1 {
  font-size: 24px;
  font-weight: 900;
  color: var(--ink);
  margin: 0 0 4px 0;
  font-family: 'Fredoka One', sans-serif;
}

.subtitle {
  font-size: 13px;
  color: var(--ink-3);
  margin: 0;
}

.animal-grid {
  display: grid;
  gap: 12px;
  margin-top: 16px;
}

.animal-card {
  cursor: pointer;
  transition: all 0.2s;
}

.animal-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.photo-container {
  position: relative;
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;
  background: var(--surface-2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.animal-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.emoji {
  font-size: 40px;
  flex-shrink: 0;
}

.info h3 {
  font-size: 16px;
  font-weight: 800;
  color: var(--ink);
  margin: 0 0 4px 0;
}

.species {
  font-size: 12px;
  color: var(--ink-2);
  margin: 0 0 4px 0;
}

.location {
  font-size: 12px;
  color: var(--ink-3);
  margin: 0;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.btn-report {
  border-color: var(--coral) !important;
  color: var(--coral) !important;
}

.btn-report:hover {
  background: rgba(255, 107, 107, 0.1);
}

.kennel-card {
  text-align: center;
  padding: 16px;
}

.kc-emoji {
  font-size: 48px;
  margin-bottom: 8px;
}

.kc-name {
  font-size: 22px;
  font-weight: 900;
  color: var(--ink);
  margin: 0 0 8px 0;
  font-family: 'Fredoka One', sans-serif;
}

.kc-status {
  display: inline-block;
  padding: 4px 12px;
  background: var(--surface-2);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  color: var(--ink-2);
  margin-bottom: 12px;
}

.kc-grid {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  margin-bottom: 12px;
  font-size: 13px;
}

.kc-grid tr {
  border-bottom: 1px solid var(--border);
}

.kc-grid td {
  padding: 8px 4px;
}

.kc-grid td.label {
  font-weight: 700;
  color: var(--ink-2);
  width: 30%;
}

.note {
  text-align: left;
  margin-bottom: 8px;
  padding: 8px;
  background: var(--surface-2);
  border-radius: 6px;
  font-size: 12px;
  line-height: 1.4;
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

.form-group textarea {
  padding: 10px 12px;
  background: var(--surface-2);
  border: 1.5px solid var(--border);
  border-radius: 8px;
  color: var(--ink);
  font-size: 13px;
  font-family: 'Nunito', sans-serif;
  resize: vertical;
}

.form-group textarea:focus {
  outline: none;
  border-color: var(--mint);
}
</style>
