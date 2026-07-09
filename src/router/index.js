import { createRouter, createWebHistory } from 'vue-router'

// Route names match the old ui.currentTab string values exactly, so
// stores/ui.js can keep exposing setCurrentTab(name)/currentTab as a thin
// wrapper around the router with zero changes needed at any of the 40+ call
// sites across the app. Every component is lazy-loaded, which also splits
// the previous single 1.2MB bundle into per-route chunks.
const routes = [
  { path: '/', name: 'dashboard', component: () => import('../components/features/Dashboard.vue') },
  { path: '/animals', name: 'animals', component: () => import('../components/features/Animals.vue') },
  // :id is optional so a stray navigation with no animal selected still
  // resolves to a route (AnimalDetail.vue shows a real "not found" state
  // instead of the old hardcoded "Luna" placeholder).
  { path: '/animals/:id?', name: 'animal-detail', component: () => import('../components/features/AnimalDetail.vue'), props: true },
  { path: '/shifts', name: 'shifts', component: () => import('../components/features/Shifts.vue') },
  { path: '/people', name: 'people', component: () => import('../components/features/People.vue') },
  { path: '/vet-hub', name: 'vet-hub', component: () => import('../components/features/VetHub.vue') },
  { path: '/inbox', name: 'inbox', component: () => import('../components/features/Inbox.vue') },
  { path: '/admin', name: 'admin-hub', component: () => import('../components/features/AdminHub.vue') },
  { path: '/admin/grants', name: 'admin-grants', component: () => import('../components/features/admin/GrantsPage.vue') },
  { path: '/admin/grant-finder', name: 'admin-grant-finder', component: () => import('../components/features/admin/GrantFinderPage.vue') },
  { path: '/admin/grant-letter', name: 'admin-grant-letter', component: () => import('../components/features/admin/GrantLetterPage.vue') },
  { path: '/admin/med-run', name: 'admin-med-run', component: () => import('../components/features/admin/MedRunPage.vue') },
  { path: '/admin/bites', name: 'admin-bites', component: () => import('../components/features/admin/BiteReportsPage.vue') },
  { path: '/admin/announcements', name: 'admin-announcements', component: () => import('../components/features/admin/AnnouncementsPage.vue') },
  { path: '/admin/tasks', name: 'admin-tasks', component: () => import('../components/features/admin/TasksPage.vue') },
  { path: '/admin/waivers', name: 'admin-waivers', component: () => import('../components/features/admin/WaiversPage.vue') },
  { path: '/admin/rounds', name: 'admin-rounds', component: () => import('../components/features/admin/MorningRoundsPage.vue') },
  { path: '/admin/feeding', name: 'admin-feeding', component: () => import('../components/features/admin/FeedingLogPage.vue') },
  { path: '/admin/eod', name: 'admin-eod', component: () => import('../components/features/admin/EODReportPage.vue') },
  { path: '/admin/adoptions', name: 'admin-adoptions', component: () => import('../components/features/admin/AdoptionsPage.vue') },
  { path: '/admin/ledger', name: 'admin-ledger', component: () => import('../components/features/admin/LedgerPage.vue') },
  { path: '/admin/messages', name: 'admin-messages', component: () => import('../components/features/admin/MessagesPage.vue') },
  { path: '/admin/people', name: 'admin-people', component: () => import('../components/features/admin/PeoplePage.vue') },
  { path: '/admin/safe-houses', name: 'admin-safe-houses', component: () => import('../components/features/admin/SafeHousesPage.vue') },
  { path: '/admin/availability', name: 'admin-availability', component: () => import('../components/features/admin/AvailabilityPage.vue') },
  { path: '/admin/message-team', name: 'admin-message-team', component: () => import('../components/features/admin/MessageTeamPage.vue') },
  { path: '/admin/finance-stats', name: 'admin-finance-stats', component: () => import('../components/features/admin/FinanceStatsPage.vue') },
  { path: '/foster-portal', name: 'foster-portal', component: () => import('../components/features/FosterPortal.vue') },
  { path: '/admin/intake', name: 'admin-intake', component: () => import('../components/features/admin/IntakeWizardPage.vue') },
  { path: '/admin/outcomes', name: 'admin-outcomes', component: () => import('../components/features/admin/OutcomesPage.vue') },
  { path: '/admin/rounds-history', name: 'admin-rounds-history', component: () => import('../components/features/admin/RoundsHistoryPage.vue') },
  { path: '/admin/donors', name: 'admin-donors', component: () => import('../components/features/admin/DonorsPage.vue') },
  { path: '/admin/pipeline', name: 'admin-pipeline', component: () => import('../components/features/admin/AnimalPipelinePage.vue') },
  { path: '/admin/activity', name: 'admin-activity', component: () => import('../components/features/admin/ActivityLogPage.vue') },
  { path: '/admin/shift-calendar', name: 'admin-shift-calendar', component: () => import('../components/features/admin/ShiftCalendarPage.vue') },
  { path: '/admin/reminders', name: 'admin-reminders', component: () => import('../components/features/admin/RemindersPage.vue') },
  { path: '/volunteer-training', name: 'volunteer-training', component: () => import('../components/features/admin/TrainingPage.vue') },
  { path: '/volunteer-profile', name: 'volunteer-profile', component: () => import('../components/features/VolunteerProfile.vue') },
  { path: '/supplies', name: 'supplies', component: () => import('../components/features/SuppliesPage.vue') },
  { path: '/volunteer-animals', name: 'volunteer-animals', component: () => import('../components/features/VolunteerAnimals.vue') },
  { path: '/volunteer-tasks', name: 'volunteer-tasks', component: () => import('../components/features/VolunteerHub.vue') },
  { path: '/admin/volunteer-hours', name: 'admin-volunteer-hours', component: () => import('../components/features/admin/VolunteerHoursPage.vue') },
  { path: '/admin/compliance', name: 'admin-compliance', component: () => import('../components/features/admin/ComplianceChecklistPage.vue') },
  { path: '/admin/fundraising', name: 'admin-fundraising', component: () => import('../components/features/admin/FundraisingPage.vue') },
  { path: '/admin/quarantine', name: 'admin-quarantine', component: () => import('../components/features/admin/QuarantinePage.vue') },
  { path: '/admin/supplies', name: 'admin-supplies', component: () => import('../components/features/admin/SupplyInventoryPage.vue') },
  { path: '/admin/auction-items', name: 'admin-auction-items', component: () => import('../components/features/admin/AuctionItemsPage.vue') },
  { path: '/admin/newsletter', name: 'admin-newsletter', component: () => import('../components/features/admin/NewsletterPage.vue') },
  { path: '/admin/reports', name: 'admin-reports-hub', component: () => import('../components/features/admin/ReportsHubPage.vue') },
  { path: '/admin/stories', name: 'admin-stories', component: () => import('../components/features/admin/StoriesPage.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

// Finance/grant tools — same set AdminHub.vue already hides from non-admins
// at the tile level (see its `adminOnly` items). Enforcing it here too closes
// the gap where a volunteer or staff account could reach them directly by
// URL, bypassing the hub's tile filtering entirely.
const ADMIN_ONLY_ROUTES = new Set([
  'admin-finance-stats', 'admin-newsletter', 'admin-auction-items', 'admin-reports-hub', 'admin-stories',
  'admin-ledger', 'admin-donors', 'admin-grants', 'admin-grant-finder', 'admin-grant-letter',
  'admin-fundraising',
])

// Everything else under the Admin Hub — day-to-day operations tools meant
// for staff and admin, not volunteers. `admin-announcements` is deliberately
// excluded: it's the volunteer-facing "News" tab (see BottomNav.vue).
const STAFF_OR_ADMIN_ROUTES = new Set([
  'admin-hub', 'admin-med-run', 'admin-bites', 'admin-tasks', 'admin-waivers',
  'admin-rounds', 'admin-rounds-history', 'admin-feeding', 'admin-eod', 'admin-adoptions',
  'admin-messages', 'admin-people', 'admin-safe-houses', 'admin-availability',
  'admin-message-team', 'admin-intake', 'admin-outcomes', 'admin-pipeline',
  'admin-activity', 'admin-shift-calendar', 'admin-reminders', 'admin-volunteer-hours',
  'admin-compliance', 'admin-quarantine', 'admin-supplies', 'inbox',
])

router.beforeEach(async (to) => {
  const { useAuthStore } = await import('../stores/auth')
  const { useUIStore } = await import('../stores/ui')
  const role = useAuthStore().user?.role
  if (!role) return true // still resolving auth / not logged in — App.vue's own gate handles this

  if (ADMIN_ONLY_ROUTES.has(to.name) && role !== 'admin') {
    useUIStore().showToast("That's admin-only", 'error')
    return { name: role === 'staff' ? 'admin-hub' : 'dashboard' }
  }
  if (STAFF_OR_ADMIN_ROUTES.has(to.name) && role === 'volunteer') {
    useUIStore().showToast("That's staff-only", 'error')
    return { name: 'dashboard' }
  }
  return true
})

// Accessibility: announce the new page to screen readers and move focus to
// it on every route change, since none of this happened before (a SPA tab
// swap is otherwise silent and invisible to assistive tech).
router.afterEach((to) => {
  const label = to.name ? String(to.name).replace(/-/g, ' ') : 'page'
  document.title = `SanctuaryBase — ${label.replace(/\b\w/g, (c) => c.toUpperCase())}`
  requestAnimationFrame(() => {
    const main = document.querySelector('main')
    if (main) {
      main.setAttribute('tabindex', '-1')
      main.focus()
    }
  })
})

export default router
