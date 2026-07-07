<template>
  <PageContainer>
    <button class="back-btn" @click="ui.setCurrentTab('admin-hub')">← Admin Hub</button>

    <div class="page-header">
      <h1>📝 EOD Report</h1>
      <AppButton variant="primary">+ New report</AppButton>
    </div>

    <SectionLabel>Today's summary</SectionLabel>
    <div class="summary-grid">
      <AppCard title="Animals fed">
        <div class="stat-number">{{ animalsFed }}</div>
        <div class="stat-label">All fed</div>
      </AppCard>
      <AppCard title="Meds given">
        <div class="stat-number">{{ medsDosed }}</div>
        <div class="stat-label">Doses administered</div>
      </AppCard>
      <AppCard title="Volunteers">
        <div class="stat-number">{{ volunteersOnShift }}</div>
        <div class="stat-label">On shift</div>
      </AppCard>
      <AppCard title="Issues logged">
        <div class="stat-number">{{ issuesLogged }}</div>
        <div class="stat-label">Incidents reported</div>
      </AppCard>
    </div>

    <SectionLabel>Notes & observations</SectionLabel>
    <AppCard title="General notes">
      <AppInput v-model="notes" type="textarea" placeholder="Any noteworthy observations or incidents today?" />
    </AppCard>

    <SectionLabel>Issues requiring attention</SectionLabel>
    <AppCard v-for="i in issues" :key="i.id" :flat="true">
      <div class="issue-row">
        <span>{{ i.animal }} - {{ i.issue }}</span>
        <AppBadge :type="i.priority === 'high' ? 'high' : i.priority === 'med' ? 'med' : 'low'">
          {{ i.priority }}
        </AppBadge>
      </div>
    </AppCard>

    <div class="eod-actions">
      <AppButton variant="primary" @click="submitReport">✓ Submit report</AppButton>
      <AppButton variant="secondary">Save draft</AppButton>
    </div>
  </PageContainer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { PageContainer, AppCard, SectionLabel, AppButton, AppBadge, AppInput } from '../../ui'
import { useUIStore } from '../../../stores/ui'
import { useEodReportsStore } from '../../../stores/eodReports'

const ui = useUIStore()
const eodReports = useEodReportsStore()

const notes = ref('')

// Compute summary stats from reports
const animalsFed = computed(() => {
  const today = new Date().toDateString()
  const todayReports = eodReports.reports.filter(r => new Date(r.createdAt).toDateString() === today)
  return todayReports.length > 0 ? todayReports[0].animalsFed : '0/0'
})

const medsDosed = computed(() => {
  const today = new Date().toDateString()
  const todayReports = eodReports.reports.filter(r => new Date(r.createdAt).toDateString() === today)
  return todayReports.length > 0 ? todayReports[0].medsGiven : 0
})

const volunteersOnShift = computed(() => {
  const today = new Date().toDateString()
  const todayReports = eodReports.reports.filter(r => new Date(r.createdAt).toDateString() === today)
  return todayReports.length > 0 ? todayReports[0].volunteersCount : 0
})

const issuesLogged = computed(() => {
  const today = new Date().toDateString()
  const todayReports = eodReports.reports.filter(r => new Date(r.createdAt).toDateString() === today)
  return todayReports.length > 0 ? todayReports[0].issues?.length : 0
})

const issues = computed(() => {
  const today = new Date().toDateString()
  const todayReports = eodReports.reports.filter(r => new Date(r.createdAt).toDateString() === today)
  return todayReports.length > 0 ? (todayReports[0].issues || []) : []
})

onMounted(async () => {
  await eodReports.fetchReports()
})

const submitReport = async () => {
  try {
    await eodReports.createReport({
      notes: notes.value,
      animalsFed: animalsFed.value,
      medsGiven: medsDosed.value,
      volunteersCount: volunteersOnShift.value,
      issues: issues.value
    })
    ui.showToast('EOD report submitted!')
    notes.value = ''
  } catch (err) {
    ui.showToast('Failed to submit report', 'error')
  }
}
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

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.page-header h1 {
  font-size: 22px;
  font-weight: 900;
  color: var(--ink);
  margin: 0;
  font-family: 'Fredoka One', sans-serif;
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 4px;
}

.stat-number {
  font-size: 24px;
  font-weight: 900;
  color: var(--mint);
  font-family: 'Fredoka One', sans-serif;
}

.stat-label {
  font-size: 11px;
  color: var(--ink-3);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .05em;
}

.issue-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
  font-size: 12px;
}
.issue-row:last-child { border-bottom: none; }

.eod-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}
</style>
