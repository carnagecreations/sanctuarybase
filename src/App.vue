<template>
  <!-- Show signup success screen on top of dashboard if just completed signup -->
  <div v-if="auth.isLoggedIn && signupStore.showSuccessScreen" class="signup-success-overlay">
    <div class="signup-success-modal">
      <div class="success-icon">✅</div>
      <h1>Welcome to the team, {{ signupStore.volunteerName }}!</h1>
      <p>Your account is ready to go.</p>
      <button class="btn-primary" @click="signupStore.clearSignupSuccess()">Go to dashboard</button>
    </div>
  </div>

  <VolunteerSignup v-else-if="!auth.isLoggedIn && showVolunteerSignup" @switch-to-login="showVolunteerSignup = false" />
  <WelcomeScreen v-else-if="!auth.isLoggedIn" @switch-to-volunteer="showVolunteerSignup = true" />

  <template v-else>
    <OfflineBanner />
    <Header />
    <main>
      <router-view />
    </main>
    <BottomNav />
    <Toast />
    <ConfirmDialog />
  </template>
</template>

<script setup>
import { watch, onMounted, onUnmounted, ref } from 'vue'
import { useAuthStore } from './stores/auth'
import { useUIStore } from './stores/ui'
import { useSignupStore } from './stores/signup'
import { useContacts } from './stores/contacts'
import { playNotificationSound, sendBrowserNotification, showNotification } from './services/notifications'
import Header      from './components/layout/Header.vue'
import BottomNav   from './components/layout/BottomNav.vue'
import Toast         from './components/shared/Toast.vue'
import ConfirmDialog from './components/shared/ConfirmDialog.vue'
import OfflineBanner from './components/shared/OfflineBanner.vue'
import WelcomeScreen from './components/auth/WelcomeScreen.vue'
import VolunteerSignup from './components/auth/VolunteerSignup.vue'

const auth = useAuthStore()
const ui   = useUIStore()
const signupStore = useSignupStore()
const { loadContacts } = useContacts()
const showVolunteerSignup = ref(false)
let contactsPoll = null

// Theme: default dark, persist in localStorage
const applyTheme = () => {
  document.documentElement.setAttribute('data-theme', ui.isDarkMode ? 'dark' : 'light')
}

const savedTheme = localStorage.getItem('sb_theme')
ui.isDarkMode = savedTheme !== 'light'   // default dark

watch(() => ui.isDarkMode, () => {
  localStorage.setItem('sb_theme', ui.isDarkMode ? 'dark' : 'light')
  applyTheme()
})

// Keeps the Inbox nav badge (BottomNav.vue) accurate even when staff/admin
// never visit Dashboard this session — previously it only loaded on
// Dashboard mount, so a new contact submission was invisible until someone
// happened to open Dashboard or Inbox. Contacts live in Postgres (not
// Firestore), so there's no realtime listener option — poll instead.
const CONTACTS_POLL_MS = 60000

const startContactsPolling = () => {
  if (contactsPoll) return
  const role = auth.user?.role
  if (role !== 'admin' && role !== 'staff') return

  const handleNewMessages = (newMessages) => {
    if (newMessages.length === 0) return
    playNotificationSound()
    showNotification(ui, `📬 ${newMessages.length} new message${newMessages.length !== 1 ? 's' : ''} received`, 'success')
    const firstMsg = newMessages[0]
    sendBrowserNotification(`New message from ${firstMsg.name}`, {
      tag: 'inbox-notification',
      body: firstMsg.subject || 'New contact form submission'
    })
  }

  loadContacts(handleNewMessages)
  contactsPoll = setInterval(() => loadContacts(handleNewMessages), CONTACTS_POLL_MS)
}

const stopContactsPolling = () => {
  if (contactsPoll) {
    clearInterval(contactsPoll)
    contactsPoll = null
  }
}

watch(() => auth.user?.role, () => {
  stopContactsPolling()
  startContactsPolling()
})

onMounted(() => {
  auth.initializeAuth()
  window.addEventListener('message', (e) => {
    if (e.data?.type === 'navigate' && e.data?.tab) {
      ui.setCurrentTab(e.data.tab)
    }
  })
  startContactsPolling()
})

onUnmounted(stopContactsPolling)

// Recurring tasks: there's no server cron, so due instances are materialized
// whenever a staff/admin logs in (firestore rules restrict task creation to
// privileged roles, so this must not run for volunteers).
let recurringChecked = false
watch(() => auth.isLoggedIn, async (loggedIn) => {
  if (!loggedIn || recurringChecked) return
  const role = auth.user?.role
  if (role !== 'admin' && role !== 'staff') return
  recurringChecked = true
  try {
    const { useRecurringTasksStore } = await import('./stores/recurringTasks')
    await useRecurringTasksStore().generateDueTasks()
  } catch (e) {
    console.error('Recurring task generation failed:', e.message)
  }
}, { immediate: true })

// Analytics: track admin login
watch(() => auth.isLoggedIn, (loggedIn) => {
  if (loggedIn && auth.user?.role === 'admin') {
    try {
      if (typeof window.plausible === 'function') {
        window.plausible('Admin Login', { props: { userId: auth.user?.id || 'unknown' } })
      }
    } catch (e) { /* analytics must never break the page */ }
  }
})
</script>

<style scoped>
.signup-success-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(8px);
  animation: fadeIn var(--duration-normal);
}

.signup-success-modal {
  background: var(--color-surface-1);
  border-radius: var(--radius-2xl);
  padding: var(--space-11);
  text-align: center;
  max-width: 400px;
  box-shadow: var(--shadow-2xl);
  border: 1px solid var(--color-border-strong);
  animation: scaleIn var(--duration-normal) var(--ease-out);
}

.success-icon {
  font-size: 64px;
  margin-bottom: var(--space-5);
  display: block;
  animation: bounce var(--duration-normal);
}

.signup-success-modal h1 {
  font-family: var(--font-family-display);
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-black);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2);
  letter-spacing: var(--letter-spacing-tight);
}

.signup-success-modal p {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-lg);
  margin: 0 0 var(--space-7);
  line-height: var(--line-height-relaxed);
}

.btn-primary {
  width: 100%;
  padding: var(--space-4) var(--space-6);
  background: var(--gradient-success);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-family-primary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-black);
  cursor: pointer;
  transition: all var(--duration-fast);
  box-shadow: var(--shadow-glow-success);
  letter-spacing: var(--letter-spacing-loose);
  text-transform: uppercase;
}

.btn-primary:hover {
  filter: brightness(1.12);
  transform: translateY(-2px);
  box-shadow: var(--shadow-glow-success), var(--shadow-lg);
}

.btn-primary:active {
  filter: brightness(0.95);
  transform: translateY(0);
}
</style>
