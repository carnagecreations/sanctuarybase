<template>
  <div>
    <!-- Emergency Alerts Section -->
    <div class="section">
      <div class="section-header">
        <SectionLabel>Emergency alerts</SectionLabel>
        <AppButton size="sm" variant="secondary" @click="showAlertModal = true">+ Add Alert</AppButton>
      </div>
      <AppCard :flat="true">
        <div v-if="alerts.length" class="divide-list">
          <div v-for="a in alerts" :key="a.id" class="alert-item-wrapper">
            <div class="alert-item" :class="`alert-${a.severity}`">
              <span class="alert-icon">⚠️</span>
              <div class="alert-content">
                <div class="alert-title">{{ a.title }}</div>
                <div class="alert-description">{{ a.description }}</div>
              </div>
            </div>
            <div class="alert-actions">
              <button class="action-btn" @click="editAlert(a)" title="Edit">✏️</button>
              <button class="action-btn danger" @click="deleteAlert(a.id)" title="Delete">🗑</button>
            </div>
          </div>
        </div>
        <EmptyState v-else icon="🚨" title="No alerts" message="Add critical health or behavioral information." />
      </AppCard>
    </div>

    <!-- Edit Alert Modal -->
    <AppModal v-if="showAlertModal" :open="true" :title="editingAlert ? 'Edit Alert' : 'New Alert'" size="sm" @close="closeAlertModal">
      <div class="form-field">
        <label>Title *</label>
        <AppInput v-model="alertForm.title" placeholder="e.g. Medication allergy..." />
      </div>
      <div class="form-field">
        <label>Description</label>
        <AppInput v-model="alertForm.description" placeholder="Details and specifics..." />
      </div>
      <div class="form-field">
        <label>Severity</label>
        <div class="severity-buttons">
          <button v-for="s in ['low', 'medium', 'high']" :key="s" class="severity-btn" :class="{ active: alertForm.severity === s }" @click="alertForm.severity = s">{{ s.charAt(0).toUpperCase() + s.slice(1) }}</button>
        </div>
      </div>
      <template #actions>
        <AppButton @click="closeAlertModal">Cancel</AppButton>
        <AppButton variant="primary" @click="saveAlert">{{ editingAlert ? 'Update' : 'Add' }} Alert</AppButton>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { AppCard, SectionLabel, EmptyState, AppButton, AppInput, AppModal } from '../../ui'
import { useUIStore } from '../../../stores/ui'
import { useAnimalRecordsStore } from '../../../stores/animalRecords'

const props = defineProps({
  animal: { type: Object, required: true }
})

const ui = useUIStore()
const recordsStore = useAnimalRecordsStore()

const alerts = ref([])

onMounted(async () => {
  if (!props.animal?.id) return
  alerts.value = await recordsStore.fetchByAnimalId(props.animal.id, 'sos-alert')
})

const showAlertModal = ref(false)
const editingAlert = ref(null)
const alertForm = ref({ title: '', description: '', severity: 'high' })

const editAlert = (alert) => {
  editingAlert.value = alert
  alertForm.value = { title: alert.title, description: alert.description, severity: alert.severity }
  showAlertModal.value = true
}

const closeAlertModal = () => {
  showAlertModal.value = false
  editingAlert.value = null
  alertForm.value = { title: '', description: '', severity: 'high' }
}

const saveAlert = async () => {
  if (!alertForm.value.title.trim()) {
    ui.showToast('Title is required', 'error')
    return
  }
  if (!props.animal?.id) {
    ui.showToast('Select a real animal first', 'error')
    return
  }
  try {
    if (editingAlert.value) {
      await recordsStore.updateRecord(editingAlert.value.id, { ...alertForm.value })
      const idx = alerts.value.findIndex(a => a.id === editingAlert.value.id)
      if (idx !== -1) alerts.value[idx] = { ...alerts.value[idx], ...alertForm.value }
      ui.showToast('Alert updated')
    } else {
      const created = await recordsStore.addRecord(props.animal.id, 'sos-alert', { ...alertForm.value })
      alerts.value.unshift(created)
      ui.showToast('Alert added')
    }
    closeAlertModal()
  } catch (err) {
    ui.showToast('Failed to save alert', 'error')
  }
}

const deleteAlert = async (id) => {
  if (!confirm('Delete this alert?')) return
  try {
    await recordsStore.deleteRecord(id)
    alerts.value = alerts.value.filter(a => a.id !== id)
    ui.showToast('Alert deleted')
  } catch (err) {
    ui.showToast('Failed to delete alert', 'error')
  }
}
</script>

<style scoped>
.section { margin-bottom: 16px; }

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.divide-list > * + * { border-top: 1px solid var(--border); }

.alert-item-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 0;
}

.alert-item {
  flex: 1;
  padding: 10px;
  display: flex;
  gap: 10px;
  background: var(--surface-2);
  border-radius: var(--r);
  border-left: 3px solid var(--border);
}

.alert-high { background: var(--coral-l); border-color: var(--coral); }
.alert-medium { background: var(--amber-l); border-color: var(--amber); }
.alert-low { background: var(--teal-l); border-color: var(--mint); }

.alert-icon { font-size: 16px; flex-shrink: 0; }

.alert-content { flex: 1; }

.alert-title {
  font-size: 12px;
  font-weight: 800;
  color: var(--ink);
}

.alert-description {
  font-size: 11px;
  color: var(--ink-3);
  margin-top: 2px;
}

.alert-actions {
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

.severity-buttons {
  display: flex;
  gap: 8px;
}

.severity-btn {
  flex: 1;
  padding: 8px;
  background: var(--surface-2);
  border: 1.5px solid var(--border);
  border-radius: var(--r);
  color: var(--ink-2);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all .15s;
  text-transform: capitalize;
}

.severity-btn:hover { border-color: var(--mint); }
.severity-btn.active { background: var(--mint); border-color: var(--mint); color: var(--bg); }
</style>
