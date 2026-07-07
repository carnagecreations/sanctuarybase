import { defineStore } from 'pinia'
import { ref } from 'vue'
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore'
import { db } from '../services/firebase'

export const useLedgerStore = defineStore('ledger', () => {
  const ledgers = ref([])
  const loading = ref(false)
  const selectedLedger = ref(null)

  /** Fetches all ledger entries from Firestore. @returns {Promise<Array>} */
  const fetchLedgers = async () => {
    loading.value = true
    try {
      const querySnapshot = await getDocs(collection(db, 'ledgers'))
      ledgers.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      return ledgers.value
    } catch (error) {
      console.error('Failed to fetch ledgers:', error.message)
      return []
    } finally {
      loading.value = false
    }
  }

  /** Fetches a specific ledger entry by ID from Firestore. @returns {Promise<Object|null>} */
  const getLedgerById = async (id) => {
    try {
      const docSnap = await getDoc(doc(db, 'ledgers', id))
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() }
      }
      return null
    } catch (error) {
      console.error('Failed to fetch ledger:', error.message)
      return null
    }
  }

  /** Creates a new ledger entry in Firestore. @returns {Promise<Object>} */
  const addLedgerEntry = async (entryData) => {
    loading.value = true
    try {
      const docRef = await addDoc(collection(db, 'ledgers'), {
        ...entryData,
        createdAt: new Date(),
      })
      const newEntry = { id: docRef.id, ...entryData, createdAt: new Date() }
      ledgers.value.push(newEntry)
      return newEntry
    } catch (error) {
      console.error('Failed to add ledger entry:', error.message)
      throw error
    } finally {
      loading.value = false
    }
  }

  /** Updates an existing ledger entry in Firestore. @returns {Promise<Object|null>} */
  const updateLedgerEntry = async (id, entryData) => {
    loading.value = true
    try {
      await updateDoc(doc(db, 'ledgers', id), {
        ...entryData,
        updatedAt: new Date(),
      })
      const idx = ledgers.value.findIndex((e) => e.id === id)
      if (idx !== -1) {
        ledgers.value[idx] = { ...ledgers.value[idx], ...entryData, updatedAt: new Date() }
      }
      return ledgers.value[idx]
    } catch (error) {
      console.error('Failed to update ledger entry:', error.message)
      return null
    } finally {
      loading.value = false
    }
  }

  /** Deletes a ledger entry from Firestore. @returns {Promise<boolean>} */
  const deleteLedgerEntry = async (id) => {
    loading.value = true
    try {
      await deleteDoc(doc(db, 'ledgers', id))
      const idx = ledgers.value.findIndex((e) => e.id === id)
      if (idx !== -1) {
        ledgers.value.splice(idx, 1)
      }
      return true
    } catch (error) {
      console.error('Failed to delete ledger entry:', error.message)
      return false
    } finally {
      loading.value = false
    }
  }

  /** Fetches ledger entries filtered by category from Firestore. @returns {Promise<Array>} */
  const getLedgersByCategory = async (category) => {
    loading.value = true
    try {
      const q = query(collection(db, 'ledgers'), where('category', '==', category), orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Failed to fetch ledgers by category:', error.message)
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    ledgers,
    loading,
    selectedLedger,
    fetchLedgers,
    getLedgerById,
    addLedgerEntry,
    updateLedgerEntry,
    deleteLedgerEntry,
    getLedgersByCategory,
  }
})
