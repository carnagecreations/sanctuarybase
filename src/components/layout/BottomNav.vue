<template>
  <nav class="bottom-nav">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      class="nav-tab"
      :class="{ active: ui.currentTab === tab.id }"
      @click="select(tab.id)"
    >
      <span class="nav-icon">
        {{ tab.icon }}
        <span v-if="tab.id === 'inbox' && unreadCount > 0" class="nav-badge">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
      </span>
      {{ tab.label }}
    </button>

  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useUIStore } from '../../stores/ui'
import { useAuthStore } from '../../stores/auth'
import { useContacts } from '../../stores/contacts'

const ui = useUIStore()
const auth = useAuthStore()
const { unreadCount } = useContacts()

const adminTabs = [
  { id: 'dashboard',  label: 'Home',    icon: '🏠' },
  { id: 'animals',    label: 'Animals', icon: '🐾' },
  { id: 'shifts',     label: 'Shifts',  icon: '⏰' },
  { id: 'people',     label: 'People',  icon: '👥' },
  { id: 'vet-hub',    label: 'Vet Hub', icon: '🩺' },
  { id: 'inbox',      label: 'Inbox',   icon: '📧' },
  { id: 'admin-hub',  label: 'Admin',   icon: '⚙️' },
]

// Staff get day-to-day operations (same Admin Hub, but with finance,
// grants, compliance, and the auction/fundraising tools hidden — see
// AdminHub.vue's role filtering).
const staffTabs = adminTabs

const volunteerTabs = [
  { id: 'dashboard',         label: 'Home',         icon: '🏠' },
  { id: 'volunteer-animals', label: 'Animals',      icon: '🐾' },
  { id: 'admin-announcements', label: 'News',      icon: '📰' },
  { id: 'shifts',            label: 'My Shifts',    icon: '📅' },
  { id: 'volunteer-tasks',   label: 'Tasks',        icon: '✓' },
  { id: 'supplies',          label: 'Supplies',     icon: '📦' },
  { id: 'volunteer-training', label: 'Training',    icon: '🎓' },
]

const tabs = computed(() => {
  if (auth.user?.role === 'admin') return adminTabs
  if (auth.user?.role === 'staff') return staffTabs
  return volunteerTabs
})

const select = (id) => {
  ui.setCurrentTab(id)
}
</script>

<style scoped>
.nav-icon { position: relative; display: inline-block; }

.nav-badge {
  position: absolute;
  top: -6px;
  right: -10px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  background: var(--coral, #FF6B6B);
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  line-height: 16px;
  text-align: center;
  box-shadow: 0 0 0 2px var(--surface, #12141a);
}
</style>
