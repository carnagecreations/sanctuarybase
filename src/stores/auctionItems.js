import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  fetchAuctionItems, createAuctionItem, updateAuctionItem, deleteAuctionItem, uploadAuctionImage
} from '../services/auctionItemsService'

export const useAuctionItemsStore = defineStore('auctionItems', () => {
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)

  const loadItems = async () => {
    loading.value = true
    error.value = null
    try {
      items.value = await fetchAuctionItems()
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const addItem = async (data) => {
    const item = await createAuctionItem(data)
    items.value.unshift(item)
    return item
  }

  const editItem = async (id, data) => {
    const item = await updateAuctionItem(id, data)
    const idx = items.value.findIndex(i => i.id === id)
    if (idx !== -1) items.value[idx] = item
    return item
  }

  const removeItem = async (id) => {
    await deleteAuctionItem(id)
    items.value = items.value.filter(i => i.id !== id)
  }

  const uploadImage = (file) => uploadAuctionImage(file)

  return { items, loading, error, loadItems, addItem, editItem, removeItem, uploadImage }
})
