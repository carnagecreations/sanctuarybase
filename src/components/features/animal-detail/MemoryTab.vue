<template>
  <div>
    <!-- Story Section -->
    <div class="section">
      <div class="section-header">
        <SectionLabel>Animal story</SectionLabel>
        <AppButton size="sm" variant="secondary" @click="openStoryModal">{{ story ? '✏️ Edit' : '+ Add Story' }}</AppButton>
      </div>
      <AppCard title="Background & journey">
        <p class="story-text">{{ story || 'No story yet. Click edit to add one.' }}</p>
      </AppCard>
    </div>

    <!-- Notes Section -->
    <div class="section">
      <div class="section-header">
        <SectionLabel>Important notes</SectionLabel>
        <AppButton size="sm" variant="secondary" @click="showNoteModal = true">+ Add Note</AppButton>
      </div>
      <AppCard v-if="notes.length" :flat="true">
        <div class="divide-list">
          <div v-for="n in notes" :key="n.id" class="note-entry">
            <div class="note-header">
              <div>
                <div class="note-date">{{ formatDate(n.date) }}</div>
                <div class="note-text">{{ n.text }}</div>
                <div class="note-by">— {{ n.by }}</div>
              </div>
              <div class="note-actions">
                <button class="action-btn" @click="editNote(n)" title="Edit">✏️</button>
                <button class="action-btn danger" @click="deleteNote(n.id)" title="Delete">🗑</button>
              </div>
            </div>
          </div>
        </div>
      </AppCard>
      <EmptyState v-else icon="📖" title="No notes yet" message="Add memories and important milestones." />
    </div>

    <!-- Edit Story Modal -->
    <AppModal v-if="showStoryModal" :open="true" title="Edit Animal Story" size="sm" @close="closeStoryModal">
      <div class="form-field">
        <label>Background & Journey</label>
        <textarea v-model="storyForm" class="form-textarea" placeholder="Tell the animal's story..." rows="6"></textarea>
      </div>
      <template #actions>
        <AppButton @click="closeStoryModal">Cancel</AppButton>
        <AppButton variant="primary" @click="saveStory">Save Story</AppButton>
      </template>
    </AppModal>

    <!-- Edit Note Modal -->
    <AppModal v-if="showNoteModal" :open="true" :title="editingNote ? 'Edit Note' : 'New Note'" size="sm" @close="closeNoteModal">
      <div class="form-field">
        <label>Date</label>
        <AppInput v-model="noteForm.date" type="date" />
      </div>
      <div class="form-field">
        <label>Note *</label>
        <AppInput v-model="noteForm.text" placeholder="Memory or important milestone..." />
      </div>
      <div class="form-field">
        <label>By (name)</label>
        <AppInput v-model="noteForm.by" placeholder="Your name..." />
      </div>
      <template #actions>
        <AppButton @click="closeNoteModal">Cancel</AppButton>
        <AppButton variant="primary" @click="saveNote">{{ editingNote ? 'Update' : 'Add' }} Note</AppButton>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { AppCard, SectionLabel, EmptyState, AppButton, AppInput, AppModal } from '../../ui'
import { useUIStore } from '../../../stores/ui'
import { useAnimalsStore } from '../../../stores/animals'
import { useAnimalRecordsStore } from '../../../stores/animalRecords'

const props = defineProps({
  animal: { type: Object, required: true }
})

const ui = useUIStore()
const animalsStore = useAnimalsStore()
const recordsStore = useAnimalRecordsStore()

// The story lives on the animal document itself; notes are individual
// records in the shared animalbehavior collection.
const story = ref(props.animal.story || '')
const notes = ref([])

onMounted(async () => {
  if (!props.animal?.id) return
  notes.value = await recordsStore.fetchByAnimalId(props.animal.id, 'memory-note')
})

const showStoryModal = ref(false)
const showNoteModal = ref(false)
const storyForm = ref('')
const editingNote = ref(null)
const noteForm = ref({ date: '', text: '', by: '' })

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Story handlers
const openStoryModal = () => {
  storyForm.value = story.value
  showStoryModal.value = true
}

const closeStoryModal = () => {
  showStoryModal.value = false
  storyForm.value = ''
}

const saveStory = async () => {
  if (!storyForm.value.trim()) {
    ui.showToast('Story cannot be empty', 'error')
    return
  }
  if (!props.animal?.id) {
    ui.showToast('Select a real animal first', 'error')
    return
  }
  try {
    await animalsStore.updateAnimal(props.animal.id, { story: storyForm.value })
    story.value = storyForm.value
    ui.showToast('Story saved')
    closeStoryModal()
  } catch (err) {
    ui.showToast('Failed to save story', 'error')
  }
}

// Note handlers
const editNote = (note) => {
  editingNote.value = note
  noteForm.value = { ...note }
  showNoteModal.value = true
}

const closeNoteModal = () => {
  showNoteModal.value = false
  editingNote.value = null
  noteForm.value = { date: '', text: '', by: '' }
}

const saveNote = async () => {
  if (!noteForm.value.text.trim()) {
    ui.showToast('Note text is required', 'error')
    return
  }
  if (!noteForm.value.date) {
    ui.showToast('Date is required', 'error')
    return
  }
  if (!props.animal?.id) {
    ui.showToast('Select a real animal first', 'error')
    return
  }
  try {
    if (editingNote.value) {
      const data = { date: noteForm.value.date, text: noteForm.value.text, by: noteForm.value.by }
      await recordsStore.updateRecord(editingNote.value.id, data)
      const idx = notes.value.findIndex(n => n.id === editingNote.value.id)
      if (idx !== -1) notes.value[idx] = { ...notes.value[idx], ...data }
      ui.showToast('Note updated')
    } else {
      const created = await recordsStore.addRecord(props.animal.id, 'memory-note', { ...noteForm.value })
      notes.value.unshift(created)
      ui.showToast('Note added')
    }
    closeNoteModal()
  } catch (err) {
    ui.showToast('Failed to save note', 'error')
  }
}

const deleteNote = async (id) => {
  if (!confirm('Delete this note?')) return
  try {
    await recordsStore.deleteRecord(id)
    notes.value = notes.value.filter(n => n.id !== id)
    ui.showToast('Note deleted')
  } catch (err) {
    ui.showToast('Failed to delete note', 'error')
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

.story-text {
  font-size: 12px;
  color: var(--ink-3);
  line-height: 1.6;
  margin: 0;
}

.divide-list > * + * { border-top: 1px solid var(--border); }

.note-entry {
  padding: 10px 0;
}
.note-entry:first-child { padding-top: 0; }
.note-entry:last-child { padding-bottom: 0; }

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.note-date {
  font-size: 10px;
  color: var(--ink-3);
  font-weight: 600;
  margin-bottom: 4px;
}

.note-text {
  font-size: 12px;
  color: var(--ink-2);
  margin-bottom: 4px;
  line-height: 1.5;
}

.note-by {
  font-size: 10px;
  color: var(--ink-3);
  font-style: italic;
}

.note-actions {
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

.form-textarea {
  padding: 10px 12px;
  background: var(--surface-2);
  border: 1.5px solid var(--border);
  border-radius: var(--r);
  color: var(--ink);
  font-family: 'Nunito', sans-serif;
  font-size: 13px;
  resize: vertical;
  width: 100%;
}

.form-textarea:focus { outline: none; border-color: var(--mint); }
</style>
