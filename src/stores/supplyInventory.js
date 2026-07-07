import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '../services/firebase'
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore'

export const useSupplyInventoryStore = defineStore('supplyInventory', () => {
  const supplies = ref([])
  const loading = ref(false)
  const error = ref(null)
  let unsubscribe = null
  let firstSnapshotPromise = null

  /** Subscribes to real-time supply updates (once). @returns {Promise<Array>} resolves on first snapshot */
  const subscribe = () => {
    if (firstSnapshotPromise) return firstSnapshotPromise
    loading.value = true
    error.value = null
    firstSnapshotPromise = new Promise((resolve) => {
      const q = query(
        collection(db, 'supplies'),
        orderBy('category', 'asc')
      )
      unsubscribe = onSnapshot(q, (snapshot) => {
        supplies.value = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        loading.value = false
        resolve(supplies.value)
      }, (err) => {
        error.value = err.message
        console.error('Supplies listener error:', err)
        loading.value = false
        resolve(supplies.value)
      })
    })
    return firstSnapshotPromise
  }

  /** Fetches all supplies (live via onSnapshot). @returns {Promise<Array>} */
  const fetchAll = async () => {
    await subscribe()
    return supplies.value
  }

  /** Stops the real-time listener. @returns {void} */
  const stopListening = () => {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
      firstSnapshotPromise = null
    }
  }

  /** Creates a new supply in Firestore. @returns {Promise<string>} */
  const addSupply = async (data) => {
    try {
      const docRef = await addDoc(collection(db, 'supplies'), {
        ...data,
        quantity: parseInt(data.quantity) || 0,
        reorderLevel: parseInt(data.reorderLevel) || 0,
        costPerUnit: parseFloat(data.costPerUnit) || 0,
        lastRestocked: serverTimestamp(),
        createdAt: serverTimestamp()
      })
      // With an active listener the snapshot is the source of truth.
      if (!unsubscribe) {
        supplies.value.push({
          id: docRef.id,
          ...data,
          quantity: parseInt(data.quantity),
          reorderLevel: parseInt(data.reorderLevel),
          costPerUnit: parseFloat(data.costPerUnit),
          lastRestocked: new Date()
        })
      }
      return docRef.id
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  /** Applies a partial update to the local supplies array (listener-off fallback). @returns {void} */
  const patchLocal = (id, patch) => {
    if (unsubscribe) return
    const idx = supplies.value.findIndex(s => s.id === id)
    if (idx !== -1) {
      supplies.value[idx] = { ...supplies.value[idx], ...patch }
    }
  }

  /** Updates supply quantity in Firestore. @returns {Promise<void>} */
  const updateQuantity = async (id, newQuantity) => {
    try {
      await updateDoc(doc(db, 'supplies', id), {
        quantity: parseInt(newQuantity)
      })
      patchLocal(id, { quantity: parseInt(newQuantity) })
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  /** Decreases supply stock in Firestore. @returns {Promise<void>} */
  const decreaseStock = async (id, amount) => {
    try {
      const supply = supplies.value.find(s => s.id === id)
      if (!supply) throw new Error('Supply not found')
      const newQuantity = Math.max(0, supply.quantity - parseInt(amount))
      await updateQuantity(id, newQuantity)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  /** Restocks a supply in Firestore and clears any pending restock request. @returns {Promise<void>} */
  const restockSupply = async (id, amount) => {
    try {
      const supply = supplies.value.find(s => s.id === id)
      if (!supply) throw new Error('Supply not found')
      const newQuantity = supply.quantity + parseInt(amount)
      await updateDoc(doc(db, 'supplies', id), {
        quantity: newQuantity,
        lastRestocked: serverTimestamp(),
        restockRequested: false,
        restockRequestedBy: null,
        restockRequestedAt: null
      })
      patchLocal(id, {
        quantity: newQuantity,
        lastRestocked: new Date(),
        restockRequested: false,
        restockRequestedBy: null,
        restockRequestedAt: null
      })
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  /** Flags a supply as needing restock (volunteer request). @returns {Promise<void>} */
  const requestRestock = async (id, requestedByName) => {
    try {
      const patch = {
        restockRequested: true,
        restockRequestedBy: requestedByName,
        restockRequestedAt: new Date().toISOString()
      }
      await updateDoc(doc(db, 'supplies', id), patch)
      patchLocal(id, patch)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  /** Clears a pending restock request on a supply. @returns {Promise<void>} */
  const clearRestockRequest = async (id) => {
    try {
      const patch = {
        restockRequested: false,
        restockRequestedBy: null,
        restockRequestedAt: null
      }
      await updateDoc(doc(db, 'supplies', id), patch)
      patchLocal(id, patch)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  /** Filters supplies by category from local state. @returns {Array} */
  const getByCategory = (category) => {
    return supplies.value.filter(s => s.category === category)
  }

  /** Filters low stock supplies from local state. @returns {Array} */
  const getLowStock = () => {
    return supplies.value.filter(s => s.quantity <= s.reorderLevel)
  }

  const restockNotification = computed(() => {
    return getLowStock().length
  })

  return {
    supplies,
    loading,
    error,
    restockNotification,
    fetchAll,
    stopListening,
    addSupply,
    updateQuantity,
    decreaseStock,
    restockSupply,
    requestRestock,
    clearRestockRequest,
    getByCategory,
    getLowStock
  }
})
