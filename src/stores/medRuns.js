import { defineStore } from 'pinia'
import { ref } from 'vue'
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore'
import { db } from '../services/firebase'

export const useMedRunsStore = defineStore('medRuns', () => {
  const medRuns = ref([])
  const loading = ref(false)
  const selectedMedRun = ref(null)

  /** Fetches all medication runs from Firestore. @returns {Promise<Array>} */
  const fetchMedRuns = async () => {
    loading.value = true
    try {
      const querySnapshot = await getDocs(collection(db, 'medRuns'))
      medRuns.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      return medRuns.value
    } catch (error) {
      console.error('Failed to fetch medication runs:', error.message)
      return []
    } finally {
      loading.value = false
    }
  }

  /** Fetches a specific medication run by ID from Firestore. @returns {Promise<Object|null>} */
  const getMedRunById = async (id) => {
    try {
      const docSnap = await getDoc(doc(db, 'medRuns', id))
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() }
      }
      return null
    } catch (error) {
      console.error('Failed to fetch medication run:', error.message)
      return null
    }
  }

  /** Fetches medication runs for a specific animal from Firestore. @returns {Promise<Array>} */
  const getMedRunsByAnimal = async (animalId) => {
    try {
      const q = query(collection(db, 'medRuns'), where('animalId', '==', animalId))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Failed to fetch medication runs for animal:', error.message)
      return []
    }
  }

  /** Creates a new medication run in Firestore. @returns {Promise<Object>} */
  const addMedRun = async (medRunData) => {
    loading.value = true
    try {
      const docRef = await addDoc(collection(db, 'medRuns'), {
        ...medRunData,
        createdAt: new Date(),
        status: medRunData.status || 'pending'
      })
      const newMedRun = { id: docRef.id, ...medRunData }
      medRuns.value.push(newMedRun)
      return newMedRun
    } catch (error) {
      console.error('Failed to add medication run:', error.message)
      throw error
    } finally {
      loading.value = false
    }
  }

  /** Updates an existing medication run in Firestore. @returns {Promise<Object|null>} */
  const updateMedRun = async (id, medRunData) => {
    loading.value = true
    try {
      await updateDoc(doc(db, 'medRuns', id), {
        ...medRunData,
        updatedAt: new Date(),
      })
      const idx = medRuns.value.findIndex((m) => m.id === id)
      if (idx !== -1) {
        medRuns.value[idx] = { ...medRuns.value[idx], ...medRunData }
        return medRuns.value[idx]
      }
      return null
    } catch (error) {
      console.error('Failed to update medication run:', error.message)
      return null
    } finally {
      loading.value = false
    }
  }

  /** Deletes a medication run from Firestore. @returns {Promise<boolean>} */
  const deleteMedRun = async (id) => {
    loading.value = true
    try {
      await deleteDoc(doc(db, 'medRuns', id))
      medRuns.value = medRuns.value.filter((m) => m.id !== id)
      return true
    } catch (error) {
      console.error('Failed to delete medication run:', error.message)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    medRuns,
    loading,
    selectedMedRun,
    fetchMedRuns,
    getMedRunById,
    getMedRunsByAnimal,
    addMedRun,
    updateMedRun,
    deleteMedRun,
  }
})
