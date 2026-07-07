<template>
  <PageContainer>
    <button class="back-btn" @click="ui.setCurrentTab('admin-hub')">← Admin Hub</button>

    <div class="page-header">
      <h1>🏡 Adoptions</h1>
      <AppButton variant="primary">+ Log adoption</AppButton>
    </div>

    <SectionLabel>Pending adoptions</SectionLabel>
    <AppCard v-if="pending.length" :flat="true">
      <div class="divide-list">
        <div v-for="a in pending" :key="a.id" class="adoption-card">
          <div class="adoption-header">
            <span class="adoption-animal">{{ a.emoji }} {{ a.animalName }}</span>
            <AppBadge type="info">Pending</AppBadge>
          </div>
          <div class="adoption-adopter">👤 {{ a.adopterName }}</div>
          <div class="adoption-dates">Meet & Greet: {{ a.meetDate }}</div>
          <div class="adoption-actions">
            <AppButton size="sm" variant="primary">Approve</AppButton>
            <AppButton size="sm" variant="secondary">Deny</AppButton>
          </div>
        </div>
      </div>
    </AppCard>
    <EmptyState v-else icon="⏳" title="No pending" message="No adoptions awaiting approval." />

    <SectionLabel>Completed this month</SectionLabel>
    <AppCard v-for="a in completed" :key="a.id" :flat="true">
      <div class="adoption-row">
        <span>{{ a.emoji }} {{ a.animalName }}</span>
        <span class="adoption-adopter">→ {{ a.adopterName }}</span>
        <span class="adoption-date">{{ a.completedDate }}</span>
      </div>
    </AppCard>

    <SectionLabel>Stats</SectionLabel>
    <div class="stats-row">
      <AppCard title="This month">
        <div class="stat-val">{{ monthStats }}</div>
      </AppCard>
      <AppCard title="This year">
        <div class="stat-val">{{ yearStats }}</div>
      </AppCard>
      <AppCard title="Success rate">
        <div class="stat-val">{{ successRate }}</div>
      </AppCard>
    </div>
  </PageContainer>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { PageContainer, AppCard, SectionLabel, AppButton, AppBadge, EmptyState } from '../../ui'
import { useUIStore } from '../../../stores/ui'
import { useAdoptionsStore } from '../../../stores/adoptions'

const ui = useUIStore()
const adoptionsStore = useAdoptionsStore()

const pending = computed(() =>
  adoptionsStore.adoptions.filter(a => a.status === 'pending' || a.status === undefined)
)

const completed = computed(() => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  return adoptionsStore.adoptions.filter(a => {
    if (a.status !== 'completed') return false
    const completedDate = a.completedAt?.toDate ? a.completedAt.toDate() : new Date(a.completedAt)
    return completedDate.getMonth() === currentMonth && completedDate.getFullYear() === currentYear
  })
})

const monthStats = computed(() => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  return adoptionsStore.adoptions.filter(a => {
    if (a.status !== 'completed') return false
    const completedDate = a.completedAt?.toDate ? a.completedAt.toDate() : new Date(a.completedAt)
    return completedDate.getMonth() === currentMonth && completedDate.getFullYear() === currentYear
  }).length
})

const yearStats = computed(() => {
  const now = new Date()
  const currentYear = now.getFullYear()

  return adoptionsStore.adoptions.filter(a => {
    if (a.status !== 'completed') return false
    const completedDate = a.completedAt?.toDate ? a.completedAt.toDate() : new Date(a.completedAt)
    return completedDate.getFullYear() === currentYear
  }).length
})

const successRate = computed(() => {
  const total = adoptionsStore.adoptions.length
  if (total === 0) return '0%'
  const successCount = adoptionsStore.adoptions.filter(a => a.status === 'completed').length
  const rate = Math.round((successCount / total) * 100)
  return `${rate}%`
})

onMounted(() => {
  adoptionsStore.fetchAdoptions()
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

.divide-list > * + * { border-top: 1px solid var(--border); }

.adoption-card { padding: 10px 0; }
.adoption-card:first-child { padding-top: 0; }
.adoption-card:last-child { padding-bottom: 0; }

.adoption-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.adoption-animal {
  font-size: 13px;
  font-weight: 800;
  color: var(--ink);
}

.adoption-adopter {
  font-size: 12px;
  color: var(--ink-2);
  font-weight: 600;
  margin-bottom: 4px;
}

.adoption-dates {
  font-size: 11px;
  color: var(--ink-3);
  margin-bottom: 6px;
}

.adoption-actions {
  display: flex;
  gap: 6px;
}

.adoption-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
  font-size: 12px;
  flex-wrap: wrap;
}
.adoption-row:last-child { border-bottom: none; }

.adoption-date { font-size: 10px; color: var(--ink-3); }

.stats-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
}

.stat-val {
  font-size: 22px;
  font-weight: 900;
  color: var(--mint);
  font-family: 'Fredoka One', sans-serif;
}
</style>
