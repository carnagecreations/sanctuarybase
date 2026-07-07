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
  query
} from 'firebase/firestore'

export const useTrainingStore = defineStore('training', () => {
  const modules = ref([])
  const loading = ref(false)
  const error = ref(null)
  let unsubscribe = null
  let firstSnapshotPromise = null

  // Sorted by section's first-seen order, then each module's `order` within
  // its section — admins set `order` by hand (no drag-and-drop), so this
  // needs to be stable even when it's 0/undefined for every module.
  const sortedModules = computed(() =>
    [...modules.value].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  )

  /** Sets up real-time listener for training modules (once). @returns {Promise<Array>} resolves on first snapshot */
  const setupRealtimeListener = () => {
    if (firstSnapshotPromise) return firstSnapshotPromise
    firstSnapshotPromise = new Promise((resolve) => {
      const q = query(collection(db, 'trainingModules'))
      unsubscribe = onSnapshot(q, (snapshot) => {
        modules.value = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
        resolve(modules.value)
      }, (err) => {
        error.value = err.message
        console.error('Training modules listener error:', err)
        resolve(modules.value)
      })
    })
    return firstSnapshotPromise
  }

  /** Fetches all training modules (live via onSnapshot). @returns {Promise<Array>} */
  const fetchTrainingModules = async () => {
    loading.value = true
    error.value = null
    try {
      await setupRealtimeListener()
      return modules.value
    } finally {
      loading.value = false
    }
  }

  /** Creates a new training module in Firestore. @returns {Promise<string>} */
  const createTrainingModule = async (data) => {
    try {
      const docRef = await addDoc(collection(db, 'trainingModules'), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      return docRef.id
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  /** Updates an existing training module in Firestore. @returns {Promise<void>} */
  const updateTrainingModule = async (id, data) => {
    try {
      await updateDoc(doc(db, 'trainingModules', id), { ...data, updatedAt: serverTimestamp() })
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  /** Deletes a training module from Firestore. @returns {Promise<void>} */
  const deleteTrainingModule = async (id) => {
    try {
      await deleteDoc(doc(db, 'trainingModules', id))
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  /** Stops the real-time listener. @returns {void} */
  const cleanup = () => {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
      firstSnapshotPromise = null
    }
  }

  return {
    modules,
    sortedModules,
    loading,
    error,
    fetchTrainingModules,
    createTrainingModule,
    updateTrainingModule,
    deleteTrainingModule,
    setupRealtimeListener,
    cleanup
  }
})
