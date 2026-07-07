<template>
  <PageContainer>
    <button class="back-btn" @click="ui.setCurrentTab('admin-hub')">← Admin Hub</button>

    <div class="page-header">
      <h1>📈 Reports &amp; Analytics</h1>
      <p class="page-sub">A cross-cutting snapshot pulled from real data across the app — nothing here is seeded or mocked.</p>
    </div>

    <SectionLabel>This month</SectionLabel>
    <div class="metrics-grid">
      <StatCard :value="formatCurrency(monthIncome)" label="Income" />
      <StatCard :value="formatCurrency(monthExpenses)" label="Expenses" />
      <StatCard :value="String(monthVolunteerHours)" label="Volunteer hours" />
      <StatCard :value="`${openTasks}/${totalTasks}`" label="Open tasks" />
    </div>

    <SectionLabel style="margin-top:16px">Current population ({{ animals.length }})</SectionLabel>
    <AppCard :flat="true">
      <div v-if="populationByStatus.length" class="breakdown-list">
        <div v-for="row in populationByStatus" :key="row.label" class="breakdown-row">
          <span class="breakdown-label">{{ row.label }}</span>
          <div class="breakdown-bar-wrap">
            <div class="breakdown-bar" :style="{ width: row.percent + '%' }"></div>
          </div>
          <span class="breakdown-count">{{ row.count }}</span>
        </div>
      </div>
      <EmptyState v-else icon="🐾" title="No animals yet" message="Add animals to see population breakdown." />
    </AppCard>

    <SectionLabel style="margin-top:16px">Outcomes, all time ({{ outcomes.length }})</SectionLabel>
    <AppCard :flat="true">
      <div v-if="outcomesByType.length" class="breakdown-list">
        <div v-for="row in outcomesByType" :key="row.label" class="breakdown-row">
          <span class="breakdown-label">{{ row.label }}</span>
          <div class="breakdown-bar-wrap">
            <div class="breakdown-bar outcome" :style="{ width: row.percent + '%' }"></div>
          </div>
          <span class="breakdown-count">{{ row.count }}</span>
        </div>
      </div>
      <EmptyState v-else icon="🎉" title="No outcomes logged yet" message="Adoptions, transfers, and other outcomes will show up here." />
    </AppCard>

    <SectionLabel style="margin-top:16px">Top volunteers, this month</SectionLabel>
    <AppCard :flat="true">
      <div v-if="topVolunteers.length" class="divide-list">
        <div v-for="v in topVolunteers" :key="v.userId" class="volunteer-row">
          <span class="volunteer-name">{{ v.email }}</span>
          <span class="volunteer-hours">{{ v.hours }}h {{ v.minutes }}m</span>
        </div>
      </div>
      <EmptyState v-else icon="⏱️" title="No hours logged this month" message="Clock-ins and claimed shifts will show up here." />
    </AppCard>

    <SectionLabel style="margin-top:16px">Finance, this month</SectionLabel>
    <AppCard :flat="true">
      <div class="finance-summary">
        <div class="finance-row">
          <span>Income</span>
          <span class="income">+{{ formatCurrency(monthIncome) }}</span>
        </div>
        <div class="finance-row">
          <span>Expenses</span>
          <span class="expense">-{{ formatCurrency(monthExpenses) }}</span>
        </div>
        <div class="finance-row net">
          <span>Net</span>
          <span :class="monthIncome - monthExpenses >= 0 ? 'income' : 'expense'">{{ formatCurrency(monthIncome - monthExpenses) }}</span>
        </div>
      </div>
    </AppCard>
  </PageContainer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { PageContainer, AppCard, SectionLabel, StatCard, EmptyState } from '../../ui'
import { useUIStore } from '../../../stores/ui'
import { useAnimalsStore } from '../../../stores/animals'
import { useOutcomesStore } from '../../../stores/outcomes'
import { useLedgerStore } from '../../../stores/ledger'
import { useShiftsStore } from '../../../stores/shifts'
import { useTasksStore } from '../../../stores/tasks'

const ui = useUIStore()
const animalsStore = useAnimalsStore()
const outcomesStore = useOutcomesStore()
const ledgerStore = useLedgerStore()
const shiftsStore = useShiftsStore()
const tasksStore = useTasksStore()

const loading = ref(true)
const volunteerHoursData = ref([])

const animals = computed(() => animalsStore.animals)
const outcomes = computed(() => outcomesStore.outcomes)
const tasks = computed(() => tasksStore.tasks)

const toDate = (v) => (v?.toDate ? v.toDate() : new Date(v))

const STATUS_LABELS = {
  intake: 'Intake', quarantine: 'Quarantine', medical: 'Medical Hold',
  available: 'Available', foster: 'In Foster', sanctuary: 'Sanctuary', adopted: 'Adopted',
}

const populationByStatus = computed(() => {
  const counts = {}
  animals.value.forEach(a => {
    const key = a.status || 'unknown'
    counts[key] = (counts[key] || 0) + 1
  })
  const max = Math.max(1, ...Object.values(counts))
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([status, count]) => ({
      label: STATUS_LABELS[status] || status,
      count,
      percent: Math.round((count / max) * 100),
    }))
})

const outcomesByType = computed(() => {
  const counts = {}
  outcomes.value.forEach(o => {
    const key = o.outcome || 'Unknown'
    counts[key] = (counts[key] || 0) + 1
  })
  const max = Math.max(1, ...Object.values(counts))
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({ label, count, percent: Math.round((count / max) * 100) }))
})

const monthRange = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return { start, end }
}

const monthIncome = computed(() => {
  const { start, end } = monthRange()
  return ledgerStore.ledgers
    .filter(e => e.type === 'income' && toDate(e.date) >= start && toDate(e.date) < end)
    .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)
})

const monthExpenses = computed(() => {
  const { start, end } = monthRange()
  return ledgerStore.ledgers
    .filter(e => e.type === 'expense' && toDate(e.date) >= start && toDate(e.date) < end)
    .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)
})

const monthVolunteerHours = computed(() =>
  volunteerHoursData.value.reduce((sum, v) => sum + v.hours + v.minutes / 60, 0).toFixed(1)
)

const topVolunteers = computed(() =>
  [...volunteerHoursData.value].sort((a, b) => b.totalMinutes - a.totalMinutes).slice(0, 5)
)

const openTasks = computed(() => tasks.value.filter(t => !t.completed).length)
const totalTasks = computed(() => tasks.value.length)

const formatCurrency = (n) => `$${(n || 0).toFixed(2)}`

onMounted(async () => {
  const { start, end } = monthRange()
  await Promise.all([
    animalsStore.fetchAnimals(),
    outcomesStore.fetchOutcomes(),
    ledgerStore.fetchLedgers(),
    tasksStore.fetchTasks(),
    shiftsStore.getAllVolunteerHours(start, end).then(data => { volunteerHoursData.value = data }),
  ])
  loading.value = false
})
</script>

<style scoped>
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: transparent;
  border: 1.5px solid var(--border);
  border-radius: var(--r);
  color: var(--ink-3);
  font-size: 12px;
  font-weight: 700;
  font-family: 'Nunito', sans-serif;
  cursor: pointer;
  transition: all .15s;
  margin-bottom: 16px;
}
.back-btn:hover { color: var(--ink); border-color: var(--border-2); }

.page-header { margin-bottom: 20px; }
.page-header h1 {
  margin: 0 0 6px;
  font-size: 28px;
  font-weight: 900;
  color: var(--ink);
  letter-spacing: -.01em;
}
.page-sub { margin: 0; font-size: 13px; color: var(--ink-3); }

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
@media (max-width: 700px) {
  .metrics-grid { grid-template-columns: repeat(2, 1fr); }
}

.breakdown-list { display: flex; flex-direction: column; gap: 10px; }
.breakdown-row {
  display: grid;
  grid-template-columns: 100px 1fr 32px;
  align-items: center;
  gap: 10px;
}
.breakdown-label { font-size: 12px; font-weight: 700; color: var(--ink-2); }
.breakdown-bar-wrap {
  height: 8px;
  background: var(--surface-2);
  border-radius: 4px;
  overflow: hidden;
}
.breakdown-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--mint), var(--brand));
  border-radius: 4px;
}
.breakdown-bar.outcome {
  background: linear-gradient(90deg, var(--amber), var(--coral));
}
.breakdown-count { font-size: 12px; font-weight: 800; color: var(--ink); text-align: right; }

.divide-list > * + * { border-top: 1px solid var(--border); }
.volunteer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}
.volunteer-row:first-child { padding-top: 0; }
.volunteer-row:last-child { padding-bottom: 0; }
.volunteer-name { font-size: 13px; font-weight: 700; color: var(--ink); }
.volunteer-hours { font-size: 12px; font-weight: 800; color: var(--mint); }

.finance-summary { display: flex; flex-direction: column; gap: 8px; }
.finance-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 700;
  color: var(--ink-2);
}
.finance-row.net {
  padding-top: 8px;
  border-top: 1px solid var(--border);
  font-size: 14px;
  font-weight: 900;
  color: var(--ink);
}
.income { color: var(--mint); }
.expense { color: var(--coral); }
</style>
