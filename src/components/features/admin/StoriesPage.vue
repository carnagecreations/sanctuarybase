<template>
    <PageContainer>

      <div class="al-top">
        <div>
          <h1 class="al-title">📰 Stories</h1>
          <p class="al-sub">Rescue stories and news shown on the public site</p>
        </div>
        <AppButton variant="primary" size="sm" @click="openAddForm(null)">+ New story</AppButton>
      </div>

      <div class="pill-row">
        <button class="pill" :class="{ active: statusFilter === 'all' }" @click="statusFilter = 'all'">
          All <span class="pill-count">{{ store.items.length }}</span>
        </button>
        <button v-for="st in statuses" :key="st" class="pill" :class="{ active: statusFilter === st }" @click="statusFilter = st">
          {{ statusLabel[st] }} <span class="pill-count">{{ countByStatus(st) }}</span>
        </button>
      </div>

      <AlertBox v-if="store.error" type="danger">Couldn't load stories: {{ store.error }}</AlertBox>

      <!-- Add / Edit form -->
      <div v-if="showForm" class="form-card">
        <div class="form-card-header">
          <span>{{ editingItem ? 'Edit story' : 'New story' }}</span>
          <button class="panel-close" @click="closeForm()">✕</button>
        </div>

        <div class="form-group">
          <div class="form-label">Photo <span class="muted">(optional)</span></div>
          <input type="file" accept="image/*" @change="onFileSelected" />
          <div class="thumbs" v-if="formData.imageUrl">
            <div class="t">
              <img :src="siteMediaUrl(formData.imageUrl)" alt="" />
              <button title="Remove" @click="formData.imageUrl = ''">&times;</button>
            </div>
          </div>
          <p class="muted upload-msg">{{ uploadMsg }}</p>
        </div>

        <div class="form-group">
          <div class="field-label">Title *</div>
          <input v-model="formData.title" type="text" class="form-input" placeholder="e.g. Canelo's second chance" />
        </div>

        <div class="form-group">
          <div class="field-label">Excerpt *</div>
          <textarea v-model="formData.excerpt" class="form-textarea" rows="2" placeholder="A short teaser shown on the stories list"></textarea>
        </div>

        <div class="form-group">
          <div class="field-label">Story *</div>
          <textarea v-model="formData.body" class="form-textarea" rows="8" placeholder="The full story. Blank lines start a new paragraph."></textarea>
        </div>

        <div class="form-group">
          <div class="field-label">Status</div>
          <select v-model="formData.status" class="form-input">
            <option v-for="st in statuses" :key="st" :value="st">{{ statusLabel[st] }}</option>
          </select>
          <p class="muted" style="font-size:12px;margin-top:4px">Draft stories are only visible here — they won't show on the public site until published.</p>
        </div>

        <AlertBox v-if="formError" type="danger">{{ formError }}</AlertBox>

        <div class="form-actions">
          <AppButton variant="primary" :loading="saving" @click="save">{{ editingItem ? 'Update' : 'Save' }} story</AppButton>
          <AppButton variant="secondary" @click="closeForm()">Cancel</AppButton>
        </div>
      </div>

      <!-- List -->
      <div v-if="store.loading" class="loading-msg">Loading…</div>
      <div v-else-if="filteredItems.length" class="animal-list">
        <div v-for="it in filteredItems" :key="it.id" class="animal-row">
          <img class="animal-thumb" :src="it.imageUrl ? siteMediaUrl(it.imageUrl) : '/logo.png'" alt="" />
          <div class="animal-body">
            <div class="animal-top">
              <span class="animal-name">{{ it.title }}</span>
              <AppBadge :type="badgeType(it.status)">{{ statusLabel[it.status] }}</AppBadge>
            </div>
            <div class="animal-meta">
              {{ it.excerpt }}
              <template v-if="it.publishedAt"> · Published {{ formatDate(it.publishedAt) }}</template>
            </div>
          </div>
          <div class="animal-actions">
            <button class="action-btn" title="Edit" @click="openAddForm(it)">✏️</button>
            <button class="action-btn danger" title="Delete" @click="openConfirm(it)">🗑</button>
          </div>
        </div>
      </div>
      <EmptyState v-else icon="📰" title="No stories yet" message="Write one to share a rescue story on the public site." />

    </PageContainer>

    <!-- Delete confirmation -->
    <AppModal v-if="showConfirm" :open="true" title="Delete story" size="sm" @close="closeConfirm">
      <p>Delete <strong>{{ itemToDelete?.title }}</strong>? This removes it from the website immediately.</p>
      <template #actions>
        <AppButton variant="secondary" @click="closeConfirm">Cancel</AppButton>
        <AppButton variant="danger" @click="confirmDelete(async (it) => {
          try {
            await store.removeItem(it.id)
            ui.showToast('Story deleted')
          } catch (err) {
            ui.showToast(err.message || 'Error deleting', 'error')
            throw err
          }
        })">Delete</AppButton>
      </template>
    </AppModal>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { PageContainer, AppButton, AppBadge, EmptyState, AlertBox, AppModal } from '../../ui'
import { useStoriesStore } from '../../../stores/stories'
import { useUIStore } from '../../../stores/ui'
import { siteMediaUrl } from '../../../services/siteApi'
import { useFormModal } from '../../../composables/useFormModal'
import { useConfirmDelete } from '../../../composables/useConfirmDelete'

const store = useStoriesStore()
const ui = useUIStore()

const { showModal: showForm, formData, editingItem, openAdd, openEdit, closeModal: closeForm } = useFormModal()
const { showConfirm, itemToDelete, openConfirm, closeConfirm, confirmDelete } = useConfirmDelete()

const statusFilter = ref('all')
const uploadMsg = ref('')
const formError = ref('')
const saving = ref(false)

const statuses = ['draft', 'published']
const statusLabel = { draft: 'Draft', published: 'Published' }

const badgeType = (status) => ({ draft: 'info', published: 'success' }[status] || 'info')

const countByStatus = (st) => store.items.filter(i => i.status === st).length

const filteredItems = computed(() => {
  if (statusFilter.value === 'all') return store.items
  return store.items.filter(i => i.status === statusFilter.value)
})

const formatDate = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d)) return ''
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const defaultForm = () => ({
  title: '', excerpt: '', body: '', imageUrl: '', status: 'draft',
})

const openAddForm = (item) => {
  uploadMsg.value = ''
  formError.value = ''
  if (item) {
    openEdit(item)
    formData.value = { ...item }
  } else {
    openAdd(defaultForm())
  }
}

const onFileSelected = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  uploadMsg.value = 'Uploading…'
  try {
    formData.value.imageUrl = await store.uploadImage(file)
    uploadMsg.value = 'Photo added.'
  } catch (err) {
    uploadMsg.value = err.message || 'Upload failed.'
  } finally {
    e.target.value = ''
  }
}

const save = async () => {
  formError.value = ''
  const data = { ...formData.value }
  if (!data.title?.trim() || !data.excerpt?.trim() || !data.body?.trim()) {
    formError.value = 'Title, excerpt, and story are required.'
    return
  }
  saving.value = true
  try {
    if (editingItem.value) {
      await store.editItem(editingItem.value.id, data)
      ui.showToast('Story updated')
    } else {
      await store.addItem(data)
      ui.showToast('Story saved')
    }
    closeForm()
  } catch (err) {
    formError.value = err.message || 'Failed to save story'
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  store.loadItems()
})
</script>

<style scoped>
.al-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 12px;
}
.al-title { font-size: 22px; font-weight: 900; color: var(--ink); margin: 0; }
.al-sub { font-size: 12px; color: var(--ink-3); margin-top: 2px; }

.pill-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
.pill {
  padding: 6px 12px;
  border-radius: 20px;
  background: var(--surface-2);
  border: 1.5px solid var(--border);
  color: var(--ink-2);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all .15s;
}
.pill.active { background: var(--mint); border-color: var(--mint); color: var(--bg); }
.pill-count { opacity: .7; margin-left: 4px; }

.form-card {
  background: var(--surface-1);
  border: 1px solid var(--border);
  border-radius: var(--rl);
  padding: 16px;
  margin-bottom: 16px;
}
.form-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  font-weight: 800;
  color: var(--ink);
  margin-bottom: 12px;
}
.panel-close { background: none; border: none; font-size: 16px; color: var(--ink-3); cursor: pointer; }

.form-group { margin-bottom: 14px; }
.form-label, .field-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--ink-3);
  margin-bottom: 6px;
  letter-spacing: .03em;
}
.form-input, .form-textarea, select.form-input {
  width: 100%;
  padding: 9px 12px;
  background: var(--surface-2);
  border: 1.5px solid var(--border);
  border-radius: var(--r);
  color: var(--ink);
  font-family: 'Nunito', sans-serif;
  font-size: 13px;
}
.form-textarea { resize: vertical; }
.form-actions { display: flex; gap: 8px; margin-top: 12px; }

.thumbs { display: flex; gap: 8px; margin-top: 8px; }
.thumbs .t { position: relative; }
.thumbs img { width: 64px; height: 64px; object-fit: cover; border-radius: 8px; }
.thumbs button {
  position: absolute; top: -6px; right: -6px;
  width: 20px; height: 20px; border-radius: 50%;
  background: var(--coral); color: #fff; border: none; cursor: pointer; font-size: 12px;
}
.upload-msg { font-size: 11px; margin-top: 4px; }

.loading-msg { padding: 20px; text-align: center; color: var(--ink-3); font-size: 13px; }

.animal-list > * + * { border-top: 1px solid var(--border); }
.animal-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
}
.animal-thumb { width: 52px; height: 52px; border-radius: 10px; object-fit: cover; flex-shrink: 0; background: var(--surface-2); }
.animal-body { flex: 1; min-width: 0; }
.animal-top { display: flex; align-items: center; gap: 8px; }
.animal-name { font-size: 14px; font-weight: 800; color: var(--ink); }
.animal-meta { font-size: 12px; color: var(--ink-3); margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.animal-actions { display: flex; gap: 6px; flex-shrink: 0; }
.action-btn {
  width: 32px; height: 32px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px;
}
.action-btn:hover { background: var(--surface-3); }
.action-btn.danger:hover { border-color: var(--coral); }
</style>
