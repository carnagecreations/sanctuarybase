import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '../services/firebase'
import {
  collection,
  getDocs,
  addDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  where,
  deleteDoc
} from 'firebase/firestore'
import { usePeopleStore } from './people'
import { authHeaders } from '../services/siteApi'

export const useMessagesStore = defineStore('messages', () => {
  const messages = ref([])
  const loading = ref(false)
  const error = ref(null)

  /** Fetches all messages from Firestore. @returns {Promise<void>} */
  const fetchMessages = async () => {
    loading.value = true
    error.value = null
    try {
      const q = query(
        collection(db, 'messages'),
        orderBy('sentAt', 'desc')
      )
      const snapshot = await getDocs(q)
      messages.value = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }))
    } catch (err) {
      error.value = err.message
      console.error('Failed to fetch messages:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Sends a message: records it in Firestore for the sender's history, and
   * actually emails each recipient via the same /api/send-reminder endpoint
   * Reminders already uses. Without this, "Send Message" only wrote a
   * Firestore doc that nothing ever showed to the recipient — nobody
   * actually received anything.
   * @returns {Promise<{id: string, emailedCount: number, failedEmails: string[]}>}
   */
  const sendMessage = async (text, recipientIds, recipientType = 'specific', recipientEmails = []) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
      const sentBy = currentUser.email || 'admin'

      const messageData = {
        text,
        sentBy,
        sentAt: serverTimestamp(),
        recipientType, // 'all', 'online', 'staff-admin', or 'specific'
        recipients: recipientIds || [],
        read: false
      }

      const docRef = await addDoc(collection(db, 'messages'), messageData)

      messages.value.unshift({
        id: docRef.id,
        ...messageData,
        sentAt: new Date()
      })

      const uniqueEmails = [...new Set((recipientEmails || []).filter(Boolean))]
      const failedEmails = []
      await Promise.all(uniqueEmails.map(async (to) => {
        try {
          const resp = await fetch('/api/send-reminder', {
            method: 'POST',
            headers: await authHeaders(),
            body: JSON.stringify({ to, subject: 'New message from SanctuaryBase', body: text, type: 'volunteer' }),
          })
          if (!resp.ok) failedEmails.push(to)
        } catch {
          failedEmails.push(to)
        }
      }))

      return { id: docRef.id, emailedCount: uniqueEmails.length - failedEmails.length, failedEmails }
    } catch (err) {
      error.value = err.message
      console.error('Failed to send message:', err)
      throw err
    }
  }

  /** Fetches all volunteers from people store (cached). @returns {Promise<Array>} */
  const getVolunteers = async () => {
    try {
      const peopleStore = usePeopleStore()
      if (peopleStore.people.length === 0) {
        await peopleStore.fetchPeople()
      }
      return peopleStore.getPeopleByType('volunteer')
    } catch (err) {
      console.error('Failed to fetch volunteers:', err)
      return []
    }
  }

  // Staff/admin accounts live in `users` (role field), not the `people` CRM
  // collection — that's where donors/fosters/adopters live, and it has no
  // notion of a login role at all.
  /** Fetches all staff and admin accounts. @returns {Promise<Array>} */
  const getStaffAndAdmin = async () => {
    try {
      const q = query(collection(db, 'users'), where('role', 'in', ['staff', 'admin']))
      const snap = await getDocs(q)
      return snap.docs.map(d => ({
        id: d.id,
        name: d.data().name || d.data().email || 'Unknown',
        email: d.data().email || '',
        role: d.data().role,
      }))
    } catch (err) {
      console.error('Failed to fetch staff/admin:', err)
      return []
    }
  }

  /** Deletes a message from Firestore. @returns {Promise<void>} */
  const deleteMessage = async (messageId) => {
    try {
      await deleteDoc(doc(db, 'messages', messageId))
      // Remove from local state
      messages.value = messages.value.filter(msg => msg.id !== messageId)
    } catch (err) {
      error.value = err.message
      console.error('Failed to delete message:', err)
      throw err
    }
  }

  return {
    messages,
    loading,
    error,
    fetchMessages,
    sendMessage,
    getVolunteers,
    getStaffAndAdmin,
    deleteMessage
  }
})
