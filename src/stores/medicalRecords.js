import { defineStore } from 'pinia'
import { ref } from 'vue'
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore'
import { db } from '../services/firebase'

export const useMedicalRecordsStore = defineStore('medicalRecords', () => {
  const medicalRecords = ref([])
  const loading = ref(false)

  /** Fetches all medical records from Firestore. @returns {Promise<Array>} */
  const fetchMedicalRecords = async () => {
    loading.value = true
    try {
      const querySnapshot = await getDocs(collection(db, 'animalMedical'))
      medicalRecords.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date instanceof Object ? doc.data().date.toDate() : new Date(doc.data().date)
      }))
      return medicalRecords.value
    } catch (error) {
      console.error('Failed to fetch medical records:', error.message)
      return []
    } finally {
      loading.value = false
    }
  }

  /** Fetches medical records for a specific animal from Firestore. @returns {Promise<Array>} */
  const fetchByAnimalId = async (animalId) => {
    loading.value = true
    try {
      const q = query(
        collection(db, 'animalMedical'),
        where('animalId', '==', animalId),
        orderBy('date', 'desc')
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date instanceof Object ? doc.data().date.toDate() : new Date(doc.data().date)
      }))
    } catch (error) {
      console.error('Failed to fetch medical records for animal:', error.message)
      return []
    } finally {
      loading.value = false
    }
  }

  /** Fetches a specific medical record by ID from Firestore. @returns {Promise<Object|null>} */
  const getMedicalRecordById = async (id) => {
    try {
      const docSnap = await getDoc(doc(db, 'animalMedical', id))
      if (docSnap.exists()) {
        const data = docSnap.data()
        return {
          id: docSnap.id,
          ...data,
          date: data.date instanceof Object ? data.date.toDate() : new Date(data.date)
        }
      }
      return null
    } catch (error) {
      console.error('Failed to fetch medical record:', error.message)
      return null
    }
  }

  /** Creates a new medical record in Firestore. @returns {Promise<Object>} */
  const addRecord = async (recordData) => {
    loading.value = true
    try {
      const docRef = await addDoc(collection(db, 'animalMedical'), {
        ...recordData,
        date: recordData.date instanceof Date ? recordData.date : new Date(recordData.date),
        createdAt: new Date(),
      })
      const newRecord = {
        id: docRef.id,
        ...recordData,
        date: recordData.date instanceof Date ? recordData.date : new Date(recordData.date)
      }
      medicalRecords.value.unshift(newRecord)
      return newRecord
    } catch (error) {
      console.error('Failed to add medical record:', error.message)
      throw error
    } finally {
      loading.value = false
    }
  }

  /** Updates an existing medical record in Firestore. @returns {Promise<Object|null>} */
  const updateRecord = async (id, recordData) => {
    loading.value = true
    try {
      const updateData = {
        ...recordData,
        updatedAt: new Date(),
      }
      if (recordData.date) {
        updateData.date = recordData.date instanceof Date ? recordData.date : new Date(recordData.date)
      }
      await updateDoc(doc(db, 'animalMedical', id), updateData)
      const idx = medicalRecords.value.findIndex((r) => r.id === id)
      if (idx !== -1) {
        medicalRecords.value[idx] = {
          ...medicalRecords.value[idx],
          ...recordData,
          date: updateData.date || medicalRecords.value[idx].date
        }
      }
      return medicalRecords.value[idx] || null
    } catch (error) {
      console.error('Failed to update medical record:', error.message)
      return null
    } finally {
      loading.value = false
    }
  }

  /** Deletes a medical record from Firestore. @returns {Promise<boolean>} */
  const deleteRecord = async (id) => {
    loading.value = true
    try {
      await deleteDoc(doc(db, 'animalMedical', id))
      const idx = medicalRecords.value.findIndex((r) => r.id === id)
      if (idx !== -1) {
        medicalRecords.value.splice(idx, 1)
      }
      return true
    } catch (error) {
      console.error('Failed to delete medical record:', error.message)
      return false
    } finally {
      loading.value = false
    }
  }

  /** Fetches recent medical records for an animal with optional limit. @returns {Promise<Array>} */
  const getRecentRecords = async (animalId, limit = 10) => {
    try {
      const q = query(
        collection(db, 'animalMedical'),
        where('animalId', '==', animalId),
        orderBy('date', 'desc')
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.slice(0, limit).map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date instanceof Object ? doc.data().date.toDate() : new Date(doc.data().date)
      }))
    } catch (error) {
      console.error('Failed to fetch recent records:', error.message)
      return []
    }
  }

  return {
    medicalRecords,
    loading,
    fetchMedicalRecords,
    fetchByAnimalId,
    getMedicalRecordById,
    addRecord,
    updateRecord,
    deleteRecord,
    getRecentRecords,
  }
})
