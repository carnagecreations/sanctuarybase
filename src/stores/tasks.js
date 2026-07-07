import { defineStore } from 'pinia'
import { ref } from 'vue'
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../services/firebase'

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref([])
  const loading = ref(false)
  let unsubscribe = null
  let firstSnapshotPromise = null

  /** Subscribes to real-time task updates (once). @returns {Promise<Array>} resolves on first snapshot */
  const subscribe = () => {
    if (firstSnapshotPromise) return firstSnapshotPromise
    loading.value = true
    firstSnapshotPromise = new Promise((resolve) => {
      unsubscribe = onSnapshot(collection(db, 'tasks'), (snapshot) => {
        tasks.value = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        loading.value = false
        resolve(tasks.value)
      }, (error) => {
        console.error('Tasks listener error:', error.message)
        loading.value = false
        resolve(tasks.value)
      })
    })
    return firstSnapshotPromise
  }

  /** Fetches all tasks (live via onSnapshot). @returns {Promise<Array>} */
  const fetchTasks = async () => {
    await subscribe()
    return tasks.value
  }

  /** Stops the real-time listener. @returns {void} */
  const stopListening = () => {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
      firstSnapshotPromise = null
    }
  }

  /** Creates a new task in Firestore. @returns {Promise<Object>} */
  const addTask = async (taskData) => {
    loading.value = true
    try {
      const docRef = await addDoc(collection(db, 'tasks'), {
        ...taskData,
        completed: false,
        createdAt: new Date().toISOString(),
      })
      const newTask = { id: docRef.id, ...taskData, completed: false }
      // With an active listener the snapshot is the source of truth.
      if (!unsubscribe) tasks.value.unshift(newTask)
      return newTask
    } catch (error) {
      console.error('Failed to add task:', error.message)
      throw error
    } finally {
      loading.value = false
    }
  }

  /** Updates an existing task in Firestore. @returns {Promise<Object|null>} */
  const updateTask = async (id, taskData) => {
    loading.value = true
    try {
      await updateDoc(doc(db, 'tasks', id), taskData)
      const existing = tasks.value.find(t => t.id === id)
      const updated = existing ? { ...existing, ...taskData } : null
      if (!unsubscribe && updated) {
        const idx = tasks.value.findIndex(t => t.id === id)
        tasks.value[idx] = updated
      }
      return updated
    } catch (error) {
      console.error('Failed to update task:', error.message)
      throw error
    } finally {
      loading.value = false
    }
  }

  /** Deletes a task from Firestore. @returns {Promise<void>} */
  const deleteTask = async (id) => {
    loading.value = true
    try {
      await deleteDoc(doc(db, 'tasks', id))
      if (!unsubscribe) tasks.value = tasks.value.filter(t => t.id !== id)
    } catch (error) {
      console.error('Failed to delete task:', error.message)
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    tasks,
    loading,
    fetchTasks,
    stopListening,
    addTask,
    updateTask,
    deleteTask,
  }
})
