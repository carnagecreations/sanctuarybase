<template>
  <header class="app-bar">
    <div class="ab-brand" @click="ui.setCurrentTab('dashboard')">
      <div class="ab-mark">
        <img src="/logo.png" alt="SanctuaryBase" @error="onLogoError" ref="logoImg" style="width:100%;height:100%;object-fit:cover" />
      </div>
      <div>
        <div class="ab-title">Mission Control</div>
        <div class="ab-sub">
          <span style="color:var(--mint);font-weight:800">{{ auth.user?.orgName || 'Saint Francis Rescue' }}</span>
        </div>
      </div>
    </div>

    <div class="ab-right">
      <button class="btn-clockout" @click="ui.toggleTheme()" :title="ui.isDarkMode ? 'Light mode' : 'Dark mode'">
        {{ ui.isDarkMode ? '☀️' : '🌙' }}
      </button>

      <button
        v-if="!auth.isClocked"
        class="btn-clockout btn-clockout-active"
        @click="handleClockIn"
        title="Clock in to start tracking hours"
      >
        ✓ Clock in
      </button>
      <button
        v-else
        class="btn-clockout btn-clockout-working"
        @click="handleClockOut"
        title="Click to clock out"
      >
        <span class="pulse-dot"></span>
        Working: {{ elapsedTime }}
      </button>

      <button class="btn-clockout" @click="handleSignOut" style="display:none" id="admin-signout-btn">
        Sign out
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useUIStore } from '../../stores/ui'

const auth = useAuthStore()
const ui = useUIStore()
const elapsedTime = ref('0m')
const logoImg = ref(null)
let interval = null

const onLogoError = () => {
  if (logoImg.value) logoImg.value.style.display = 'none'
}

const updateElapsed = () => {
  if (!auth.clockInTime) return
  const secs = Math.floor((Date.now() - auth.clockInTime.getTime()) / 1000)
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  elapsedTime.value = h > 0 ? `${h}h ${m}m` : `${m}m`
}

const formatDuration = (seconds) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

const handleClockIn = async () => {
  await auth.clockIn()
  ui.showToast('Clocked in ✓')
}

const handleClockOut = async () => {
  await auth.clockOut()
  ui.showToast('Clocked out')
}

const handleSignOut = async () => {
  await auth.signOut()
}

onMounted(() => {
  updateElapsed()
  interval = setInterval(updateElapsed, 1000)
})
onUnmounted(() => clearInterval(interval))
</script>

<style scoped>
.btn-clockout-working {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, rgba(44, 210, 94, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%);
  border-color: var(--mint) !important;
  color: var(--mint);
  font-weight: 600;
}

.btn-clockout-working:hover {
  background: linear-gradient(135deg, rgba(44, 210, 94, 0.15) 0%, rgba(76, 175, 80, 0.1) 100%);
  border-color: var(--mint) !important;
}

.pulse-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  background: var(--mint);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.btn-clockout-active {
  background: linear-gradient(135deg, rgba(44, 210, 94, 0.15) 0%, rgba(76, 175, 80, 0.08) 100%);
  border-color: var(--mint) !important;
  color: var(--mint);
  font-weight: 600;
}

.btn-clockout-active:hover {
  background: linear-gradient(135deg, rgba(44, 210, 94, 0.2) 0%, rgba(76, 175, 80, 0.12) 100%);
  border-color: var(--mint) !important;
}
</style>
