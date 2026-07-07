import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '../services/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

export const useSettingsStore = defineStore('settings', () => {
  const contact = ref(null)
  const loading = ref(false)
  const error = ref(null)

  /** Fetches the settings/contact doc (staff contact info for the Training page). @returns {Promise<Object|null>} */
  const fetchContact = async () => {
    loading.value = true
    error.value = null
    try {
      const snap = await getDoc(doc(db, 'settings', 'contact'))
      contact.value = snap.exists() ? snap.data() : null
      return contact.value
    } catch (err) {
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  /** Creates/overwrites the settings/contact doc. @returns {Promise<void>} */
  const updateContact = async (data) => {
    try {
      await setDoc(doc(db, 'settings', 'contact'), data)
      contact.value = data
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  return { contact, loading, error, fetchContact, updateContact }
})
