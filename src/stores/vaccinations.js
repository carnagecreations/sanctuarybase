import { defineStore } from 'pinia'
import { ref } from 'vue'
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore'
import { db } from '../services/firebase'

export const useVaccinationsStore = defineStore('vaccinations', () => {
  const vaccinations = ref([])
  const loading = ref(false)

  /** Fetches all vaccinations from Firestore. @returns {Promise<Array>} */
  const fetchVaccinations = async () => {
    loading.value = true
    try {
      const querySnapshot = await getDocs(collection(db, 'vaccinations'))
      vaccinations.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate instanceof Object ? doc.data().dueDate.toDate() : new Date(doc.data().dueDate),
        completedDate: doc.data().completedDate ? (doc.data().completedDate instanceof Object ? doc.data().completedDate.toDate() : new Date(doc.data().completedDate)) : null,
        nextDueDate: doc.data().nextDueDate ? (doc.data().nextDueDate instanceof Object ? doc.data().nextDueDate.toDate() : new Date(doc.data().nextDueDate)) : null,
      }))
      return vaccinations.value
    } catch (error) {
      console.error('Failed to fetch vaccinations:', error.message)
      return []
    } finally {
      loading.value = false
    }
  }

  /** Fetches vaccinations for a specific animal from Firestore. @returns {Promise<Array>} */
  const fetchByAnimalId = async (animalId) => {
    loading.value = true
    try {
      const q = query(
        collection(db, 'vaccinations'),
        where('animalId', '==', animalId),
        orderBy('dueDate', 'desc')
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate instanceof Object ? doc.data().dueDate.toDate() : new Date(doc.data().dueDate),
        completedDate: doc.data().completedDate ? (doc.data().completedDate instanceof Object ? doc.data().completedDate.toDate() : new Date(doc.data().completedDate)) : null,
        nextDueDate: doc.data().nextDueDate ? (doc.data().nextDueDate instanceof Object ? doc.data().nextDueDate.toDate() : new Date(doc.data().nextDueDate)) : null,
      }))
    } catch (error) {
      console.error('Failed to fetch vaccinations for animal:', error.message)
      return []
    } finally {
      loading.value = false
    }
  }

  /** Fetches a specific vaccination by ID from Firestore. @returns {Promise<Object|null>} */
  const getVaccinationById = async (id) => {
    try {
      const docSnap = await getDoc(doc(db, 'vaccinations', id))
      if (docSnap.exists()) {
        const data = docSnap.data()
        return {
          id: docSnap.id,
          ...data,
          dueDate: data.dueDate instanceof Object ? data.dueDate.toDate() : new Date(data.dueDate),
          completedDate: data.completedDate ? (data.completedDate instanceof Object ? data.completedDate.toDate() : new Date(data.completedDate)) : null,
          nextDueDate: data.nextDueDate ? (data.nextDueDate instanceof Object ? data.nextDueDate.toDate() : new Date(data.nextDueDate)) : null,
        }
      }
      return null
    } catch (error) {
      console.error('Failed to fetch vaccination:', error.message)
      return null
    }
  }

  /** Creates a new vaccination record in Firestore. @returns {Promise<Object>} */
  const addVaccine = async (vaccineData) => {
    loading.value = true
    try {
      const docRef = await addDoc(collection(db, 'vaccinations'), {
        ...vaccineData,
        dueDate: vaccineData.dueDate instanceof Date ? vaccineData.dueDate : new Date(vaccineData.dueDate),
        completedDate: vaccineData.completedDate ? (vaccineData.completedDate instanceof Date ? vaccineData.completedDate : new Date(vaccineData.completedDate)) : null,
        nextDueDate: vaccineData.nextDueDate ? (vaccineData.nextDueDate instanceof Date ? vaccineData.nextDueDate : new Date(vaccineData.nextDueDate)) : null,
        createdAt: new Date(),
      })
      const newVaccine = {
        id: docRef.id,
        ...vaccineData,
        dueDate: vaccineData.dueDate instanceof Date ? vaccineData.dueDate : new Date(vaccineData.dueDate),
        completedDate: vaccineData.completedDate ? (vaccineData.completedDate instanceof Date ? vaccineData.completedDate : new Date(vaccineData.completedDate)) : null,
        nextDueDate: vaccineData.nextDueDate ? (vaccineData.nextDueDate instanceof Date ? vaccineData.nextDueDate : new Date(vaccineData.nextDueDate)) : null,
      }
      vaccinations.value.push(newVaccine)
      return newVaccine
    } catch (error) {
      console.error('Failed to add vaccine:', error.message)
      throw error
    } finally {
      loading.value = false
    }
  }

  /** Marks a vaccination as complete in Firestore. @returns {Promise<Object|null>} */
  const markComplete = async (id, completedDate = new Date(), nextDueDate = null) => {
    loading.value = true
    try {
      const updateData = {
        completedDate: completedDate instanceof Date ? completedDate : new Date(completedDate),
        updatedAt: new Date(),
      }
      if (nextDueDate) {
        updateData.nextDueDate = nextDueDate instanceof Date ? nextDueDate : new Date(nextDueDate)
      }
      await updateDoc(doc(db, 'vaccinations', id), updateData)
      const idx = vaccinations.value.findIndex((v) => v.id === id)
      if (idx !== -1) {
        vaccinations.value[idx] = {
          ...vaccinations.value[idx],
          ...updateData
        }
      }
      return vaccinations.value[idx] || null
    } catch (error) {
      console.error('Failed to mark vaccine complete:', error.message)
      return null
    } finally {
      loading.value = false
    }
  }

  /** Updates an existing vaccination in Firestore. @returns {Promise<Object|null>} */
  const updateVaccine = async (id, vaccineData) => {
    loading.value = true
    try {
      const updateData = {
        ...vaccineData,
        updatedAt: new Date(),
      }
      if (vaccineData.dueDate) {
        updateData.dueDate = vaccineData.dueDate instanceof Date ? vaccineData.dueDate : new Date(vaccineData.dueDate)
      }
      if (vaccineData.completedDate !== undefined) {
        updateData.completedDate = vaccineData.completedDate ? (vaccineData.completedDate instanceof Date ? vaccineData.completedDate : new Date(vaccineData.completedDate)) : null
      }
      if (vaccineData.nextDueDate !== undefined) {
        updateData.nextDueDate = vaccineData.nextDueDate ? (vaccineData.nextDueDate instanceof Date ? vaccineData.nextDueDate : new Date(vaccineData.nextDueDate)) : null
      }
      await updateDoc(doc(db, 'vaccinations', id), updateData)
      const idx = vaccinations.value.findIndex((v) => v.id === id)
      if (idx !== -1) {
        vaccinations.value[idx] = { ...vaccinations.value[idx], ...updateData }
      }
      return vaccinations.value[idx] || null
    } catch (error) {
      console.error('Failed to update vaccine:', error.message)
      return null
    } finally {
      loading.value = false
    }
  }

  /** Deletes a vaccination from Firestore. @returns {Promise<boolean>} */
  const deleteVaccine = async (id) => {
    loading.value = true
    try {
      await deleteDoc(doc(db, 'vaccinations', id))
      const idx = vaccinations.value.findIndex((v) => v.id === id)
      if (idx !== -1) {
        vaccinations.value.splice(idx, 1)
      }
      return true
    } catch (error) {
      console.error('Failed to delete vaccine:', error.message)
      return false
    } finally {
      loading.value = false
    }
  }

  /** Fetches overdue vaccinations for an animal. @returns {Promise<Array>} */
  const getOverdue = async (animalId) => {
    try {
      const records = await fetchByAnimalId(animalId)
      const now = new Date()
      return records.filter(v => {
        const nextDue = v.nextDueDate || v.dueDate
        return !v.completedDate && new Date(nextDue) < now
      })
    } catch (error) {
      console.error('Failed to get overdue vaccines:', error.message)
      return []
    }
  }

  /** Fetches vaccinations due soon for an animal. @returns {Promise<Array>} */
  const getDueSoon = async (animalId, daysAhead = 30) => {
    try {
      const records = await fetchByAnimalId(animalId)
      const now = new Date()
      const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000)
      return records.filter(v => {
        const nextDue = v.nextDueDate || v.dueDate
        const nextDueDate = new Date(nextDue)
        return !v.completedDate && nextDueDate >= now && nextDueDate <= futureDate
      })
    } catch (error) {
      console.error('Failed to get due soon vaccines:', error.message)
      return []
    }
  }

  return {
    vaccinations,
    loading,
    fetchVaccinations,
    fetchByAnimalId,
    getVaccinationById,
    addVaccine,
    markComplete,
    updateVaccine,
    deleteVaccine,
    getOverdue,
    getDueSoon,
  }
})
