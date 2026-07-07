<template>
  <PageContainer>
    <div class="space-y-4">
      <!-- Stats -->
      <div class="stats-grid">
        <StatCard number="$125,000" label="Total Funded" />
        <StatCard number="8" label="Active Grants" />
        <StatCard number="3" label="Pending Approvals" />
        <StatCard number="14" label="Completed This Year" />
      </div>

      <!-- Quick Actions -->
      <div class="action-buttons">
        <AppButton variant="primary" @click="openAdd({ name: '', organization: '', deadline: '', amount: '', description: '' })">+ New Grant Opportunity</AppButton>
        <AppButton variant="secondary" @click="showLoiGenerator = !showLoiGenerator">✨ Draft LOI with AI</AppButton>
      </div>

      <!-- Add New Grant Form -->
      <AppCard v-if="showForm" title="Add Grant Opportunity">
        <div class="form-grid">
          <AppInput v-model="newGrant.name" placeholder="Grant name" />
          <AppInput v-model="newGrant.organization" placeholder="Funding organization" />
          <AppInput v-model="newGrant.deadline" type="date" label="Deadline" />
          <AppInput v-model="newGrant.amount" type="number" placeholder="Amount" />
          <AppInput v-model="newGrant.description" placeholder="Description (optional)" style="grid-column: span 2" />
          <AppButton variant="primary" @click="addGrant" style="grid-column: span 2">✓ Add Grant</AppButton>
          <AppButton variant="secondary" @click="closeForm" style="grid-column: span 2">Cancel</AppButton>
        </div>
      </AppCard>

      <!-- AI LOI Generator -->
      <AppCard v-if="showLoiGenerator" title="AI-Powered LOI Drafter">
        <div class="loi-form">
          <AppSelect v-model="loiGrant" :options="grantOptions" label="Select Grant" />
          <textarea v-model="loiContext" placeholder="Grant details, your mission, key achievements..." class="loi-textarea" />
          <AppButton variant="primary" @click="generateLOI" :disabled="loiLoading">
            {{ loiLoading ? '⏳ Generating...' : '✨ Generate LOI Draft' }}
          </AppButton>

          <div v-if="loiDraft" class="loi-result">
            <div class="loi-header">
              <h3>Generated LOI Draft</h3>
              <AppButton variant="secondary" size="sm" @click="copyLOI">📋 Copy</AppButton>
            </div>
            <div class="loi-content">{{ loiDraft }}</div>
          </div>
        </div>
      </AppCard>

      <!-- Document Upload -->
      <SectionLabel>Grant Documents</SectionLabel>
      <AppCard>
        <div class="upload-area" @click="fileInput?.click()">
          <div class="upload-icon">📄</div>
          <div class="upload-text">Click to upload or drag documents here</div>
          <div class="upload-hint">PDF, Word, or Text files</div>
          <input ref="fileInput" type="file" multiple accept=".pdf,.doc,.docx,.txt" @change="handleFileUpload" style="display: none" />
        </div>

        <div v-if="uploadedFiles.length > 0" class="uploaded-list">
          <div v-for="file in uploadedFiles" :key="file.id" class="file-item">
            <div class="file-info">
              <div class="file-name">📎 {{ file.name }}</div>
              <div class="file-meta">{{ formatFileSize(file.size) }} · {{ file.uploadedAt }}</div>
            </div>
            <AppButton size="sm" variant="secondary" @click="deleteFile(file.id)">Delete</AppButton>
          </div>
        </div>
      </AppCard>

      <!-- Active Grants -->
      <SectionLabel>Active Opportunities</SectionLabel>
      <div v-if="activeGrants.length > 0" class="space-y-3">
        <AppCard v-for="g in activeGrants" :key="g.id" noPad>
          <div class="grant-card">
            <div class="grant-header">
              <div>
                <div class="grant-name">{{ g.name }}</div>
                <div class="grant-org">{{ g.organization }}</div>
              </div>
              <AppBadge :type="daysUntilDeadline(g.deadline) <= 7 ? 'danger' : 'info'">
                {{ daysUntilDeadline(g.deadline) }}d left
              </AppBadge>
            </div>
            <div class="grant-amount">💰 {{ formatCurrency(g.amount) }}</div>
            <div v-if="g.description" class="grant-desc">{{ g.description }}</div>
            <div class="grant-actions">
              <AppButton size="sm" variant="primary" @click="applyForGrant(g.id)">Apply</AppButton>
              <AppButton size="sm" variant="secondary" @click="useGrantForLOI(g.id)">📝 Draft LOI</AppButton>
              <AppButton size="sm" variant="secondary" @click="removeGrant(g)">Remove</AppButton>
            </div>
          </div>
        </AppCard>
      </div>
      <EmptyState v-else icon="🏆" title="No active grants" message="Add grant opportunities above." />

      <!-- Pending Applications -->
      <SectionLabel>Pending Applications</SectionLabel>
      <AppCard :flat="true">
        <div v-if="pendingApplications.length > 0" class="divide-list">
          <div v-for="app in pendingApplications" :key="app.id" class="pending-item">
            <div class="pending-header">
              <div class="pending-name">{{ app.grantName }}</div>
              <AppBadge type="info">{{ app.status }}</AppBadge>
            </div>
            <div class="pending-meta">
              <span>{{ app.organization }}</span>
              <span>Applied {{ app.appliedDate }}</span>
            </div>
            <div class="pending-amount">Expected: {{ formatCurrency(app.amount) }}</div>
          </div>
        </div>
        <EmptyState v-else icon="📋" title="No pending" message="All applications approved or reviewed." />
      </AppCard>

      <!-- Funded Grants -->
      <SectionLabel>Funded Grants</SectionLabel>
      <AppCard :flat="true">
        <div v-if="fundedGrants.length > 0" class="divide-list">
          <div v-for="grant in fundedGrants" :key="grant.id" class="funded-item">
            <div class="funded-header">
              <div>
                <div class="funded-name">{{ grant.grantName }}</div>
                <div class="funded-org">{{ grant.organization }}</div>
              </div>
              <AppBadge type="success">Funded</AppBadge>
            </div>
            <div class="funded-amount">✓ {{ formatCurrency(grant.amount) }} received</div>
            <div class="funded-date">{{ grant.fundedDate }}</div>
            <div class="funded-desc">{{ grant.description }}</div>
          </div>
        </div>
        <EmptyState v-else icon="💚" title="No funded grants yet" message="Track approved grants here." />
      </AppCard>

      <!-- Delete Confirmation Dialog -->
      <AppModal v-if="showDeleteConfirm" :open="true" title="Delete grant?" size="sm" @close="closeDeleteConfirm">
        <p>Are you sure you want to delete "{{ grantToDelete?.name }}"? This action cannot be undone.</p>
        <template #actions>
          <AppButton variant="secondary" @click="closeDeleteConfirm">Cancel</AppButton>
          <AppButton variant="danger" @click="handleConfirmDelete">Delete</AppButton>
        </template>
      </AppModal>
    </div>
  </PageContainer>
</template>

<script setup>
import { ref, computed } from 'vue'
import { PageContainer, AppCard, SectionLabel, StatCard, AppButton, AppInput, AppSelect, AppBadge, EmptyState, AppModal } from '../../ui'
import { useUIStore } from '../../../stores/ui'
import { authHeaders, authOnlyHeaders } from '../../../services/siteApi'
import { useTableFilters } from '../../../composables/useTableFilters'
import { useFormModal } from '../../../composables/useFormModal'
import { useConfirmDelete } from '../../../composables/useConfirmDelete'

const ui = useUIStore()

const showLoiGenerator = ref(false)
const loiLoading = ref(false)
const loiDraft = ref('')
const loiGrant = ref('')
const loiContext = ref('')
const fileInput = ref(null)

const grants = ref([])
const uploadedFiles = ref([])
const pendingApplications = ref([])
const fundedGrants = ref([])

// Initialize composables
const { showModal: showForm, formData: newGrant, openAdd, closeModal: closeForm, submitForm } = useFormModal()
const { searchQuery, filtered: filteredGrants, sorted: activeGrants, clearFilters } = useTableFilters(grants, { defaultSort: 'name' })
const { showConfirm: showDeleteConfirm, itemToDelete: grantToDelete, openConfirm: openDeleteConfirm, closeConfirm: closeDeleteConfirm, confirmDelete } = useConfirmDelete()

const grantOptions = computed(() =>
  grants.value.map(g => ({ label: g.name, value: g.id }))
)

const daysUntilDeadline = (deadline) => {
  const today = new Date()
  const deadlineDate = new Date(deadline)
  const diff = deadlineDate - today
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatCurrency = (amount) => {
  return '$' + Number(amount).toLocaleString()
}

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const addGrant = async () => {
  if (newGrant.value.name && newGrant.value.organization && newGrant.value.deadline && newGrant.value.amount) {
    await submitForm(async (data) => {
      grants.value.push({
        id: Math.max(...grants.value.map(g => g.id), 0) + 1,
        ...data,
      })
    })
  }
}

const removeGrant = (grant) => {
  openDeleteConfirm(grant)
}

const handleConfirmDelete = async () => {
  await confirmDelete(async (item) => {
    grants.value = grants.value.filter(g => g.id !== item.id)
  })
}

const applyForGrant = (id) => {
  const grant = grants.value.find(g => g.id === id)
  if (grant) {
    pendingApplications.value.unshift({
      id: Math.max(...pendingApplications.value.map(p => p.id), 0) + 1,
      grantName: grant.name,
      organization: grant.organization,
      status: 'Submitted',
      amount: grant.amount,
      appliedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    })
  }
}

const useGrantForLOI = (id) => {
  loiGrant.value = id
  showLoiGenerator.value = true
}

const generateLOI = async () => {
  if (!loiGrant.value || !loiContext.value) return

  loiLoading.value = true
  try {
    const grant = grants.value.find(g => g.id === loiGrant.value)

    // Call the Cloudflare Worker to generate LOI using Claude
    const response = await fetch('/api/generate-loi', {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify({
        grantName: grant.name,
        organization: grant.organization,
        amount: grant.amount,
        context: loiContext.value,
      }),
    })

    const data = await response.json()
    loiDraft.value = data.loi
  } catch (error) {
    loiDraft.value = 'Error generating LOI. Please try again.'
  } finally {
    loiLoading.value = false
  }
}

const copyLOI = () => {
  navigator.clipboard.writeText(loiDraft.value)
  ui.showToast('LOI copied to clipboard!')
}

const handleFileUpload = async (event) => {
  const files = event.target.files
  if (!files.length) return

  const currentGrant = loiGrant.value || (grants.value[0]?.id || 'default')

  for (let file of files) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('grantId', currentGrant)

      const response = await fetch('/api/upload-document', {
        method: 'POST',
        headers: await authOnlyHeaders(),
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        uploadedFiles.value.push({
          id: Math.max(...uploadedFiles.value.map(f => f.id), 0) + 1,
          name: file.name,
          size: file.size,
          uploadedAt: 'Just now',
          key: data.filename,
        })
      } else {
        ui.showToast('Upload failed', 'error')
      }
    } catch (error) {
      ui.showToast('Upload error', 'error')
    }
  }

  if (fileInput.value) fileInput.value.value = ''
}

const deleteFile = async (id) => {
  const file = uploadedFiles.value.find(f => f.id === id)
  if (!file || !file.key) {
    uploadedFiles.value = uploadedFiles.value.filter(f => f.id !== id)
    return
  }

  try {
    await fetch(`/api/delete-document?key=${encodeURIComponent(file.key)}`, {
      method: 'DELETE',
      headers: await authOnlyHeaders(),
    })
  } catch (error) {
    ui.showToast('Delete error', 'error')
  }

  uploadedFiles.value = uploadedFiles.value.filter(f => f.id !== id)
}

const loadGrantDocuments = async (grantId) => {
  try {
    const response = await fetch(`/api/get-documents?grantId=${grantId}`, {
      headers: await authOnlyHeaders(),
    })
    if (response.ok) {
      const data = await response.json()
      uploadedFiles.value = data.documents.map((doc, idx) => ({
        id: idx + 1,
        name: doc.filename,
        size: doc.size,
        uploadedAt: new Date(doc.uploaded).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        key: doc.key,
      }))
    }
  } catch (error) {
    // Silently fail
  }
}
</script>

<style scoped>
.space-y-4 > * + * { margin-top: 16px; }

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.loi-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.loi-textarea {
  min-height: 120px;
  padding: 12px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--r);
  color: var(--ink);
  font-family: 'Nunito', sans-serif;
  font-size: 12px;
  resize: vertical;
}

.loi-result {
  margin-top: 16px;
  padding: 14px;
  background: rgba(78, 255, 197, 0.08);
  border: 1px solid var(--mint);
  border-radius: var(--r);
}

.loi-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.loi-header h3 {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: var(--ink);
}

.loi-content {
  font-size: 12px;
  color: var(--ink-2);
  line-height: 1.7;
  max-height: 400px;
  overflow-y: auto;
  padding: 10px;
  background: var(--surface-2);
  border-radius: 6px;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.upload-area {
  padding: 30px;
  border: 2px dashed var(--border);
  border-radius: var(--r);
  text-align: center;
  cursor: pointer;
  transition: all .15s;
  background: var(--surface-2);
}

.upload-area:hover {
  border-color: var(--mint);
  background: rgba(78, 255, 197, 0.08);
}

.upload-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 13px;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 4px;
}

.upload-hint {
  font-size: 11px;
  color: var(--ink-3);
}

.uploaded-list {
  margin-top: 16px;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: var(--surface-2);
  border-radius: 6px;
  margin-bottom: 8px;
}

.file-info {
  flex: 1;
}

.file-name {
  font-size: 12px;
  font-weight: 700;
  color: var(--ink);
}

.file-meta {
  font-size: 10px;
  color: var(--ink-3);
  margin-top: 2px;
}

.grant-card {
  padding: 14px;
}

.grant-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  gap: 8px;
}

.grant-name {
  font-size: 14px;
  font-weight: 800;
  color: var(--ink);
}

.grant-org {
  font-size: 11px;
  color: var(--ink-3);
  margin-top: 2px;
}

.grant-amount {
  font-size: 13px;
  font-weight: 700;
  color: var(--mint);
  margin-bottom: 6px;
}

.grant-desc {
  font-size: 11px;
  color: var(--ink-3);
  margin-bottom: 8px;
  line-height: 1.5;
}

.grant-actions {
  display: flex;
  gap: 6px;
}

.divide-list > * + * { border-top: 1px solid var(--border); padding-top: 12px; }
.divide-list > *:first-child { padding-top: 0; }

.pending-item { padding: 12px 0; }

.pending-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.pending-name {
  font-size: 13px;
  font-weight: 800;
  color: var(--ink);
}

.pending-meta {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: var(--ink-3);
  margin-bottom: 4px;
}

.pending-amount {
  font-size: 12px;
  font-weight: 700;
  color: var(--ink-2);
}

.funded-item { padding: 12px 0; }

.funded-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 6px;
  gap: 8px;
}

.funded-name {
  font-size: 13px;
  font-weight: 800;
  color: var(--ink);
}

.funded-org {
  font-size: 11px;
  color: var(--ink-3);
  margin-top: 2px;
}

.funded-amount {
  font-size: 13px;
  font-weight: 700;
  color: var(--mint);
  margin-bottom: 4px;
}

.funded-date {
  font-size: 10px;
  color: var(--ink-3);
  margin-bottom: 4px;
}

.funded-desc {
  font-size: 11px;
  color: var(--ink-3);
  line-height: 1.5;
}

</style>
