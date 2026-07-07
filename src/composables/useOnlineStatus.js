import { ref, onMounted, onUnmounted } from 'vue'

// Module-level singleton state — every component that calls this composable
// shares one pair of listeners instead of each mounting its own.
const isOnline = ref(navigator.onLine)
let listenerCount = 0

const handleOnline = () => { isOnline.value = true }
const handleOffline = () => { isOnline.value = false }

/** Tracks browser connectivity so the UI can warn field staff their
 *  writes are queuing locally instead of syncing immediately. */
export function useOnlineStatus() {
  onMounted(() => {
    if (listenerCount === 0) {
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)
    }
    listenerCount++
  })

  onUnmounted(() => {
    listenerCount--
    if (listenerCount === 0) {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  })

  return { isOnline }
}
