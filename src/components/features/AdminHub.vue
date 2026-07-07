<template>
  <PageContainer>

    <!-- Hub Header -->
    <div class="hub-header">
      <div class="hub-header__title">Admin Hub</div>
      <div class="hub-header__date">{{ today }}</div>
    </div>

    <!-- Dynamic Sections -->
    <div v-for="section in visibleSections" :key="section.id" class="hub-section" :style="{ '--sc': section.hex }">
      <div class="section-head">
        <span class="section-dot"></span>
        <span class="section-title">{{ section.label }}</span>
      </div>
      <div class="hub-grid" :class="section.gridClass">
        <button
          v-for="item in section.items"
          :key="item.label"
          class="hub-item"
          :class="section.itemClass || ''"
          @click="selectFeature(item.id)"
        >
          <span class="hub-item__icon">{{ item.icon }}</span>
          <span class="hub-item__label">{{ item.label }}</span>
        </button>
      </div>
    </div>

    <!-- Bottom actions -->
    <div class="theme-section">
      <AppCard :flat="true">
        <div class="theme-row">
          <span>{{ ui.isDarkMode ? '🌙 Dark Mode' : '☀️ Light Mode' }}</span>
          <button class="theme-toggle" @click="ui.toggleTheme()">
            {{ ui.isDarkMode ? '→ Light' : '→ Dark' }}
          </button>
        </div>
        <div class="theme-row" style="border-top: 1px solid var(--border);">
          <span>👤 Profile</span>
          <button class="theme-toggle" @click="selectFeature('profile')">
            Edit
          </button>
        </div>
      </AppCard>
    </div>

  </PageContainer>
</template>

<script setup>
import { computed } from 'vue'
import { PageContainer, AppCard } from '../ui'
import { useUIStore } from '../../stores/ui'
import { useAuthStore } from '../../stores/auth'

const ui = useUIStore()
const auth = useAuthStore()
const isAdmin = computed(() => auth.user?.role === 'admin')

const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

const allSections = [
  {
    id: 'quick-access',
    label: 'Quick Access',
    hex: '#4EFFC5',
    gridClass: 'hub-grid-6',
    itemClass: 'hub-item-lg',
    items: [
      { id: 'announcements',  icon: '📢', label: 'Announcements' },
      { id: 'messaging',      icon: '💌', label: 'Message Team' },
      { id: 'tasks',          icon: '✅', label: 'Tasks' },
      { id: 'supplies',       icon: '📦', label: 'Supplies' },
      { id: 'reports',        icon: '📈', label: 'Finance Stats', adminOnly: true },
      { id: 'shift-calendar', icon: '🗓️', label: 'Shifts' },
    ]
  },
  {
    id: 'daily-care',
    label: 'Daily Care',
    hex: '#FF9500',
    gridClass: 'hub-grid',
    items: [
      { id: 'morning-rounds', icon: '🌅', label: 'Morning Rounds' },
      { id: 'feeding-log',    icon: '🍖', label: 'Feeding Log' },
      { id: 'med-run',        icon: '💊', label: 'Med Run' },
      { id: 'eod-report',     icon: '📝', label: 'EOD Report' },
    ]
  },
  {
    id: 'people',
    label: 'People & Community',
    hex: '#5B8DEF',
    gridClass: 'hub-grid',
    items: [
      { id: 'people',       icon: '👥', label: 'People & CRM' },
      { id: 'availability', icon: '📅', label: 'Availability' },
      { id: 'waivers',      icon: '📋', label: 'Waivers' },
      { id: 'inbox',        icon: '📥', label: 'Applications & Inbox' },
      { id: 'training',     icon: '🎓', label: 'Training' },
      { id: 'newsletter',   icon: '📰', label: 'Newsletter', adminOnly: true },
      { id: 'stories',      icon: '📝', label: 'Stories', adminOnly: true },
    ]
  },
  {
    id: 'animals',
    label: 'Animals',
    hex: '#52C96F',
    gridClass: 'hub-grid',
    items: [
      { id: 'adoptions',      icon: '🏡', label: 'Adoptions' },
      { id: 'intake',         icon: '➕', label: 'Intake Wizard' },
      { id: 'outcomes',       icon: '📊', label: 'Outcomes' },
      { id: 'pipeline',       icon: '🔄', label: 'Pipeline' },
      { id: 'quarantine',     icon: '🔇', label: 'Quarantine' },
      { id: 'auction-items',  icon: '🔨', label: 'Auction Items', adminOnly: true },
    ]
  },
  {
    id: 'operations',
    label: 'Operations',
    hex: '#FF6B9D',
    gridClass: 'hub-grid',
    items: [
      { id: 'reports-hub',    icon: '📈', label: 'Reports & Analytics', adminOnly: true },
      { id: 'volunteer-hours', icon: '⏱️', label: 'Volunteer Hours' },
      { id: 'activity-log',   icon: '📊', label: 'Activity Log' },
      { id: 'bites',          icon: '🚨', label: 'Bite Reports' },
      { id: 'foster',         icon: '🏠', label: 'Safe Houses' },
      { id: 'reminders',      icon: '🔔', label: 'Reminders' },
    ]
  },
  {
    id: 'finance',
    label: 'Finance & Grants',
    hex: '#FFB300',
    gridClass: 'hub-grid',
    adminOnly: true,
    items: [
      { id: 'ledger',     icon: '💰', label: 'Ledger' },
      { id: 'donors',     icon: '🎁', label: 'Donors' },
      { id: 'grants',     icon: '📄', label: 'Manage Grants' },
      { id: 'grants-hub', icon: '🔍', label: 'Find Grants' },
    ]
  },
  {
    id: 'compliance',
    label: 'Compliance & Support',
    hex: '#FF5252',
    gridClass: 'hub-grid',
    items: [
      { id: 'medical-compliance', icon: '📋', label: 'Medical Compliance' },
      { id: 'fundraising',        icon: '🤝', label: 'Fundraising', adminOnly: true },
    ]
  },
]

// Staff see day-to-day operations only — financial and fundraising tools
// (Finance & Grants, Auction Items, Fundraising, Finance Stats) are admin-only.
const visibleSections = computed(() =>
  allSections
    .filter((s) => !s.adminOnly || isAdmin.value)
    .map((s) => ({ ...s, items: s.items.filter((i) => !i.adminOnly || isAdmin.value) }))
    .filter((s) => s.items.length > 0)
)

const featureRoutes = {
  'announcements':      'admin-announcements',
  'messaging':          'admin-message-team',
  'tasks':              'admin-tasks',
  'supplies':           'admin-supplies',
  'reports':            'admin-finance-stats',
  'shift-calendar':     'admin-shift-calendar',
  'morning-rounds':     'admin-rounds',
  'feeding-log':        'admin-feeding',
  'med-run':            'admin-med-run',
  'eod-report':         'admin-eod',
  'people':             'admin-people',
  'availability':       'admin-availability',
  'waivers':            'admin-waivers',
  'inbox':              'inbox',
  'training':           'volunteer-training',
  'newsletter':         'admin-newsletter',
  'adoptions':          'admin-adoptions',
  'intake':             'admin-intake',
  'outcomes':           'admin-outcomes',
  'pipeline':           'admin-pipeline',
  'quarantine':         'admin-quarantine',
  'auction-items':      'admin-auction-items',
  'reports-hub':        'admin-reports-hub',
  'stories':            'admin-stories',
  'volunteer-hours':    'admin-volunteer-hours',
  'activity-log':       'admin-activity',
  'bites':              'admin-bites',
  'foster':             'admin-safe-houses',
  'reminders':          'admin-reminders',
  'ledger':             'admin-ledger',
  'donors':             'admin-donors',
  'grants':             'admin-grants',
  'grants-hub':         'admin-grant-finder',
  'medical-compliance': 'admin-compliance',
  'fundraising':        'admin-fundraising',
  'profile':            'volunteer-profile',
}

const selectFeature = (id) => {
  const route = featureRoutes[id]
  if (route) {
    ui.setCurrentTab(route)
  } else {
    ui.showToast(`${id} coming soon 🚀`)
  }
}
</script>

<style scoped>
/* Hub header */
.hub-header {
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1.5px solid var(--border);
}

.hub-header__title {
  font-size: 28px;
  font-weight: 900;
  color: var(--ink);
  letter-spacing: -.02em;
}

.hub-header__date {
  font-size: 13px;
  font-weight: 600;
  color: var(--ink-3);
  margin-top: 4px;
}

/* Section */
.hub-section {
  margin-bottom: 32px;
}

.section-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.section-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--sc, var(--mint));
  flex-shrink: 0;
  box-shadow: 0 0 6px var(--sc, var(--mint));
}

.section-title {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .07em;
  color: var(--ink-2);
}

/* Grids */
.hub-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.hub-grid-6 {
  grid-template-columns: repeat(6, 1fr);
  gap: 14px;
}

/* Items */
.hub-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 10px;
  background: linear-gradient(135deg, var(--surface-2), var(--surface));
  border: 1.5px solid var(--border-2);
  border-radius: var(--r);
  cursor: pointer;
  transition: all .2s cubic-bezier(.16,1,.3,1);
  font-family: 'Nunito', sans-serif;
  position: relative;
  overflow: hidden;
}

.hub-item-lg { padding: 20px 12px; }

.hub-item::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--sc, var(--mint));
  transform: scaleX(0);
  transition: transform .2s;
}

.hub-item:hover {
  background: linear-gradient(135deg, var(--surface-3), var(--surface-2));
  border-color: var(--sc, var(--mint));
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0,0,0,.2);
}

.hub-item:hover::after {
  transform: scaleX(1);
}

.hub-item__icon {
  font-size: 28px;
  transition: transform .2s;
  line-height: 1;
}

.hub-item-lg .hub-item__icon { font-size: 32px; }

.hub-item:hover .hub-item__icon {
  transform: scale(1.15);
}

.hub-item__label {
  font-size: 11px;
  font-weight: 800;
  color: var(--ink-2);
  text-align: center;
  text-transform: uppercase;
  letter-spacing: .04em;
  line-height: 1.3;
}

.hub-item-lg .hub-item__label { font-size: 12px; }

/* Theme section */
.theme-section {
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
}

.theme-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  font-weight: 600;
  color: var(--ink-2);
  padding: 16px;
}

.theme-toggle {
  padding: 8px 14px;
  background: var(--teal-l);
  border: 1.5px solid var(--mint);
  border-radius: 20px;
  color: var(--mint);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all .15s;
}

.theme-toggle:hover { background: var(--mint); color: white; }

@media (max-width: 1024px) {
  .hub-grid-6 { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 768px) {
  .hub-grid,
  .hub-grid-6 { grid-template-columns: repeat(3, 1fr); }
}
</style>
