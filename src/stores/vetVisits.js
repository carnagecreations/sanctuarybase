import { defineStore } from 'pinia'
import { ref } from 'vue'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore'
import { db } from '../services/firebase'

// Vet appointments in the `animalvetvisits` collection (already allowed for
// staff/admin in firestore.rules). Equality-only query + client-side sort so
// no composite index is required.
export const useVetVisitsStore = defineStore('vetVisits', () => {
  const loading = ref(false)

  /** Fetches all appointments for an animal, soonest first. @returns {Promise<Array>} */
  const fetchByAnimalId = async (animalId) => {
    loading.value = true
    try {
      const q = query(collection(db, 'animalvetvisits'), where('animalId', '==', animalId))
      const snap = await getDocs(q)
      return snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
    } catch (error) {
      console.error('Failed to fetch vet appointments:', error.message)
      return []
    } finally {
      loading.value = false
    }
  }

  /** Creates an appointment. @returns {Promise<Object>} */
  const addVisit = async (visitData) => {
    loading.value = true
    try {
      const entry = { ...visitData, createdAt: new Date().toISOString() }
      const docRef = await addDoc(collection(db, 'animalvetvisits'), entry)
      return { id: docRef.id, ...entry }
    } catch (error) {
      console.error('Failed to add vet appointment:', error.message)
      throw error
    } finally {
      loading.value = false
    }
  }

  /** Updates an appointment. @returns {Promise<void>} */
  const updateVisit = async (id, visitData) => {
    loading.value = true
    try {
      await updateDoc(doc(db, 'animalvetvisits', id), {
        ...visitData,
        updatedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Failed to update vet appointment:', error.message)
      throw error
    } finally {
      loading.value = false
    }
  }

  /** Deletes an appointment. @returns {Promise<void>} */
  const deleteVisit = async (id) => {
    loading.value = true
    try {
      await deleteDoc(doc(db, 'animalvetvisits', id))
    } catch (error) {
      console.error('Failed to delete vet appointment:', error.message)
      throw error
    } finally {
      loading.value = false
    }
  }

  return { loading, fetchByAnimalId, addVisit, updateVisit, deleteVisit }
})
