import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '../services/firebase'
import { collection, getDocs, addDoc, query, orderBy, limit, where, updateDoc, doc } from 'firebase/firestore'
import { useAuthStore } from './auth'

export const useRoundsHistoryStore = defineStore('roundsHistory', () => {
  const rounds = ref([])
  const loading = ref(false)

  /** Fetches rounds history with optional filters from Firestore. @returns {Promise<void>} */
  const fetchRounds = async (filters = {}) => {
    loading.value = true
    try {
      let q = query(collection(db, 'roundsHistory'), orderBy('createdAt', 'desc'), limit(filters.limit || 100))
      if (filters.shiftId) {
        q = query(collection(db, 'roundsHistory'), where('shiftId', '==', filters.shiftId), orderBy('createdAt', 'desc'), limit(50))
      }
      if (filters.volunteerId) {
        q = query(collection(db, 'roundsHistory'), where('volunteerId', '==', filters.volunteerId), orderBy('createdAt', 'desc'), limit(50))
      }
      const snap = await getDocs(q)
      rounds.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    } catch (e) {
      console.error('Failed to fetch rounds history:', e)
    } finally {
      loading.value = false
    }
  }

  /** Adds a round history entry to Firestore. @returns {Promise<Object>} */
  const addRound = async (roundData) => {
    const auth = useAuthStore()
    const entry = {
      ...roundData,
      volunteerId: roundData.volunteerId || auth.user?.uid,
      volunteerName: roundData.volunteerName || auth.user?.displayName || auth.user?.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    try {
      const ref = await addDoc(collection(db, 'roundsHistory'), entry)
      rounds.value.unshift({ id: ref.id, ...entry })
      return { id: ref.id, ...entry }
    } catch (e) {
      console.error('Failed to add round:', e)
      throw e
    }
  }

  /** Updates a round history entry in Firestore. @returns {Promise<void>} */
  const updateRound = async (roundId, updates) => {
    try {
      const roundRef = doc(db, 'roundsHistory', roundId)
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString(),
      }
      await updateDoc(roundRef, updateData)
      const index = rounds.value.findIndex(r => r.id === roundId)
      if (index !== -1) {
        rounds.value[index] = { ...rounds.value[index], ...updateData }
      }
    } catch (e) {
      console.error('Failed to update round:', e)
      throw e
    }
  }

  /** Soft-deletes a round history entry in Firestore. @returns {Promise<void>} */
  const deleteRound = async (roundId) => {
    try {
      // Soft delete by marking as deleted
      await updateRound(roundId, { deleted: true })
      rounds.value = rounds.value.filter(r => r.id !== roundId)
    } catch (e) {
      console.error('Failed to delete round:', e)
      throw e
    }
  }

  return { rounds, loading, fetchRounds, addRound, updateRound, deleteRound }
})
