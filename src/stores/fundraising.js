import { defineStore } from 'pinia'
import { ref } from 'vue'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, query } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuthStore } from './auth'

// Volunteer-facing fundraising ideas — the `fundraising` collection already
// existed in firestore.rules (staff/admin read+write) but had no page
// reading or writing it until now.
export const useFundraisingStore = defineStore('fundraising', () => {
  const ideas = ref([])
  const loading = ref(false)

  /** Fetches all fundraising ideas, newest first. @returns {Promise<Array>} */
  const fetchIdeas = async () => {
    loading.value = true
    try {
      const snap = await getDocs(query(collection(db, 'fundraising'), orderBy('createdAt', 'desc')))
      ideas.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      return ideas.value
    } catch (error) {
      console.error('Failed to fetch fundraising ideas:', error.message)
      return []
    } finally {
      loading.value = false
    }
  }

  /** Creates a fundraising idea. @returns {Promise<Object>} */
  const addIdea = async (data) => {
    loading.value = true
    try {
      const auth = useAuthStore()
      const entry = {
        ...data,
        createdBy: auth.user?.displayName || auth.user?.email || '',
        createdAt: new Date().toISOString(),
      }
      const docRef = await addDoc(collection(db, 'fundraising'), entry)
      const created = { id: docRef.id, ...entry }
      ideas.value.unshift(created)
      return created
    } catch (error) {
      console.error('Failed to add fundraising idea:', error.message)
      throw error
    } finally {
      loading.value = false
    }
  }

  /** Updates a fundraising idea. @returns {Promise<void>} */
  const updateIdea = async (id, data) => {
    loading.value = true
    try {
      await updateDoc(doc(db, 'fundraising', id), { ...data, updatedAt: new Date().toISOString() })
      const idx = ideas.value.findIndex(i => i.id === id)
      if (idx !== -1) ideas.value[idx] = { ...ideas.value[idx], ...data }
    } catch (error) {
      console.error('Failed to update fundraising idea:', error.message)
      throw error
    } finally {
      loading.value = false
    }
  }

  /** Deletes a fundraising idea. @returns {Promise<void>} */
  const deleteIdea = async (id) => {
    loading.value = true
    try {
      await deleteDoc(doc(db, 'fundraising', id))
      ideas.value = ideas.value.filter(i => i.id !== id)
    } catch (error) {
      console.error('Failed to delete fundraising idea:', error.message)
      throw error
    } finally {
      loading.value = false
    }
  }

  return { ideas, loading, fetchIdeas, addIdea, updateIdea, deleteIdea }
})
