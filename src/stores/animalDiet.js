import { defineStore } from 'pinia'
import { ref } from 'vue'
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore'
import { db } from '../services/firebase'

export const useAnimalDietStore = defineStore('animalDiet', () => {
  const dietRecords = ref([])
  const loading = ref(false)

  /** Fetches diet records for a specific animal from Firestore. @returns {Promise<Array>} */
  const fetchFoodByAnimalId = async (animalId) => {
    loading.value = true
    try {
      const q = query(collection(db, 'animalDiet'), where('animalId', '==', animalId))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Failed to fetch diet records:', error.message)
      return []
    } finally {
      loading.value = false
    }
  }

  /** Fetches a specific diet record by ID from Firestore. @returns {Promise<Object|null>} */
  const getDietById = async (id) => {
    try {
      const docSnap = await getDoc(doc(db, 'animalDiet', id))
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() }
      }
      return null
    } catch (error) {
      console.error('Failed to fetch diet record:', error.message)
      return null
    }
  }

  /** Creates a new diet record in Firestore. @returns {Promise<Object>} */
  const addDiet = async (dietData) => {
    loading.value = true
    try {
      const docRef = await addDoc(collection(db, 'animalDiet'), {
        ...dietData,
        dateCreated: new Date(),
        lastModified: new Date(),
      })
      const newDiet = { id: docRef.id, ...dietData }
      dietRecords.value.push(newDiet)
      return newDiet
    } catch (error) {
      console.error('Failed to add diet record:', error.message)
      throw error
    } finally {
      loading.value = false
    }
  }

  /** Updates an existing diet record in Firestore. @returns {Promise<Object|null>} */
  const updateDiet = async (id, dietData) => {
    loading.value = true
    try {
      await updateDoc(doc(db, 'animalDiet', id), {
        ...dietData,
        lastModified: new Date(),
      })
      const idx = dietRecords.value.findIndex((d) => d.id === id)
      if (idx !== -1) {
        dietRecords.value[idx] = { ...dietRecords.value[idx], ...dietData }
      }
      return dietRecords.value[idx]
    } catch (error) {
      console.error('Failed to update diet record:', error.message)
      throw error
    } finally {
      loading.value = false
    }
  }

  /** Deletes a diet record from Firestore. @returns {Promise<void>} */
  const deleteDiet = async (id) => {
    loading.value = true
    try {
      await deleteDoc(doc(db, 'animalDiet', id))
      const idx = dietRecords.value.findIndex((d) => d.id === id)
      if (idx !== -1) {
        dietRecords.value.splice(idx, 1)
      }
    } catch (error) {
      console.error('Failed to delete diet record:', error.message)
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    dietRecords,
    loading,
    fetchFoodByAnimalId,
    getDietById,
    addDiet,
    updateDiet,
    deleteDiet,
  }
})
