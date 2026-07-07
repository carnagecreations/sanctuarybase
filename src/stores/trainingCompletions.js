import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '../services/firebase'
import { collection, onSnapshot, doc, getDoc, setDoc, query, where, serverTimestamp } from 'firebase/firestore'

export const useTrainingCompletionsStore = defineStore('trainingCompletions', () => {
  const completions = ref([])
  const loading = ref(false)
  const error = ref(null)
  // moduleId -> unsubscribe, so switching between modules' read modals
  // doesn't leave old listeners running.
  const unsubscribers = new Map()

  /** Live-subscribes to every completion for one module (admin view). @returns {void} */
  const watchModule = (moduleId) => {
    if (unsubscribers.has(moduleId)) return
    const q = query(collection(db, 'trainingCompletions'), where('moduleId', '==', moduleId))
    const unsub = onSnapshot(q, (snapshot) => {
      const rows = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      completions.value = [...completions.value.filter(c => c.moduleId !== moduleId), ...rows]
    }, (err) => {
      error.value = err.message
      console.error('Training completions listener error:', err)
    })
    unsubscribers.set(moduleId, unsub)
  }

  /** Stops watching one module's completions. @returns {void} */
  const unwatchModule = (moduleId) => {
    unsubscribers.get(moduleId)?.()
    unsubscribers.delete(moduleId)
    completions.value = completions.value.filter(c => c.moduleId !== moduleId)
  }

  /** Fetches one user's own completion for a module via its deterministic doc ID — a query-free single-doc read, since security rules can't authorize a non-admin querying other users' rows. @returns {Promise<Object|null>} */
  const fetchOwnCompletion = async (moduleId, userId) => {
    try {
      const snap = await getDoc(doc(db, 'trainingCompletions', `${moduleId}_${userId}`))
      return snap.exists() ? { id: snap.id, ...snap.data() } : null
    } catch (err) {
      error.value = err.message
      return null
    }
  }

  /** Records the current user's quiz result for a module (one doc per user+module, overwritten on retake). @returns {Promise<void>} */
  const submitCompletion = async ({ moduleId, userId, userName, userEmail, score, total, passed }) => {
    loading.value = true
    try {
      await setDoc(doc(db, 'trainingCompletions', `${moduleId}_${userId}`), {
        moduleId, userId, userName, userEmail, score, total, passed,
        completedAt: serverTimestamp(),
      })
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /** Stops all active listeners. @returns {void} */
  const cleanup = () => {
    for (const unsub of unsubscribers.values()) unsub()
    unsubscribers.clear()
    completions.value = []
  }

  return {
    completions,
    loading,
    error,
    watchModule,
    unwatchModule,
    fetchOwnCompletion,
    submitCompletion,
    cleanup,
  }
})
