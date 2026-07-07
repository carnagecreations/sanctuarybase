import { defineStore } from 'pinia'
import { ref } from 'vue'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuthStore } from './auth'

// Per-animal profile records (traits, memory notes, SOS alerts, meet &
// greets, testimonials) stored in the `animalbehavior` collection with a
// `kind` discriminator. The collection already exists in firestore.rules
// (staff/admin read+write), so no rules deploy is needed.
//
// Queries use equality filters only and sort client-side — where+orderBy
// combinations would each require a composite index that isn't deployed.
export const useAnimalRecordsStore = defineStore('animalRecords', () => {
  const loading = ref(false)

  /** Fetches records of one kind for an animal, newest first. @returns {Promise<Array>} */
  const fetchByAnimalId = async (animalId, kind) => {
    loading.value = true
    try {
      const q = query(
        collection(db, 'animalbehavior'),
        where('animalId', '==', animalId),
        where('kind', '==', kind),
      )
      const snap = await getDocs(q)
      return snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
    } catch (error) {
      console.error(`Failed to fetch ${kind} records:`, error.message)
      return []
    } finally {
      loading.value = false
    }
  }

  /** Creates a record. @returns {Promise<Object>} */
  const addRecord = async (animalId, kind, data) => {
    loading.value = true
    try {
      const auth = useAuthStore()
      const entry = {
        ...data,
        animalId,
        kind,
        createdBy: auth.user?.displayName || auth.user?.email || '',
        createdAt: new Date().toISOString(),
      }
      const docRef = await addDoc(collection(db, 'animalbehavior'), entry)
      return { id: docRef.id, ...entry }
    } catch (error) {
      console.error(`Failed to add ${kind} record:`, error.message)
      throw error
    } finally {
      loading.value = false
    }
  }

  /** Updates a record. @returns {Promise<void>} */
  const updateRecord = async (id, data) => {
    loading.value = true
    try {
      await updateDoc(doc(db, 'animalbehavior', id), {
        ...data,
        updatedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Failed to update record:', error.message)
      throw error
    } finally {
      loading.value = false
    }
  }

  /** Deletes a record. @returns {Promise<void>} */
  const deleteRecord = async (id) => {
    loading.value = true
    try {
      await deleteDoc(doc(db, 'animalbehavior', id))
    } catch (error) {
      console.error('Failed to delete record:', error.message)
      throw error
    } finally {
      loading.value = false
    }
  }

  return { loading, fetchByAnimalId, addRecord, updateRecord, deleteRecord }
})
