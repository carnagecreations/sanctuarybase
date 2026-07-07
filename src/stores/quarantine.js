import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '../services/firebase'
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  where,
  orderBy
} from 'firebase/firestore'

export const useQuarantineStore = defineStore('quarantine', () => {
  const quarantines = ref([])
  const loading = ref(false)
  const error = ref(null)

  /** Fetches all quarantine records from Firestore. @returns {Promise<Array>} */
  const fetchAll = async () => {
    loading.value = true
    error.value = null
    try {
      const q = query(
        collection(db, 'quarantine'),
        orderBy('startDate', 'desc')
      )
      const snapshot = await getDocs(q)
      quarantines.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      return quarantines.value
    } catch (err) {
      error.value = err.message
      console.error('Failed to fetch quarantines:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  /** Fetches active quarantine records from Firestore. @returns {Promise<Array>} */
  const fetchActive = async () => {
    loading.value = true
    error.value = null
    try {
      const q = query(
        collection(db, 'quarantine'),
        where('status', '==', 'active'),
        orderBy('startDate', 'desc')
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (err) {
      error.value = err.message
      console.error('Failed to fetch active quarantines:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  /** Creates a new quarantine record in Firestore. @returns {Promise<string>} */
  const addQuarantine = async (data) => {
    try {
      const docRef = await addDoc(collection(db, 'quarantine'), {
        ...data,
        status: 'active',
        actualEndDate: null,
        startDate: serverTimestamp(),
        createdAt: serverTimestamp()
      })
      const newQuarantine = {
        id: docRef.id,
        ...data,
        status: 'active',
        actualEndDate: null,
        startDate: new Date()
      }
      quarantines.value.unshift(newQuarantine)
      return docRef.id
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  /** Marks a quarantine as completed in Firestore. @returns {Promise<void>} */
  const completeQuarantine = async (id, notes = '') => {
    try {
      await updateDoc(doc(db, 'quarantine', id), {
        status: 'completed',
        actualEndDate: serverTimestamp(),
        notes: notes || ''
      })
      const idx = quarantines.value.findIndex(q => q.id === id)
      if (idx !== -1) {
        quarantines.value[idx] = {
          ...quarantines.value[idx],
          status: 'completed',
          actualEndDate: new Date(),
          notes: notes || ''
        }
      }
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  /** Updates quarantine notes in Firestore. @returns {Promise<void>} */
  const updateNotes = async (id, notes) => {
    try {
      await updateDoc(doc(db, 'quarantine', id), { notes })
      const idx = quarantines.value.findIndex(q => q.id === id)
      if (idx !== -1) {
        quarantines.value[idx] = { ...quarantines.value[idx], notes }
      }
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  /** Gets quarantine records for an animal from local state. @returns {Array} */
  const getByAnimalId = (animalId) => {
    return quarantines.value.filter(q => q.animalId === animalId)
  }

  return {
    quarantines,
    loading,
    error,
    fetchAll,
    fetchActive,
    addQuarantine,
    completeQuarantine,
    updateNotes,
    getByAnimalId
  }
})
