import { defineStore } from 'pinia'
import { ref } from 'vue'
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../services/firebase'

export const useDonorsStore = defineStore('donors', () => {
  const donors = ref([])
  const loading = ref(false)
  const selectedDonor = ref(null)

  /** Fetches all donors from Firestore. @returns {Promise<Array>} */
  const fetchDonors = async () => {
    loading.value = true
    try {
      const querySnapshot = await getDocs(collection(db, 'donors'))
      donors.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      return donors.value
    } catch (error) {
      console.error('Failed to fetch donors:', error.message)
      return []
    } finally {
      loading.value = false
    }
  }

  /** Fetches a specific donor by ID from Firestore. @returns {Promise<Object|null>} */
  const getDonorById = async (id) => {
    try {
      const docSnap = await getDoc(doc(db, 'donors', id))
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() }
      }
      return null
    } catch (error) {
      console.error('Failed to fetch donor:', error.message)
      return null
    }
  }

  /** Creates a new donor in Firestore. @returns {Promise<Object>} */
  const addDonor = async (donorData) => {
    loading.value = true
    try {
      const docRef = await addDoc(collection(db, 'donors'), {
        ...donorData,
        createdAt: new Date(),
      })
      const newDonor = { id: docRef.id, ...donorData }
      donors.value.push(newDonor)
      return newDonor
    } catch (error) {
      console.error('Failed to add donor:', error.message)
      throw error
    } finally {
      loading.value = false
    }
  }

  /** Updates an existing donor in Firestore. @returns {Promise<Object|null>} */
  const updateDonor = async (id, donorData) => {
    loading.value = true
    try {
      await updateDoc(doc(db, 'donors', id), {
        ...donorData,
        updatedAt: new Date(),
      })
      const idx = donors.value.findIndex((d) => d.id === id)
      if (idx !== -1) {
        donors.value[idx] = { ...donors.value[idx], ...donorData }
      }
      return donors.value[idx]
    } catch (error) {
      console.error('Failed to update donor:', error.message)
      return null
    } finally {
      loading.value = false
    }
  }

  /** Deletes a donor from Firestore. @returns {Promise<boolean>} */
  const deleteDonor = async (id) => {
    loading.value = true
    try {
      await deleteDoc(doc(db, 'donors', id))
      const idx = donors.value.findIndex((d) => d.id === id)
      if (idx !== -1) {
        donors.value.splice(idx, 1)
      }
      return true
    } catch (error) {
      console.error('Failed to delete donor:', error.message)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    donors,
    loading,
    selectedDonor,
    fetchDonors,
    getDonorById,
    addDonor,
    updateDonor,
    deleteDonor,
  }
})
