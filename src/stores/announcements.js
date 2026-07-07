import { defineStore } from 'pinia'
import { ref } from 'vue'
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

export const useAnnouncementsStore = defineStore('announcements', () => {
  const announcements = ref([])
  const loading = ref(false)
  const error = ref(null)
  let unsubscribe = null
  let firstSnapshotPromise = null

  /** Sets up real-time listener for announcements (once). @returns {Promise<Array>} resolves on first snapshot */
  const setupRealtimeListener = () => {
    if (firstSnapshotPromise) return firstSnapshotPromise
    firstSnapshotPromise = new Promise((resolve) => {
      const q = query(
        collection(db, 'announcements'),
        orderBy('createdAt', 'desc')
      )
      unsubscribe = onSnapshot(q, (snapshot) => {
        announcements.value = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        resolve(announcements.value)
      }, (err) => {
        error.value = err.message
        console.error('Announcements listener error:', err)
        resolve(announcements.value)
      })
    })
    return firstSnapshotPromise
  }

  /** Fetches all announcements (live via onSnapshot). @returns {Promise<Array>} */
  const fetchAnnouncements = async () => {
    loading.value = true
    error.value = null
    try {
      await setupRealtimeListener()
      return announcements.value
    } finally {
      loading.value = false
    }
  }

  /** Creates a new announcement in Firestore. @returns {Promise<string>} */
  const createAnnouncement = async (data) => {
    try {
      const docRef = await addDoc(collection(db, 'announcements'), {
        ...data,
        createdAt: serverTimestamp(),
        active: true
      })
      // With an active listener the snapshot is the source of truth.
      if (!unsubscribe) {
        announcements.value.unshift({
          id: docRef.id,
          ...data,
          createdAt: new Date()
        })
      }
      return docRef.id
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  /** Updates an existing announcement in Firestore. @returns {Promise<void>} */
  const updateAnnouncement = async (id, data) => {
    try {
      await updateDoc(doc(db, 'announcements', id), data)
      if (!unsubscribe) {
        const idx = announcements.value.findIndex(a => a.id === id)
        if (idx !== -1) {
          announcements.value[idx] = { ...announcements.value[idx], ...data }
        }
      }
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  /** Deletes an announcement from Firestore. @returns {Promise<void>} */
  const deleteAnnouncement = async (id) => {
    try {
      await deleteDoc(doc(db, 'announcements', id))
      if (!unsubscribe) {
        announcements.value = announcements.value.filter(a => a.id !== id)
      }
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
    announcements,
    loading,
    error,
    fetchAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    setupRealtimeListener,
    cleanup
  }
})
