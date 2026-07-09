<template>
  <PageContainer>

    <!-- Admin view -->
    <template v-if="isAdmin">
      <div class="admin-header">
        <h2>Shift Management</h2>
        <AppButton variant="primary" @click="openScheduleModal">+ Schedule Shift</AppButton>
      </div>

      <!-- Open, unclaimed shifts -->
      <SectionLabel>Open shifts ({{ openShifts.length }})</SectionLabel>
      <AppCard :flat="true">
        <template v-if="openShifts.length">
          <div class="divide-list">
            <div v-for="s in openShifts" :key="s.id" class="shift-item">
              <div class="si-date">{{ formatDate(s.date) }}</div>
              <div class="si-time">{{ s.startTime }} – {{ s.endTime }}<template v-if="s.role"> · {{ s.role }}</template></div>
              <div class="shift-actions">
                <AppButton size="sm" variant="danger" @click="cancelOpenShift(s)">Cancel</AppButton>
              </div>
            </div>
          </div>
        </template>
        <EmptyState v-else icon="📋" title="No open shifts" message="Scheduled shifts waiting on a volunteer will show up here." />
      </AppCard>

      <!-- Claimed, not yet started -->
      <SectionLabel style="margin-top:16px">Scheduled ({{ scheduledShifts.length }})</SectionLabel>
      <AppCard :flat="true">
        <template v-if="scheduledShifts.length">
          <div class="divide-list">
            <div v-for="s in scheduledShifts" :key="s.id" class="shift-item">
              <UserRow :name="s.volunteerName" :sub="s.role">
                <template #badge>
                  <AppBadge type="info">Scheduled</AppBadge>
                </template>
              </UserRow>
              <div class="shift-detail">
                <div class="shift-time">{{ formatDate(s.date) }} · {{ s.startTime }} – {{ s.endTime }}</div>
              </div>
              <div class="shift-actions">
                <AppButton size="sm" variant="danger" @click="cancelOpenShift(s)">Cancel</AppButton>
              </div>
            </div>
          </div>
        </template>
        <EmptyState v-else icon="🗓️" title="No claimed shifts yet" message="Once a volunteer claims an open shift, it'll show up here." />
      </AppCard>

      <!-- Active shifts -->
      <SectionLabel style="margin-top:16px">Active shifts ({{ activeShifts.length }})</SectionLabel>
      <AppCard :flat="true">
        <template v-if="activeShifts.length">
          <div class="divide-list">
            <div v-for="s in activeShifts" :key="s.id" class="shift-item">
              <UserRow :name="s.volunteerName" :sub="s.role">
                <template #badge>
                  <AppBadge type="available">Active</AppBadge>
                </template>
              </UserRow>
              <div class="shift-detail">
                <div class="shift-time">Clocked in {{ s.clockIn }}</div>
                <div class="shift-progress-wrap">
                  <div class="shift-progress-bar" :style="{ width: s.progressPct + '%' }"></div>
                </div>
                <div class="shift-pct">{{ s.elapsed }} · {{ s.progressPct }}% toward goal</div>
              </div>
              <div class="shift-actions">
                <AppButton variant="danger" size="sm" @click="clockOut(s)">Clock out</AppButton>
              </div>
            </div>
          </div>
        </template>
        <EmptyState v-else icon="⏸" title="No active shifts" message="No volunteers are currently clocked in." />
      </AppCard>

      <!-- Completed shifts (grouped by date) -->
      <SectionLabel style="margin-top:16px">Completed shifts</SectionLabel>
      <template v-if="completedShifts.length">
        <div v-for="group in groupedCompleted" :key="group.date" style="margin-bottom:12px">
          <div class="date-header">{{ group.label }}</div>
          <AppCard :flat="true">
            <div class="divide-list">
              <div v-for="s in group.shifts" :key="s.id" class="shift-item">
                <UserRow :name="s.volunteerName" :sub="`${s.role} · ${s.hours}h`" />
                <div class="shift-times">{{ s.clockIn }} → {{ s.clockOut }}</div>
                <div class="shift-actions">
                  <AppButton size="sm" variant="danger" @click="deleteShift(s)">Delete</AppButton>
                </div>
              </div>
            </div>
          </AppCard>
        </div>
      </template>
      <EmptyState v-else icon="📭" title="No completed shifts yet" />

      <!-- Schedule Shift modal -->
      <AppModal v-if="showScheduleModal" :open="true" title="Schedule a shift" size="sm" @close="showScheduleModal = false">
        <div class="form-row">
          <AppInput v-model="scheduleForm.date" type="date" label="Date *" />
          <AppInput v-model="scheduleForm.role" label="Role (optional)" placeholder="Feeding, front desk…" />
        </div>
        <div class="form-row">
          <AppInput v-model="scheduleForm.startTime" type="time" label="Start time *" />
          <AppInput v-model="scheduleForm.endTime" type="time" label="End time *" />
        </div>
        <AppInput v-model="scheduleForm.notes" label="Notes (optional)" placeholder="Anything a volunteer should know…" style="margin-top:8px" />
        <template #actions>
          <AppButton @click="showScheduleModal = false">Cancel</AppButton>
          <AppButton variant="primary" :disabled="!scheduleForm.date || !scheduleForm.startTime || !scheduleForm.endTime || scheduling" @click="submitSchedule">
            {{ scheduling ? 'Publishing…' : 'Publish shift' }}
          </AppButton>
        </template>
      </AppModal>
    </template>

    <!-- Volunteer view -->
    <template v-else>
      <div class="volunteer-header">
        <h2>My Shifts</h2>
        <div v-if="currentShift" class="current-shift-badge">
          ⏱ {{ currentShiftElapsed }} on shift
        </div>
      </div>

      <!-- Quick action -->
      <div class="action-row">
        <AppButton
          v-if="!currentShift"
          variant="primary"
          @click="clockInSelf"
          :disabled="clockingIn"
        >
          {{ clockingIn ? 'Clocking in…' : '🕐 Clock in' }}
        </AppButton>
        <AppButton
          v-else
          variant="danger"
          @click="clockOutSelf"
          :disabled="clockingOut"
        >
          {{ clockingOut ? 'Clocking out…' : '⏹ Clock out' }}
        </AppButton>
      </div>

      <!-- Open shifts anyone can claim -->
      <SectionLabel>Open shifts</SectionLabel>
      <AppCard :flat="true">
        <template v-if="openShifts.length">
          <div class="divide-list">
            <div v-for="s in openShifts" :key="s.id" class="shift-item">
              <div class="si-date">{{ formatDate(s.date) }}</div>
              <div class="si-time">{{ s.startTime }} – {{ s.endTime }}<template v-if="s.role"> · {{ s.role }}</template></div>
              <div v-if="s.notes" class="si-notes">{{ s.notes }}</div>
              <div class="shift-actions">
                <AppButton size="sm" variant="primary" :disabled="claimingId === s.id" @click="claimShift(s)">
                  {{ claimingId === s.id ? 'Claiming…' : 'Claim shift' }}
                </AppButton>
              </div>
            </div>
          </div>
        </template>
        <EmptyState v-else icon="📋" title="No open shifts right now" message="Check back later or ask your coordinator." />
      </AppCard>

      <!-- Upcoming shifts -->
      <SectionLabel style="margin-top:16px">Your upcoming shifts</SectionLabel>
      <AppCard :flat="true">
        <template v-if="upcomingShifts.length">
          <div class="divide-list">
            <div v-for="s in upcomingShifts" :key="s.id" class="shift-item">
              <div class="si-date">{{ formatDate(s.date) }}</div>
              <div class="si-time">{{ s.startTime }} – {{ s.endTime }}</div>
              <div class="si-role">{{ s.role }}</div>
              <div class="shift-actions">
                <AppButton size="sm" variant="danger" :disabled="releasingId === s.id" @click="releaseShift(s)">
                  {{ releasingId === s.id ? 'Cancelling…' : 'Cancel' }}
                </AppButton>
              </div>
            </div>
          </div>
        </template>
        <EmptyState v-else icon="📅" title="No shifts scheduled" message="Claim an open shift above or check with your coordinator." />
      </AppCard>

      <!-- Past shifts -->
      <SectionLabel style="margin-top:16px">Recent completed shifts</SectionLabel>
      <AppCard :flat="true">
        <template v-if="pastShifts.length">
          <div class="divide-list">
            <div v-for="s in pastShifts" :key="s.id" class="shift-item">
              <div class="si-date">{{ formatDate(s.date) }}</div>
              <div class="si-time">{{ s.clockIn }} – {{ s.clockOut }} ({{ s.hours }}h)</div>
              <div class="si-role">{{ s.role }}</div>
            </div>
          </div>
        </template>
        <EmptyState v-else icon="📭" title="No completed shifts yet" />
      </AppCard>

      <!-- Stats -->
      <SectionLabel style="margin-top:16px">Your stats</SectionLabel>
      <div class="stats-row">
        <StatCard :value="String(volunteerStats.totalShifts)" label="Total shifts" />
        <StatCard :value="String(volunteerStats.totalHours)" label="Hours logged" />
      </div>
    </template>

  </PageContainer>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { PageContainer, AppCard, StatCard, SectionLabel, AppButton, AppBadge, UserRow, EmptyState, AppModal, AppInput } from '../ui'
import { useAuthStore } from '../../stores/auth'
import { useShiftsStore } from '../../stores/shifts'
import { useUIStore } from '../../stores/ui'

const auth = useAuthStore()
const shiftsStore = useShiftsStore()
const ui = useUIStore()

// ── Admin view ───────────────────────────────────────────────
const clockingIn = ref(false)
const clockingOut = ref(false)

const isAdmin = computed(() => auth.user?.role === 'admin' || auth.user?.role === 'staff')

// Get all shifts from store (will be empty until Firestore is populated)
const allShifts = computed(() => Array.isArray(shiftsStore.shifts) ? shiftsStore.shifts : [])

const now = new Date()
const activeShifts = computed(() =>
  allShifts.value.filter(s => s.status === 'active' && !s.clockOutTime).map(s => ({
    ...s,
    progressPct: s.hoursGoal ? Math.min(100, Math.round((s.hours || 0) / s.hoursGoal * 100)) : 0,
  }))
)

const completedShifts = computed(() =>
  allShifts.value.filter(s => s.status === 'completed' || s.clockOutTime)
)

const openShifts = computed(() =>
  allShifts.value.filter(s => s.status === 'open').sort((a, b) => new Date(a.date) - new Date(b.date))
)

const scheduledShifts = computed(() =>
  allShifts.value.filter(s => s.status === 'scheduled').sort((a, b) => new Date(a.date) - new Date(b.date))
)

const groupedCompleted = computed(() => {
  const groups = {}
  completedShifts.value.forEach(s => {
    const d = s.date || new Date(s.clockIn || Date.now()).toISOString().slice(0, 10)
    if (!groups[d]) {
      const date = new Date(d)
      const today = new Date(now.toISOString().slice(0, 10))
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      let label
      if (date.toDateString() === today.toDateString()) label = 'Today'
      else if (date.toDateString() === yesterday.toDateString()) label = 'Yesterday'
      else label = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      groups[d] = { date: d, label, shifts: [] }
    }
    groups[d].shifts.push(s)
  })
  return Object.values(groups).sort((a, b) => new Date(b.date) - new Date(a.date))
})

const clockOut = async (shift) => {
  const confirmed = await ui.confirm({
    title: `Clock out ${shift.volunteerName}?`,
    message: `Are you sure? This will end their shift.`,
    confirmText: 'Clock out',
    cancelText: 'Cancel',
  })
  if (confirmed) {
    try {
      await shiftsStore.forceClockOut(shift.id)
      ui.showToast(`${shift.volunteerName} clocked out`)
    } catch {
      ui.showToast('Failed to clock out', 'error')
    }
  }
}

const deleteShift = async (shift) => {
  const confirmed = await ui.confirm({
    title: 'Delete shift?',
    message: `Remove ${shift.volunteerName}'s shift on ${shift.date}?`,
    confirmText: 'Delete',
    cancelText: 'Cancel',
    danger: true,
  })
  if (confirmed) {
    try {
      await shiftsStore.removeShift(shift.id)
      ui.showToast('Shift deleted')
    } catch {
      ui.showToast('Failed to delete shift', 'error')
    }
  }
}

const cancelOpenShift = async (shift) => {
  const claimedBy = shift.volunteerName ? ` — currently claimed by ${shift.volunteerName}` : ''
  const confirmed = await ui.confirm({
    title: 'Cancel shift?',
    message: `Remove the ${shift.startTime}–${shift.endTime} shift on ${shift.date}${claimedBy}?`,
    confirmText: 'Cancel shift',
    cancelText: 'Keep it',
    danger: true,
  })
  if (confirmed) {
    try {
      await shiftsStore.removeShift(shift.id)
      ui.showToast('Shift removed')
    } catch {
      ui.showToast('Failed to remove shift', 'error')
    }
  }
}

// ── Admin: schedule shift modal ───────────────────────────────
const showScheduleModal = ref(false)
const scheduling = ref(false)
const scheduleForm = ref({ date: '', startTime: '', endTime: '', role: '', notes: '' })

const openScheduleModal = () => {
  scheduleForm.value = { date: '', startTime: '', endTime: '', role: '', notes: '' }
  showScheduleModal.value = true
}

const submitSchedule = async () => {
  scheduling.value = true
  try {
    await shiftsStore.scheduleShift({ ...scheduleForm.value })
    ui.showToast('Shift published')
    showScheduleModal.value = false
  } catch {
    ui.showToast('Failed to publish shift', 'error')
  } finally {
    scheduling.value = false
  }
}

// ── Volunteer view ───────────────────────────────────────────
const currentShiftElapsed = ref('0m')
let shiftTimer = null

// Older shift documents may have the misspelled `volunterId` field instead
// of `volunteerId` — getVolunteerShifts() checks both, see stores/shifts.js.
const currentShift = computed(() =>
  allShifts.value.find(s => (s.volunteerId ?? s.volunterId) === auth.user?.id && s.status === 'active' && !s.clockOutTime)
)

const myShifts = computed(() => shiftsStore.getVolunteerShifts(auth.user?.id))

const upcomingShifts = computed(() =>
  myShifts.value.filter(s => s.status === 'scheduled').slice(0, 5)
)

const pastShifts = computed(() =>
  myShifts.value.filter(s => s.status === 'completed' || s.clockOutTime).slice(0, 5)
)

const volunteerStats = computed(() => ({
  totalShifts: myShifts.value.length,
  totalHours: myShifts.value.reduce((sum, s) => sum + (s.hours || 0), 0),
}))

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const today = new Date(now.toISOString().slice(0, 10))
  if (d.toDateString() === today.toDateString()) return 'Today'
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

const clockInSelf = async () => {
  clockingIn.value = true
  try {
    await shiftsStore.clockIn(auth.user?.id, auth.user?.name || auth.user?.email)
    ui.showToast('Clocked in ✓')
  } catch {
    ui.showToast('Failed to clock in', 'error')
  } finally {
    clockingIn.value = false
  }
}

const clockOutSelf = async () => {
  clockingOut.value = true
  try {
    await shiftsStore.clockOut(auth.user?.id)
    ui.showToast('Clocked out')
  } catch {
    ui.showToast('Failed to clock out', 'error')
  } finally {
    clockingOut.value = false
  }
}

const claimingId = ref(null)
const claimShift = async (shift) => {
  claimingId.value = shift.id
  try {
    await shiftsStore.claimShift(shift.id, auth.user?.id, auth.user?.name || auth.user?.email)
    ui.showToast('Shift claimed ✓')
  } catch (err) {
    ui.showToast(err.message || 'Failed to claim shift', 'error')
  } finally {
    claimingId.value = null
  }
}

const releasingId = ref(null)
const releaseShift = async (shift) => {
  const confirmed = await ui.confirm({
    title: 'Cancel this shift?',
    message: `Give up your ${shift.startTime}–${shift.endTime} shift on ${formatDate(shift.date)}? It'll go back to open for someone else.`,
    confirmText: 'Cancel shift',
    cancelText: 'Keep it',
    danger: true,
  })
  if (!confirmed) return
  releasingId.value = shift.id
  try {
    await shiftsStore.releaseClaim(shift.id)
    ui.showToast('Shift released')
  } catch {
    ui.showToast('Failed to cancel shift', 'error')
  } finally {
    releasingId.value = null
  }
}

const updateElapsed = () => {
  if (!currentShift.value?.clockInTime) return
  const ms = Date.now() - new Date(currentShift.value.clockInTime).getTime()
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  currentShiftElapsed.value = h > 0 ? `${h}h ${m}m` : `${m}m`
}

onMounted(() => {
  shiftsStore.fetchShifts()
  if (!isAdmin.value) {
    shiftTimer = setInterval(updateElapsed, 30000)
  }
})

onUnmounted(() => {
  if (shiftTimer) clearInterval(shiftTimer)
})
</script>

<style scoped>
.admin-header, .volunteer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.admin-header h2, .volunteer-header h2 {
  font-size: 20px;
  font-weight: 900;
  color: var(--ink);
  margin: 0;
}
.current-shift-badge {
  padding: 6px 12px;
  background: var(--teal-l);
  color: var(--mint);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
}

.action-row {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.stats-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 4px;
}

.divide-list > * + * { border-top: 1px solid var(--border); }

.shift-item {
  padding: 10px 0;
}
.shift-item:first-child { padding-top: 0; }
.shift-item:last-child { padding-bottom: 0; }

.shift-detail { padding-left: 52px; margin-top: 6px; }
.shift-time { font-size: 11px; color: var(--ink-3); font-weight: 600; margin-bottom: 6px; }

.shift-progress-wrap {
  height: 4px;
  background: var(--surface-2);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 4px;
}
.shift-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--mint), var(--brand));
  border-radius: 2px;
  transition: width .3s;
}

.shift-pct { font-size: 10px; color: var(--ink-3); font-weight: 700; }

.shift-actions {
  display: flex;
  gap: 6px;
  padding-left: 52px;
  margin-top: 8px;
}

.shift-times {
  padding-left: 52px;
  font-size: 11px;
  color: var(--ink-3);
  font-weight: 600;
  margin-top: 2px;
}

.date-header {
  font-size: 11px;
  font-weight: 800;
  color: var(--ink-3);
  text-transform: uppercase;
  letter-spacing: .06em;
  margin-bottom: 6px;
  margin-top: 4px;
}

.si-date { font-size: 12px; font-weight: 800; color: var(--ink); }
.si-time { font-size: 11px; color: var(--ink-3); font-weight: 600; margin: 2px 0; }
.si-role { font-size: 10px; color: var(--mint); font-weight: 700; }
.si-notes { font-size: 11px; color: var(--ink-3); font-style: italic; margin: 2px 0 4px; }

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
</style>
