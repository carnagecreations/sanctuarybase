import { defineStore } from 'pinia'
import { ref } from 'vue'
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../services/firebase'

export const useAnimalsStore = defineStore('animals', () => {
  const animals = ref([])
  const loading = ref(false)
  const selectedAnimal = ref(null)

  /** Fetches all animals from Firestore. @returns {Promise<Array>} */
  const fetchAnimals = async () => {
    loading.value = true
    try {
      const querySnapshot = await getDocs(collection(db, 'animals'))
      animals.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      return animals.value
    } catch (error) {
      console.error('Failed to fetch animals:', error.message)
      return []
    } finally {
      loading.value = false
    }
  }

  /** Fetches a specific animal by ID from Firestore. @returns {Promise<Object|null>} */
  const getAnimalById = async (id) => {
    try {
      const docSnap = await getDoc(doc(db, 'animals', id))
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() }
      }
      return null
    } catch (error) {
      return null
    }
  }

  /** Creates a new animal in Firestore. @returns {Promise<Object>} */
  const addAnimal = async (animalData) => {
    loading.value = true
    try {
      const docRef = await addDoc(collection(db, 'animals'), {
        ...animalData,
        createdAt: new Date(),
      })
      const newAnimal = { id: docRef.id, ...animalData }
      animals.value.push(newAnimal)
      return newAnimal
    } catch (error) {
      console.error('Failed to add animal:', error.message)
      throw error
    } finally {
      loading.value = false
    }
  }

  /** Updates an existing animal in Firestore. @returns {Promise<Object|null>} */
  const updateAnimal = async (id, animalData) => {
    loading.value = true
    try {
      await updateDoc(doc(db, 'animals', id), {
        ...animalData,
        updatedAt: new Date(),
      })
      const idx = animals.value.findIndex((a) => a.id === id)
      if (idx !== -1) {
        animals.value[idx] = { ...animals.value[idx], ...animalData }
      }
      return animals.value[idx]
    } catch (error) {
      return null
    } finally {
      loading.value = false
    }
  }

  /** Deletes an animal from Firestore. @returns {Promise<void>} */
  const deleteAnimal = async (id) => {
    await deleteDoc(doc(db, 'animals', id))
    animals.value = animals.value.filter((a) => a.id !== id)
  }

  return {
    animals,
    loading,
    selectedAnimal,
    fetchAnimals,
    getAnimalById,
    addAnimal,
    updateAnimal,
    deleteAnimal,
  }
})
