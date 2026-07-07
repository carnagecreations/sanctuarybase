<template>
  <Transition name="offline-banner-fade">
    <div v-if="!isOnline" class="offline-banner" role="status">
      <span class="offline-dot"></span>
      You're offline — changes will save and sync automatically once you're back online.
    </div>
  </Transition>
</template>

<script setup>
import { watch } from 'vue'
import { useOnlineStatus } from '../../composables/useOnlineStatus'
import { useUIStore } from '../../stores/ui'

const { isOnline } = useOnlineStatus()
const ui = useUIStore()

let wasOffline = false
watch(isOnline, (online) => {
  if (online && wasOffline) {
    ui.showToast('Back online — syncing your changes')
  }
  wasOffline = !online
})
</script>

<style scoped>
.offline-banner {
  position: sticky;
  top: 0;
  z-index: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--amber-l, #fff3cd);
  color: var(--amber, #8a6500);
  font-size: 12px;
  font-weight: 700;
  text-align: center;
}

.offline-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--amber, #8a6500);
  flex-shrink: 0;
  animation: offline-pulse 1.5s ease-in-out infinite;
}

@keyframes offline-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.offline-banner-fade-enter-active,
.offline-banner-fade-leave-active {
  transition: all 0.2s ease;
}
.offline-banner-fade-enter-from,
.offline-banner-fade-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}
</style>
