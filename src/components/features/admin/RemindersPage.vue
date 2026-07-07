<template>
  <PageContainer>
    <div class="space-y-4">
      <div class="page-header">
        <h2 class="page-title">Reminders</h2>
        <AppButton variant="primary" size="sm" @click="showAddForm = !showAddForm">+ New Reminder</AppButton>
      </div>

      <!-- Add form -->
      <div v-if="showAddForm" class="form-card">
        <div class="form-card-header">
          <span>Send a Reminder</span>
          <button class="form-close" @click="showAddForm = false">✕</button>
        </div>

        <!-- Type selector -->
        <div class="form-group">
          <div class="field-label">Reminder Type</div>
          <div class="type-chips">
            <button
              v-for="rt in reminderTypes"
              :key="rt.value"
              class="type-chip"
              :class="{ active: newReminder.type === rt.value }"
              @click="newReminder.type = rt.value"
            >
              {{ rt.icon }} {{ rt.label }}
            </button>
          </div>
        </div>

        <!-- Recipient -->
        <div class="form-group">
          <div class="field-label">Send To</div>
          <div class="recipient-select">
            <select v-model="recipientMode" class="form-input">
              <option value="email">Enter email manually</option>
              <option value="person">Select from People</option>
            </select>
          </div>
          <input v-if="recipientMode === 'email'" v-model="newReminder.to" type="email" class="form-input" placeholder="recipient@email.com" />
          <select v-else v-model="newReminder.to" class="form-input">
            <option value="">Select person...</option>
            <option v-for="p in peopleWithEmail" :key="p.id" :value="p.email">
              {{ p.name }} ({{ p.email }})
            </option>
          </select>
        </div>

        <div class="form-group">
          <div class="field-label">Subject</div>
          <input v-model="newReminder.subject" type="text" class="form-input" :placeholder="subjectPlaceholder" />
        </div>

        <div class="form-group">
          <div class="field-label">Message</div>
          <textarea v-model="newReminder.body" class="form-textarea" rows="5" :placeholder="bodyPlaceholder" />
        </div>

        <!-- Quick templates -->
        <div class="form-group">
          <div class="field-label">Quick Templates</div>
          <div class="template-chips">
            <button v-for="tpl in templates[newReminder.type]" :key="tpl.label" class="tpl-btn" @click="applyTemplate(tpl)">
              {{ tpl.label }}
            </button>
          </div>
        </div>

        <div class="form-actions">
          <AppButton variant="primary" @click="sendReminder" :disabled="sending">
            {{ sending ? '⏳ Sending...' : '📧 Send Reminder' }}
          </AppButton>
          <AppButton variant="secondary" @click="showAddForm = false">Cancel</AppButton>
        </div>
      </div>

      <!-- Recent reminders -->
      <SectionLabel>Recent Reminders Sent</SectionLabel>
      <div v-if="sentReminders.length" class="reminder-list">
        <div v-for="r in sentReminders" :key="r.id" class="reminder-row">
          <div class="rr-icon">{{ getTypeIcon(r.type) }}</div>
          <div class="rr-body">
            <div class="rr-subject">{{ r.subject }}</div>
            <div class="rr-to">To: {{ r.to }}</div>
            <div class="rr-time">{{ formatTime(r.sentAt) }}</div>
          </div>
          <div class="rr-badge" :class="r.type">{{ r.type }}</div>
        </div>
      </div>
      <EmptyState v-else icon="📧" title="No reminders sent yet" message="Use the form above to send your first reminder." />

      <!-- Quick reminder suggestions -->
      <SectionLabel>Suggested Actions</SectionLabel>
      <AppCard v-for="suggestion in suggestions" :key="suggestion.label" noPad>
        <div class="suggestion-row">
          <div class="sug-icon">{{ suggestion.icon }}</div>
          <div class="sug-body">
            <div class="sug-label">{{ suggestion.label }}</div>
            <div class="sug-desc">{{ suggestion.desc }}</div>
          </div>
          <AppButton size="sm" variant="secondary" @click="preloadSuggestion(suggestion)">Send</AppButton>
        </div>
      </AppCard>
    </div>
  </PageContainer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { PageContainer, AppCard, AppButton, SectionLabel, EmptyState } from '../../ui'
import { usePeopleStore } from '../../../stores/people'
import { useUIStore } from '../../../stores/ui'
import { authHeaders } from '../../../services/siteApi'

const peopleStore = usePeopleStore()
const ui = useUIStore()

const showAddForm = ref(false)
const sending = ref(false)
const recipientMode = ref('email')
const sentReminders = ref([])

const reminderTypes = [
  { value: 'vaccine', label: 'Vaccine Due', icon: '💉' },
  { value: 'foster', label: 'Foster Update', icon: '🏠' },
  { value: 'volunteer', label: 'Volunteer', icon: '🤝' },
  { value: 'donor', label: 'Donor', icon: '💝' },
  { value: 'general', label: 'General', icon: '📢' },
]

const newReminder = ref({ type: 'general', to: '', subject: '', body: '' })

const templates = {
  vaccine: [
    { label: 'Vaccine Due Soon', subject: 'Vaccine Due Reminder', body: 'This is a reminder that a vaccine is coming due for one of our animals in your care. Please contact us to schedule an appointment.' },
    { label: 'Overdue Notice', subject: 'Vaccine Overdue - Action Required', body: 'A vaccine has become overdue for an animal in your care. Please reach out immediately so we can get this scheduled.' },
  ],
  foster: [
    { label: 'Check-in Request', subject: 'Foster Check-in', body: "Hi! We're checking in on how things are going with your foster. Please reply with a quick update on their eating, behavior, and overall health." },
    { label: 'Agreement Expiring', subject: 'Foster Agreement Expiring Soon', body: 'Your current foster agreement is expiring soon. Please contact us to discuss next steps for your foster animal.' },
  ],
  volunteer: [
    { label: 'Shift Reminder', subject: 'Upcoming Shift Reminder', body: "Just a reminder that you have a volunteer shift coming up. We're grateful for your time and dedication!" },
    { label: 'Waiver Needed', subject: 'Volunteer Waiver Required', body: "We don't have a signed waiver on file for you. Please complete and return your volunteer waiver before your next shift." },
  ],
  donor: [
    { label: 'Thank You', subject: 'Thank You for Your Support!', body: 'Thank you so much for your generous donation. Your support directly helps us care for animals in need. We are truly grateful.' },
    { label: 'Lapsed Donor', subject: "We Miss You!", body: "It's been a while since we've heard from you. Our animals still need your help. Any amount makes a difference!" },
  ],
  general: [
    { label: 'General Update', subject: 'Update from SanctuaryBase', body: '' },
  ],
}

const subjectPlaceholder = computed(() => templates[newReminder.value.type]?.[0]?.subject || 'Subject...')
const bodyPlaceholder = computed(() => 'Write your message here...')

const peopleWithEmail = computed(() => (Array.isArray(peopleStore.people) ? peopleStore.people : []).filter(p => p.email))

const getTypeIcon = (type) => reminderTypes.find(r => r.value === type)?.icon || '📧'

const suggestions = computed(() => {
  const items = []
  const fosters = peopleStore.getPeopleByType('foster')
  if (fosters.length) items.push({ icon: '🏠', label: `Send check-in to ${fosters.length} fosters`, desc: 'Monthly foster check-in request', type: 'foster', template: 'Check-in Request' })
  const donors = peopleStore.getPeopleByType('donor')
  if (donors.length) items.push({ icon: '💝', label: `Thank ${donors.length} donors`, desc: 'Send a thank-you to all donors', type: 'donor', template: 'Thank You' })
  return items
})

const applyTemplate = (tpl) => {
  newReminder.value.subject = tpl.subject
  newReminder.value.body = tpl.body
}

const preloadSuggestion = (sug) => {
  newReminder.value.type = sug.type
  const tpl = templates[sug.type]?.find(t => t.label === sug.template)
  if (tpl) applyTemplate(tpl)
  showAddForm.value = true
}

const formatTime = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

const sendReminder = async () => {
  if (!newReminder.value.to || !newReminder.value.subject || !newReminder.value.body) {
    ui.showToast('Please fill in all fields', 'error')
    return
  }
  sending.value = true
  try {
    const resp = await fetch('/api/send-reminder', {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify(newReminder.value),
    })
    const data = await resp.json()
    if (data.success) {
      sentReminders.value.unshift({ id: Date.now(), ...newReminder.value, sentAt: new Date().toISOString() })
      newReminder.value = { type: 'general', to: '', subject: '', body: '' }
      showAddForm.value = false
      ui.showToast('Reminder sent successfully!')
    } else {
      ui.showToast(data.error || 'Failed to send', 'error')
    }
  } catch {
    ui.showToast('Error sending reminder', 'error')
  } finally {
    sending.value = false
  }
}

onMounted(() => peopleStore.fetchPeople())
</script>

<style scoped>
.space-y-4 > * + * { margin-top: 16px; }
.page-header { display: flex; justify-content: space-between; align-items: center; }
.page-title { font-size: 20px; font-weight: 800; color: var(--ink); margin: 0; }

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

.type-chips { display: flex; gap: 6px; flex-wrap: wrap; }
.type-chip {
  padding: 6px 12px; background: var(--surface-2); border: 1.5px solid var(--border);
  border-radius: 20px; color: var(--ink-2); font-size: 11px; font-weight: 700;
  cursor: pointer; transition: all .15s;
}
.type-chip:hover { border-color: var(--mint); }
.type-chip.active { background: var(--mint); border-color: var(--mint); color: var(--bg); }

.recipient-select { margin-bottom: 8px; }

.template-chips { display: flex; gap: 6px; flex-wrap: wrap; }
.tpl-btn {
  padding: 5px 10px; background: var(--surface-2); border: 1px solid var(--border);
  border-radius: 12px; color: var(--ink-3); font-size: 10px; font-weight: 700;
  cursor: pointer; transition: all .15s;
}
.tpl-btn:hover { border-color: var(--mint); color: var(--ink); }

.form-actions { display: flex; gap: 8px; }

.reminder-list { display: flex; flex-direction: column; gap: 6px; }
.reminder-row {
  display: flex; align-items: center; gap: 10px; padding: 12px;
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--r);
}
.rr-icon { font-size: 24px; }
.rr-body { flex: 1; }
.rr-subject { font-size: 12px; font-weight: 800; color: var(--ink); margin-bottom: 2px; }
.rr-to { font-size: 11px; color: var(--ink-3); }
.rr-time { font-size: 10px; color: var(--ink-3); margin-top: 2px; }
.rr-badge {
  font-size: 9px; font-weight: 800; padding: 3px 8px;
  border-radius: 10px; text-transform: uppercase;
  background: rgba(78,255,197,.1); color: var(--mint);
}

.suggestion-row {
  display: flex; align-items: center; gap: 12px; padding: 12px;
}
.sug-icon { font-size: 28px; }
.sug-body { flex: 1; }
.sug-label { font-size: 12px; font-weight: 800; color: var(--ink); }
.sug-desc { font-size: 11px; color: var(--ink-3); margin-top: 2px; }
</style>
