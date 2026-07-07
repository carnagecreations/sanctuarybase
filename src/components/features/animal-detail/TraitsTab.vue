<template>
  <div>
    <SectionLabel>Personality traits</SectionLabel>
    <div class="section-controls">
      <AppButton size="sm" variant="secondary" @click="showTraitModal = true">+ Add Trait</AppButton>
    </div>
    <AppCard :flat="true">
      <div class="traits-grid">
        <div v-for="t in traits" :key="t.id" class="trait-badge">
          <div class="trait-info">
            <span class="trait-label">{{ t.label }}</span>
            <span class="trait-level" :class="`level-${t.level}`">{{ t.level }}</span>
          </div>
          <div class="trait-actions">
            <button class="trait-btn" @click="editTrait(t)" title="Edit">✏️</button>
            <button class="trait-btn danger" @click="deleteTrait(t.id)" title="Delete">✕</button>
          </div>
        </div>
      </div>
      <EmptyState v-if="!traits.length" icon="🎭" title="No traits added" message="Document personality and behavior traits." />
    </AppCard>

    <!-- Edit Trait Modal -->
    <AppModal v-if="showTraitModal" :open="true" :title="editingTrait ? 'Edit Trait' : 'New Trait'" size="sm" @close="closeTraitModal">
      <div class="form-field">
        <label>Trait Name *</label>
        <AppInput v-model="traitForm.label" placeholder="e.g. Playful, Shy..." />
      </div>
      <div class="form-field">
        <label>Level *</label>
        <div class="level-buttons">
          <button v-for="l in ['Low', 'Medium', 'High']" :key="l" class="level-btn" :class="{ active: traitForm.level === l }" @click="traitForm.level = l">{{ l }}</button>
        </div>
      </div>
      <template #actions>
        <AppButton @click="closeTraitModal">Cancel</AppButton>
        <AppButton variant="primary" @click="saveTrait">{{ editingTrait ? 'Update' : 'Add' }} Trait</AppButton>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { AppCard, SectionLabel, EmptyState, AppBadge, AppButton, AppInput, AppModal } from '../../ui'
import { useUIStore } from '../../../stores/ui'
import { useAnimalRecordsStore } from '../../../stores/animalRecords'

const props = defineProps({
  animal: { type: Object, required: true }
})

const ui = useUIStore()
const recordsStore = useAnimalRecordsStore()

const showTraitModal = ref(false)
const editingTrait = ref(null)
const traitForm = ref({ label: '', level: 'Medium' })

const traits = ref([])

onMounted(async () => {
  if (!props.animal?.id) return
  traits.value = await recordsStore.fetchByAnimalId(props.animal.id, 'trait')
})

const editTrait = (trait) => {
  editingTrait.value = trait
  traitForm.value = { label: trait.label, level: trait.level }
  showTraitModal.value = true
}

const closeTraitModal = () => {
  showTraitModal.value = false
  editingTrait.value = null
  traitForm.value = { label: '', level: 'Medium' }
}

const saveTrait = async () => {
  if (!traitForm.value.label.trim()) {
    ui.showToast('Trait name is required', 'error')
    return
  }
  if (!props.animal?.id) {
    ui.showToast('Select a real animal first', 'error')
    return
  }
  try {
    if (editingTrait.value) {
      await recordsStore.updateRecord(editingTrait.value.id, { ...traitForm.value })
      const idx = traits.value.findIndex(t => t.id === editingTrait.value.id)
      if (idx !== -1) traits.value[idx] = { ...traits.value[idx], ...traitForm.value }
      ui.showToast('Trait updated')
    } else {
      const created = await recordsStore.addRecord(props.animal.id, 'trait', { ...traitForm.value })
      traits.value.push(created)
      ui.showToast('Trait added')
    }
    closeTraitModal()
  } catch (err) {
    ui.showToast('Failed to save trait', 'error')
  }
}

const deleteTrait = async (id) => {
  if (!confirm('Delete this trait?')) return
  try {
    await recordsStore.deleteRecord(id)
    traits.value = traits.value.filter(t => t.id !== id)
    ui.showToast('Trait deleted')
  } catch (err) {
    ui.showToast('Failed to delete trait', 'error')
  }
}
</script>

<style scoped>
.section-controls { margin-bottom: 8px; }

.traits-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.trait-badge {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: var(--surface-2);
  border-radius: var(--r);
  gap: 10px;
}

.trait-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.trait-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--ink-2);
}

.trait-level {
  font-size: 10px;
  font-weight: 700;
  color: var(--ink-3);
  text-transform: uppercase;
  background: var(--surface-3);
  padding: 2px 6px;
  border-radius: 4px;
}
.level-High { color: var(--coral); background: var(--coral-l); }
.level-Medium { color: var(--amber); background: var(--amber-l); }
.level-Low { color: var(--ink-3); background: transparent; }

.trait-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.trait-btn {
  width: 24px;
  height: 24px;
  background: var(--surface-3);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all .15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.trait-btn:hover { background: var(--surface-4); color: var(--mint); }
.trait-btn.danger:hover { color: var(--coral); }

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.form-field label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--ink-3);
  letter-spacing: .03em;
}

.level-buttons {
  display: flex;
  gap: 8px;
}

.level-btn {
  flex: 1;
  padding: 8px;
  background: var(--surface-2);
  border: 1.5px solid var(--border);
  border-radius: var(--r);
  color: var(--ink-2);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all .15s;
}

.level-btn:hover { border-color: var(--mint); }
.level-btn.active { background: var(--mint); border-color: var(--mint); color: var(--bg); }

.energy-display {
  width: 100%;
  height: 8px;
  background: var(--surface-2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.energy-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--mint), var(--brand));
  border-radius: 4px;
}

.energy-label {
  font-size: 12px;
  color: var(--ink-3);
  margin: 0;
}

.compatibility-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.compatibility-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: var(--surface-2);
  border-radius: var(--r);
  font-size: 12px;
  font-weight: 600;
  color: var(--ink);
}
</style>
