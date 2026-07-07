import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '../services/firebase'
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  where,
  orderBy
} from 'firebase/firestore'

export const useEodReportsStore = defineStore('eodReports', () => {
  const reports = ref([])
  const loading = ref(false)
  const error = ref(null)

  /** Fetches EOD reports with optional filters from Firestore. @returns {Promise<void>} */
  const fetchReports = async (filters = {}) => {
    loading.value = true
    error.value = null
    try {
      let q = query(
        collection(db, 'eodReports'),
        orderBy('createdAt', 'desc')
      )

      // Optional: add filters for date range, status, etc.
      if (filters.status) {
        q = query(
          collection(db, 'eodReports'),
          where('status', '==', filters.status),
          orderBy('createdAt', 'desc')
        )
      }

      const snapshot = await getDocs(q)
      reports.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (err) {
      error.value = err.message
      console.error('Failed to fetch EOD reports:', err)
    } finally {
      loading.value = false
    }
  }

  /** Creates a new EOD report in Firestore. @returns {Promise<string>} */
  const createReport = async (data) => {
    try {
      const docRef = await addDoc(collection(db, 'eodReports'), {
        ...data,
        createdAt: serverTimestamp(),
        status: 'submitted'
      })
      reports.value.unshift({
        id: docRef.id,
        ...data,
        createdAt: new Date(),
        status: 'submitted'
      })
      return docRef.id
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  /** Updates an existing EOD report in Firestore. @returns {Promise<void>} */
  const updateReport = async (id, data) => {
    try {
      await updateDoc(doc(db, 'eodReports', id), data)
      const idx = reports.value.findIndex(r => r.id === id)
      if (idx !== -1) {
        reports.value[idx] = { ...reports.value[idx], ...data }
      }
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  /** Deletes an EOD report from Firestore. @returns {Promise<void>} */
  const deleteReport = async (id) => {
    try {
      await deleteDoc(doc(db, 'eodReports', id))
      reports.value = reports.value.filter(r => r.id !== id)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  /** Gets a report by ID from local state. @returns {Object|undefined} */
  const getReportById = (id) => {
    return reports.value.find(r => r.id === id)
  }

  return {
    reports,
    loading,
    error,
    fetchReports,
    createReport,
    updateReport,
    deleteReport,
    getReportById
  }
})
