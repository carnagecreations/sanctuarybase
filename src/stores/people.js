import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '../services/firebase'
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc,
  query, where, orderBy, addDoc as firestoreAddDoc
} from 'firebase/firestore'
import { useActivityLogStore } from './activityLog'

export const usePeopleStore = defineStore('people', () => {
  const people = ref([])
  const loading = ref(false)

  /** Fetches all people from Firestore. @returns {Promise<void>} */
  const fetchPeople = async () => {
    loading.value = true
    try {
      const snapshot = await getDocs(collection(db, 'people'))
      people.value = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
    } catch (e) {
    } finally {
      loading.value = false
    }
  }

  /** Filters people by type from local state. Handles both the current
   *  `types` array schema and the legacy single `type` string. @returns {Array} */
  const getPeopleByType = (type) => people.value.filter(p =>
    Array.isArray(p.types) ? p.types.includes(type) : p.type === type
  )
  /** Gets a person by ID from local state. @returns {Object|undefined} */
  const getPersonById = (id) => people.value.find(p => p.id === id)

  /** Creates a new person in Firestore. @returns {Promise<Object>} */
  const addPerson = async (personData) => {
    const actLog = useActivityLogStore()
    try {
      const ref = await addDoc(collection(db, 'people'), {
        ...personData,
        linkedAnimals: [],
        donations: [],
        notes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      const newPerson = { id: ref.id, ...personData, linkedAnimals: [], donations: [], notes: [] }
      people.value.push(newPerson)
      await actLog.log('created', 'person', ref.id, personData.name, `Type: ${personData.type}`)
      return newPerson
    } catch (e) {
      throw e
    }
  }

  /** Updates an existing person in Firestore. @returns {Promise<void>} */
  const updatePerson = async (id, personData) => {
    const actLog = useActivityLogStore()
    try {
      const personRef = doc(db, 'people', id)
      await updateDoc(personRef, { ...personData, updatedAt: new Date().toISOString() })
      const idx = people.value.findIndex(p => p.id === id)
      if (idx >= 0) people.value[idx] = { ...people.value[idx], ...personData }
      await actLog.log('updated', 'person', id, personData.name, '')
    } catch (e) {
      throw e
    }
  }

  /** Deletes a person from Firestore. @returns {Promise<void>} */
  const deletePerson = async (id) => {
    const actLog = useActivityLogStore()
    const person = getPersonById(id)
    try {
      await deleteDoc(doc(db, 'people', id))
      people.value = people.value.filter(p => p.id !== id)
      if (person) await actLog.log('deleted', 'person', id, person.name, '')
    } catch (e) {
      throw e
    }
  }

  // Link/unlink an animal to a person
  /** Links an animal to a person in Firestore. @returns {Promise<void>} */
  const linkAnimal = async (personId, animalId, animalName) => {
    const actLog = useActivityLogStore()
    const person = getPersonById(personId)
    if (!person) return
    const linked = [...(person.linkedAnimals || [])]
    if (!linked.find(a => a.id === animalId)) {
      linked.push({ id: animalId, name: animalName, linkedAt: new Date().toISOString() })
      await updateDoc(doc(db, 'people', personId), { linkedAnimals: linked, updatedAt: new Date().toISOString() })
      const idx = people.value.findIndex(p => p.id === personId)
      if (idx >= 0) people.value[idx].linkedAnimals = linked
      await actLog.log('linked_animal', 'person', personId, person.name, `Linked to ${animalName}`)
    }
  }

  /** Unlinks an animal from a person in Firestore. @returns {Promise<void>} */
  const unlinkAnimal = async (personId, animalId) => {
    const person = getPersonById(personId)
    if (!person) return
    const linked = (person.linkedAnimals || []).filter(a => a.id !== animalId)
    await updateDoc(doc(db, 'people', personId), { linkedAnimals: linked, updatedAt: new Date().toISOString() })
    const idx = people.value.findIndex(p => p.id === personId)
    if (idx >= 0) people.value[idx].linkedAnimals = linked
  }

  // Donor giving history
  /** Records a donation for a person in Firestore. @returns {Promise<void>} */
  const addDonation = async (personId, donation) => {
    const actLog = useActivityLogStore()
    const person = getPersonById(personId)
    if (!person) return
    const donations = [...(person.donations || []), {
      ...donation,
      id: Date.now().toString(),
      date: donation.date || new Date().toISOString().slice(0, 10),
    }]
    await updateDoc(doc(db, 'people', personId), { donations, updatedAt: new Date().toISOString() })
    const idx = people.value.findIndex(p => p.id === personId)
    if (idx >= 0) people.value[idx].donations = donations
    await actLog.log('donation', 'person', personId, person.name, `$${donation.amount} - ${donation.campaign || 'General'}`)
  }

  // Notes with @mentions
  /** Adds a note with mentions to a person in Firestore. @returns {Promise<void>} */
  const addNote = async (personId, noteText, mentions = []) => {
    const actLog = useActivityLogStore()
    const { useAuthStore } = await import('./auth')
    const auth = useAuthStore()
    const person = getPersonById(personId)
    if (!person) return
    const notes = [...(person.notes || []), {
      id: Date.now().toString(),
      text: noteText,
      mentions,
      author: auth.user?.displayName || auth.user?.email || 'Demo User',
      createdAt: new Date().toISOString(),
    }]
    await updateDoc(doc(db, 'people', personId), { notes, updatedAt: new Date().toISOString() })
    const idx = people.value.findIndex(p => p.id === personId)
    if (idx >= 0) people.value[idx].notes = notes
    await actLog.log('note_added', 'person', personId, person.name, noteText.slice(0, 60))
  }

  /** Searches people by name, email, phone, or notes. @returns {Array} */
  const searchPeople = (q) => {
    const query = q.toLowerCase()
    return people.value.filter(p =>
      p.name?.toLowerCase().includes(query) ||
      p.email?.toLowerCase().includes(query) ||
      p.phone?.includes(query) ||
      p.location?.toLowerCase().includes(query) ||
      p.notes?.some(n => n.text?.toLowerCase().includes(query))
    )
  }

  return {
    people, loading,
    fetchPeople, getPeopleByType, getPersonById,
    addPerson, updatePerson, deletePerson,
    linkAnimal, unlinkAnimal,
    addDonation, addNote,
    searchPeople,
  }
})
