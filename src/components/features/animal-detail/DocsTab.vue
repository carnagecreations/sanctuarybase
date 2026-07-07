<template>
  <div>
    <SectionLabel>Behavior & handling</SectionLabel>
    <AppCard>
      <div class="note-field">
        <label>Behavior notes</label>
        <textarea v-model="behaviorNotes" placeholder="Triggers, handling instructions, socialization level, fears..." rows="3"></textarea>
        <div class="note-save-row">
          <AppButton size="sm" variant="primary" :disabled="savingNotes" @click="saveBehaviorNotes">{{ savingNotes ? 'Saving…' : '💾 Save notes' }}</AppButton>
        </div>
      </div>
    </AppCard>

    <div class="section-header">
      <SectionLabel>Documents</SectionLabel>
      <AppButton size="sm" variant="secondary" :disabled="uploading" @click="fileInput?.click()">
        {{ uploading ? 'Uploading…' : '⬆️ Upload document' }}
      </AppButton>
    </div>
    <AppCard>
      <div class="upload-row">
        <input ref="fileInput" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.txt,.doc,.docx" style="display:none" @change="onFileSelected" />
        <AppInput v-model="uploadTags" placeholder="Tags for next upload (optional, comma-separated: vet, intake, adoption...)" />
      </div>
      <p class="muted-msg">PDF, images, or Word docs up to 10 MB. Files are private — only staff and admins can view them.</p>
    </AppCard>
    <AppCard :flat="true">
      <div v-if="loadingDocs" class="muted-msg">Loading documents…</div>
      <div v-else-if="documents.length" class="divide-list">
        <div v-for="d in documents" :key="d.key" class="doc-entry">
          <span class="doc-icon">📄</span>
          <div class="doc-info">
            <div class="doc-name">{{ d.filename }}</div>
            <div class="doc-date">{{ formatDate(d.uploaded) }} · {{ formatSize(d.size) }}</div>
            <div v-if="d.tags" class="doc-tags">
              <span v-for="tag in splitTags(d.tags)" :key="tag" class="doc-tag">{{ tag }}</span>
            </div>
          </div>
          <AppButton size="sm" variant="secondary" @click="download(d)">Download</AppButton>
          <button class="action-btn danger" @click="removeDoc(d)" title="Delete">🗑</button>
        </div>
      </div>
      <EmptyState v-else icon="📁" title="No documents" message="Upload vet records, adoption papers, or other files." />
    </AppCard>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { AppCard, SectionLabel, AppButton, AppInput, EmptyState } from '../../ui'
import { useUIStore } from '../../../stores/ui'
import { useAnimalsStore } from '../../../stores/animals'
import { listAnimalDocs, uploadAnimalDoc, downloadAnimalDoc, deleteAnimalDoc } from '../../../services/animalDocsService'

const props = defineProps({
  animal: { type: Object, required: true }
})

const ui = useUIStore()
const animalsStore = useAnimalsStore()

/* Behavior notes — same animal field the Profile tab edits */
const behaviorNotes = ref(props.animal.behaviorNotes || '')
const savingNotes = ref(false)

const saveBehaviorNotes = async () => {
  if (!props.animal?.id) {
    ui.showToast('Select a real animal first', 'error')
    return
  }
  savingNotes.value = true
  try {
    await animalsStore.updateAnimal(props.animal.id, { behaviorNotes: behaviorNotes.value })
    ui.showToast('Behavior notes saved', 'success')
  } catch (err) {
    ui.showToast('Failed to save notes', 'error')
  } finally {
    savingNotes.value = false
  }
}

/* Documents */
const documents = ref([])
const loadingDocs = ref(false)
const uploading = ref(false)
const uploadTags = ref('')
const fileInput = ref(null)

onMounted(async () => {
  if (!props.animal?.id) return
  loadingDocs.value = true
  try {
    documents.value = await listAnimalDocs(props.animal.id)
  } catch (err) {
    ui.showToast(err.message || 'Failed to load documents', 'error')
  } finally {
    loadingDocs.value = false
  }
})

const onFileSelected = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  if (!props.animal?.id) {
    ui.showToast('Select a real animal first', 'error')
    return
  }
  uploading.value = true
  try {
    await uploadAnimalDoc(props.animal.id, file, uploadTags.value.trim())
    documents.value = await listAnimalDocs(props.animal.id)
    uploadTags.value = ''
    ui.showToast(`"${file.name}" uploaded`, 'success')
  } catch (err) {
    ui.showToast(err.message || 'Upload failed', 'error')
  } finally {
    uploading.value = false
    e.target.value = ''
  }
}

const download = async (docEntry) => {
  try {
    await downloadAnimalDoc(docEntry.key, docEntry.filename)
  } catch (err) {
    ui.showToast(err.message || 'Download failed', 'error')
  }
}

const removeDoc = async (docEntry) => {
  if (!confirm(`Delete "${docEntry.filename}"?`)) return
  try {
    await deleteAnimalDoc(docEntry.key)
    documents.value = documents.value.filter(d => d.key !== docEntry.key)
    ui.showToast('Document deleted')
  } catch (err) {
    ui.showToast(err.message || 'Delete failed', 'error')
  }
}

const splitTags = (tags) => tags.split(',').map(t => t.trim()).filter(Boolean)

const formatDate = (d) => {
  if (!d) return ''
  const date = new Date(d)
  return isNaN(date) ? '' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatSize = (bytes) => {
  if (!bytes && bytes !== 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
</script>

<style scoped>
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.note-field { display: flex; flex-direction: column; gap: 4px; }
.note-field label {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--ink-3);
  letter-spacing: .05em;
}
.note-field textarea {
  padding: 9px 12px;
  background: var(--surface-2);
  border: 1.5px solid var(--border);
  border-radius: 8px;
  color: var(--ink);
  font-size: 13px;
  font-family: 'Nunito', sans-serif;
  resize: vertical;
}
.note-field textarea:focus { outline: none; border-color: var(--mint); }
.note-save-row { display: flex; justify-content: flex-end; margin-top: 6px; }

.upload-row { margin-bottom: 6px; }

.muted-msg {
  font-size: 11px;
  color: var(--ink-3);
  margin: 4px 0 0;
}

.divide-list > * + * { border-top: 1px solid var(--border); }

.doc-entry {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
}
.doc-entry:first-child { padding-top: 0; }
.doc-entry:last-child { padding-bottom: 0; }

.doc-icon { font-size: 18px; }

.doc-info {
  flex: 1;
  min-width: 0;
}

.doc-name {
  font-size: 12px;
  font-weight: 700;
  color: var(--ink);
  word-break: break-all;
}

.doc-date {
  font-size: 10px;
  color: var(--ink-3);
  margin-top: 2px;
}

.doc-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.doc-tag {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .03em;
  padding: 2px 8px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--ink-2);
}

.action-btn {
  width: 28px;
  height: 28px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  transition: all .15s;
  flex-shrink: 0;
}
.action-btn:hover { background: var(--surface-3); }
.action-btn.danger:hover { border-color: var(--coral); }
</style>
