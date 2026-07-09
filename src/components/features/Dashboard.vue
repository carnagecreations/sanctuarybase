<template>
  <PageContainer>

    <!-- Greeting banner -->
    <div class="greeting">
      <div class="greeting__title">Good {{ timeOfDay }}, {{ firstName }}</div>
      <div class="greeting__date">{{ today }}</div>
    </div>

    <!-- Weather Widget -->
    <WeatherWidget />

    <!-- New message notification -->
    <button v-if="isAdmin && unreadCount > 0" class="inbox-alert" @click="ui.setCurrentTab('inbox')">
      <span class="inbox-alert__icon">📥</span>
      <span class="inbox-alert__text">
        <strong>{{ unreadCount }} new message{{ unreadCount > 1 ? 's' : '' }}</strong>
        <span>from the website contact form — tap to open the inbox</span>
      </span>
      <span class="inbox-alert__arrow">→</span>
    </button>

    <!-- ── ADMIN POWERHOUSE ── -->
    <template v-if="isAdmin">

      <!-- Command Center: 4 live metrics -->
      <div class="command-center">
        <div class="cmd-card" style="--cc:#4EFFC5" @click="ui.setCurrentTab('animals')">
          <span class="cmd-icon">🐾</span>
          <div class="cmd-value">{{ animalCount }}</div>
          <div class="cmd-label">Animals</div>
        </div>
        <div class="cmd-card" style="--cc:#5B8DEF" @click="ui.setCurrentTab('people')">
          <span class="cmd-icon">👥</span>
          <div class="cmd-value">{{ volunteerCount }}</div>
          <div class="cmd-label">Volunteers</div>
        </div>
        <div class="cmd-card" style="--cc:#FF9500" @click="ui.setCurrentTab('admin-tasks')">
          <span class="cmd-icon">✅</span>
          <div class="cmd-value">{{ pendingTaskCount }}</div>
          <div class="cmd-label">Open Tasks</div>
        </div>
        <div class="cmd-card" style="--cc:#FF6B9D" @click="ui.setCurrentTab('admin-feeding')">
          <span class="cmd-icon">🍖</span>
          <div class="cmd-value">{{ fedTodayCount }}/{{ animalCount }}</div>
          <div class="cmd-label">Fed Today</div>
        </div>
      </div>

      <!-- Status Row: Feeding + Compliance -->
      <div class="status-row">
        <div class="status-panel" @click="ui.setCurrentTab('admin-feeding')">
          <div class="status-panel__header">
            <span class="status-panel__title">🍖 Feedings Today</span>
            <span class="status-badge" :class="allFed ? 'badge-ok' : fedTodayCount > 0 ? 'badge-warn' : 'badge-muted'">
              {{ allFed ? '✓ All Fed' : fedTodayCount + ' / ' + animalCount }}
            </span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: feedingPercent + '%' }" />
          </div>
          <div class="status-panel__sub">{{ fedTodayCount }} of {{ animalCount }} animals fed today</div>
        </div>

        <div class="status-panel" @click="ui.setCurrentTab('admin-compliance')">
          <div class="status-panel__header">
            <span class="status-panel__title">📋 Compliance</span>
            <span class="status-badge" :class="overdueCount > 0 ? 'badge-alert' : 'badge-ok'">
              {{ overdueCount > 0 ? overdueCount + ' Overdue' : '✓ Clear' }}
            </span>
          </div>
          <div v-if="overdueItems.length" class="overdue-list">
            <div v-for="item in overdueItems.slice(0, 3)" :key="item.id" class="overdue-item">
              ⚠️ {{ item.title }}
            </div>
          </div>
          <div v-else class="status-panel__sub">All compliance items are up to date</div>
        </div>
      </div>

      <!-- Pending Tasks -->
      <SectionLabel>Pending Tasks</SectionLabel>
      <AppCard v-if="pendingTasks.length" :flat="true">
        <div class="task-list">
          <div v-for="t in pendingTasks" :key="t.id" class="task-row" @click="ui.setCurrentTab('admin-tasks')">
            <div class="task-main">
              <span v-if="t.priority" class="task-priority" :class="`priority-${(t.priority || '').toLowerCase()}`">
                {{ t.priority }}
              </span>
              <span class="task-title">{{ t.title }}</span>
            </div>
            <span v-if="t.dueDate" class="task-due">{{ formatDate(t.dueDate) }}</span>
          </div>
        </div>
      </AppCard>
      <AppCard v-else :flat="true">
        <EmptyState icon="🎯" title="No pending tasks" message="All clear — nothing outstanding." />
      </AppCard>

      <!-- Quick Actions -->
      <SectionLabel>Quick Actions</SectionLabel>
      <div class="action-grid">
        <AppButton variant="secondary" @click="ui.setCurrentTab('admin-feeding')">🍖 Log Feeding</AppButton>
        <AppButton variant="secondary" @click="ui.setCurrentTab('admin-announcements')">📢 Announce</AppButton>
        <AppButton variant="secondary" @click="ui.setCurrentTab('admin-tasks')">✅ Tasks</AppButton>
        <AppButton variant="secondary" @click="ui.setCurrentTab('admin-med-run')">💊 Med Run</AppButton>
        <AppButton variant="secondary" @click="ui.setCurrentTab('animals')">🐾 Animals</AppButton>
        <AppButton variant="secondary" @click="ui.setCurrentTab('admin-hub')">🗂 Admin Hub</AppButton>
      </div>

      <AppButton variant="danger" @click="auth.signOut()" style="margin-top:16px;width:100%">Sign out</AppButton>

    </template>

    <!-- ── VOLUNTEER VIEW ── -->
    <template v-else>
      <AppCard v-if="myProfile" :flat="false" class="profile-card">
        <div class="profile-row">
          <div class="profile-avatar">{{ firstName.charAt(0) }}</div>
          <div class="profile-info">
            <div class="profile-name">{{ myProfile.name }}</div>
            <div class="profile-email">{{ myProfile.email }}</div>
            <div class="profile-badge">
              <span class="badge-vol">Volunteer</span>
              <span v-if="myProfile.experience" class="badge-exp">{{ myProfile.experience }}</span>
            </div>
          </div>
        </div>
        <div v-if="myProfile.availability?.length" class="profile-avail">
          <span class="avail-label">Available:</span>
          <span v-for="d in myProfile.availability" :key="d" class="avail-day">{{ d }}</span>
        </div>
        <div v-if="myProfile.skills?.length" class="profile-skills">
          <span class="avail-label">Skills:</span>
          {{ myProfile.skills.join(', ') }}
        </div>
        <AppButton size="sm" @click="ui.setCurrentTab('volunteer-profile')" style="margin-top:12px">✏️ Edit profile</AppButton>
      </AppCard>

      <SectionLabel>Your upcoming shifts</SectionLabel>
      <AppCard :flat="true">
        <EmptyState icon="📅" title="No shifts scheduled yet" message="An admin will reach out to schedule your first shift." />
      </AppCard>

      <SectionLabel>Your tasks</SectionLabel>
      <AppCard :flat="true" v-if="pendingTasks.length">
        <div class="task-list">
          <div v-for="t in pendingTasks.slice(0, 3)" :key="t.id" class="task-preview">
            <div class="task-title">{{ t.title }}</div>
            <div v-if="t.dueDate" class="task-date">📅 Due {{ formatDate(t.dueDate) }}</div>
          </div>
        </div>
      </AppCard>
      <AppCard v-else :flat="true">
        <EmptyState icon="🎯" title="No tasks yet" message="Tasks assigned to you will show up here." />
      </AppCard>
    </template>

  </PageContainer>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useUIStore } from '../../stores/ui'
import { useAuthStore } from '../../stores/auth'
import { useAnimalsStore } from '../../stores/animals'
import { usePeopleStore } from '../../stores/people'
import { useTasksStore } from '../../stores/tasks'
import { useFeedingLogsStore } from '../../stores/feedingLogs'
import { useComplianceStore } from '../../stores/compliance'
import { useContacts } from '../../stores/contacts'
import { personTypeList } from './admin/people/personDisplay'
import { AppCard, SectionLabel, AppButton, EmptyState, PageContainer } from '../ui'
import WeatherWidget from './WeatherWidget.vue'

const ui              = useUIStore()
const auth            = useAuthStore()
const animalsStore    = useAnimalsStore()
const peopleStore     = usePeopleStore()
const tasksStore      = useTasksStore()
const feedingStore    = useFeedingLogsStore()
const complianceStore = useComplianceStore()
const { unreadCount, loadContacts } = useContacts()

const now       = new Date()
const hour      = now.getHours()
const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
const firstName = computed(() => auth.user?.name?.split(' ')[0] || auth.user?.displayName?.split(' ')[0] || 'there')
const today     = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

const isAdmin = computed(() => auth.user?.role === 'admin')

const animalCount    = computed(() => (Array.isArray(animalsStore.animals) ? animalsStore.animals : []).length)
const volunteerCount = computed(() => (Array.isArray(peopleStore.people) ? peopleStore.people : []).filter(p => personTypeList(p).includes('volunteer')).length)
const myProfile      = computed(() => (Array.isArray(peopleStore.people) ? peopleStore.people : []).find(p => p.email === auth.user?.email))

const pendingTaskCount = computed(() => {
  const tasks = tasksStore.tasks || []
  return (Array.isArray(tasks) ? tasks : []).filter(t => !t.completed).length
})

const pendingTasks = computed(() => {
  const tasks = tasksStore.tasks || []
  return (Array.isArray(tasks) ? tasks : []).filter(t => !t.completed).slice(0, 5)
})

const fedTodayCount = computed(() => {
  const today = new Date().toDateString()
  const uniqueIds = new Set(
    (feedingStore.feedingLogs || [])
      .filter(f => {
        const d = new Date(f.timestamp?.toDate?.() || f.timestamp).toDateString()
        return d === today && f.given
      })
      .map(f => f.animalId)
  )
  return uniqueIds.size
})

const feedingPercent = computed(() => {
  if (!animalCount.value) return 0
  return Math.min(100, Math.round((fedTodayCount.value / animalCount.value) * 100))
})

const allFed = computed(() => animalCount.value > 0 && fedTodayCount.value >= animalCount.value)

const overdueItems = computed(() => {
  const now = new Date()
  return (complianceStore.items || []).filter(item => {
    if (item.status === 'complete') return false
    if (!item.dueDate) return false
    return new Date(item.dueDate) < now
  })
})

const overdueCount = computed(() => overdueItems.value.length)

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = dateStr?.toDate ? dateStr.toDate() : new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

onMounted(() => {
  animalsStore.fetchAnimals()
  peopleStore.fetchPeople()
  tasksStore.fetchTasks()
  feedingStore.fetchFeedingLogs()
  complianceStore.fetchCompliance()
  if (isAdmin.value) loadContacts()
})
</script>

<style scoped>
.greeting {
  margin-bottom: 20px;
  padding: 24px 20px;
  background: linear-gradient(135deg, var(--brand-l), rgba(78,255,197,.12));
  border: 1px solid var(--border-2);
  border-radius: var(--rxl);
  box-shadow: 0 4px 20px rgba(0,0,0,.2);
}

.greeting__title {
  font-size: 32px;
  font-weight: 900;
  color: var(--ink);
  margin-bottom: 6px;
  letter-spacing: -.01em;
}

.greeting__date {
  font-size: 14px;
  font-weight: 600;
  color: var(--ink-2);
}

/* New message alert */
.inbox-alert {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  text-align: left;
  padding: 16px 18px;
  margin-bottom: 16px;
  background: linear-gradient(135deg, rgba(255,107,107,.16), rgba(255,107,107,.06));
  border: 1.5px solid rgba(255,107,107,.35);
  border-radius: var(--rxl);
  cursor: pointer;
  transition: all .18s cubic-bezier(.16,1,.3,1);
  animation: alert-pulse 2.4s ease-in-out infinite;
}

.inbox-alert:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255,107,107,.18);
  border-color: rgba(255,107,107,.55);
}

@keyframes alert-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255,107,107,.0); }
  50%      { box-shadow: 0 0 0 4px rgba(255,107,107,.10); }
}

.inbox-alert__icon { font-size: 26px; line-height: 1; flex-shrink: 0; }

.inbox-alert__text { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.inbox-alert__text strong { font-size: 15px; font-weight: 900; color: var(--ink); }
.inbox-alert__text span { font-size: 12px; font-weight: 600; color: var(--ink-2); }

.inbox-alert__arrow {
  font-size: 20px;
  font-weight: 900;
  color: var(--coral, #FF6B6B);
  flex-shrink: 0;
}

/* Command Center */
.command-center {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.cmd-card {
  --cc: var(--mint);
  padding: 18px 14px 16px;
  background: var(--surface-2);
  border: 1.5px solid var(--border);
  border-top: 3px solid var(--cc);
  border-radius: var(--r);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  transition: all .2s cubic-bezier(.16,1,.3,1);
  text-align: center;
}

.cmd-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0,0,0,.18);
  border-color: var(--cc);
}

.cmd-icon { font-size: 24px; line-height: 1; }

.cmd-value {
  font-size: 26px;
  font-weight: 900;
  color: var(--cc);
  line-height: 1;
  letter-spacing: -.02em;
}

.cmd-label {
  font-size: 10px;
  font-weight: 800;
  color: var(--ink-3);
  text-transform: uppercase;
  letter-spacing: .06em;
}

/* Status Row */
.status-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 28px;
}

.status-panel {
  background: var(--surface-2);
  border: 1.5px solid var(--border);
  border-radius: var(--r);
  padding: 18px;
  cursor: pointer;
  transition: all .15s;
}

.status-panel:hover {
  border-color: var(--border-2);
  background: var(--surface-3);
}

.status-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  gap: 8px;
}

.status-panel__title {
  font-size: 13px;
  font-weight: 800;
  color: var(--ink);
}

.status-badge {
  padding: 3px 9px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .04em;
  white-space: nowrap;
}

.badge-ok    { background: rgba(78,255,197,.15); color: #4EFFC5; border: 1px solid rgba(78,255,197,.3); }
.badge-warn  { background: rgba(255,149,0,.15);  color: #FF9500; border: 1px solid rgba(255,149,0,.3); }
.badge-alert { background: rgba(255,82,82,.15);  color: #FF5252; border: 1px solid rgba(255,82,82,.3); }
.badge-muted { background: var(--surface-3);     color: var(--ink-3); border: 1px solid var(--border); }

.progress-track {
  height: 6px;
  background: var(--surface);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--mint), #4EFFC5aa);
  border-radius: 3px;
  transition: width .6s ease;
}

.status-panel__sub {
  font-size: 11px;
  color: var(--ink-3);
  font-weight: 600;
}

.overdue-list { display: flex; flex-direction: column; gap: 5px; }

.overdue-item {
  font-size: 12px;
  color: #FF5252;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Announcements */
.announce-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 28px;
}

.announce-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  background: var(--surface-2);
  border: 1.5px solid var(--border);
  border-left: 4px solid var(--mint);
  border-radius: var(--r);
  cursor: pointer;
  transition: all .15s;
}

.announce-item:hover {
  background: var(--surface-3);
  transform: translateX(3px);
}

.announce-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }

.announce-body { flex: 1; min-width: 0; }

.announce-title {
  font-size: 14px;
  font-weight: 800;
  color: var(--ink);
  margin-bottom: 3px;
}

.announce-preview {
  font-size: 12px;
  color: var(--ink-3);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.announce-date {
  font-size: 11px;
  color: var(--ink-3);
  font-weight: 700;
  flex-shrink: 0;
  padding-top: 2px;
}

/* Tasks */
.task-list { display: flex; flex-direction: column; }

.task-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 11px 16px;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: background .15s;
}

.task-row:last-child { border-bottom: none; }
.task-row:hover { background: var(--surface-2); }

.task-main {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.task-priority {
  padding: 2px 7px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .05em;
  flex-shrink: 0;
}

.priority-high   { background: rgba(255,82,82,.2);  color: #FF5252; }
.priority-medium { background: rgba(255,149,0,.2); color: #FF9500; }
.priority-med    { background: rgba(255,149,0,.2); color: #FF9500; }
.priority-low    { background: rgba(78,255,197,.15); color: var(--mint); }

.task-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-due {
  font-size: 11px;
  color: var(--ink-3);
  font-weight: 600;
  flex-shrink: 0;
}

/* Quick Actions */
.action-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 28px;
}

/* Volunteer view */
.task-preview {
  padding: 14px;
  background: var(--surface-2);
  border-radius: var(--r);
  border-left: 4px solid var(--mint);
  transition: all .2s;
  margin-bottom: 10px;
}

.task-preview:hover {
  background: var(--surface-3);
  transform: translateX(4px);
}

.task-date { font-size: 12px; color: var(--ink-2); font-weight: 600; margin-top: 4px; }

.profile-card { margin-bottom: 20px; }

.profile-row {
  display: flex;
  gap: 18px;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.profile-avatar {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--mint), var(--teal-d));
  color: #0A1F18;
  font-size: 24px;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-family: 'Fredoka One', sans-serif;
  box-shadow: 0 4px 12px rgba(78,255,197,.2);
}

.profile-name  { font-size: 18px; font-weight: 900; color: var(--ink); margin-bottom: 4px; }
.profile-email { font-size: 12px; color: var(--ink-3); font-weight: 600; margin-bottom: 6px; }

.profile-badge { display: flex; gap: 6px; }

.badge-vol, .badge-exp {
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .04em;
}

.badge-vol { background: var(--teal-l); color: var(--mint); }
.badge-exp { background: var(--surface-2); color: var(--ink-3); }

.profile-avail, .profile-skills {
  font-size: 12px;
  color: var(--ink-3);
  font-weight: 600;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
}

.avail-label { color: var(--ink-2); font-weight: 700; margin-right: 2px; }

.avail-day {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 2px 7px;
  font-size: 11px;
  font-weight: 700;
  color: var(--ink-2);
}

@media (max-width: 768px) {
  .command-center { grid-template-columns: repeat(2, 1fr); }
  .status-row     { grid-template-columns: 1fr; }
  .action-grid    { grid-template-columns: repeat(2, 1fr); }
}
</style>
