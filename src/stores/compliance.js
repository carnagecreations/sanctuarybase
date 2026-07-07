import { defineStore } from 'pinia'
import { ref } from 'vue'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../services/firebase'

export const useComplianceStore = defineStore('compliance', () => {
  const items = ref([])
  const loading = ref(false)

  /** Fetches all compliance items from Firestore. @returns {Promise<Array>} */
  const fetchCompliance = async () => {
    loading.value = true
    try {
      const querySnapshot = await getDocs(collection(db, 'compliance'))
      items.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      return items.value
    } catch (error) {
      console.error('Failed to fetch compliance items:', error.message)
      return []
    } finally {
      loading.value = false
    }
  }

  /** Creates a new compliance item in Firestore. @returns {Promise<Object>} */
  const addItem = async (itemData) => {
    loading.value = true
    try {
      const docRef = await addDoc(collection(db, 'compliance'), {
        ...itemData,
        completedDate: null,
        createdAt: new Date().toISOString(),
      })
      const newItem = { id: docRef.id, ...itemData, completedDate: null }
      items.value.unshift(newItem)
      return newItem
    } catch (error) {
      console.error('Failed to add compliance item:', error.message)
      throw error
    } finally {
      loading.value = false
    }
  }

  /** Marks a compliance item as complete. @returns {Promise<Object|null>} */
  const completeItem = async (id) => {
    loading.value = true
    try {
      const completedDate = new Date().toISOString()
      await updateDoc(doc(db, 'compliance', id), { completedDate })
      const idx = items.value.findIndex(i => i.id === id)
      if (idx !== -1) {
        items.value[idx] = { ...items.value[idx], completedDate }
      }
      return items.value[idx]
    } catch (error) {
      console.error('Failed to complete item:', error.message)
      throw error
    } finally {
      loading.value = false
    }
  }

  /** Marks a compliance item as incomplete. @returns {Promise<Object|null>} */
  const uncompleteItem = async (id) => {
    loading.value = true
    try {
      await updateDoc(doc(db, 'compliance', id), { completedDate: null })
      const idx = items.value.findIndex(i => i.id === id)
      if (idx !== -1) {
        items.value[idx] = { ...items.value[idx], completedDate: null }
      }
      return items.value[idx]
    } catch (error) {
      console.error('Failed to uncomplete item:', error.message)
      throw error
    } finally {
      loading.value = false
    }
  }

  /** Deletes a compliance item from Firestore. @returns {Promise<void>} */
  const deleteItem = async (id) => {
    loading.value = true
    try {
      await deleteDoc(doc(db, 'compliance', id))
      items.value = items.value.filter(i => i.id !== id)
    } catch (error) {
      console.error('Failed to delete compliance item:', error.message)
      throw error
    } finally {
      loading.value = false
    }
  }

  /** Updates an existing compliance item in Firestore. @returns {Promise<Object|null>} */
  const updateItem = async (id, itemData) => {
    loading.value = true
    try {
      await updateDoc(doc(db, 'compliance', id), itemData)
      const idx = items.value.findIndex(i => i.id === id)
      if (idx !== -1) {
        items.value[idx] = { ...items.value[idx], ...itemData }
      }
      return items.value[idx]
    } catch (error) {
      console.error('Failed to update compliance item:', error.message)
      throw error
    } finally {
      loading.value = false
    }
  }

  /** Filters overdue compliance items. @returns {Array} */
  const getOverdue = () => {
    const now = new Date()
    return items.value.filter(item => {
      if (item.completedDate) return false
      const dueDate = new Date(item.dueDate)
      return dueDate < now
    })
  }

  /** Filters compliance items due within 7 days. @returns {Array} */
  const getDueSoon = () => {
    const now = new Date()
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    return items.value.filter(item => {
      if (item.completedDate) return false
      const dueDate = new Date(item.dueDate)
      return dueDate >= now && dueDate <= sevenDaysFromNow
    })
  }

  /** Filters incomplete compliance items. @returns {Array} */
  const getPending = () => {
    return items.value.filter(item => !item.completedDate)
  }

  /** Filters completed compliance items. @returns {Array} */
  const getCompleted = () => {
    return items.value.filter(item => item.completedDate)
  }

  /** Filters compliance items by category. @returns {Array} */
  const getByCategory = (category) => {
    return items.value.filter(item => item.category === category)
  }

  return {
    items,
    loading,
    fetchCompliance,
    addItem,
    completeItem,
    uncompleteItem,
    deleteItem,
    updateItem,
    getOverdue,
    getDueSoon,
    getPending,
    getCompleted,
    getByCategory,
  }
})
