import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '../services/firebase'
import {
  collection, getDocs, addDoc, updateDoc, doc, query, where
} from 'firebase/firestore'

// Foster care log entries live in the `animalfollowups` collection —
// per firestore.rules it's the animal-record collection any authenticated
// user (including fosters/volunteers) may create and update in.
const COLLECTION = 'animalfollowups'
const LOG_TYPE = 'foster-care-log'

export const useFosterLogsStore = defineStore('fosterLogs', () => {
  const logs = ref([])
  const loading = ref(false)

  /** Fetches the current foster's care log entries from Firestore. @returns {Promise<void>} */
  const fetchLogs = async (authorId) => {
    loading.value = true
    try {
      const q = query(
        collection(db, COLLECTION),
        where('authorId', '==', authorId)
      )
      const snapshot = await getDocs(q)
      logs.value = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(l => l.type === LOG_TYPE)
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    } catch (e) {
      console.error('Failed to fetch foster logs:', e)
    } finally {
      loading.value = false
    }
  }

  /** Creates a new care log entry in Firestore. @returns {Promise<Object>} */
  const addLog = async ({ animalId, animalName, note, author }) => {
    const entry = {
      type: LOG_TYPE,
      animalId: animalId != null ? String(animalId) : '',
      animalName,
      note,
      authorId: author?.id || '',
      authorName: author?.name || '',
      authorEmail: author?.email || '',
      createdAt: new Date().toISOString(),
    }
    const docRef = await addDoc(collection(db, COLLECTION), entry)
    const newLog = { id: docRef.id, ...entry }
    logs.value.unshift(newLog)
    return newLog
  }

  /** Updates an existing care log entry in Firestore. @returns {Promise<void>} */
  const updateLog = async (id, note) => {
    await updateDoc(doc(db, COLLECTION, id), {
      note,
      updatedAt: new Date().toISOString(),
    })
    const idx = logs.value.findIndex(l => l.id === id)
    if (idx !== -1) {
      logs.value[idx] = { ...logs.value[idx], note, updatedAt: new Date().toISOString() }
    }
  }

  return { logs, loading, fetchLogs, addLog, updateLog }
})
