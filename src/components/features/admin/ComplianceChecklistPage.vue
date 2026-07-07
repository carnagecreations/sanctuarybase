<template>
  <PageContainer>
    <div class="space-y-4">
      <div class="page-header">
        <h2 class="page-title">Medical Compliance Checklist</h2>
        <AppButton variant="primary" size="sm" @click="openAddItem">+ Add Item</AppButton>
      </div>

      <!-- Add form -->
      <div v-if="showModal" class="form-card">
        <div class="form-card-header">
          <span>Add Compliance Item</span>
          <button class="form-close" @click="closeModal">✕</button>
        </div>

        <div class="form-group">
          <div class="field-label">Title</div>
          <input v-model="formData.title" type="text" class="form-input" placeholder="e.g., Annual Vet Inspection" />
        </div>

        <div class="form-group">
          <div class="field-label">Description</div>
          <textarea v-model="formData.description" class="form-textarea" rows="2" placeholder="Additional details..." />
        </div>

        <div class="form-group">
          <div class="field-label">Category</div>
          <select v-model="formData.category" class="form-input">
            <option value="">Select category...</option>
            <option value="inspections">Vet Inspections</option>
            <option value="vaccinations">Vaccinations</option>
            <option value="certifications">Health Certifications</option>
            <option value="emergency">Emergency Contacts</option>
            <option value="firstaid">First Aid Kit</option>
            <option value="safety">Facility Safety</option>
            <option value="quarantine">Animal Quarantine</option>
            <option value="documentation">Documentation</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div class="form-group">
          <div class="field-label">Due Date</div>
          <input v-model="formData.dueDate" type="date" class="form-input" />
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input v-model="formData.recurring" type="checkbox" />
            <span>Recurring Item</span>
          </label>
        </div>

        <div v-if="formData.recurring" class="form-group">
          <div class="field-label">Recurrence Interval (days)</div>
          <input v-model.number="formData.recurrenceInterval" type="number" class="form-input" placeholder="365" min="1" />
        </div>

        <div class="form-actions">
          <AppButton variant="primary" @click="handleSaveItem" :disabled="!formData.title || !formData.dueDate || !formData.category">
            Save Item
          </AppButton>
          <AppButton variant="secondary" @click="closeModal">Cancel</AppButton>
        </div>
      </div>

      <!-- Status overview -->
      <div class="overview-grid">
        <div class="overview-card completed">
          <div class="overview-number">{{ getCompleted().length }}</div>
          <div class="overview-label">Completed</div>
        </div>
        <div class="overview-card pending">
          <div class="overview-number">{{ getPending().length }}</div>
          <div class="overview-label">Pending</div>
        </div>
        <div class="overview-card dueSoon">
          <div class="overview-number">{{ getDueSoon().length }}</div>
          <div class="overview-label">Due Soon</div>
        </div>
        <div class="overview-card overdue">
          <div class="overview-number">{{ getOverdue().length }}</div>
          <div class="overview-label">Overdue</div>
        </div>
      </div>

      <!-- Filter tabs -->
      <div class="filter-tabs">
        <button
          v-for="filter in filterTabs"
          :key="filter"
          class="filter-tab"
          :class="{ active: activeFilter === filter }"
          @click="activeFilter = filter"
        >
          {{ filter }}
        </button>
      </div>

      <!-- Items list -->
      <div v-if="filteredItems.length" class="items-list">
        <div
          v-for="item in filteredItems"
          :key="item.id"
          class="item-card"
          :class="`status-${getItemStatus(item)}`"
        >
          <div class="item-left">
            <button
              class="item-checkbox"
              :class="{ checked: item.completedDate }"
              @click="toggleComplete(item)"
            >
              {{ item.completedDate ? '✓' : '' }}
            </button>
            <div class="item-info">
              <div class="item-title">{{ item.title }}</div>
              <div class="item-category-badge">{{ getCategoryLabel(item.category) }}</div>
              <div v-if="item.description" class="item-description">{{ item.description }}</div>
            </div>
          </div>

          <div class="item-right">
            <div class="item-dates">
              <div v-if="!item.completedDate" class="due-date" :class="`due-${getItemStatus(item)}`">
                <span class="due-label">Due:</span>
                <span class="due-value">{{ formatDate(item.dueDate) }}</span>
              </div>
              <div v-else class="completed-date">
                <span class="completed-label">Completed:</span>
                <span class="completed-value">{{ formatDate(item.completedDate) }}</span>
              </div>

              <div v-if="item.recurring" class="recurring-badge">Recurring</div>
            </div>

            <button
              v-if="item.completedDate"
              class="item-action-btn"
              @click="toggleComplete(item)"
              title="Mark as incomplete"
            >
              ↺
            </button>
            <button
              class="item-action-btn delete-btn"
              @click="openDeleteConfirm(item)"
              title="Delete item"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
      <EmptyState
        v-else
        icon="📋"
        title="No compliance items"
        :message="`No items in the ${activeFilter.toLowerCase()} filter`"
      />

      <!-- Delete confirmation dialog -->
      <AppModal v-if="showConfirm && itemToDelete" :open="true" title="Delete item?" size="sm" @close="closeConfirm">
        <p class="confirmation-message">
          Are you sure you want to delete "{{ itemToDelete.title }}"? This action cannot be undone.
        </p>
        <template #actions>
          <AppButton variant="secondary" @click="closeConfirm">Cancel</AppButton>
          <AppButton variant="danger" @click="handleDeleteItem(itemToDelete)">Delete</AppButton>
        </template>
      </AppModal>

    </div>
  </PageContainer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { PageContainer, AppCard, AppButton, SectionLabel, EmptyState, AppModal } from '../../ui'
import { useComplianceStore } from '../../../stores/compliance'
import { useUIStore } from '../../../stores/ui'
import { useFormModal } from '../../../composables/useFormModal'
import { useConfirmDelete } from '../../../composables/useConfirmDelete'

const complianceStore = useComplianceStore()
const ui = useUIStore()
const { showModal, formData, openAdd, closeModal, submitForm } = useFormModal()
const { showConfirm, itemToDelete, openConfirm, closeConfirm, confirmDelete } = useConfirmDelete()

const activeFilter = ref('All')
const filterTabs = ['All', 'Overdue', 'Due Soon', 'Pending', 'Completed']

// Template for new item form
const formTemplate = {
  title: '',
  description: '',
  dueDate: '',
  category: '',
  recurring: false,
  recurrenceInterval: 365,
}

const categories = {
  inspections: 'Vet Inspections',
  vaccinations: 'Vaccinations',
  certifications: 'Health Certifications',
  emergency: 'Emergency Contacts',
  firstaid: 'First Aid Kit',
  safety: 'Facility Safety',
  quarantine: 'Animal Quarantine',
  documentation: 'Documentation',
  other: 'Other',
}

const getCategoryLabel = (cat) => categories[cat] || cat

const openAddItem = () => {
  openAdd({ ...formTemplate })
}

const getItemStatus = (item) => {
  if (item.completedDate) return 'completed'
  const now = new Date()
  const dueDate = new Date(item.dueDate)
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  if (dueDate < now) return 'overdue'
  if (dueDate <= sevenDaysFromNow) return 'dueSoon'
  return 'pending'
}

const getCompleted = () => complianceStore.getCompleted()
const getPending = () => complianceStore.getPending()
const getDueSoon = () => complianceStore.getDueSoon()
const getOverdue = () => complianceStore.getOverdue()

const filteredItems = computed(() => {
  const allItems = complianceStore.items
  switch (activeFilter.value) {
    case 'Overdue':
      return allItems.filter(item => {
        if (item.completedDate) return false
        const dueDate = new Date(item.dueDate)
        return dueDate < new Date()
      }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))

    case 'Due Soon':
      return allItems.filter(item => {
        if (item.completedDate) return false
        const now = new Date()
        const dueDate = new Date(item.dueDate)
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        return dueDate >= now && dueDate <= sevenDaysFromNow
      }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))

    case 'Pending':
      return allItems.filter(item => !item.completedDate && new Date(item.dueDate) > new Date())
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))

    case 'Completed':
      return allItems.filter(item => item.completedDate)
        .sort((a, b) => new Date(b.completedDate) - new Date(a.completedDate))

    default: // All
      return allItems.sort((a, b) => {
        // Sort by status priority: overdue, due soon, pending, completed
        const statusPriority = { overdue: 0, dueSoon: 1, pending: 2, completed: 3 }
        const statusA = getItemStatus(a)
        const statusB = getItemStatus(b)
        const priorityDiff = statusPriority[statusA] - statusPriority[statusB]
        if (priorityDiff !== 0) return priorityDiff
        return new Date(a.dueDate) - new Date(b.dueDate)
      })
  }
})

const formatDate = (iso) => {
  if (!iso) return ''
  const date = new Date(iso)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const handleSaveItem = async () => {
  if (!formData.value.title || !formData.value.dueDate || !formData.value.category) {
    ui.showToast('Please fill in all required fields', 'error')
    return
  }

  try {
    await submitForm(async () => {
      await complianceStore.addItem({
        title: formData.value.title,
        description: formData.value.description,
        dueDate: formData.value.dueDate,
        category: formData.value.category,
        recurring: formData.value.recurring,
        recurrenceInterval: formData.value.recurring ? formData.value.recurrenceInterval : null,
      })
      ui.showToast('Compliance item added successfully!')
    })
  } catch (error) {
    ui.showToast('Failed to add item', 'error')
  }
}

const toggleComplete = async (item) => {
  try {
    if (item.completedDate) {
      await complianceStore.uncompleteItem(item.id)
      ui.showToast('Item marked incomplete')
    } else {
      await complianceStore.completeItem(item.id)
      ui.showToast('Item marked complete!')
    }
  } catch (error) {
    ui.showToast('Failed to update item', 'error')
  }
}

const handleDeleteItem = async (item) => {
  try {
    await confirmDelete(async () => {
      await complianceStore.deleteItem(item.id)
      ui.showToast('Item deleted')
    })
  } catch (error) {
    ui.showToast('Failed to delete item', 'error')
  }
}

const openDeleteConfirm = (item) => {
  openConfirm(item)
}


onMounted(() => {
  complianceStore.fetchCompliance()
})
</script>

<style scoped>
.space-y-4 > * + * { margin-top: 16px; }

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: 800;
  color: var(--ink);
  margin: 0;
}

.form-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r);
  padding: 16px;
  margin-bottom: 20px;
}

.form-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  font-weight: 800;
  color: var(--ink);
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.form-close {
  background: none;
  border: none;
  font-size: 16px;
  color: var(--ink-3);
  cursor: pointer;
  transition: all .15s;
}

.form-close:hover { color: var(--ink); }

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 14px;
}

.field-label {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--ink-3);
  letter-spacing: .04em;
}

.form-input,
.form-textarea {
  padding: 9px 12px;
  background: var(--surface-2);
  border: 1.5px solid var(--border);
  border-radius: var(--r);
  color: var(--ink);
  font-family: 'Nunito', sans-serif;
  font-size: 13px;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--mint);
}

.form-textarea {
  resize: vertical;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  color: var(--ink-2);
}

.checkbox-label input[type="checkbox"] {
  cursor: pointer;
  width: 16px;
  height: 16px;
}

.form-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.overview-card {
  padding: 16px;
  border-radius: var(--r);
  text-align: center;
  border: 1.5px solid var(--border);
  background: var(--surface-2);
}

.overview-card.completed {
  border-color: #4ADE80;
  background: rgba(74, 222, 128, 0.08);
}

.overview-card.pending {
  border-color: #94A3B8;
  background: rgba(148, 163, 184, 0.08);
}

.overview-card.dueSoon {
  border-color: #FBBF24;
  background: rgba(251, 191, 36, 0.08);
}

.overview-card.overdue {
  border-color: #F87171;
  background: rgba(248, 113, 113, 0.08);
}

.overview-number {
  font-size: 28px;
  font-weight: 900;
  margin-bottom: 4px;
}

.overview-card.completed .overview-number { color: #2D6A4F; }
.overview-card.pending .overview-number { color: #475569; }
.overview-card.dueSoon .overview-number { color: #92400E; }
.overview-card.overdue .overview-number { color: #7F1D1D; }

.overview-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--ink-3);
  letter-spacing: .02em;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-tab {
  padding: 8px 16px;
  background: var(--surface-2);
  border: 1.5px solid var(--border);
  border-radius: 20px;
  color: var(--ink-2);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all .15s;
}

.filter-tab:hover {
  border-color: var(--mint);
  color: var(--ink);
}

.filter-tab.active {
  background: var(--mint);
  border-color: var(--mint);
  color: white;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.item-card {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 14px;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--r);
  transition: all .15s;
}

.item-card:hover {
  border-color: var(--ink-3);
  background: var(--surface-2);
}

.item-card.status-completed {
  border-color: #4ADE80;
  background: rgba(74, 222, 128, 0.04);
}

.item-card.status-dueSoon {
  border-color: #FBBF24;
  background: rgba(251, 191, 36, 0.04);
}

.item-card.status-overdue {
  border-color: #F87171;
  background: rgba(248, 113, 113, 0.04);
}

.item-card.status-pending {
  border-color: var(--border);
}

.item-left {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
}

.item-checkbox {
  width: 24px;
  height: 24px;
  min-width: 24px;
  border: 2px solid var(--border);
  border-radius: 6px;
  background: var(--surface-2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
  font-size: 12px;
  font-weight: 800;
  color: white;
  transition: all .15s;
}

.item-checkbox:hover {
  border-color: var(--mint);
}

.item-checkbox.checked {
  background: #4ADE80;
  border-color: #4ADE80;
}

.item-info {
  flex: 1;
}

.item-title {
  font-size: 13px;
  font-weight: 800;
  color: var(--ink);
  margin-bottom: 4px;
}

.item-card.status-completed .item-title {
  text-decoration: line-through;
  color: var(--ink-3);
}

.item-category-badge {
  display: inline-block;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--mint);
  background: rgba(78, 255, 197, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  letter-spacing: .02em;
  margin-bottom: 4px;
}

.item-description {
  font-size: 11px;
  color: var(--ink-3);
  margin-top: 4px;
  line-height: 1.4;
}

.item-right {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: 16px;
}

.item-dates {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.due-date {
  font-size: 11px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.due-label {
  color: var(--ink-3);
  font-weight: 700;
  text-transform: uppercase;
  font-size: 9px;
  letter-spacing: .02em;
}

.due-value {
  color: var(--ink-2);
  font-weight: 700;
}

.due-date.due-overdue {
  color: #7F1D1D;
}

.due-date.due-overdue .due-value {
  color: #DC2626;
  font-weight: 900;
}

.due-date.due-dueSoon {
  color: #92400E;
}

.due-date.due-dueSoon .due-value {
  color: #D97706;
  font-weight: 900;
}

.completed-date {
  font-size: 11px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  color: #2D6A4F;
}

.completed-label {
  font-weight: 700;
  text-transform: uppercase;
  font-size: 9px;
  letter-spacing: .02em;
}

.completed-value {
  font-weight: 700;
  color: #059669;
}

.recurring-badge {
  display: inline-block;
  font-size: 8px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--ink-3);
  background: var(--surface-2);
  padding: 2px 6px;
  border-radius: 4px;
  letter-spacing: .02em;
  white-space: nowrap;
}

.item-action-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all .15s;
}

.item-action-btn:hover {
  background: var(--surface-3);
  border-color: var(--ink-3);
}

.item-action-btn.delete-btn:hover {
  background: rgba(248, 113, 113, 0.1);
  border-color: #F87171;
}


.confirmation-message {
  font-size: 13px;
  color: var(--ink-2);
  margin: 0;
  line-height: 1.5;
}
</style>
