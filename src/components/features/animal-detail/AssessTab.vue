<template>
  <div>
    <SectionLabel>Behavioral assessment</SectionLabel>
    <div class="section-controls">
      <AppButton size="sm" variant="secondary" @click="showAssessModal = true">+ Add Assessment</AppButton>
    </div>
    <AppCard v-if="assessments.length" :flat="true">
      <div class="divide-list">
        <div v-for="a in assessments" :key="a.id" class="assessment-row">
          <div class="assessment-card">
            <div class="assessment-header">
              <span class="assessment-name">{{ a.name }}</span>
              <span class="assessment-date">{{ formatDate(a.date) }}</span>
            </div>
            <div class="assessment-score">Score: {{ a.score }}/10</div>
            <div class="assessment-notes">{{ a.notes }}</div>
            <div class="assessment-by">By {{ a.by }}</div>
          </div>
          <div class="assessment-actions">
            <button class="action-btn" @click="editAssess(a)" title="Edit">✏️</button>
            <button class="action-btn danger" @click="deleteAssess(a.id)" title="Delete">🗑</button>
          </div>
        </div>
      </div>
    </AppCard>
    <EmptyState v-else icon="📋" title="No assessments" message="Document behavioral and foster readiness assessments." />

    <!-- Edit Assessment Modal -->
    <AppModal v-if="showAssessModal" :open="true" :title="editingAssess ? 'Edit Assessment' : 'New Assessment'" size="sm" @close="closeAssessModal">
      <div class="form-field">
        <label>Assessment Name *</label>
        <AppInput v-model="assessForm.name" placeholder="e.g. Intake behavioral..." />
      </div>
      <div class="form-field">
        <label>Date</label>
        <AppInput v-model="assessForm.date" type="date" />
      </div>
      <div class="form-field">
        <label>Score (0-10)</label>
        <AppInput v-model="assessForm.score" type="number" min="0" max="10" step="0.5" placeholder="7.5" />
      </div>
      <div class="form-field">
        <label>Notes</label>
        <AppInput v-model="assessForm.notes" placeholder="Assessment details..." />
      </div>
      <div class="form-field">
        <label>Assessor Name</label>
        <AppInput v-model="assessForm.by" placeholder="Your name..." />
      </div>
      <template #actions>
        <AppButton @click="closeAssessModal">Cancel</AppButton>
        <AppButton variant="primary" @click="saveAssess">{{ editingAssess ? 'Update' : 'Add' }} Assessment</AppButton>
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

const assessments = ref([])

onMounted(async () => {
  if (!props.animal?.id) return
  assessments.value = await recordsStore.fetchByAnimalId(props.animal.id, 'assessment')
})

const showAssessModal = ref(false)
const editingAssess = ref(null)
const assessForm = ref({ name: '', date: '', score: '', notes: '', by: '' })

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const editAssess = (assess) => {
  editingAssess.value = assess
  assessForm.value = { ...assess }
  showAssessModal.value = true
}

const closeAssessModal = () => {
  showAssessModal.value = false
  editingAssess.value = null
  assessForm.value = { name: '', date: '', score: '', notes: '', by: '' }
}

const saveAssess = async () => {
  if (!assessForm.value.name.trim()) {
    ui.showToast('Assessment name is required', 'error')
    return
  }
  if (!props.animal?.id) {
    ui.showToast('Select a real animal first', 'error')
    return
  }
  try {
    if (editingAssess.value) {
      await recordsStore.updateRecord(editingAssess.value.id, { ...assessForm.value })
      const idx = assessments.value.findIndex(a => a.id === editingAssess.value.id)
      if (idx !== -1) assessments.value[idx] = { ...assessments.value[idx], ...assessForm.value }
      ui.showToast('Assessment updated')
    } else {
      const created = await recordsStore.addRecord(props.animal.id, 'assessment', { ...assessForm.value })
      assessments.value.unshift(created)
      ui.showToast('Assessment added')
    }
    closeAssessModal()
  } catch (err) {
    ui.showToast('Failed to save assessment', 'error')
  }
}

const deleteAssess = async (id) => {
  if (!confirm('Delete this assessment?')) return
  try {
    await recordsStore.deleteRecord(id)
    assessments.value = assessments.value.filter(a => a.id !== id)
    ui.showToast('Assessment deleted')
  } catch (err) {
    ui.showToast('Failed to delete assessment', 'error')
  }
}
</script>

<style scoped>
.section-controls { margin-bottom: 8px; }

.divide-list > * + * { border-top: 1px solid var(--border); }

.assessment-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 0;
}

.assessment-card {
  flex: 1;
}

.assessment-card:first-child { padding-top: 0; }
.assessment-card:last-child { padding-bottom: 0; }

.assessment-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 4px;
}

.assessment-name {
  font-size: 12px;
  font-weight: 800;
  color: var(--ink);
}

.assessment-date {
  font-size: 10px;
  color: var(--ink-3);
  font-weight: 600;
}

.assessment-score {
  font-size: 11px;
  font-weight: 700;
  color: var(--mint);
  margin-bottom: 4px;
}

.assessment-notes {
  font-size: 11px;
  color: var(--ink-3);
  margin-bottom: 4px;
  line-height: 1.5;
}

.assessment-by {
  font-size: 10px;
  color: var(--ink-3);
  font-style: italic;
}

.assessment-actions {
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

.suitability-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.suitability-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: var(--surface-2);
  border-radius: var(--r);
}

.suitability-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--ink);
}
</style>
