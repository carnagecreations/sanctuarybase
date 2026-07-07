<template>
  <PageContainer>
    <div class="space-y-4">
      <div class="page-header">
        <h2 class="page-title">🤝 Fundraising Ideas</h2>
        <AppButton variant="primary" size="sm" @click="openAddForm">+ New Idea</AppButton>
      </div>
      <p class="page-sub">Ideas volunteers and staff can run with to help raise money — a bake sale, a matching-gift drive, a peer-to-peer campaign. Add one, and anyone can pick it up.</p>

      <!-- Add / edit form -->
      <div v-if="showForm" class="form-card">
        <div class="form-card-header">
          <span>{{ editingIdea ? 'Edit Idea' : 'New Fundraising Idea' }}</span>
          <button class="form-close" @click="closeForm">✕</button>
        </div>

        <div class="form-group">
          <div class="field-label">Title</div>
          <input v-model="form.title" type="text" class="form-input" placeholder="e.g. Holiday bake sale" />
        </div>

        <div class="form-group">
          <div class="field-label">Details</div>
          <textarea v-model="form.description" class="form-textarea" rows="4" placeholder="What it involves, who it needs, roughly how much it could raise..." />
        </div>

        <div class="form-actions">
          <AppButton variant="primary" @click="saveIdea" :disabled="saving">
            {{ saving ? 'Saving...' : (editingIdea ? 'Update Idea' : 'Add Idea') }}
          </AppButton>
          <AppButton variant="secondary" @click="closeForm">Cancel</AppButton>
        </div>
      </div>

      <SectionLabel>All Ideas</SectionLabel>
      <div v-if="loading" class="loading-text">Loading...</div>
      <div v-else-if="ideas.length" class="idea-list">
        <div v-for="idea in ideas" :key="idea.id" class="idea-row">
          <div class="idea-icon">💡</div>
          <div class="idea-body">
            <div class="idea-title">{{ idea.title }}</div>
            <div v-if="idea.description" class="idea-desc">{{ idea.description }}</div>
            <div v-if="idea.createdBy" class="idea-by">Added by {{ idea.createdBy }}</div>
          </div>
          <div class="idea-actions">
            <button class="icon-btn" @click="editIdea(idea)" title="Edit">✏️</button>
            <button class="icon-btn danger" @click="removeIdea(idea.id)" title="Delete">🗑</button>
          </div>
        </div>
      </div>
      <EmptyState v-else icon="🤝" title="No fundraising ideas yet" message="Add the first one above." />
    </div>
  </PageContainer>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { PageContainer, AppButton, SectionLabel, EmptyState } from '../../ui'
import { useUIStore } from '../../../stores/ui'
import { useFundraisingStore } from '../../../stores/fundraising'

const ui = useUIStore()
const fundraisingStore = useFundraisingStore()

const ideas = ref([])
const loading = ref(false)
const saving = ref(false)
const showForm = ref(false)
const editingIdea = ref(null)
const form = ref({ title: '', description: '' })

const openAddForm = () => {
  editingIdea.value = null
  form.value = { title: '', description: '' }
  showForm.value = true
}

const editIdea = (idea) => {
  editingIdea.value = idea
  form.value = { title: idea.title, description: idea.description || '' }
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
  editingIdea.value = null
  form.value = { title: '', description: '' }
}

const saveIdea = async () => {
  if (!form.value.title.trim()) {
    ui.showToast('Title is required', 'error')
    return
  }
  saving.value = true
  try {
    if (editingIdea.value) {
      await fundraisingStore.updateIdea(editingIdea.value.id, { ...form.value })
      const idx = ideas.value.findIndex(i => i.id === editingIdea.value.id)
      if (idx !== -1) ideas.value[idx] = { ...ideas.value[idx], ...form.value }
      ui.showToast('Idea updated')
    } else {
      const created = await fundraisingStore.addIdea({ ...form.value })
      ideas.value.unshift(created)
      ui.showToast('Idea added')
    }
    closeForm()
  } catch (err) {
    ui.showToast('Failed to save idea', 'error')
  } finally {
    saving.value = false
  }
}

const removeIdea = async (id) => {
  if (!confirm('Delete this fundraising idea?')) return
  try {
    await fundraisingStore.deleteIdea(id)
    ideas.value = ideas.value.filter(i => i.id !== id)
    ui.showToast('Idea deleted')
  } catch (err) {
    ui.showToast('Failed to delete idea', 'error')
  }
}

onMounted(async () => {
  loading.value = true
  try {
    ideas.value = await fundraisingStore.fetchIdeas()
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.space-y-4 > * + * { margin-top: 16px; }
.page-header { display: flex; justify-content: space-between; align-items: center; }
.page-title { font-size: 20px; font-weight: 800; color: var(--ink); margin: 0; }
.page-sub { font-size: 12px; color: var(--ink-3); margin: 0; line-height: 1.5; }

.form-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); padding: 16px; }
.form-card-header { display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-weight: 800; color: var(--ink); margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
.form-close { background: none; border: none; font-size: 16px; color: var(--ink-3); cursor: pointer; }
.form-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
.field-label { font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--ink-3); letter-spacing: .04em; }
.form-input {
  padding: 9px 12px; background: var(--surface-2); border: 1.5px solid var(--border);
  border-radius: var(--r); color: var(--ink); font-family: 'Nunito', sans-serif; font-size: 13px;
}
.form-input:focus { outline: none; border-color: var(--mint); }
.form-textarea {
  padding: 10px 12px; background: var(--surface-2); border: 1.5px solid var(--border);
  border-radius: var(--r); color: var(--ink); font-family: 'Nunito', sans-serif; font-size: 12px;
  resize: vertical;
}
.form-textarea:focus { outline: none; border-color: var(--mint); }
.form-actions { display: flex; gap: 8px; }

.loading-text { font-size: 12px; color: var(--ink-3); }

.idea-list { display: flex; flex-direction: column; gap: 6px; }
.idea-row {
  display: flex; align-items: flex-start; gap: 10px; padding: 12px;
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--r);
}
.idea-icon { font-size: 20px; flex-shrink: 0; }
.idea-body { flex: 1; min-width: 0; }
.idea-title { font-size: 13px; font-weight: 800; color: var(--ink); }
.idea-desc { font-size: 12px; color: var(--ink-2); margin-top: 4px; line-height: 1.5; }
.idea-by { font-size: 10px; color: var(--ink-3); margin-top: 6px; font-style: italic; }
.idea-actions { display: flex; gap: 4px; flex-shrink: 0; }

.icon-btn {
  width: 28px; height: 28px; background: var(--surface-2); border: 1px solid var(--border);
  border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center;
  font-size: 13px; transition: all .15s;
}
.icon-btn:hover { background: var(--surface-3); border-color: var(--mint); }
.icon-btn.danger:hover { border-color: var(--coral); }
</style>
