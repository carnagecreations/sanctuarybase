import { defineStore } from 'pinia'
import { ref } from 'vue'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../services/firebase'

export const useOutcomesStore = defineStore('outcomes', () => {
  const outcomes = ref([])
  const loading = ref(false)

  /** Fetches all outcomes from Firestore. @returns {Promise<Array>} */
  const fetchOutcomes = async () => {
    loading.value = true
    try {
      const querySnapshot = await getDocs(collection(db, 'outcomes'))
      outcomes.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      return outcomes.value
    } catch (error) {
      console.error('Failed to fetch outcomes:', error.message)
      return []
    } finally {
      loading.value = false
    }
  }

  /** Creates a new outcome in Firestore. @returns {Promise<Object>} */
  const addOutcome = async (outcomeData) => {
    loading.value = true
    try {
      const docRef = await addDoc(collection(db, 'outcomes'), {
        ...outcomeData,
        createdAt: new Date().toISOString(),
      })
      const newOutcome = { id: docRef.id, ...outcomeData }
      outcomes.value.unshift(newOutcome)
      return newOutcome
    } catch (error) {
      console.error('Failed to add outcome:', error.message)
      throw error
    } finally {
      loading.value = false
    }
  }

  /** Updates an existing outcome in Firestore. @returns {Promise<Object|null>} */
  const updateOutcome = async (id, outcomeData) => {
    loading.value = true
    try {
      await updateDoc(doc(db, 'outcomes', id), outcomeData)
      const idx = outcomes.value.findIndex(o => o.id === id)
      if (idx !== -1) {
        outcomes.value[idx] = { ...outcomes.value[idx], ...outcomeData }
      }
      return outcomes.value[idx]
    } catch (error) {
      console.error('Failed to update outcome:', error.message)
      throw error
    } finally {
      loading.value = false
    }
  }

  /** Deletes an outcome from Firestore. @returns {Promise<void>} */
  const deleteOutcome = async (id) => {
    loading.value = true
    try {
      await deleteDoc(doc(db, 'outcomes', id))
      outcomes.value = outcomes.value.filter(o => o.id !== id)
    } catch (error) {
      console.error('Failed to delete outcome:', error.message)
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    outcomes,
    loading,
    fetchOutcomes,
    addOutcome,
    updateOutcome,
    deleteOutcome,
  }
})
