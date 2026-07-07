import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '../services/firebase'
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where
} from 'firebase/firestore'
import { useActivityLogStore } from './activityLog'

export const useWaiversStore = defineStore('waivers', () => {
  const waivers = ref([])
  const loading = ref(false)

  /** Fetches all waivers from Firestore. @returns {Promise<void>} */
  const fetchWaivers = async () => {
    loading.value = true
    try {
      const snapshot = await getDocs(collection(db, 'waivers'))
      waivers.value = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
    } catch (e) {
      console.error('Error fetching waivers:', e)
    } finally {
      loading.value = false
    }
  }

  /** Creates a new waiver in Firestore. @returns {Promise<Object>} */
  const addWaiver = async (waiverData) => {
    const actLog = useActivityLogStore()
    try {
      const ref = await addDoc(collection(db, 'waivers'), {
        ...waiverData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      const newWaiver = { id: ref.id, ...waiverData, createdAt: new Date().toISOString() }
      waivers.value.push(newWaiver)
      await actLog.log('created', 'waiver', ref.id, waiverData.name, waiverData.signed ? 'Signed' : 'Unsigned')
      return newWaiver
    } catch (e) {
      throw e
    }
  }

  /** Signs a waiver in Firestore. @returns {Promise<void>} */
  const signWaiver = async (waiverId, signatureData) => {
    const actLog = useActivityLogStore()
    try {
      const waiverRef = doc(db, 'waivers', waiverId)
      await updateDoc(waiverRef, {
        signed: true,
        signedAt: new Date().toISOString(),
        signature: signatureData.signature,
        updatedAt: new Date().toISOString(),
      })
      const idx = waivers.value.findIndex(w => w.id === waiverId)
      if (idx >= 0) {
        waivers.value[idx] = {
          ...waivers.value[idx],
          signed: true,
          signedAt: new Date().toISOString(),
          signature: signatureData.signature,
        }
      }
      const waiver = waivers.value[idx]
      if (waiver) {
        await actLog.log('signed_waiver', 'waiver', waiverId, waiver.name, '')
      }
    } catch (e) {
      throw e
    }
  }

  /** Deletes a waiver from Firestore. @returns {Promise<void>} */
  const deleteWaiver = async (id) => {
    const actLog = useActivityLogStore()
    const waiver = waivers.value.find(w => w.id === id)
    try {
      await deleteDoc(doc(db, 'waivers', id))
      waivers.value = waivers.value.filter(w => w.id !== id)
      if (waiver) await actLog.log('deleted', 'waiver', id, waiver.name, '')
    } catch (e) {
      throw e
    }
  }

  /** Filters unsigned waivers from local state. @returns {Array} */
  const getUnsignedWaivers = () => waivers.value.filter(w => !w.signed)
  /** Filters signed waivers from local state. @returns {Array} */
  const getSignedWaivers = () => waivers.value.filter(w => w.signed)

  return {
    waivers, loading,
    fetchWaivers, addWaiver, signWaiver, deleteWaiver,
    getUnsignedWaivers, getSignedWaivers,
  }
})
