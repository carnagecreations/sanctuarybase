<template>
    <PageContainer>

      <div class="al-top">
        <div>
          <h1 class="al-title">🔨 Auction Items</h1>
          <p class="al-sub">Fundraiser auction listings shown on the public site</p>
        </div>
        <AppButton variant="primary" size="sm" @click="openAddForm(null)">+ Add item</AppButton>
      </div>

      <div class="pill-row">
        <button class="pill" :class="{ active: statusFilter === 'all' }" @click="statusFilter = 'all'">
          All <span class="pill-count">{{ store.items.length }}</span>
        </button>
        <button v-for="st in statuses" :key="st" class="pill" :class="{ active: statusFilter === st }" @click="statusFilter = st">
          {{ statusLabel[st] }} <span class="pill-count">{{ countByStatus(st) }}</span>
        </button>
      </div>

      <AlertBox v-if="store.error" type="danger">Couldn't load auction items: {{ store.error }}</AlertBox>

      <!-- Add / Edit form -->
      <div v-if="showForm" class="form-card">
        <div class="form-card-header">
          <span>{{ editingItem ? 'Edit auction item' : 'New auction item' }}</span>
          <button class="panel-close" @click="closeForm()">✕</button>
        </div>

        <div class="form-group">
          <div class="form-label">Photo <span class="muted">(required)</span></div>
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
          <input v-model="formData.title" type="text" class="form-input" placeholder="e.g. Weekend cabin getaway" />
        </div>

        <div class="form-group">
          <div class="field-label">Description *</div>
          <textarea v-model="formData.description" class="form-textarea" rows="3"></textarea>
        </div>

        <div class="form-group">
          <div class="form-cols">
            <div>
              <div class="field-label">Starting bid (USD)</div>
              <input v-model.number="startDollars" type="number" min="0" step="1" class="form-input" placeholder="25" />
            </div>
            <div>
              <div class="field-label">Estimated value (USD)</div>
              <input v-model.number="estDollars" type="number" min="0" step="1" class="form-input" placeholder="60" />
            </div>
          </div>
        </div>

        <div class="form-group">
          <div class="field-label">Donor</div>
          <input v-model="formData.donor" type="text" class="form-input" placeholder="Donated by…" />
        </div>

        <div class="form-group">
          <div class="field-label">Bid instructions</div>
          <textarea v-model="formData.bidInstructions" class="form-textarea" rows="2" placeholder="How supporters place a bid"></textarea>
        </div>

        <div class="form-group">
          <div class="form-cols">
            <div>
              <div class="field-label">Ends at</div>
              <input v-model="endsAtLocal" type="datetime-local" class="form-input" />
            </div>
            <div>
              <div class="field-label">Status</div>
              <select v-model="formData.status" class="form-input">
                <option v-for="st in statuses" :key="st" :value="st">{{ statusLabel[st] }}</option>
              </select>
            </div>
          </div>
        </div>

        <AlertBox v-if="formError" type="danger">{{ formError }}</AlertBox>

        <div class="form-actions">
          <AppButton variant="primary" :loading="saving" @click="save">{{ editingItem ? 'Update' : 'Save' }} item</AppButton>
          <AppButton variant="secondary" @click="closeForm()">Cancel</AppButton>
        </div>
      </div>

      <!-- List -->
      <div v-if="store.loading" class="loading-msg">Loading…</div>
      <div v-else-if="filteredItems.length" class="animal-list">
        <div v-for="it in filteredItems" :key="it.id" class="animal-row">
          <img class="animal-thumb" :src="siteMediaUrl(it.imageUrl)" alt="" />
          <div class="animal-body">
            <div class="animal-top">
              <span class="animal-name">{{ it.title }}</span>
              <AppBadge :type="badgeType(it.status)">{{ statusLabel[it.status] }}</AppBadge>
            </div>
            <div class="animal-meta">
              <template v-if="it.bidCount">
                <strong>{{ formatMoney(it.currentBidCents) }}</strong> current bid · {{ it.bidCount }} {{ it.bidCount === 1 ? 'bid' : 'bids' }}
              </template>
              <template v-else>Start {{ formatMoney(it.startingBidCents) }} · no bids yet</template>
              <template v-if="it.estimatedValueCents != null"> · Est. {{ formatMoney(it.estimatedValueCents) }}</template>
              <template v-if="it.donor"> · {{ it.donor }}</template>
            </div>
          </div>
          <div class="animal-actions">
            <button class="action-btn" title="Edit" @click="openAddForm(it)">✏️</button>
            <button class="action-btn danger" title="Delete" @click="openConfirm(it)">🗑</button>
          </div>
        </div>
      </div>
      <EmptyState v-else icon="🔨" title="No auction items yet" message="Add an item to feature it in the fundraiser." />

    </PageContainer>

    <!-- Delete confirmation -->
    <AppModal v-if="showConfirm" :open="true" title="Delete auction item" size="sm" @close="closeConfirm">
      <p>Delete <strong>{{ itemToDelete?.title }}</strong>? This removes it from the website immediately.</p>
      <template #actions>
        <AppButton variant="secondary" @click="closeConfirm">Cancel</AppButton>
        <AppButton variant="danger" @click="confirmDelete(async (it) => {
          try {
            await store.removeItem(it.id)
            ui.showToast('Auction item deleted')
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
import { useAuctionItemsStore } from '../../../stores/auctionItems'
import { useUIStore } from '../../../stores/ui'
import { siteMediaUrl } from '../../../services/siteApi'
import { useFormModal } from '../../../composables/useFormModal'
import { useConfirmDelete } from '../../../composables/useConfirmDelete'

const store = useAuctionItemsStore()
const ui = useUIStore()

const { showModal: showForm, formData, editingItem, openAdd, openEdit, closeModal: closeForm } = useFormModal()
const { showConfirm, itemToDelete, openConfirm, closeConfirm, confirmDelete } = useConfirmDelete()

const statusFilter = ref('all')
const uploadMsg = ref('')
const formError = ref('')
const saving = ref(false)
const startDollars = ref('')
const estDollars = ref('')
const endsAtLocal = ref('')

const statuses = ['active', 'closed', 'won']
const statusLabel = { active: 'Active', closed: 'Closed', won: 'Won' }

const badgeType = (status) => ({ active: 'success', closed: 'info', won: 'warn' }[status] || 'info')

const countByStatus = (st) => store.items.filter(i => i.status === st).length

const filteredItems = computed(() => {
  if (statusFilter.value === 'all') return store.items
  return store.items.filter(i => i.status === statusFilter.value)
})

const formatMoney = (cents) => {
  if (cents == null || isNaN(cents)) return '—'
  return '$' + (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

const toLocalInput = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d)) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const defaultForm = () => ({
  title: '', description: '', imageUrl: '', startingBidCents: 0,
  estimatedValueCents: null, donor: '', bidInstructions: '', endsAt: null, status: 'active',
})

const openAddForm = (item) => {
  uploadMsg.value = ''
  formError.value = ''
  if (item) {
    openEdit(item)
    formData.value = { ...item }
    startDollars.value = item.startingBidCents != null ? item.startingBidCents / 100 : ''
    estDollars.value = item.estimatedValueCents != null ? item.estimatedValueCents / 100 : ''
    endsAtLocal.value = toLocalInput(item.endsAt)
  } else {
    openAdd(defaultForm())
    startDollars.value = ''
    estDollars.value = ''
    endsAtLocal.value = ''
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

const dollarsToCents = (v) => {
  if (v === '' || v == null) return null
  const n = Math.round(Number(v) * 100)
  return isNaN(n) ? null : n
}

const save = async () => {
  formError.value = ''
  const data = {
    ...formData.value,
    startingBidCents: dollarsToCents(startDollars.value) || 0,
    estimatedValueCents: dollarsToCents(estDollars.value),
    donor: formData.value.donor?.trim() || null,
    bidInstructions: formData.value.bidInstructions?.trim() || null,
    endsAt: endsAtLocal.value ? new Date(endsAtLocal.value).toISOString() : null,
  }
  if (!data.title?.trim() || !data.description?.trim()) {
    formError.value = 'Title and description are required.'
    return
  }
  if (!data.imageUrl) {
    formError.value = 'Please add a photo.'
    return
  }
  saving.value = true
  try {
    if (editingItem.value) {
      await store.editItem(editingItem.value.id, data)
      ui.showToast('Auction item updated')
    } else {
      await store.addItem(data)
      ui.showToast('Auction item added')
    }
    closeForm()
  } catch (err) {
    formError.value = err.message || 'Save failed.'
  } finally {
    saving.value = false
  }
}

onMounted(() => store.loadItems())
</script>

<style scoped>
.al-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 16px; }
.al-title { font-size: 22px; font-weight: 900; color: var(--ink); margin: 0; }
.al-sub { font-size: 12px; color: var(--ink-3); font-weight: 600; margin: 4px 0 0; }

.pill-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px; }
.pill {
  padding: 5px 12px; background: var(--surface-2);
  border: 1px solid var(--border); border-radius: 20px;
  color: var(--ink-2); font-size: 11px; font-weight: 700;
  cursor: pointer; transition: all .15s;
  display: flex; align-items: center; gap: 4px;
}
.pill:hover { border-color: var(--mint); }
.pill.active { background: var(--mint); border-color: var(--mint); color: var(--bg); }
.pill-count { background: rgba(0,0,0,.15); padding: 1px 5px; border-radius: 10px; font-size: 10px; }

.form-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--r); padding: 16px; margin-bottom: 16px;
}
.form-card-header {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 13px; font-weight: 800; color: var(--ink);
  margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--border);
}
.panel-close { background: none; border: none; font-size: 16px; color: var(--ink-3); cursor: pointer; }
.form-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
.form-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; color: var(--ink-3); }
.field-label { font-size: 11px; font-weight: 700; color: var(--ink-2); margin-bottom: 4px; }
.form-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-input {
  padding: 9px 12px; background: var(--surface-2);
  border: 1.5px solid var(--border); border-radius: var(--r);
  color: var(--ink); font-family: 'Nunito', sans-serif; font-size: 13px;
  width: 100%; transition: border .15s;
}
.form-input:focus { outline: none; border-color: var(--mint); }
.form-textarea {
  padding: 10px 12px; background: var(--surface-2);
  border: 1.5px solid var(--border); border-radius: var(--r);
  color: var(--ink); font-family: 'Nunito', sans-serif; font-size: 12px;
  resize: vertical; width: 100%;
}
.form-textarea:focus { outline: none; border-color: var(--mint); }
.form-actions { display: flex; gap: 8px; padding-top: 8px; }
.muted { color: var(--ink-3); font-size: .82rem; }
.upload-msg { min-height: 1.1em; margin: 4px 0 0; }

.thumbs { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
.thumbs .t { position: relative; width: 62px; height: 62px; border-radius: 8px; overflow: hidden; border: 1px solid var(--border); }
.thumbs .t img { width: 100%; height: 100%; object-fit: cover; }
.thumbs .t button {
  position: absolute; top: 2px; right: 2px; width: 18px; height: 18px;
  border: 0; border-radius: 50%; background: rgba(0,0,0,.6); color: #fff;
  font-size: 11px; line-height: 18px; cursor: pointer; padding: 0;
}

.loading-msg { text-align: center; color: var(--ink-3); font-size: 13px; padding: 40px 0; }
.animal-list { display: flex; flex-direction: column; gap: 6px; }
.animal-row {
  display: flex; align-items: center; gap: 12px;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--r); padding: 10px 12px; transition: all .15s;
}
.animal-row:hover { border-color: var(--mint); }
.animal-thumb { width: 56px; height: 56px; border-radius: 8px; object-fit: cover; background: var(--surface-2); flex-shrink: 0; }
.animal-body { flex: 1; min-width: 0; }
.animal-top { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 4px; }
.animal-name { font-size: 14px; font-weight: 800; color: var(--ink); }
.animal-meta { font-size: 11px; color: var(--ink-3); }
.animal-actions { display: flex; gap: 4px; flex-shrink: 0; }
.action-btn {
  width: 28px; height: 28px; background: var(--surface-2);
  border: 1px solid var(--border); border-radius: 6px;
  cursor: pointer; display: flex; align-items: center;
  justify-content: center; font-size: 13px; transition: all .15s;
}
.action-btn:hover { background: var(--surface-3); border-color: var(--mint); }
.action-btn.danger:hover { border-color: var(--coral); }

</style>
