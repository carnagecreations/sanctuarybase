import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  fetchStories, createStory, updateStory, deleteStory, uploadStoryImage
} from '../services/storiesService'

export const useStoriesStore = defineStore('stories', () => {
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)

  const loadItems = async () => {
    loading.value = true
    error.value = null
    try {
      items.value = await fetchStories()
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const addItem = async (data) => {
    const item = await createStory(data)
    items.value.unshift(item)
    return item
  }

  const editItem = async (id, data) => {
    const item = await updateStory(id, data)
    const idx = items.value.findIndex(i => i.id === id)
    if (idx !== -1) items.value[idx] = item
    return item
  }

  const removeItem = async (id) => {
    await deleteStory(id)
    items.value = items.value.filter(i => i.id !== id)
  }

  const uploadImage = (file) => uploadStoryImage(file)

  return { items, loading, error, loadItems, addItem, editItem, removeItem, uploadImage }
})
