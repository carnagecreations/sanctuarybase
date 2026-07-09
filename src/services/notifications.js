// App notification service for alerts and sounds

// Request browser notification permission
export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false

  try {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  } catch (err) {
    console.error('Failed to request notification permission:', err)
    return false
  }
}

// Send browser notification
export function sendBrowserNotification(title, options = {}) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return

  try {
    new Notification(title, {
      icon: '/images/logo-mark-sm.png',
      ...options
    })
  } catch (err) {
    console.error('Failed to send notification:', err)
  }
}

// Play notification sound
export function playNotificationSound() {
  try {
    const audio = new Audio('/sounds/new-message.wav')
    audio.play().catch(err => {
      console.error('Failed to play notification sound:', err)
    })
  } catch (err) {
    console.error('Failed to create audio element:', err)
  }
}

// Show app toast notification (uses existing UI store)
export function showNotification(ui, message, type = 'success') {
  if (ui && typeof ui.showToast === 'function') {
    ui.showToast(message, type, 4000)
  }
}
