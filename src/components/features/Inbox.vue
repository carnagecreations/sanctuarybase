<template>
  <PageContainer>

    <!-- Toolbar -->
    <div class="inbox-toolbar">
      <div class="inbox-heading">
        <h1 class="inbox-title">📥 Inbox</h1>
        <p class="inbox-sub">Messages from the website contact form</p>
      </div>
      <button class="refresh-btn" :class="{ spinning: loading }" @click="refresh" title="Refresh">
        ↻
      </button>
    </div>

    <!-- Quick stats -->
    <div class="inbox-stats">
      <div class="stat-box" :class="{ 'stat-box--accent': unreadCount > 0 }">
        <div class="stat-num">{{ unreadCount }}</div>
        <div class="stat-label">Unread</div>
      </div>
      <div class="stat-box">
        <div class="stat-num">{{ submissions.length }}</div>
        <div class="stat-label">Pending</div>
      </div>
      <div class="stat-box">
        <div class="stat-num">{{ repliedCount }}</div>
        <div class="stat-label">Replied</div>
      </div>
      <div class="stat-box">
        <div class="stat-num">{{ archived.length }}</div>
        <div class="stat-label">Archived</div>
      </div>
    </div>

    <!-- Filter tabs + search -->
    <div class="inbox-controls">
      <div class="filter-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="tab-btn"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          {{ tab.label }} <span class="tab-count">{{ tab.count }}</span>
        </button>
      </div>
      <div class="search-wrap">
        <span class="search-icon">🔍</span>
        <input
          v-model="search"
          class="search-input"
          type="search"
          placeholder="Search name, email, message…"
        />
      </div>
    </div>

    <!-- Error -->
    <AlertBox v-if="error" type="danger" style="margin-bottom:14px">
      Couldn't load messages: {{ error }}
    </AlertBox>

    <!-- Submissions list -->
    <div v-if="filtered.length > 0" class="submission-list">
      <article
        v-for="s in filtered"
        :key="s.id"
        class="submission"
        :class="{ 'is-unread': isUnread(s), 'is-replied': s.replied }"
      >
        <header class="submission__header">
          <div class="submission__who">
            <span v-if="isUnread(s)" class="unread-dot" title="New"></span>
            <span class="submission__name">{{ s.name }}</span>
            <span class="type-pill" :class="`type-${s.type.replace(/[^a-z]/g,'')}`">{{ s.type }}</span>
            <span v-if="s.replied" class="replied-pill">📝 Noted</span>
          </div>
          <time class="submission__date">{{ s.date }}</time>
        </header>

        <a class="submission__email" :href="`mailto:${s.email}`">{{ s.email }}</a>

        <p class="submission__message">{{ s.message }}</p>

        <!-- Structured application details, captured from the website form -->
        <div v-if="s.details && Object.keys(s.details).length" class="details-block">
          <button class="details-toggle" @click="toggleDetails(s.id)">
            {{ openDetailsId === s.id ? '▾' : '▸' }} Application details
          </button>
          <dl v-if="openDetailsId === s.id" class="details-grid">
            <template v-for="(value, key) in s.details" :key="key">
              <dt v-if="key !== 'formType'">{{ formatDetailKey(key) }}</dt>
              <dd v-if="key !== 'formType'">{{ formatDetailValue(value) }}</dd>
            </template>
          </dl>
        </div>

        <!-- Applicant pipeline — adoption/foster/volunteer only. Declining is
             always a status, never a delete, so the record and reason stay. -->
        <div v-if="s.isApplication" class="pipeline-block">
          <span class="status-pill" :class="`status-${s.status}`">{{ statusLabel(s.status) }}</span>
          <span v-if="s.status === 'declined' && s.declineReason" class="decline-reason">{{ s.declineReason }}</span>

          <div v-if="declineId !== s.id" class="pipeline-actions">
            <AppButton
              v-for="next in nextStatuses(s.status)"
              :key="next"
              size="sm" variant="secondary"
              :disabled="busyId === s.id"
              @click="setStatus(s, next)"
            >{{ statusActionLabel(next) }}</AppButton>
            <AppButton
              v-if="!['declined', 'completed'].includes(s.status)"
              size="sm" variant="ghost"
              :disabled="busyId === s.id"
              @click="startDecline(s)"
            >Decline</AppButton>
          </div>
          <div v-else class="decline-composer">
            <textarea
              v-model="declineReasonDraft"
              class="reply-textarea"
              rows="2"
              placeholder="Reason for declining (required, stays on file)…"
            ></textarea>
            <div class="composer-actions">
              <AppButton size="sm" variant="primary" :disabled="!declineReasonDraft.trim() || busyId === s.id" @click="confirmDecline(s.id)">
                {{ busyId === s.id ? 'Saving…' : 'Confirm decline' }}
              </AppButton>
              <AppButton size="sm" variant="ghost" @click="cancelDecline">Cancel</AppButton>
            </div>
          </div>
        </div>

        <div v-if="s.replied && s.replyText" class="submission__reply">
          <div class="reply-label">Note on file</div>
          <div class="reply-text">{{ s.replyText }}</div>
        </div>

        <!-- Reply composer — no email service exists yet, so this saves an
             internal note and hands off to the staff member's own mail
             client. It never claims to have sent anything itself. -->
        <div v-if="replyingId === s.id" class="reply-composer">
          <textarea
            v-model="replyDraft"
            class="reply-textarea"
            rows="3"
            placeholder="Draft your reply…"
          ></textarea>
          <div class="composer-actions">
            <AppButton size="sm" variant="primary" :disabled="!replyDraft.trim() || busyId === s.id" @click="sendReply(s.id, s.email, s.subject)">
              {{ busyId === s.id ? 'Saving…' : 'Save note & open email' }}
            </AppButton>
            <AppButton size="sm" variant="ghost" @click="cancelReply">Cancel</AppButton>
          </div>
        </div>

        <!-- Actions -->
        <div v-else class="submission__actions">
          <AppButton size="sm" variant="primary" @click="openReply(s)">
            {{ s.replied ? 'Edit note' : 'Reply' }}
          </AppButton>
          <AppButton size="sm" variant="secondary" :disabled="busyId === s.id" @click="toggleArchive(s)">
            {{ activeTab === 'archived' ? 'Restore' : 'Archive' }}
          </AppButton>
          <button
            class="delete-btn"
            :class="{ armed: confirmId === s.id }"
            :disabled="busyId === s.id"
            @click="handleDelete(s)"
          >
            {{ confirmId === s.id ? 'Confirm delete?' : '🗑 Delete' }}
          </button>
        </div>
      </article>
    </div>

    <EmptyState
      v-else
      :icon="search ? '🔍' : '📭'"
      :title="search ? 'No matches' : 'All caught up'"
      :message="search ? 'No messages match your search.' : 'No messages in this category.'"
    />

  </PageContainer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { PageContainer, AppButton, EmptyState, AlertBox } from '../ui'
import { useContacts } from '../../stores/contacts'

const {
  submissions, archived, loading, error, unreadCount,
  loadContacts, replyToSubmission, archiveSubmission, restoreSubmission, updateSubmissionStatus, deleteSubmission, markInboxSeen
} = useContacts()

const activeTab = ref('pending')
const search = ref('')
const replyingId = ref(null)
const replyDraft = ref('')
const confirmId = ref(null)
const busyId = ref(null)
const seenAtOpen = ref(0)
const openDetailsId = ref(null)
const declineId = ref(null)
const declineReasonDraft = ref('')

// Interview/home-check aren't required for every application type, so both
// lead straight to "approved" as well as to each other.
const STATUS_FLOW = {
  new: ['reviewing'],
  reviewing: ['interview', 'approved'],
  interview: ['home_check', 'approved'],
  home_check: ['approved'],
  approved: ['completed'],
  completed: [],
  declined: ['new'],
}
const STATUS_LABELS = {
  new: 'New', reviewing: 'Reviewing', interview: 'Interview scheduled',
  home_check: 'Home check', approved: 'Approved', completed: 'Completed', declined: 'Declined',
}
const STATUS_ACTION_LABELS = {
  reviewing: 'Start review', interview: 'Schedule interview', home_check: 'Schedule home check',
  approved: 'Approve', completed: 'Mark completed', new: 'Reopen',
}

const nextStatuses = (status) => STATUS_FLOW[status] || []
const statusLabel = (status) => STATUS_LABELS[status] || status
const statusActionLabel = (status) => STATUS_ACTION_LABELS[status] || status

const formatDetailKey = (key) => key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase())
const formatDetailValue = (value) => {
  if (Array.isArray(value)) return value.length ? value.join(', ') : '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (value === null || value === undefined || value === '') return '—'
  return String(value)
}
const toggleDetails = (id) => {
  openDetailsId.value = openDetailsId.value === id ? null : id
}

const repliedCount = computed(() => submissions.value.filter(s => s.replied).length)

const tabs = computed(() => [
  { id: 'pending', label: 'Pending', count: submissions.value.length },
  { id: 'archived', label: 'Archived', count: archived.value.length },
])

const filtered = computed(() => {
  const list = activeTab.value === 'pending' ? submissions.value : archived.value
  const q = search.value.trim().toLowerCase()
  if (!q) return list
  return list.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.email.toLowerCase().includes(q) ||
    (s.message || '').toLowerCase().includes(q) ||
    (s.type || '').toLowerCase().includes(q)
  )
})

// Unread relative to the moment the inbox was opened (so newly-read items still highlight this session)
const isUnread = (s) => activeTab.value === 'pending' && s.createdAtMs > seenAtOpen.value

onMounted(async () => {
  seenAtOpen.value = Number(localStorage.getItem('inbox_last_seen') || 0)
  await loadContacts()
  markInboxSeen()
})

const refresh = async () => {
  await loadContacts()
}

const openReply = (s) => {
  replyingId.value = s.id
  replyDraft.value = s.replyText || ''
  confirmId.value = null
}

const cancelReply = () => {
  replyingId.value = null
  replyDraft.value = ''
}

const sendReply = async (id, email, subject) => {
  busyId.value = id
  try {
    const text = replyDraft.value.trim()
    await replyToSubmission(id, text)
    cancelReply()
    // No email service exists yet — hand off to the staff member's own mail
    // client instead of pretending the app just sent this itself.
    const mailtoSubject = encodeURIComponent(`Re: your ${subject || 'message'} to Saint Francis Rescue`)
    window.location.href = `mailto:${email}?subject=${mailtoSubject}&body=${encodeURIComponent(text)}`
  } finally {
    busyId.value = null
  }
}

const toggleArchive = async (s) => {
  busyId.value = s.id
  try {
    if (s.archived) await restoreSubmission(s.id)
    else await archiveSubmission(s.id)
  } finally {
    busyId.value = null
  }
}

const setStatus = async (s, status) => {
  busyId.value = s.id
  try {
    await updateSubmissionStatus(s.id, status)
  } finally {
    busyId.value = null
  }
}

const startDecline = (s) => {
  declineId.value = s.id
  declineReasonDraft.value = ''
}

const cancelDecline = () => {
  declineId.value = null
  declineReasonDraft.value = ''
}

const confirmDecline = async (id) => {
  busyId.value = id
  try {
    await updateSubmissionStatus(id, 'declined', declineReasonDraft.value.trim())
    cancelDecline()
  } finally {
    busyId.value = null
  }
}

const handleDelete = async (s) => {
  if (confirmId.value !== s.id) {
    confirmId.value = s.id
    setTimeout(() => { if (confirmId.value === s.id) confirmId.value = null }, 3500)
    return
  }
  busyId.value = s.id
  try {
    await deleteSubmission(s.id)
    confirmId.value = null
  } finally {
    busyId.value = null
  }
}
</script>

<style scoped>
/* Toolbar */
.inbox-toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.inbox-title {
  font-size: 24px;
  font-weight: 900;
  color: var(--ink);
  letter-spacing: -.01em;
  margin: 0;
}

.inbox-sub {
  font-size: 12px;
  color: var(--ink-3);
  font-weight: 600;
  margin: 4px 0 0;
}

.refresh-btn {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  color: var(--ink-2);
  font-size: 20px;
  cursor: pointer;
  transition: all .15s;
}

.refresh-btn:hover { border-color: var(--mint); color: var(--mint); }
.refresh-btn.spinning { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Stats */
.inbox-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 18px;
}

.stat-box {
  background: var(--surface-2);
  padding: 14px 10px;
  border-radius: var(--r);
  border: 1px solid var(--border);
  text-align: center;
}

.stat-box--accent {
  border-color: rgba(255,107,107,.4);
  background: linear-gradient(135deg, rgba(255,107,107,.12), var(--surface-2));
}

.stat-num {
  font-size: 24px;
  font-weight: 900;
  color: var(--mint);
  font-family: 'Fredoka One', sans-serif;
  line-height: 1;
}

.stat-box--accent .stat-num { color: var(--coral, #FF6B6B); }

.stat-label {
  font-size: 10px;
  font-weight: 800;
  color: var(--ink-3);
  text-transform: uppercase;
  letter-spacing: .05em;
  margin-top: 6px;
}

/* Controls */
.inbox-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.filter-tabs { display: flex; gap: 8px; }

.tab-btn {
  padding: 7px 14px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 20px;
  color: var(--ink-3);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all .15s;
}

.tab-btn:hover { border-color: var(--border-2); color: var(--ink-2); }

.tab-btn.active {
  background: var(--teal-l);
  border-color: var(--mint);
  color: var(--mint);
}

.tab-count {
  display: inline-block;
  min-width: 18px;
  padding: 0 5px;
  margin-left: 3px;
  border-radius: 10px;
  background: rgba(255,255,255,.08);
  font-size: 11px;
}

.tab-btn.active .tab-count { background: rgba(78,255,197,.2); }

.search-wrap {
  position: relative;
  flex: 1;
  min-width: 200px;
  max-width: 320px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 13px;
  opacity: .6;
}

.search-input {
  width: 100%;
  padding: 9px 12px 9px 34px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--ink);
  font-size: 13px;
  font-weight: 500;
}

.search-input:focus { outline: none; border-color: var(--mint); }

/* Submission cards */
.submission-list { display: flex; flex-direction: column; gap: 12px; }

.submission {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--r);
  padding: 16px;
  transition: border-color .15s;
}

.submission:hover { border-color: var(--border-2); }

.submission.is-unread {
  border-left: 3px solid var(--mint);
}

.submission.is-replied {
  background: linear-gradient(135deg, rgba(78,255,197,.05), var(--surface-2));
}

.submission__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
}

.submission__who {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  min-width: 0;
}

.unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--mint);
  box-shadow: 0 0 8px var(--mint);
  flex-shrink: 0;
}

.submission__name {
  font-size: 15px;
  font-weight: 800;
  color: var(--ink);
}

.type-pill {
  padding: 3px 9px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .04em;
  background: rgba(116,176,255,.15);
  color: var(--blue, #74B0FF);
  border: 1px solid rgba(116,176,255,.3);
}

.type-adoption { background: rgba(196,181,253,.15); color: var(--lavender,#C4B5FD); border-color: rgba(196,181,253,.3); }
.type-volunteer { background: rgba(78,255,197,.15); color: var(--mint); border-color: rgba(78,255,197,.3); }
.type-foster { background: rgba(116,176,255,.15); color: var(--blue,#74B0FF); border-color: rgba(116,176,255,.3); }
.type-donation, .type-cardonation, .type-inkind { background: rgba(217,119,6,.18); color: var(--amber,#F59E0B); border-color: rgba(217,119,6,.3); }
.type-newsletter { background: rgba(255,255,255,.08); color: var(--ink-3); border-color: var(--border); }

.replied-pill {
  padding: 3px 9px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  background: rgba(78,255,197,.15);
  color: var(--mint);
  border: 1px solid rgba(78,255,197,.3);
}

.submission__date {
  font-size: 11px;
  color: var(--ink-3);
  font-weight: 700;
  flex-shrink: 0;
  white-space: nowrap;
}

.submission__email {
  display: inline-block;
  font-size: 12px;
  color: var(--mint);
  font-weight: 700;
  text-decoration: none;
  margin-bottom: 10px;
}

.submission__email:hover { text-decoration: underline; }

.submission__message {
  font-size: 13px;
  color: var(--ink-2);
  font-weight: 500;
  line-height: 1.6;
  margin: 0 0 12px;
  white-space: pre-wrap;
}

.submission__reply {
  background: var(--surface);
  padding: 10px 12px;
  border-radius: 8px;
  margin-bottom: 12px;
  border-left: 3px solid var(--mint);
}

.reply-label {
  font-size: 10px;
  font-weight: 800;
  color: var(--mint);
  text-transform: uppercase;
  letter-spacing: .05em;
  margin-bottom: 4px;
}

.reply-text { font-size: 12px; color: var(--ink-2); line-height: 1.5; white-space: pre-wrap; }

/* Composer */
.reply-composer { margin-top: 4px; }

.reply-textarea {
  width: 100%;
  padding: 10px 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--ink);
  font-size: 13px;
  font-family: inherit;
  line-height: 1.5;
  resize: vertical;
  margin-bottom: 8px;
}

.reply-textarea:focus { outline: none; border-color: var(--mint); }

.composer-actions { display: flex; gap: 8px; }

/* Actions */
.submission__actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.delete-btn {
  margin-left: auto;
  padding: 7px 12px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--ink-3);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all .15s;
}

.delete-btn:hover { border-color: rgba(255,107,107,.4); color: var(--coral,#FF6B6B); }

.delete-btn.armed {
  background: rgba(255,107,107,.15);
  border-color: var(--coral,#FF6B6B);
  color: var(--coral,#FF6B6B);
}

/* Application details */
.details-block { margin-bottom: 12px; }

.details-toggle {
  background: none;
  border: none;
  color: var(--ink-3);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
}

.details-toggle:hover { color: var(--mint); }

.details-grid {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 4px 12px;
  margin: 10px 0 0;
  padding: 10px 12px;
  background: var(--surface);
  border-radius: 8px;
  font-size: 12px;
}

.details-grid dt { color: var(--ink-3); font-weight: 700; }
.details-grid dd { margin: 0; color: var(--ink-2); }

/* Applicant pipeline */
.pipeline-block {
  margin-bottom: 12px;
  padding: 10px 12px;
  background: var(--surface);
  border-radius: 8px;
}

.status-pill {
  display: inline-block;
  padding: 3px 9px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .04em;
  background: rgba(116,176,255,.15);
  color: var(--blue, #74B0FF);
  border: 1px solid rgba(116,176,255,.3);
}

.status-approved, .status-completed { background: rgba(78,255,197,.15); color: var(--mint); border-color: rgba(78,255,197,.3); }
.status-declined { background: rgba(255,107,107,.15); color: var(--coral,#FF6B6B); border-color: rgba(255,107,107,.3); }

.decline-reason {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: var(--ink-2);
  font-style: italic;
}

.pipeline-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.decline-composer { margin-top: 10px; }

@media (max-width: 640px) {
  .inbox-stats { grid-template-columns: repeat(2, 1fr); }
  .inbox-controls { flex-direction: column; align-items: stretch; }
  .search-wrap { max-width: none; }
}
</style>
