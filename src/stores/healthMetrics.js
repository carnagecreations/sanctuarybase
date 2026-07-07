import { defineStore } from 'pinia'
import { ref } from 'vue'
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore'
import { db } from '../services/firebase'

export const useHealthMetricsStore = defineStore('healthMetrics', () => {
  const metrics = ref([])
  const loading = ref(false)

  /** Fetches health metrics for a specific animal from Firestore. @returns {Promise<Array>} */
  const fetchByAnimalId = async (animalId) => {
    loading.value = true
    try {
      const q = query(
        collection(db, 'healthMetrics'),
        where('animalId', '==', animalId),
        orderBy('date', 'desc')
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Failed to fetch health metrics:', error.message)
      return []
    } finally {
      loading.value = false
    }
  }

  /** Fetches a specific health metric by ID from Firestore. @returns {Promise<Object|null>} */
  const getMetricById = async (id) => {
    try {
      const docSnap = await getDoc(doc(db, 'healthMetrics', id))
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() }
      }
      return null
    } catch (error) {
      console.error('Failed to fetch metric:', error.message)
      return null
    }
  }

  /** Creates a new health metric in Firestore. @returns {Promise<Object>} */
  const addMetric = async (metricData) => {
    loading.value = true
    try {
      const docRef = await addDoc(collection(db, 'healthMetrics'), {
        ...metricData,
        recordedAt: new Date(),
      })
      const newMetric = { id: docRef.id, ...metricData }
      metrics.value.unshift(newMetric)
      return newMetric
    } catch (error) {
      console.error('Failed to add health metric:', error.message)
      throw error
    } finally {
      loading.value = false
    }
  }

  /** Updates an existing health metric in Firestore. @returns {Promise<Object|null>} */
  const updateMetric = async (id, metricData) => {
    loading.value = true
    try {
      await updateDoc(doc(db, 'healthMetrics', id), {
        ...metricData,
        updatedAt: new Date(),
      })
      const idx = metrics.value.findIndex((m) => m.id === id)
      if (idx !== -1) {
        metrics.value[idx] = { ...metrics.value[idx], ...metricData }
      }
      return metrics.value[idx]
    } catch (error) {
      console.error('Failed to update health metric:', error.message)
      throw error
    } finally {
      loading.value = false
    }
  }

  /** Deletes a health metric from Firestore. @returns {Promise<void>} */
  const deleteMetric = async (id) => {
    loading.value = true
    try {
      await deleteDoc(doc(db, 'healthMetrics', id))
      const idx = metrics.value.findIndex((m) => m.id === id)
      if (idx !== -1) {
        metrics.value.splice(idx, 1)
      }
    } catch (error) {
      console.error('Failed to delete health metric:', error.message)
      throw error
    } finally {
      loading.value = false
    }
  }

  /** Calculates weight trend from animal metrics. @returns {Object|null} */
  const getTrend = (animalMetrics) => {
    if (animalMetrics.length < 2) return null
    const latest = animalMetrics[0]
    const previous = animalMetrics[1]
    if (!latest.weight || !previous.weight) return null

    const change = parseFloat(latest.weight) - parseFloat(previous.weight)
    const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'stable'

    return {
      change: Math.abs(change).toFixed(1),
      direction,
      fromDate: previous.date
    }
  }

  /** Calculates total weight change over time. @returns {Object|null} */
  const calculateWeightChange = (animalMetrics, unit = 'kg') => {
    if (animalMetrics.length < 2) return null
    const latest = animalMetrics[0]
    const oldest = animalMetrics[animalMetrics.length - 1]

    const change = parseFloat(latest.weight) - parseFloat(oldest.weight)
    const percentChange = ((change / parseFloat(oldest.weight)) * 100).toFixed(1)

    return {
      totalChange: change.toFixed(1),
      percentChange,
      unit,
      period: `${oldest.date} to ${latest.date}`
    }
  }

  return {
    metrics,
    loading,
    fetchByAnimalId,
    getMetricById,
    addMetric,
    updateMetric,
    deleteMetric,
    getTrend,
    calculateWeightChange,
  }
})
