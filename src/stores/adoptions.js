import { defineStore } from 'pinia'
import { ref } from 'vue'
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore'
import { db } from '../services/firebase'

export const useAdoptionsStore = defineStore('adoptions', () => {
  const adoptions = ref([])
  const loading = ref(false)
  const selectedAdoption = ref(null)

  /** Fetches all adoptions from Firestore. @returns {Promise<Array>} */
  const fetchAdoptions = async () => {
    loading.value = true
    try {
      const querySnapshot = await getDocs(collection(db, 'adoptions'))
      adoptions.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      return adoptions.value
    } catch (error) {
      console.error('Failed to fetch adoptions:', error.message)
      return []
    } finally {
      loading.value = false
    }
  }

  /** Fetches a specific adoption by ID from Firestore. @returns {Promise<Object|null>} */
  const getAdoptionById = async (id) => {
    try {
      const docSnap = await getDoc(doc(db, 'adoptions', id))
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() }
      }
      return null
    } catch (error) {
      console.error('Failed to fetch adoption:', error.message)
      return null
    }
  }

  /** Fetches adoptions for a specific animal from Firestore. @returns {Promise<Array>} */
  const getAdoptionsByAnimal = async (animalId) => {
    try {
      const q = query(collection(db, 'adoptions'), where('animalId', '==', animalId))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Failed to fetch adoptions for animal:', error.message)
      return []
    }
  }

  /** Fetches adoptions for a specific person from Firestore. @returns {Promise<Array>} */
  const getAdoptionsByPerson = async (personId) => {
    try {
      const q = query(collection(db, 'adoptions'), where('personId', '==', personId))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Failed to fetch adoptions for person:', error.message)
      return []
    }
  }

  /** Creates a new adoption in Firestore. @returns {Promise<Object>} */
  const addAdoption = async (adoptionData) => {
    loading.value = true
    try {
      const docRef = await addDoc(collection(db, 'adoptions'), {
        ...adoptionData,
        createdAt: new Date(),
      })
      const newAdoption = { id: docRef.id, ...adoptionData }
      adoptions.value.push(newAdoption)
      return newAdoption
    } catch (error) {
      console.error('Failed to add adoption:', error.message)
      throw error
    } finally {
      loading.value = false
    }
  }

  /** Updates an existing adoption in Firestore. @returns {Promise<Object|null>} */
  const updateAdoption = async (id, adoptionData) => {
    loading.value = true
    try {
      await updateDoc(doc(db, 'adoptions', id), {
        ...adoptionData,
        updatedAt: new Date(),
      })
      const idx = adoptions.value.findIndex((a) => a.id === id)
      if (idx !== -1) {
        adoptions.value[idx] = { ...adoptions.value[idx], ...adoptionData }
      }
      return adoptions.value[idx]
    } catch (error) {
      console.error('Failed to update adoption:', error.message)
      return null
    } finally {
      loading.value = false
    }
  }

  /** Deletes an adoption from Firestore. @returns {Promise<boolean>} */
  const deleteAdoption = async (id) => {
    loading.value = true
    try {
      await deleteDoc(doc(db, 'adoptions', id))
      const idx = adoptions.value.findIndex((a) => a.id === id)
      if (idx !== -1) {
        adoptions.value.splice(idx, 1)
      }
      return true
    } catch (error) {
      console.error('Failed to delete adoption:', error.message)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    adoptions,
    loading,
    selectedAdoption,
    fetchAdoptions,
    getAdoptionById,
    getAdoptionsByAnimal,
    getAdoptionsByPerson,
    addAdoption,
    updateAdoption,
    deleteAdoption,
  }
})
