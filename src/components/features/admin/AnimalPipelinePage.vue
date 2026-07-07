<template>
  <PageContainer>
    <div class="pipeline-wrap">
      <div class="pipeline-header">
        <h2 class="pipeline-title">Animal Pipeline</h2>
        <div class="pipeline-sub">Intake → Medical/Quarantine → Available → Foster → Sanctuary → Outcome</div>
      </div>

      <!-- Kanban board -->
      <div class="kanban-board">
        <div v-for="col in columns" :key="col.id" class="kanban-col">
          <div class="col-header" :style="{ borderColor: col.color }">
            <span class="col-icon">{{ col.icon }}</span>
            <span class="col-name">{{ col.name }}</span>
            <span class="col-count" :style="{ background: col.color + '22', color: col.color }">
              {{ getAnimalsInStage(col.id).length }}
            </span>
          </div>

          <div class="col-cards">
            <div
              v-for="animal in getAnimalsInStage(col.id)"
              :key="animal.id"
              class="kanban-card"
              :style="{ borderLeft: `3px solid ${col.color}` }"
              @click="selectedAnimal = animal"
            >
              <div class="kc-name">{{ animal.name }}</div>
              <div class="kc-species">{{ animal.species }} · {{ animal.breed }}</div>
              <div v-if="animal.location" class="kc-location">📍 {{ animal.location }}</div>
              <div v-if="animal.flags?.length" class="kc-flags">
                <span v-for="flag in animal.flags" :key="flag" class="kc-flag">{{ flag }}</span>
              </div>
              <div class="kc-days">{{ daysInStage(animal) }}d in stage</div>
              <div class="kc-actions">
                <select class="kc-select" :value="animal.status || 'intake'" @change="moveAnimal(animal, $event.target.value)" @click.stop>
                  <option v-for="s in STATUS_OPTIONS" :key="s.value" :value="s.value">→ {{ s.label }}</option>
                </select>
              </div>
            </div>

            <div v-if="!getAnimalsInStage(col.id).length" class="col-empty">
              <div>{{ col.emptyText }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detail modal -->
      <AppModal v-if="selectedAnimal" :open="true" :title="selectedAnimal.name" size="sm" @close="selectedAnimal = null">
        <div class="modal-row"><span class="ml">Status:</span><span>{{ stageLabel(selectedAnimal.status) }}</span></div>
        <div class="modal-row"><span class="ml">Species:</span><span>{{ selectedAnimal.species }}</span></div>
        <div class="modal-row"><span class="ml">Location:</span><span>{{ selectedAnimal.location }}</span></div>
        <div class="modal-row"><span class="ml">Days in Stage:</span><span>{{ daysInStage(selectedAnimal) }}</span></div>
        <template #actions>
          <AppButton variant="secondary" size="sm" @click="selectedAnimal = null">Close</AppButton>
          <AppButton variant="primary" size="sm" @click="viewAnimal(selectedAnimal)">View Full Profile</AppButton>
        </template>
      </AppModal>
    </div>
  </PageContainer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { PageContainer, AppButton, AppModal } from '../../ui'
import { useAnimalsStore } from '../../../stores/animals'
import { useUIStore } from '../../../stores/ui'
import { useActivityLogStore } from '../../../stores/activityLog'

const animalsStore = useAnimalsStore()
const ui = useUIStore()
const actLog = useActivityLogStore()

const selectedAnimal = ref(null)

// Matches the exact status enum used everywhere else (AnimalDetail.vue,
// Animals.vue) — the pipeline board is just a different view of the same
// `status` field, not a separate tracked concept.
const STATUS_OPTIONS = [
  { value: 'intake',      label: 'Intake' },
  { value: 'quarantine',  label: 'Quarantine' },
  { value: 'medical',     label: 'Medical Hold' },
  { value: 'available',   label: 'Available' },
  { value: 'foster',      label: 'In Foster' },
  { value: 'sanctuary',   label: 'Sanctuary' },
  { value: 'adopted',     label: 'Adopted' },
  { value: 'transferred', label: 'Transferred' },
]

const columns = [
  { id: 'intake',     name: 'Intake',            icon: '📥', color: '#60A5FA', statuses: ['intake'],             emptyText: 'No new intakes' },
  { id: 'medical',    name: 'Medical/Quarantine',icon: '🏥', color: '#F97316', statuses: ['medical','quarantine'],emptyText: 'No medical or quarantine cases' },
  { id: 'available',  name: 'Available',         icon: '🌟', color: '#4EFFC5', statuses: ['available'],          emptyText: 'None available' },
  { id: 'foster',     name: 'Foster',             icon: '🏠', color: '#A78BFA', statuses: ['foster'],             emptyText: 'None in foster' },
  { id: 'sanctuary',  name: 'Sanctuary',          icon: '🏞️', color: '#38BDF8', statuses: ['sanctuary'],          emptyText: 'No sanctuary residents' },
  { id: 'adopted',    name: 'Adopted',            icon: '🎉', color: '#34D399', statuses: ['adopted'],            emptyText: 'No adoptions yet' },
  { id: 'transferred',name: 'Transferred',        icon: '🚗', color: '#94A3B8', statuses: ['transferred'],        emptyText: 'None transferred' },
]

const getAnimalsInStage = (stage) => {
  const list = Array.isArray(animalsStore.animals) ? animalsStore.animals : []
  const col = columns.find(c => c.id === stage)
  if (!col) return []
  return list.filter(a => col.statuses.includes(a.status) || (col.id === 'intake' && !a.status))
}

const stageLabel = (status) => STATUS_OPTIONS.find(s => s.value === status)?.label || 'Intake'

// createdAt/stageChangedAt come back as Firestore Timestamps after a
// reload, not plain Dates — new Date(Timestamp) is Invalid Date and
// produced "NaNd in stage" here.
const toDate = (value) => {
  if (!value) return null
  if (value.toDate) return value.toDate()
  const d = new Date(value)
  return isNaN(d) ? null : d
}

const daysInStage = (animal) => {
  const d = toDate(animal.stageChangedAt) || toDate(animal.createdAt) || new Date()
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000))
}

const moveAnimal = async (animal, newStatus) => {
  await animalsStore.updateAnimal(animal.id, {
    status: newStatus,
    stageChangedAt: new Date().toISOString(),
  })
  await actLog.log('stage_changed', 'animal', animal.id, animal.name, `Moved to ${stageLabel(newStatus)}`)
  ui.showToast(`${animal.name} moved to ${stageLabel(newStatus)}`)
}

const viewAnimal = (animal) => {
  ui.selectAnimal(animal)
  selectedAnimal.value = null
}

onMounted(() => animalsStore.fetchAnimals())
</script>

<style scoped>
.pipeline-wrap { padding: 0 0 20px; }
.pipeline-header { margin-bottom: 24px; }
.pipeline-title { font-size: 24px; font-weight: 900; color: var(--ink); margin: 0 0 8px; }
.pipeline-sub { font-size: 12px; color: var(--ink-3); text-transform: uppercase; letter-spacing: .05em; font-weight: 600; }

.kanban-board {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  padding-bottom: 12px;
}

.kanban-col {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.col-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: linear-gradient(135deg, var(--surface-2) 0%, rgba(0,0,0,0.1) 100%);
  border-radius: 10px 10px 0 0;
  border-top: 4px solid;
  margin-bottom: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.col-icon { font-size: 18px; flex-shrink: 0; }
.col-name {
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--ink-2);
  flex: 1;
}
.col-count {
  font-size: 12px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 900;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.col-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  min-height: 200px;
}

.kanban-card {
  padding: 12px 14px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  transition: all .2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.kanban-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.15);
  border-color: var(--ink-3);
}
.kanban-card:active {
  transform: translateY(-2px);
}

.kc-name {
  font-size: 13px;
  font-weight: 900;
  color: var(--ink);
  margin-bottom: 4px;
  letter-spacing: -0.3px;
}
.kc-species {
  font-size: 11px;
  color: var(--ink-3);
  margin-bottom: 6px;
  font-weight: 500;
}
.kc-location {
  font-size: 11px;
  color: var(--ink-3);
  margin-bottom: 6px;
  font-weight: 500;
}
.kc-flags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
}
.kc-flag {
  font-size: 10px;
  padding: 3px 7px;
  background: rgba(255, 122, 69, .2);
  color: var(--coral);
  border-radius: 10px;
  font-weight: 700;
  border: 1px solid rgba(255, 122, 69, .3);
}
.kc-days {
  font-size: 10px;
  color: var(--ink-3);
  margin-bottom: 8px;
  font-weight: 500;
  padding: 4px 6px;
  background: var(--surface-2);
  border-radius: 6px;
  display: inline-block;
  width: fit-content;
}

.kc-select {
  width: 100%;
  padding: 8px 10px;
  background: var(--surface-2);
  border: 1.5px solid var(--border);
  border-radius: 6px;
  color: var(--ink-2);
  font-size: 11px;
  font-family: 'Nunito', sans-serif;
  cursor: pointer;
  font-weight: 600;
  transition: all .2s;
}
.kc-select:hover {
  border-color: var(--ink-3);
  background: var(--surface);
}
.kc-select:focus {
  outline: none;
  border-color: var(--ink-2);
  box-shadow: 0 0 0 3px rgba(0,0,0,0.05);
}

.col-empty {
  padding: 32px 14px;
  text-align: center;
  font-size: 12px;
  color: var(--ink-3);
  border: 2px dashed var(--border);
  border-radius: 8px;
  background: rgba(0,0,0,0.02);
  font-weight: 500;
}

.modal-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  font-size: 13px;
  border-bottom: 1px solid var(--border-2);
  gap: 12px;
}
.modal-row:last-child { border-bottom: none; }
.ml {
  font-weight: 800;
  color: var(--ink-2);
  min-width: 80px;
}
</style>
