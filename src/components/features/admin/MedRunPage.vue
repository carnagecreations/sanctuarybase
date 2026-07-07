<template>
  <PageContainer>
    <button class="back-btn" @click="ui.setCurrentTab('admin-hub')">← Admin Hub</button>

    <div class="page-header">
      <h1>💊 Med Run</h1>
      <AppButton variant="primary" @click="startMedRun">+ Start med run</AppButton>
    </div>

    <SectionLabel>Today's medications</SectionLabel>
    <div v-if="todaysMeds.length" class="med-list">
      <AppCard v-for="m in todaysMeds" :key="m.id" :flat="true" class="med-item">
        <div class="med-item-header">
          <div class="med-animal">
            <span class="med-emoji">{{ m.emoji }}</span>
            <span class="med-name">{{ m.animalName }}</span>
          </div>
          <AppBadge :type="m.given ? 'success' : 'info'">
            {{ m.given ? '✓ Given' : 'Pending' }}
          </AppBadge>
        </div>
        <div class="med-item-meds">
          <div v-for="med in m.medications" :key="med.id" class="med-row">
            <span class="med-dose">{{ med.dose }} {{ med.frequency }}</span>
            <span class="med-route">{{ med.route }}</span>
            <span v-if="med.notes" class="med-notes">{{ med.notes }}</span>
          </div>
        </div>
        <div v-if="!m.given" class="med-actions">
          <AppButton variant="primary" size="sm">✓ Mark as given</AppButton>
          <AppButton variant="secondary" size="sm">Skip</AppButton>
        </div>
      </AppCard>
    </div>
    <EmptyState v-else icon="✓" title="All done" message="All medications given for today." />

    <SectionLabel>History</SectionLabel>
    <AppCard v-for="h in history" :key="h.id" :flat="true">
      <div class="history-row">
        <span class="history-date">{{ h.date }}</span>
        <span class="history-count">{{ h.count }} animals medicated</span>
        <span class="history-by">By {{ h.by }}</span>
      </div>
    </AppCard>
  </PageContainer>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { PageContainer, AppCard, SectionLabel, AppButton, AppBadge, EmptyState } from '../../ui'
import { useUIStore } from '../../../stores/ui'
import { useMedRunsStore } from '../../../stores/medRuns'

const ui = useUIStore()
const medRunsStore = useMedRunsStore()

const startMedRun = () => {
  ui.showToast('Med run started 💊', 'success')
}

const todaysMeds = computed(() => {
  return medRunsStore.medRuns.filter(run => {
    const runDate = new Date(run.createdAt)
    const today = new Date()
    return runDate.toDateString() === today.toDateString()
  })
})

const history = computed(() => {
  return medRunsStore.medRuns.map(run => ({
    id: run.id,
    date: new Date(run.createdAt).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }),
    count: run.medications?.length || 0,
    by: run.givenBy || 'Unknown'
  })).slice(0, 10)
})

onMounted(() => {
  medRunsStore.fetchMedRuns()
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

.med-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 4px;
}

.med-item { margin-bottom: 0; }

.med-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.med-animal {
  display: flex;
  align-items: center;
  gap: 8px;
}

.med-emoji { font-size: 20px; }

.med-name {
  font-size: 13px;
  font-weight: 800;
  color: var(--ink);
}

.med-item-meds {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px;
  background: var(--surface-2);
  border-radius: var(--r);
  margin-bottom: 8px;
}

.med-row {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  font-size: 11px;
}

.med-dose { font-weight: 700; color: var(--ink); }
.med-route { color: var(--mint); font-weight: 700; }
.med-notes { color: var(--ink-3); font-style: italic; }

.med-actions {
  display: flex;
  gap: 6px;
}

.history-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
  font-size: 12px;
}
.history-row:last-child { border-bottom: none; }

.history-date { font-weight: 700; color: var(--ink); }
.history-count { color: var(--mint); font-weight: 700; }
.history-by { color: var(--ink-3); }
</style>
