import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '../services/firebase'
import { collection, getDocs, addDoc, query, orderBy, limit, where } from 'firebase/firestore'
import { useAuthStore } from './auth'

export const useActivityLogStore = defineStore('activityLog', () => {
  const logs = ref([])
  const loading = ref(false)

  /** Fetches activity logs with optional filters. @returns {Promise<void>} */
  const fetchLogs = async (filters = {}) => {
    loading.value = true
    try {
      let q = query(collection(db, 'activityLog'), orderBy('createdAt', 'desc'), limit(filters.limit || 100))
      if (filters.entityId) {
        q = query(collection(db, 'activityLog'), where('entityId', '==', filters.entityId), orderBy('createdAt', 'desc'), limit(50))
      }
      const snap = await getDocs(q)
      logs.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    } catch (e) {
      // Silently fail
    } finally {
      loading.value = false
    }
  }

  /** Logs an activity entry to Firestore. @returns {Promise<void>} */
  const log = async (action, entityType, entityId, entityName, details = '') => {
    const auth = useAuthStore()
    const entry = {
      action,
      entityType,
      entityId,
      entityName,
      details,
      userId: auth.user?.uid || 'demo',
      userName: auth.user?.displayName || auth.user?.email || 'Demo User',
      createdAt: new Date().toISOString(),
    }
    try {
      const ref = await addDoc(collection(db, 'activityLog'), entry)
      logs.value.unshift({ id: ref.id, ...entry })
    } catch (e) {
      // Silently fail
    }
  }

  return { logs, loading, fetchLogs, log }
})
