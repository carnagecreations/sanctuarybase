<template>
  <PageContainer>
    <button class="back-btn" @click="ui.setCurrentTab('admin-hub')">← Admin Hub</button>

    <div class="page-header">
      <h1>⏱️ Volunteer Hours</h1>
      <div class="header-controls">
        <select v-model="selectedMonth" class="filter-select">
          <option value="month">This Month</option>
          <option value="year">This Year</option>
          <option value="all">All Time</option>
        </select>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search volunteer..."
          class="search-input"
        />
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <AppCard :flat="true" class="stat-card">
        <div class="stat-label">Total Hours (Period)</div>
        <div class="stat-value">{{ totalHours }}h {{ totalMinutes }}m</div>
      </AppCard>
      <AppCard :flat="true" class="stat-card">
        <div class="stat-label">Volunteers Tracked</div>
        <div class="stat-value">{{ filteredVolunteers.length }}</div>
      </AppCard>
      <AppCard :flat="true" class="stat-card">
        <div class="stat-label">Average Hours</div>
        <div class="stat-value">{{ averageHours }}h</div>
      </AppCard>
    </div>

    <!-- Volunteers Table -->
    <AppCard :flat="true" class="table-card">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <span>Loading volunteer hours...</span>
      </div>

      <div v-else-if="!filteredVolunteers.length" class="empty-state">
        <div style="color: var(--ink-3); font-size: 13px; padding: 20px; text-align: center;">
          {{ searchQuery ? 'No volunteers match your search' : 'No volunteer hours tracked yet' }}
        </div>
      </div>

      <table v-else class="hours-table">
        <thead>
          <tr>
            <th @click="sortBy('email')" class="sortable">
              Volunteer {{ sortField === 'email' ? (sortAsc ? '↑' : '↓') : '' }}
            </th>
            <th @click="sortBy('hours')" class="sortable text-right">
              Hours {{ sortField === 'hours' ? (sortAsc ? '↑' : '↓') : '' }}
            </th>
            <th class="text-right">Last Shift</th>
            <th class="text-right">Shifts</th>
            <th class="text-right">Trend</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="volunteer in paginatedVolunteers" :key="volunteer.userId" class="volunteer-row">
            <td class="volunteer-name">
              <div class="name">{{ volunteer.email }}</div>
            </td>
            <td class="hours-cell text-right">
              <div class="hours-badge">{{ volunteer.hours }}h {{ volunteer.minutes }}m</div>
            </td>
            <td class="last-shift-cell text-right">
              <div class="last-shift">
                {{ volunteer.shifts[0] ? formatDate(volunteer.shifts[0].clockInAt) : '—' }}
              </div>
            </td>
            <td class="shifts-count text-right">{{ volunteer.shifts.length }}</td>
            <td class="trend-cell text-right">
              <div class="trend-indicator" :class="getTrendClass(volunteer)">
                {{ getTrendIcon(volunteer) }}
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button
          class="pagination-btn"
          @click="currentPage = Math.max(1, currentPage - 1)"
          :disabled="currentPage === 1"
        >
          ← Previous
        </button>
        <span class="pagination-info">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        <button
          class="pagination-btn"
          @click="currentPage = Math.min(totalPages, currentPage + 1)"
          :disabled="currentPage === totalPages"
        >
          Next →
        </button>
      </div>
    </AppCard>

    <!-- Detailed View Toggle -->
    <div v-if="selectedVolunteer" class="detailed-view">
      <AppCard class="volunteer-detail-card">
        <div class="detail-header">
          <h2>{{ selectedVolunteer.email }} - Shift Details</h2>
          <button class="close-btn" @click="selectedVolunteer = null">✕</button>
        </div>

        <div class="detail-stats">
          <div class="detail-stat">
            <span class="label">Total Hours</span>
            <span class="value">{{ selectedVolunteer.hours }}h {{ selectedVolunteer.minutes }}m</span>
          </div>
          <div class="detail-stat">
            <span class="label">Total Shifts</span>
            <span class="value">{{ selectedVolunteer.shifts.length }}</span>
          </div>
          <div class="detail-stat">
            <span class="label">Avg Shift Duration</span>
            <span class="value">
              {{ selectedVolunteer.shifts.length > 0 ? formatAvgDuration(selectedVolunteer.totalMinutes / selectedVolunteer.shifts.length) : '—' }}
            </span>
          </div>
        </div>

        <SectionLabel>Recent Shifts</SectionLabel>
        <div class="shifts-list">
          <div v-for="shift in selectedVolunteer.shifts.slice(0, 10)" :key="shift.id" class="shift-item">
            <div class="shift-date">{{ formatDateFull(shift.clockInAt) }}</div>
            <div class="shift-time">
              {{ formatTime(shift.clockInAt) }}
              <span v-if="shift.clockOutAt"> — {{ formatTime(shift.clockOutAt) }}</span>
            </div>
            <div class="shift-duration">{{ formatDuration(shift.duration) }}</div>
          </div>
        </div>
      </AppCard>
    </div>
  </PageContainer>
</template>

<script setup>
import { computed, onMounted, ref, reactive, watch } from 'vue'
import { PageContainer, AppCard, SectionLabel } from '../../ui'
import { useUIStore } from '../../../stores/ui'
import { useShiftsStore } from '../../../stores/shifts'
import { useTableFilters } from '../../../composables/useTableFilters'

const ui = useUIStore()
const shiftsStore = useShiftsStore()

const loading = ref(false)
const volunteers = ref([])
const selectedMonth = ref('month')
const selectedVolunteer = ref(null)
const sortField = ref('hours')
const sortAsc = ref(false)
const currentPage = ref(1)
const itemsPerPage = 10

// Initialize composable with volunteers
const { searchQuery, filtered } = useTableFilters(volunteers)

const getDateRange = () => {
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  let startDate = new Date(now)
  let endDate = new Date(now)
  endDate.setDate(endDate.getDate() + 1)

  if (selectedMonth.value === 'month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  } else if (selectedMonth.value === 'year') {
    startDate = new Date(now.getFullYear(), 0, 1)
    endDate = new Date(now.getFullYear() + 1, 0, 1)
  } else if (selectedMonth.value === 'all') {
    startDate = new Date(2020, 0, 1)
    endDate = new Date(now.getFullYear() + 1, 0, 1)
  }

  return { startDate, endDate }
}

const fetchVolunteerHours = async () => {
  loading.value = true
  try {
    const { startDate, endDate } = getDateRange()
    const data = await shiftsStore.getAllVolunteerHours(startDate, endDate)
    volunteers.value = data.sort((a, b) => b.totalMinutes - a.totalMinutes)
  } catch (err) {
    console.error('Failed to fetch volunteer hours:', err)
    ui.showToast('Failed to load volunteer hours')
  } finally {
    loading.value = false
  }
}

const filteredVolunteers = computed(() => {
  // Use composable's filtered results (search already applied)
  let results = [...filtered.value]

  // Apply custom sort logic for volunteer hours
  results.sort((a, b) => {
    let aVal = a[sortField.value]
    let bVal = b[sortField.value]

    if (sortField.value === 'hours') {
      aVal = a.totalMinutes
      bVal = b.totalMinutes
    }

    if (sortAsc.value) {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  return results
})

const paginatedVolunteers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredVolunteers.value.slice(start, start + itemsPerPage)
})

const totalPages = computed(() => {
  return Math.ceil(filteredVolunteers.value.length / itemsPerPage)
})

const totalHours = computed(() => {
  const totalMinutes = volunteers.value.reduce((sum, v) => sum + v.totalMinutes, 0)
  return Math.floor(totalMinutes / 60)
})

const totalMinutes = computed(() => {
  const totalMinutes = volunteers.value.reduce((sum, v) => sum + v.totalMinutes, 0)
  return totalMinutes % 60
})

const averageHours = computed(() => {
  if (volunteers.value.length === 0) return 0
  const avgMinutes = volunteers.value.reduce((sum, v) => sum + v.totalMinutes, 0) / volunteers.value.length
  return Math.round(avgMinutes / 60)
})

const sortBy = (field) => {
  if (sortField.value === field) {
    sortAsc.value = !sortAsc.value
  } else {
    sortField.value = field
    sortAsc.value = false
  }
  currentPage.value = 1
}

const formatDate = (timestamp) => {
  if (!timestamp) return '—'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return 'Today'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
}

const formatDateFull = (timestamp) => {
  if (!timestamp) return '—'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: '2-digit' })
}

const formatTime = (timestamp) => {
  if (!timestamp) return '—'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

const formatDuration = (minutes) => {
  if (!minutes) return '—'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

const formatAvgDuration = (minutes) => {
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

const getTrendClass = (volunteer) => {
  if (volunteer.shifts.length < 2) return 'neutral'
  const recent = volunteer.shifts.slice(0, Math.ceil(volunteer.shifts.length / 2))
  const older = volunteer.shifts.slice(Math.ceil(volunteer.shifts.length / 2))
  const recentAvg = recent.reduce((sum, s) => sum + (s.duration || 0), 0) / recent.length
  const olderAvg = older.reduce((sum, s) => sum + (s.duration || 0), 0) / older.length
  return recentAvg > olderAvg ? 'increasing' : recentAvg < olderAvg ? 'decreasing' : 'neutral'
}

const getTrendIcon = (volunteer) => {
  if (volunteer.shifts.length < 2) return '—'
  const trendClass = getTrendClass(volunteer)
  return trendClass === 'increasing' ? '📈' : trendClass === 'decreasing' ? '📉' : '→'
}

onMounted(() => {
  fetchVolunteerHours()
})
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
}

.page-header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
}

.header-controls {
  display: flex;
  gap: 12px;
  flex: 1;
  max-width: 400px;
}

.filter-select,
.search-input {
  flex: 1;
  padding: 10px 14px;
  border: 1.5px solid var(--border-2);
  border-radius: var(--r);
  background: var(--surface-2);
  color: var(--ink);
  font-family: 'Nunito', sans-serif;
  font-size: 13px;
  transition: all 0.15s;
}

.filter-select:hover,
.search-input:hover {
  border-color: var(--border-3);
}

.filter-select:focus,
.search-input:focus {
  outline: none;
  border-color: var(--mint);
  background: var(--surface-1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.stat-card {
  padding: 16px;
  border: 1.5px solid var(--border-2);
  border-radius: var(--r);
}

.stat-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-3);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--mint);
}

.table-card {
  border: 1.5px solid var(--border-2);
  border-radius: var(--r);
  overflow: hidden;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px;
  color: var(--ink-3);
  font-size: 13px;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--border-2);
  border-top-color: var(--mint);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
}

.hours-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.hours-table thead {
  background: var(--surface-2);
  border-bottom: 1.5px solid var(--border-2);
}

.hours-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: var(--ink-3);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 11px;
  user-select: none;
}

.sortable {
  cursor: pointer;
  transition: color 0.15s;
}

.sortable:hover {
  color: var(--mint);
}

.hours-table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-2);
  vertical-align: middle;
}

.hours-table tbody tr:last-child td {
  border-bottom: none;
}

.volunteer-row {
  transition: all 0.15s;
}

.volunteer-row:hover {
  background: var(--surface-2);
  cursor: pointer;
}

.volunteer-name {
  font-weight: 600;
  color: var(--ink);
}

.hours-badge {
  display: inline-block;
  padding: 4px 12px;
  background: rgba(44, 210, 94, 0.1);
  color: var(--mint);
  border-radius: 12px;
  font-weight: 600;
  font-size: 12px;
}

.last-shift-cell {
  font-size: 12px;
  color: var(--ink-3);
}

.shifts-count {
  font-weight: 600;
  color: var(--ink-2);
}

.trend-indicator {
  font-size: 16px;
  display: inline-block;
}

.text-right {
  text-align: right;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px;
  border-top: 1px solid var(--border-2);
}

.pagination-btn {
  padding: 8px 16px;
  background: var(--surface-2);
  border: 1px solid var(--border-2);
  border-radius: 6px;
  color: var(--ink);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--surface-3);
  border-color: var(--mint);
  color: var(--mint);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 12px;
  color: var(--ink-2);
  font-weight: 600;
}

.detailed-view {
  margin-top: 24px;
}

.volunteer-detail-card {
  border: 1.5px solid var(--border-2);
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1.5px solid var(--border-2);
  margin-bottom: 16px;
}

.detail-header h2 {
  margin: 0;
  font-size: 18px;
  color: var(--ink);
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: var(--ink-3);
  transition: color 0.15s;
  padding: 0;
}

.close-btn:hover {
  color: var(--ink);
}

.detail-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background: var(--surface-2);
  border-radius: var(--r);
}

.detail-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-stat .label {
  font-size: 11px;
  font-weight: 600;
  color: var(--ink-3);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-stat .value {
  font-size: 18px;
  font-weight: 700;
  color: var(--mint);
}

.shifts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.shift-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--surface-2);
  border-radius: 8px;
  font-size: 13px;
}

.shift-date {
  font-weight: 600;
  color: var(--ink);
  min-width: 120px;
}

.shift-time {
  flex: 1;
  color: var(--ink-2);
  font-size: 12px;
}

.shift-duration {
  background: rgba(44, 210, 94, 0.1);
  color: var(--mint);
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 12px;
}

.back-btn {
  background: none;
  border: none;
  color: var(--mint);
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 16px;
  transition: all 0.15s;
  padding: 6px 12px;
}

.back-btn:hover {
  color: var(--ink);
  background: var(--surface-2);
  border-radius: 6px;
}
</style>
