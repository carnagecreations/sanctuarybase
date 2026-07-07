import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import router from '../router'

export const useUIStore = defineStore('ui', () => {
  // currentTab/setCurrentTab are kept as the public API every existing call
  // site already uses — they're now a thin wrapper around real routes
  // (real URLs, working back/forward, survives a refresh) instead of a bare
  // ref, so nothing else in the app needed to change.
  const currentTab = computed(() => router.currentRoute.value.name || 'dashboard')
  const isDarkMode = ref(true)
  const selectedAnimal = ref(null)
  const shiftPrefillVolunteer = ref(null)

  // Toast
  const toast = ref({ message: null, type: 'success' })
  const toastMessage = ref(null) // legacy compat

  // Confirm dialog
  const dialog = ref({ visible: false, title: '', message: '', icon: '', danger: false, confirmText: '', cancelText: '' })
  let dialogResolve = null

  const primaryTabs = ['dashboard', 'animals', 'shifts', 'people', 'vet-hub', 'admin-hub', 'inbox']

  /** Navigates to the named route. @returns {void} */
  const setCurrentTab = (tab, params) => {
    router.push({ name: tab, params }).catch((err) => {
      if (err?.name !== 'NavigationDuplicated') console.error('Navigation failed:', tab, err)
    })
  }

  /** Selects an animal and navigates to its detail route. @returns {void} */
  const selectAnimal = (animal) => {
    selectedAnimal.value = animal
    setCurrentTab('animal-detail', animal?.id ? { id: animal.id } : undefined)
  }

  /** Toggles between dark and light theme. @returns {void} */
  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value
    localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
  }

  /** Displays a toast notification. @returns {void} */
  const showToast = (message, type = 'success', duration = 3000) => {
    toast.value = { message, type }
    toastMessage.value = message
    setTimeout(() => {
      toast.value = { message: null, type: 'success' }
      toastMessage.value = null
    }, duration)
  }

  /** Shows a confirmation dialog. @returns {Promise<boolean>} */
  const confirm = (options) => {
    dialog.value = {
      visible: true,
      title: options.title || 'Are you sure?',
      message: options.message || '',
      icon: options.icon || '⚠️',
      danger: options.danger || false,
      confirmText: options.confirmText || 'Confirm',
      cancelText: options.cancelText || 'Cancel',
    }
    return new Promise((resolve) => { dialogResolve = resolve })
  }

  /** Resolves the confirmation dialog with a value. @returns {void} */
  const resolveDialog = (value) => {
    dialog.value.visible = false
    if (dialogResolve) { dialogResolve(value); dialogResolve = null }
  }

  return {
    currentTab, isDarkMode, selectedAnimal, shiftPrefillVolunteer, toast, toastMessage,
    dialog, primaryTabs,
    setCurrentTab, selectAnimal, toggleTheme, showToast, confirm, resolveDialog,
  }
})
