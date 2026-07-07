<template>
  <div class="space-y-4">
    <!-- QR Code Section -->
    <div>
      <SectionLabel>Share Profile</SectionLabel>
      <AppCard>
        <div class="qr-section">
          <div class="qr-container">
            <QRCode :value="animalQRLink" :size="120" level="H" />
          </div>
          <div class="qr-info">
            <div class="qr-label">Animal Profile</div>
            <div class="qr-desc">Scan to view {{ animal.name }}'s profile</div>
            <AppButton variant="secondary" size="sm" @click="copyQRLink" class="mt-3">📋 Copy Link</AppButton>
          </div>
        </div>
      </AppCard>
    </div>

    <!-- Log New Meet -->
    <div>
      <SectionLabel>Log Meet & Greet</SectionLabel>
      <AppCard>
        <div class="form-group space-y-3">
          <div class="anon-toggle">
            <label class="anon-check">
              <input type="checkbox" v-model="newMeet.isAnonymous" />
              <span>Log anonymously</span>
            </label>
            <span v-if="newMeet.isAnonymous" class="anon-note">No sign-in required</span>
          </div>
          <AppInput v-if="!newMeet.isAnonymous" v-model="newMeet.person" placeholder="Your name (optional)" />
          <AppInput v-model="newMeet.notes" placeholder="Notes about the interaction..." />
          <AppSelect v-model="newMeet.result" :options="resultOptions" label="Outcome" />
          <AppButton variant="primary" @click="addMeet">✓ Log Meet</AppButton>
        </div>
      </AppCard>
    </div>

    <!-- Meet History -->
    <div>
      <SectionLabel>Meet & Greet History</SectionLabel>
      <AppCard :flat="true">
        <div v-if="meets.length" class="divide-list">
          <div v-for="m in meets" :key="m.id" class="meet-card-wrapper">
            <div class="meet-card">
              <div class="meet-header">
                <div>
                  <div class="meet-person">👤 {{ m.person }}</div>
                  <div class="meet-date">{{ formatDate(m.date) }}</div>
                </div>
                <AppBadge :type="m.result === 'successful' ? 'success' : m.result === 'hold' ? 'info' : 'low'">
                  {{ m.result }}
                </AppBadge>
              </div>
              <div class="meet-notes">{{ m.notes }}</div>
            </div>
            <div class="meet-actions">
              <button class="action-btn" @click="editMeet(m)" title="Edit">✏️</button>
              <button class="action-btn danger" @click="deleteMeet(m.id)" title="Delete">🗑</button>
            </div>
          </div>
        </div>
        <EmptyState v-else icon="🤝" title="No meet & greets" message="Log adoption meet & greets above." />
      </AppCard>
    </div>

    <!-- Edit Meet Modal -->
    <AppModal v-if="showEditModal" :open="true" :title="editingMeet ? 'Edit Meet & Greet' : 'New Meet & Greet'" size="sm" @close="closeEditModal">
      <div class="form-group space-y-3">
        <div class="anon-toggle">
          <label class="anon-check">
            <input type="checkbox" v-model="meetForm.isAnonymous" />
            <span>Log anonymously</span>
          </label>
          <span v-if="meetForm.isAnonymous" class="anon-note">No sign-in required</span>
        </div>
        <AppInput v-if="!meetForm.isAnonymous" v-model="meetForm.person" placeholder="Your name (optional)" />
        <AppInput v-model="meetForm.date" type="date" label="Date" />
        <AppInput v-model="meetForm.notes" placeholder="Notes about the interaction..." />
        <AppSelect v-model="meetForm.result" :options="resultOptions" label="Outcome" />
      </div>
      <template #actions>
        <AppButton @click="closeEditModal">Cancel</AppButton>
        <AppButton variant="primary" @click="saveMeet">{{ editingMeet ? 'Update' : 'Add' }} Meet</AppButton>
      </template>
    </AppModal>

    <!-- Testimonials -->
    <div>
      <SectionLabel>Testimonials</SectionLabel>
      <AppCard>
        <div class="form-group space-y-3">
          <AppInput v-model="newTestimonial.quote" placeholder="What did the adopter or foster say?" />
          <AppInput v-model="newTestimonial.person" placeholder="Who said it (e.g. The Martinez Family)" />
          <AppButton variant="primary" @click="addTestimonial">✓ Add Testimonial</AppButton>
        </div>
      </AppCard>
      <AppCard :flat="true">
        <div v-if="testimonials.length" class="divide-list">
          <div v-for="t in testimonials" :key="t.id" class="testimonial-wrapper">
            <div class="testimonial">
              <div class="testimonial-quote">"{{ t.quote }}"</div>
              <div class="testimonial-by">— {{ t.person }}</div>
            </div>
            <button class="action-btn danger" @click="deleteTestimonial(t.id)" title="Delete">🗑</button>
          </div>
        </div>
        <EmptyState v-else icon="⭐" title="No testimonials" message="Share stories and updates from adopters." />
      </AppCard>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import QRCode from 'qrcode.vue'
import { AppCard, SectionLabel, EmptyState, AppBadge, AppButton, AppInput, AppSelect, AppModal } from '../../ui'
import { useUIStore } from '../../../stores/ui'
import { useAnimalRecordsStore } from '../../../stores/animalRecords'

const props = defineProps({
  animal: { type: Object, required: true }
})

const ui = useUIStore()
const recordsStore = useAnimalRecordsStore()

const resultOptions = [
  { label: 'Successful', value: 'successful' },
  { label: 'Good fit', value: 'fit' },
  { label: 'Hold for 24h', value: 'hold' },
  { label: 'Not a match', value: 'nomatch' },
]

const newMeet = ref({
  person: '',
  notes: '',
  result: 'successful',
  isAnonymous: false,
})

const meets = ref([])
const testimonials = ref([])
const newTestimonial = ref({ quote: '', person: '' })

onMounted(async () => {
  if (!props.animal?.id) return
  meets.value = await recordsStore.fetchByAnimalId(props.animal.id, 'meet')
  testimonials.value = await recordsStore.fetchByAnimalId(props.animal.id, 'testimonial')
})

const showEditModal = ref(false)
const editingMeet = ref(null)
const meetForm = ref({ date: '', person: '', notes: '', result: 'successful', isAnonymous: false })

const animalQRLink = `https://sanctuarybase-v2.pages.dev/?animal=${props.animal.name || 'animal'}`

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const addMeet = async () => {
  if (!newMeet.value.notes) return
  if (!props.animal?.id) {
    ui.showToast('Select a real animal first', 'error')
    return
  }
  try {
    const created = await recordsStore.addRecord(props.animal.id, 'meet', {
      date: new Date().toISOString().split('T')[0],
      person: newMeet.value.isAnonymous ? 'Anonymous' : (newMeet.value.person || 'Anonymous'),
      notes: newMeet.value.notes,
      result: newMeet.value.result,
    })
    meets.value.unshift(created)
    newMeet.value = { person: '', notes: '', result: 'successful', isAnonymous: false }
    ui.showToast('Meet logged')
  } catch (err) {
    ui.showToast('Failed to log meet', 'error')
  }
}

const editMeet = (meet) => {
  editingMeet.value = meet
  meetForm.value = { ...meet }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editingMeet.value = null
  meetForm.value = { date: '', person: '', notes: '', result: 'successful', isAnonymous: false }
}

const saveMeet = async () => {
  if (!meetForm.value.notes.trim()) {
    ui.showToast('Notes are required', 'error')
    return
  }
  try {
    const data = {
      date: meetForm.value.date,
      person: meetForm.value.isAnonymous ? 'Anonymous' : (meetForm.value.person || 'Anonymous'),
      notes: meetForm.value.notes,
      result: meetForm.value.result,
    }
    await recordsStore.updateRecord(editingMeet.value.id, data)
    const idx = meets.value.findIndex(m => m.id === editingMeet.value.id)
    if (idx !== -1) meets.value[idx] = { ...meets.value[idx], ...data }
    ui.showToast('Meet updated')
    closeEditModal()
  } catch (err) {
    ui.showToast('Failed to update meet', 'error')
  }
}

const deleteMeet = async (id) => {
  if (!confirm('Delete this meet & greet entry?')) return
  try {
    await recordsStore.deleteRecord(id)
    meets.value = meets.value.filter(m => m.id !== id)
    ui.showToast('Meet deleted')
  } catch (err) {
    ui.showToast('Failed to delete meet', 'error')
  }
}

const addTestimonial = async () => {
  if (!newTestimonial.value.quote.trim()) {
    ui.showToast('Testimonial text is required', 'error')
    return
  }
  if (!props.animal?.id) {
    ui.showToast('Select a real animal first', 'error')
    return
  }
  try {
    const created = await recordsStore.addRecord(props.animal.id, 'testimonial', {
      quote: newTestimonial.value.quote,
      person: newTestimonial.value.person || 'Anonymous',
    })
    testimonials.value.unshift(created)
    newTestimonial.value = { quote: '', person: '' }
    ui.showToast('Testimonial added')
  } catch (err) {
    ui.showToast('Failed to add testimonial', 'error')
  }
}

const deleteTestimonial = async (id) => {
  if (!confirm('Delete this testimonial?')) return
  try {
    await recordsStore.deleteRecord(id)
    testimonials.value = testimonials.value.filter(t => t.id !== id)
    ui.showToast('Testimonial deleted')
  } catch (err) {
    ui.showToast('Failed to delete testimonial', 'error')
  }
}

const copyQRLink = () => {
  navigator.clipboard.writeText(animalQRLink)
  ui.showToast('Link copied!')
}
</script>

<style scoped>
.space-y-4 > * + * { margin-top: 16px; }

.qr-section {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 12px 0;
}

.qr-container {
  flex-shrink: 0;
  padding: 16px;
  background: white;
  border-radius: 8px;
}

.qr-info {
  flex: 1;
}

.qr-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 4px;
}

.qr-desc {
  font-size: 12px;
  color: var(--ink-3);
  margin-bottom: 10px;
}

.form-group {
  padding: 4px 0;
}

.divide-list > * + * { border-top: 1px solid var(--border); padding-top: 12px; }
.divide-list > *:first-child { padding-top: 0; }
.divide-list > *:last-child { padding-bottom: 0; }

.meet-card {
  padding: 12px 0;
}

.meet-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 6px;
  gap: 8px;
}

.meet-person {
  font-size: 12px;
  font-weight: 700;
  color: var(--ink);
}

.meet-date {
  font-size: 11px;
  color: var(--ink-3);
  font-weight: 600;
  margin-top: 2px;
}

.meet-notes {
  font-size: 11px;
  color: var(--ink-3);
}

.testimonial-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.testimonial {
  flex: 1;
  padding: 12px 0;
}

.testimonial-quote {
  font-size: 12px;
  color: var(--ink-2);
  font-style: italic;
  margin-bottom: 6px;
}

.testimonial-by {
  font-size: 11px;
  color: var(--ink-3);
  font-weight: 600;
}

.mt-3 { margin-top: 12px; }

.anon-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.anon-check {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  color: var(--ink-2);
}

.anon-check input {
  accent-color: var(--mint);
  cursor: pointer;
}

.anon-note {
  font-size: 11px;
  color: var(--ink-3);
  font-weight: 600;
}

.meet-card-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 0;
}

.meet-actions {
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

.space-y-3 > * + * { margin-top: 12px; }
</style>
