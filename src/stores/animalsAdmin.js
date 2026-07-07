import { defineStore } from 'pinia'
import {
  fetchAllAnimals, createAnimal, updateAnimal, deleteAnimal, uploadAnimalImages
} from '../services/animalsAdminService'
import { useAnimalsStore } from './animals'

// Publishes this app's animal records to the public website's
// adoptable/foster/sanctuary-resident listings (the Neon-backed
// /api/admin/animals endpoints admin.html used). Each internal animal
// tracks its own siteAnimalId once published — see WebsiteListingTab.vue.
export const useAnimalsAdminStore = defineStore('animalsAdmin', () => {
  const addAnimal = (data) => createAnimal(data)
  const editAnimal = (id, data) => updateAnimal(id, data)
  const removeAnimal = (id) => deleteAnimal(id)
  const uploadImages = (files) => uploadAnimalImages(files)

  // Site status -> internal care status (inverse of WebsiteListingTab's map).
  const REVERSE_STATUS_MAP = { available: 'available', fostered: 'foster', adopted: 'adopted', resident: 'sanctuary' }

  // One-time reconciliation: any animal already live on the website that
  // isn't linked to an internal record (created before this app could
  // publish, e.g. via the old admin.html) gets imported so it becomes
  // editable/unpublishable from here — the site should only ever reflect
  // what this app knows about.
  const importFromSite = async () => {
    const animalsStore = useAnimalsStore()
    // Always re-fetch fresh — relying on whatever happened to already be in
    // local memory here is exactly what let a re-run duplicate everything.
    await animalsStore.fetchAnimals()

    const linkedSiteIds = new Set(animalsStore.animals.map(a => a.siteAnimalId).filter(Boolean))
    const siteAnimals = await fetchAllAnimals()
    const unlinked = siteAnimals.filter(a => !linkedSiteIds.has(a.id))

    for (const site of unlinked) {
      await animalsStore.addAnimal({
        name: site.name,
        species: site.species,
        breed: site.breed || '',
        age: site.age || '',
        sex: site.sex || '',
        status: REVERSE_STATUS_MAP[site.status] || 'available',
        location: '',
        siteAnimalId: site.id,
        publicDescription: site.description || '',
        publicPhotos: site.imageUrls || [],
        needsFoster: !!site.needsFoster,
        isFeatured: !!site.isFeatured,
        sitePublishedAt: site.createdAt || new Date().toISOString(),
      })
    }
    return unlinked.length
  }

  return { addAnimal, editAnimal, removeAnimal, uploadImages, importFromSite }
})
