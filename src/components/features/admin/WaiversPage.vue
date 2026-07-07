<template>
  <PageContainer>
    <button class="back-btn" @click="ui.setCurrentTab('admin-hub')">← Admin Hub</button>

    <div class="page-header">
      <h1>📋 Waivers</h1>
    </div>

    <SectionLabel>Signed Waivers</SectionLabel>
    <div v-if="signed.length === 0" class="mt-3">
      <AlertBox type="info">No signed waivers yet.</AlertBox>
    </div>
    <AppCard v-for="w in signed" :key="w.id" :flat="true">
      <div class="waiver-row">
        <div class="waiver-info">
          <span class="waiver-name">✅ {{ w.name }}</span>
          <span class="waiver-date">Signed {{ new Date(w.signedAt).toLocaleDateString() }}</span>
        </div>
        <div class="waiver-row-actions">
          <AppButton size="sm" variant="secondary" @click="viewWaiver(w)">👁 View</AppButton>
          <AppButton size="sm" variant="secondary" @click="printWaiver(w)">🖨 Print</AppButton>
        </div>
      </div>
    </AppCard>

    <!-- Waiver Viewer Modal -->
    <AppModal v-if="viewingWaiver" :open="true" :title="`📄 Waiver — ${viewingWaiver.name}`" size="lg" @close="closeViewer">
      <!-- PDF (URL or base64) -->
      <iframe
        v-if="pdfSrc"
        :src="pdfSrc"
        class="pdf-frame"
        title="Waiver PDF"
      ></iframe>

      <!-- Signed record fallback (waivers store name/email/signature fields, no PDF file) -->
      <div v-else class="waiver-doc">
        <div class="waiver-doc-title">Volunteer Liability Waiver</div>
        <div class="waiver-doc-meta">Version {{ viewingWaiver.waiverVersion || '1.0' }}</div>
        <div class="waiver-doc-row"><span>Name</span><strong>{{ viewingWaiver.name }}</strong></div>
        <div class="waiver-doc-row" v-if="viewingWaiver.email"><span>Email</span><strong>{{ viewingWaiver.email }}</strong></div>
        <div class="waiver-doc-row"><span>Status</span><strong>{{ viewingWaiver.signed ? 'Signed ✅' : 'Unsigned' }}</strong></div>
        <div class="waiver-doc-row" v-if="viewingWaiver.signedAt"><span>Signed on</span><strong>{{ new Date(viewingWaiver.signedAt).toLocaleString() }}</strong></div>
        <div v-if="viewingWaiver.signature" class="waiver-signature">
          <div class="waiver-signature-label">Digital Signature</div>
          <div class="waiver-signature-value">{{ viewingWaiver.signature }}</div>
        </div>
      </div>

      <template #actions>
        <a
          v-if="pdfSrc"
          :href="pdfSrc"
          :download="downloadFileName"
          target="_blank"
          rel="noopener"
          class="download-link"
        >⬇ Download PDF</a>
        <AppButton v-else size="sm" variant="secondary" @click="downloadWaiverRecord">⬇ Download</AppButton>
        <AppButton size="sm" variant="primary" @click="closeViewer">Close</AppButton>
      </template>
    </AppModal>
  </PageContainer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { PageContainer, AppCard, SectionLabel, AppButton, AlertBox, AppModal } from '../../ui'
import { useUIStore } from '../../../stores/ui'
import { useWaiversStore } from '../../../stores/waivers'

const ui = useUIStore()
const waiversStore = useWaiversStore()

const viewingWaiver = ref(null)

/** Resolves a displayable PDF source from whatever field the waiver doc carries
 *  (hosted URL or raw base64), or null when the waiver is a signed record only. */
const pdfSrc = computed(() => {
  const w = viewingWaiver.value
  if (!w) return null
  const url = w.pdfUrl || w.fileUrl || w.url
  if (url) return url
  const base64 = w.pdfBase64 || w.pdfData
  if (base64) {
    return base64.startsWith('data:') ? base64 : `data:application/pdf;base64,${base64}`
  }
  return null
})

const downloadFileName = computed(() => {
  const name = viewingWaiver.value?.name || 'waiver'
  return `waiver-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`
})

const viewWaiver = (w) => {
  viewingWaiver.value = w
}

const closeViewer = () => {
  viewingWaiver.value = null
}

/** Downloads a text copy of a signed waiver record when no PDF file exists. */
const downloadWaiverRecord = () => {
  const w = viewingWaiver.value
  if (!w) return
  const lines = [
    'VOLUNTEER LIABILITY WAIVER',
    `Version: ${w.waiverVersion || '1.0'}`,
    '',
    `Name: ${w.name || ''}`,
    `Email: ${w.email || ''}`,
    `Status: ${w.signed ? 'Signed' : 'Unsigned'}`,
    `Signed at: ${w.signedAt ? new Date(w.signedAt).toLocaleString() : 'N/A'}`,
    `Digital signature: ${w.signature || 'N/A'}`,
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `waiver-${(w.name || 'record').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const printWaiver = (w) => {
  // Open print dialog for the waiver
  window.print()
}

onMounted(() => {
  waiversStore.fetchWaivers()
})

const signed = computed(() => waiversStore.getSignedWaivers())
</script>

<style scoped>
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: transparent;
  border: 1.5px solid var(--border);
  border-radius: var(--r);
  color: var(--ink-3);
  font-size: 12px;
  font-weight: 700;
  font-family: 'Nunito', sans-serif;
  cursor: pointer;
  transition: all .15s;
  margin-bottom: 16px;
}
.back-btn:hover { color: var(--ink); border-color: var(--border-2); }

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.page-header h1 {
  font-size: 22px;
  font-weight: 900;
  color: var(--ink);
  margin: 0;
  font-family: 'Fredoka One', sans-serif;
}

.waiver-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
}
.waiver-row:last-child { border-bottom: none; }

.waiver-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.waiver-name {
  font-size: 14px;
  font-weight: 800;
  color: var(--ink);
}

.waiver-date {
  font-size: 12px;
  color: var(--ink-3);
  font-weight: 600;
}

.waiver-row-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

/* ── Waiver viewer modal ─────────────────────────────────────────── */
.pdf-frame {
  width: 100%;
  height: 60vh;
  border: 1px solid var(--border);
  border-radius: var(--r);
  background: #fff;
}

.waiver-doc {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.waiver-doc-title {
  font-size: 16px;
  font-weight: 900;
  color: var(--ink);
}

.waiver-doc-meta {
  font-size: 11px;
  color: var(--ink-3);
  font-weight: 600;
  margin-bottom: 6px;
}

.waiver-doc-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
  color: var(--ink-2);
  padding: 8px 0;
  border-bottom: 1px solid var(--border);
}
.waiver-doc-row strong { color: var(--ink); font-weight: 700; }

.waiver-signature {
  margin-top: 10px;
  padding: 12px;
  border: 1.5px dashed var(--border);
  border-radius: var(--r);
}

.waiver-signature-label {
  font-size: 11px;
  text-transform: uppercase;
  color: var(--ink-3);
  font-weight: 700;
  margin-bottom: 4px;
}

.waiver-signature-value {
  font-size: 20px;
  color: var(--ink);
  font-style: italic;
  font-weight: 700;
}

.download-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1.5px solid var(--border);
  border-radius: var(--r);
  color: var(--ink-2);
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
  transition: all .15s;
}
.download-link:hover { color: var(--ink); border-color: var(--border-2); }
</style>
