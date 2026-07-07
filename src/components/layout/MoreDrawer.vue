<template>
  <!-- Backdrop -->
  <transition name="fade">
    <div v-if="ui.showMoreDrawer" class="backdrop" @click="ui.toggleMoreDrawer" />
  </transition>

  <!-- Drawer -->
  <transition name="slide-up">
    <div v-if="ui.showMoreDrawer" class="drawer" @click.stop>
      <div class="drawer__handle"></div>

      <div class="drawer__header">
        <span class="drawer__title">More Features</span>
        <button class="drawer__close" @click="ui.toggleMoreDrawer">✕</button>
      </div>

      <div class="drawer__content">

        <div v-for="section in sections" :key="section.label" class="section">
          <div class="section__label">{{ section.label }}</div>
          <div class="section__grid">
            <button
              v-for="item in section.items"
              :key="item.label"
              class="feature-btn"
              @click="select(item.id)"
            >
              <span class="feature-btn__icon">{{ item.icon }}</span>
              <span class="feature-btn__label">{{ item.label }}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  </transition>
</template>

<script setup>
import { useUIStore } from '../../stores/ui'

const ui = useUIStore()

const sections = [
  {
    label: 'Daily Care',
    items: [
      { id: 'daily-rounds', icon: '🌅', label: 'Morning Rounds' },
      { id: 'feeding-log',  icon: '🍖', label: 'Feeding Log' },
      { id: 'med-run',      icon: '💊', label: 'Med Run' },
      { id: 'eod-report',   icon: '📝', label: 'EOD Report' },
    ],
  },
  {
    label: 'Animal Journeys',
    items: [
      { id: 'adoptions',  icon: '🏡', label: 'Adoptions' },
      { id: 'foster',     icon: '🤝', label: 'Safe Houses' },
      { id: 'enclosures', icon: '🏠', label: 'Enclosures' },
      { id: 'outcomes',   icon: '📊', label: 'Outcomes' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { id: 'bites',         icon: '🚨', label: 'Bite Reports' },
      { id: 'announcements', icon: '📢', label: 'Announcements' },
      { id: 'waivers',       icon: '📋', label: 'Waivers' },
      { id: 'messaging',     icon: '💌', label: 'Messages' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { id: 'ledger',  icon: '💰', label: 'Ledger' },
      { id: 'reports', icon: '📈', label: 'Reports' },
      { id: 'donors',  icon: '🎁', label: 'Donors' },
      { id: 'events',  icon: '🎉', label: 'Events' },
    ],
  },
  {
    label: 'Communications',
    items: [
      { id: 'inbox', icon: '📧', label: 'Inbox' },
    ],
  },
]

const select = (id) => {
  ui.showToast(`${id} coming soon 🚀`)
  ui.toggleMoreDrawer()
}
</script>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 30;
  background: rgba(0, 0, 0, .45);
}

.drawer {
  position: fixed;
  bottom: 64px; /* clears bottom nav */
  left: 0;
  right: 0;
  z-index: 40;
  background: var(--bg-2);
  border-top: 2px solid var(--mint);
  border-radius: 20px 20px 0 0;
  max-height: 62vh;
  overflow-y: auto;
  box-shadow: var(--shadow);
}

.drawer__handle {
  width: 36px;
  height: 3px;
  background: var(--border-2);
  border-radius: 2px;
  margin: 10px auto 0;
}

.drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 10px;
  border-bottom: 1px solid var(--border);
}

.drawer__title {
  font-size: 15px;
  font-weight: 800;
  color: var(--ink);
}

.drawer__close {
  background: none;
  border: none;
  color: var(--ink-3);
  font-size: 16px;
  cursor: pointer;
  padding: 4px 6px;
  transition: color .15s;
}
.drawer__close:hover { color: var(--ink); }

.drawer__content {
  padding: 12px 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section__label {
  font-size: 10px;
  font-weight: 900;
  color: var(--mint);
  text-transform: uppercase;
  letter-spacing: .08em;
  margin-bottom: 8px;
}

.section__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.feature-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 10px 6px;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--r);
  cursor: pointer;
  transition: all .15s;
  font-family: 'Nunito', sans-serif;
}
.feature-btn:hover {
  background: var(--teal-l);
  border-color: var(--mint);
}

.feature-btn__icon  { font-size: 20px; }
.feature-btn__label {
  font-size: 9px;
  font-weight: 800;
  color: var(--ink-2);
  text-align: center;
  text-transform: uppercase;
  letter-spacing: .03em;
  line-height: 1.3;
}

/* Transitions */
.fade-enter-active, .fade-leave-active    { transition: opacity .2s; }
.fade-enter-from,  .fade-leave-to        { opacity: 0; }

.slide-up-enter-active, .slide-up-leave-active { transition: transform .25s ease; }
.slide-up-enter-from,   .slide-up-leave-to     { transform: translateY(100%); }
</style>
