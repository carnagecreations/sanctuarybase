<template>
  <div class="compose-card">
    <div class="compose-header">
      <h2 class="compose-title">Compose Message</h2>
    </div>

    <!-- Recipient Type Selection -->
    <div class="recipient-section">
      <label class="recipient-option">
        <input
          v-model="recipientMode"
          type="radio"
          value="all"
          class="recipient-radio"
        />
        <div class="recipient-content">
          <div class="recipient-label">All Volunteers</div>
          <div class="recipient-hint">{{ volunteers.length }} volunteers</div>
        </div>
      </label>

      <label class="recipient-option">
        <input
          v-model="recipientMode"
          type="radio"
          value="online"
          class="recipient-radio"
        />
        <div class="recipient-content">
          <div class="recipient-label">Online Only</div>
          <div class="recipient-hint">Active volunteers</div>
        </div>
      </label>

      <label class="recipient-option">
        <input
          v-model="recipientMode"
          type="radio"
          value="staff-admin"
          class="recipient-radio"
        />
        <div class="recipient-content">
          <div class="recipient-label">Staff &amp; Admin</div>
          <div class="recipient-hint">{{ staffAndAdmin.length }} people</div>
        </div>
      </label>

      <label class="recipient-option">
        <input
          v-model="recipientMode"
          type="radio"
          value="specific"
          class="recipient-radio"
        />
        <div class="recipient-content">
          <div class="recipient-label">Select people</div>
          <div class="recipient-hint">{{ selectedVolunteers.length }} selected</div>
        </div>
      </label>
    </div>

    <!-- Recipient Selector (only when specific mode) -->
    <div v-if="recipientMode === 'specific'" class="volunteer-selector">
      <div class="selector-header">
        <label class="selector-title">Choose people</label>
        <button
          v-if="selectedVolunteers.length > 0"
          @click="selectedVolunteers = []"
          class="clear-btn"
        >
          Clear all
        </button>
      </div>

      <!-- Search Input -->
      <div class="search-input-wrapper">
        <input
          v-model="volunteerSearch"
          type="text"
          placeholder="Search people..."
          class="volunteer-search-input"
        />
      </div>

      <div v-if="loadingVolunteers" class="loading-state">
        <div class="loading-spinner"></div>
        <span>Loading people...</span>
      </div>

      <div v-else-if="filteredVolunteers.length === 0" class="empty-state">
        {{ volunteerSearch ? 'No one found' : 'No one found' }}
      </div>

      <div v-else class="volunteer-list">
        <label v-for="vol in filteredVolunteers" :key="vol.id" class="volunteer-item">
          <input
            :checked="selectedVolunteers.includes(vol.id)"
            type="checkbox"
            @change="toggleVolunteer(vol.id)"
            class="volunteer-checkbox"
          />
          <span class="volunteer-name">{{ vol.name }} <span class="volunteer-role">{{ vol.roleLabel }}</span></span>
        </label>
      </div>
    </div>

    <!-- Message Input -->
    <div class="message-input-section">
      <label class="input-label">Message</label>
      <textarea
        v-model="messageText"
        placeholder="Type your message here... Be clear and concise."
        class="message-textarea"
        :disabled="loading"
      />
      <div class="input-footer">
        <span class="char-count">{{ (messageText || '').length }} characters</span>
      </div>
    </div>

    <!-- Send Button -->
    <button
      @click="handleSendMessage"
      :disabled="loading || !(messageText || '').trim()"
      class="send-btn"
    >
      <span v-if="!loading">Send Message</span>
      <span v-else class="flex items-center gap-2">
        <div class="inline-spinner"></div>
        Sending...
      </span>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useMessagesStore } from '../../../../stores/messages'

const emit = defineEmits(['sent', 'toast'])

const messagesStore = useMessagesStore()

// Recipient selection (business logic specific to this component)
const recipientMode = ref('all')
const selectedVolunteers = ref([])

// Data
const volunteers = ref([])
const staffAndAdmin = ref([])

// States
const loadingVolunteers = ref(false)
const loading = ref(false)
const volunteerSearch = ref('')

// Form state
const messageText = ref('')

// People pickable in "specific" mode: volunteers plus staff/admin, each
// tagged with a role label since they come from two different collections
const selectablePeople = computed(() => [
  ...volunteers.value.map(v => ({ ...v, roleLabel: 'Volunteer' })),
  ...staffAndAdmin.value.map(p => ({ ...p, roleLabel: p.role === 'admin' ? 'Admin' : 'Staff' })),
])

// Simple filter without composables
const filteredVolunteers = computed(() => {
  if (!volunteerSearch.value.trim()) {
    return selectablePeople.value
  }
  const query = volunteerSearch.value.toLowerCase()
  return selectablePeople.value.filter(v => v.name?.toLowerCase().includes(query))
})

const messageFormData = ref({ text: '' })

const toggleVolunteer = (volunteerId) => {
  const idx = selectedVolunteers.value.indexOf(volunteerId)
  if (idx > -1) {
    selectedVolunteers.value.splice(idx, 1)
  } else {
    selectedVolunteers.value.push(volunteerId)
  }
}

const highlightMatch = (name) => {
  if (!volunteerSearch.value.trim()) {
    return name
  }
  const searchLower = volunteerSearch.value.toLowerCase()
  const nameLower = name.toLowerCase()
  const index = nameLower.indexOf(searchLower)

  if (index === -1) {
    return name
  }

  const highlighted =
    name.substring(0, index) +
    '<mark>' +
    name.substring(index, index + volunteerSearch.value.length) +
    '</mark>' +
    name.substring(index + volunteerSearch.value.length)

  return highlighted
}

const showToast = (message, type = 'success') => {
  emit('toast', message, type)
}

const handleSendMessage = async () => {
  if (!messageText.value?.trim()) return

  loading.value = true
  try {
    let recipientType = recipientMode.value
    let recipientIds = []
    let recipientEmails = []

    if (recipientMode.value === 'specific') {
      recipientIds = selectedVolunteers.value
      if (recipientIds.length === 0) {
        showToast('Please select at least one person', 'error')
        loading.value = false
        return
      }
      recipientEmails = selectablePeople.value.filter(p => recipientIds.includes(p.id)).map(p => p.email)
    } else if (recipientMode.value === 'staff-admin') {
      recipientIds = staffAndAdmin.value.map(p => p.id)
      recipientEmails = staffAndAdmin.value.map(p => p.email)
    } else {
      // 'all' and 'online' both resolve to volunteers for now — there's no
      // real online/presence tracking to distinguish "online" from "all" yet.
      recipientEmails = volunteers.value.map(v => v.email)
    }

    const result = await messagesStore.sendMessage(messageText.value, recipientIds, recipientType, recipientEmails)

    // Clear form
    messageText.value = ''
    selectedVolunteers.value = []
    volunteerSearch.value = ''
    recipientMode.value = 'all'

    // Notify parent to refresh messages
    emit('sent')

    if (result.failedEmails?.length) {
      showToast(`Sent to ${result.emailedCount}, but ${result.failedEmails.length} email(s) failed`, 'error')
    } else if (result.emailedCount === 0) {
      showToast('Saved, but no one had an email on file to send to', 'error')
    } else {
      showToast(`Message emailed to ${result.emailedCount} ${result.emailedCount === 1 ? 'person' : 'people'}`, 'success')
    }
  } catch (err) {
    console.error('Failed to send message:', err)
    showToast('Failed to send message', 'error')
  } finally {
    loading.value = false
  }
}

// Watch for mode changes to clear search and selections
watch(recipientMode, (newMode) => {
  volunteerSearch.value = ''
  if (newMode !== 'specific') {
    selectedVolunteers.value = []
  }
})

onMounted(() => {
  // Load counts immediately (lightweight) so the radio hints are accurate
  messagesStore.getVolunteers()
    .then(vols => { volunteers.value = vols })
    .catch(err => console.error('Failed to load volunteers:', err))
  messagesStore.getStaffAndAdmin()
    .then(people => { staffAndAdmin.value = people })
    .catch(err => console.error('Failed to load staff/admin:', err))
})

// Load the full lists only when the user switches to "specific" mode (lazy load)
watch(recipientMode, (newMode) => {
  if (newMode !== 'specific') return
  loadingVolunteers.value = true
  Promise.all([messagesStore.getVolunteers(), messagesStore.getStaffAndAdmin()])
    .then(([vols, people]) => {
      volunteers.value = vols
      staffAndAdmin.value = people
    })
    .catch(err => {
      console.error('Failed to load people:', err)
      showToast('Failed to load people', 'error')
    })
    .finally(() => {
      loadingVolunteers.value = false
    })
})
</script>

<style scoped>
/* Compose Card */
.compose-card {
  background: var(--surface);
  border: 1px solid var(--border-2);
  border-radius: var(--rl);
  overflow: hidden;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  height: fit-content;
  position: sticky;
  top: 80px;
}

.compose-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--mint), var(--brand));
}

.compose-header {
  padding: 20px 20px 0;
  border-bottom: 1px solid var(--border);
  position: relative;
  z-index: 1;
}

.compose-title {
  font-size: 16px;
  font-weight: 800;
  color: var(--ink);
  margin: 0;
}

/* Recipient Selection */
.recipient-section {
  padding: 18px 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.recipient-option {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}

.recipient-option:hover {
  background: var(--surface-2);
}

.recipient-radio {
  width: 18px;
  height: 18px;
  margin-top: 1px;
  cursor: pointer;
  accent-color: var(--mint);
}

.recipient-content {
  flex: 1;
}

.recipient-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--ink);
  margin: 0;
}

.recipient-hint {
  font-size: 12px;
  color: var(--ink-3);
  margin: 2px 0 0 0;
}

/* Volunteer Selector */
.volunteer-selector {
  padding: 18px 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Volunteer Search */
.search-input-wrapper {
  display: flex;
  align-items: center;
}

.volunteer-search-input {
  width: 100%;
  padding: 8px 12px;
  background: var(--surface-2);
  border: 1px solid var(--border-2);
  border-radius: 6px;
  color: var(--ink);
  font-family: 'Nunito', sans-serif;
  font-size: 13px;
  transition: border-color 0.15s, background 0.15s;
}

.volunteer-search-input::placeholder {
  color: var(--ink-3);
}

.volunteer-search-input:focus {
  outline: none;
  border-color: var(--mint);
  background: var(--surface-3);
  box-shadow: 0 0 0 3px rgba(78, 255, 197, 0.1);
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selector-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--ink-2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
}

.clear-btn {
  font-size: 12px;
  color: var(--blue);
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
}

.clear-btn:hover {
  color: var(--mint);
}

.volunteer-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.volunteer-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
}

.volunteer-item:hover {
  background: rgba(78, 255, 197, 0.08);
}

.volunteer-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: var(--mint);
}

.volunteer-name {
  font-size: 13px;
  color: var(--ink-2);
}

.volunteer-role {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  color: var(--ink-3);
  margin-left: 6px;
}

.volunteer-name mark {
  background: rgba(78, 255, 197, 0.3);
  color: var(--ink);
  font-weight: 600;
}

/* Message Input */
.message-input-section {
  padding: 18px 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--ink-2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
}

.message-textarea {
  width: 100%;
  min-height: 120px;
  padding: 12px;
  background: var(--surface-2);
  border: 1px solid var(--border-2);
  border-radius: 8px;
  color: var(--ink);
  font-family: 'Nunito', sans-serif;
  font-size: 13px;
  line-height: 1.5;
  resize: vertical;
  transition: border-color 0.15s, background 0.15s;
}

.message-textarea::placeholder {
  color: var(--ink-3);
}

.message-textarea:focus {
  outline: none;
  border-color: var(--mint);
  background: var(--surface-3);
  box-shadow: 0 0 0 3px rgba(78, 255, 197, 0.1);
}

.message-textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.input-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.char-count {
  font-size: 11px;
  color: var(--ink-3);
}

/* Send Button */
.send-btn {
  margin: 18px 20px 20px;
  padding: 12px 20px;
  background: linear-gradient(135deg, var(--mint), var(--teal-d));
  color: #0A1F18;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
  box-shadow: var(--glow-mint);
}

.send-btn:hover:not(:disabled) {
  filter: brightness(1.08);
  transform: translateY(-1px);
  box-shadow: 0 0 24px rgba(78, 255, 197, 0.4);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.inline-spinner {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid rgba(10, 31, 24, 0.3);
  border-top-color: #0A1F18;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px;
  color: var(--ink-3);
  font-size: 13px;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--border-2);
  border-top-color: var(--mint);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px;
  text-align: center;
  color: var(--ink-3);
}
</style>
