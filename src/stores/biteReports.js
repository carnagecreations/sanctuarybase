import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, query, where, orderBy } from 'firebase/firestore'
import { db } from '../services/firebase'

export const useBiteReportsStore = defineStore('biteReports', () => {
  const reports = ref([])
  const loading = ref(false)
  const selectedReport = ref(null)

  const pending = computed(() => reports.value.filter(r => r.status === 'Pending'))
  const reviewed = computed(() => reports.value.filter(r => r.status === 'Reviewed'))

  /** Fetches all bite reports from Firestore. @returns {Promise<Array>} */
  const fetchBiteReports = async () => {
    loading.value = true
    try {
      const q = query(collection(db, 'biteReports'), orderBy('reportedAt', 'desc'))
      const querySnapshot = await getDocs(q)
      reports.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      return reports.value
    } catch (error) {
      console.error('Failed to fetch bite reports:', error.message)
      return []
    } finally {
      loading.value = false
    }
  }

  /** Fetches a specific bite report by ID from Firestore. @returns {Promise<Object|null>} */
  const getBiteReportById = async (id) => {
    try {
      const docSnap = await getDoc(doc(db, 'biteReports', id))
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() }
      }
      return null
    } catch (error) {
      console.error('Failed to get bite report:', error.message)
      return null
    }
  }

  /** Creates a new bite report in Firestore. @returns {Promise<Object>} */
  const addBiteReport = async (reportData) => {
    loading.value = true
    try {
      const docRef = await addDoc(collection(db, 'biteReports'), {
        ...reportData,
        reportedAt: new Date(),
        createdAt: new Date(),
      })
      const newReport = { id: docRef.id, ...reportData, reportedAt: new Date(), createdAt: new Date() }
      reports.value.unshift(newReport)
      return newReport
    } catch (error) {
      console.error('Failed to add bite report:', error.message)
      throw error
    } finally {
      loading.value = false
    }
  }

  /** Updates an existing bite report in Firestore. @returns {Promise<Object|null>} */
  const updateBiteReport = async (id, reportData) => {
    loading.value = true
    try {
      await updateDoc(doc(db, 'biteReports', id), {
        ...reportData,
        updatedAt: new Date(),
      })
      const idx = reports.value.findIndex((r) => r.id === id)
      if (idx !== -1) {
        reports.value[idx] = { ...reports.value[idx], ...reportData, updatedAt: new Date() }
      }
      return reports.value[idx]
    } catch (error) {
      console.error('Failed to update bite report:', error.message)
      return null
    } finally {
      loading.value = false
    }
  }

  /** Fetches bite reports for a specific animal from Firestore. @returns {Promise<Array>} */
  const getBiteReportsByAnimal = async (animalId) => {
    try {
      const q = query(collection(db, 'biteReports'), where('animalId', '==', animalId), orderBy('reportedAt', 'desc'))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Failed to fetch bite reports for animal:', error.message)
      return []
    }
  }

  /** Fetches bite reports for a specific person from Firestore. @returns {Promise<Array>} */
  const getBiteReportsByPerson = async (personId) => {
    try {
      const q = query(collection(db, 'biteReports'), where('personId', '==', personId), orderBy('reportedAt', 'desc'))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Failed to fetch bite reports for person:', error.message)
      return []
    }
  }

  return {
    reports,
    loading,
    selectedReport,
    pending,
    reviewed,
    fetchBiteReports,
    getBiteReportById,
    addBiteReport,
    updateBiteReport,
    getBiteReportsByAnimal,
    getBiteReportsByPerson,
  }
})
