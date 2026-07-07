import { ref, computed } from 'vue'
import { fetchContacts, replyToContact, archiveContact, deleteContact, updateContactStatus } from '../services/contactsService'

// Only these subjects go through the approve/decline pipeline — donations,
// newsletter signups, and general messages don't have an "application" to
// review, they're just correspondence.
const APPLICATION_TYPES = ['adoption', 'volunteer', 'foster']

const submissions = ref([])
const archived = ref([])
const loading = ref(false)
const error = ref(null)
const lastSeen = ref(Number(localStorage.getItem('inbox_last_seen') || 0))

function parseType(subject) {
  const s = (subject || '').toLowerCase()
  if (s.includes('adopt')) return 'adoption'
  if (s.includes('volunteer')) return 'volunteer'
  if (s.includes('foster')) return 'foster'
  if (s.includes('car')) return 'car donation'
  if (s.includes('kind')) return 'in-kind'
  if (s.includes('donat')) return 'donation'
  if (s.includes('newsletter')) return 'newsletter'
  return 'general'
}

function mapContact(c) {
  const ms = new Date(c.createdAt).getTime()
  const type = parseType(c.subject)
  return {
    id: c.id,
    name: c.name,
    email: c.email,
    subject: c.subject,
    message: c.message,
    details: c.details || null,
    type,
    isApplication: APPLICATION_TYPES.includes(type),
    status: c.status || 'new',
    declineReason: c.declineReason || '',
    createdAtMs: isNaN(ms) ? 0 : ms,
    date: new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    replied: !!c.repliedAt,
    replyText: c.reply || '',
    archived: !!c.archived
  }
}

export function useContacts() {
  const loadContacts = async () => {
    loading.value = true
    error.value = null
    try {
      const contacts = await fetchContacts()
      const mapped = contacts.map(mapContact).sort((a, b) => b.createdAtMs - a.createdAtMs)
      submissions.value = mapped.filter(c => !c.archived)
      archived.value = mapped.filter(c => c.archived)
    } catch (err) {
      error.value = err.message
      console.error('Failed to load contacts:', err)
    } finally {
      loading.value = false
    }
  }

  const replyToSubmission = async (id, replyText) => {
    try {
      await replyToContact(id, replyText)
      const sub = submissions.value.find(s => s.id === id) || archived.value.find(s => s.id === id)
      if (sub) {
        sub.replied = true
        sub.replyText = replyText
      }
    } catch (err) {
      error.value = err.message
      console.error('Failed to reply:', err)
      throw err
    }
  }

  const archiveSubmission = async (id) => {
    try {
      await archiveContact(id, true)
      const idx = submissions.value.findIndex(s => s.id === id)
      if (idx !== -1) {
        const sub = submissions.value.splice(idx, 1)[0]
        sub.archived = true
        archived.value.unshift(sub)
      }
    } catch (err) {
      error.value = err.message
      console.error('Failed to archive:', err)
      throw err
    }
  }

  const restoreSubmission = async (id) => {
    try {
      await archiveContact(id, false)
      const idx = archived.value.findIndex(s => s.id === id)
      if (idx !== -1) {
        const sub = archived.value.splice(idx, 1)[0]
        sub.archived = false
        submissions.value.unshift(sub)
        submissions.value.sort((a, b) => b.createdAtMs - a.createdAtMs)
      }
    } catch (err) {
      error.value = err.message
      console.error('Failed to restore:', err)
      throw err
    }
  }

  const updateSubmissionStatus = async (id, status, declineReason) => {
    try {
      await updateContactStatus(id, status, declineReason)
      const sub = submissions.value.find(s => s.id === id) || archived.value.find(s => s.id === id)
      if (sub) {
        sub.status = status
        sub.declineReason = status === 'declined' ? (declineReason || '') : ''
      }
    } catch (err) {
      error.value = err.message
      console.error('Failed to update status:', err)
      throw err
    }
  }

  const deleteSubmission = async (id) => {
    try {
      await deleteContact(id)
      submissions.value = submissions.value.filter(s => s.id !== id)
      archived.value = archived.value.filter(s => s.id !== id)
    } catch (err) {
      error.value = err.message
      console.error('Failed to delete:', err)
      throw err
    }
  }

  // Mark the inbox as seen — clears the unread badge
  const markInboxSeen = () => {
    const now = Date.now()
    lastSeen.value = now
    localStorage.setItem('inbox_last_seen', String(now))
  }

  // Unread = pending (non-archived) submissions newer than the last time the inbox was opened
  const unreadCount = computed(() =>
    submissions.value.filter(s => s.createdAtMs > lastSeen.value).length
  )

  return {
    submissions,
    archived,
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    unreadCount,
    loadContacts,
    replyToSubmission,
    archiveSubmission,
    restoreSubmission,
    updateSubmissionStatus,
    deleteSubmission,
    markInboxSeen
  }
}
