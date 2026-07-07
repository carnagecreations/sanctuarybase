import { defineStore } from 'pinia'
import { ref } from 'vue'
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore'
import { db } from '../services/firebase'

export const useFeedingLogsStore = defineStore('feedingLogs', () => {
  const feedingLogs = ref([])
  const loading = ref(false)

  /** Fetches all feeding logs from Firestore. @returns {Promise<Array>} */
  const fetchFeedingLogs = async () => {
    loading.value = true
    try {
      const querySnapshot = await getDocs(collection(db, 'feedingLogs'))
      feedingLogs.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      return feedingLogs.value
    } catch (error) {
      console.error('Failed to fetch feeding logs:', error.message)
      return []
    } finally {
      loading.value = false
    }
  }

  /** Fetches feeding logs for a specific animal from Firestore. @returns {Promise<Array>} */
  const fetchLogsByAnimal = async (animalId) => {
    loading.value = true
    try {
      const q = query(collection(db, 'feedingLogs'), where('animalId', '==', animalId))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Failed to fetch logs for animal:', error.message)
      return []
    } finally {
      loading.value = false
    }
  }

  /** Fetches a specific feeding log by ID from Firestore. @returns {Promise<Object|null>} */
  const getFeedingLogById = async (id) => {
    try {
      const docSnap = await getDoc(doc(db, 'feedingLogs', id))
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() }
      }
      return null
    } catch (error) {
      console.error('Failed to fetch feeding log:', error.message)
      return null
    }
  }

  /** Creates a new feeding log in Firestore. @returns {Promise<Object>} */
  const addFeedingLog = async (logData) => {
    loading.value = true
    try {
      const docRef = await addDoc(collection(db, 'feedingLogs'), {
        ...logData,
        createdAt: new Date(),
      })
      const newLog = { id: docRef.id, ...logData }
      feedingLogs.value.push(newLog)
      return newLog
    } catch (error) {
      console.error('Failed to add feeding log:', error.message)
      throw error
    } finally {
      loading.value = false
    }
  }

  /** Updates an existing feeding log in Firestore. @returns {Promise<Object|null>} */
  const updateFeedingLog = async (id, logData) => {
    loading.value = true
    try {
      await updateDoc(doc(db, 'feedingLogs', id), {
        ...logData,
        updatedAt: new Date(),
      })
      const idx = feedingLogs.value.findIndex((log) => log.id === id)
      if (idx !== -1) {
        feedingLogs.value[idx] = { ...feedingLogs.value[idx], ...logData }
      }
      return feedingLogs.value[idx]
    } catch (error) {
      console.error('Failed to update feeding log:', error.message)
      return null
    } finally {
      loading.value = false
    }
  }

  /** Deletes a feeding log from Firestore. @returns {Promise<boolean>} */
  const deleteFeedingLog = async (id) => {
    loading.value = true
    try {
      await deleteDoc(doc(db, 'feedingLogs', id))
      const idx = feedingLogs.value.findIndex((log) => log.id === id)
      if (idx !== -1) {
        feedingLogs.value.splice(idx, 1)
      }
      return true
    } catch (error) {
      console.error('Failed to delete feeding log:', error.message)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    feedingLogs,
    loading,
    fetchFeedingLogs,
    fetchLogsByAnimal,
    getFeedingLogById,
    addFeedingLog,
    updateFeedingLog,
    deleteFeedingLog,
  }
})
