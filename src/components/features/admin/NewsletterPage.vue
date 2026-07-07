<template>
  <PageContainer>
    <div class="page-header">
      <h1>📰 Newsletter Subscribers</h1>
      <AppButton size="sm" variant="secondary" :disabled="!subscribers.length" @click="exportCsv">Export CSV</AppButton>
    </div>

    <div class="grid grid-cols-2 gap-3" style="margin-bottom: 16px;">
      <StatCard :number="String(subscribers.length)" label="Total Subscribers" />
      <StatCard :number="String(newThisWeek)" label="New This Week" />
    </div>

    <AppInput v-model="search" placeholder="Search by email…" style="margin-bottom: 16px;" />

    <AppCard v-if="loading">
      <div class="loading-state">Loading subscribers…</div>
    </AppCard>

    <AppCard v-else-if="error">
      <div class="error-state">{{ error }}</div>
    </AppCard>

    <AppCard v-else-if="!subscribers.length">
      <EmptyState icon="📭" title="No subscribers yet" message="Signups from the website's newsletter form will show up here." />
    </AppCard>

    <AppCard v-else-if="!filtered.length">
      <EmptyState icon="🔍" title="No matches" message="Try a different search." />
    </AppCard>

    <AppCard v-else :flat="true">
      <div class="divide-list">
        <div v-for="s in filtered" :key="s.id" class="sub-row">
          <div class="sub-email">{{ s.email }}</div>
          <div class="sub-meta">
            <span v-if="s.source" class="sub-source">{{ s.source }}</span>
            <span class="sub-date">{{ formatDate(s.createdAt) }}</span>
          </div>
        </div>
      </div>
    </AppCard>
  </PageContainer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { PageContainer, AppCard, AppButton, AppInput, StatCard, EmptyState } from '../../ui'
import { fetchSubscribers } from '../../../services/newsletterService'

const subscribers = ref([])
const loading = ref(true)
const error = ref('')
const search = ref('')

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return subscribers.value
  return subscribers.value.filter(s => s.email.toLowerCase().includes(term))
})

const newThisWeek = computed(() => {
  const weekAgo = Date.now() - 7 * 24 * 3600 * 1000
  return subscribers.value.filter(s => new Date(s.createdAt).getTime() >= weekAgo).length
})

const formatDate = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const exportCsv = () => {
  const rows = [['Email', 'Source', 'Subscribed'], ...subscribers.value.map(s => [s.email, s.source || '', s.createdAt])]
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(async () => {
  try {
    subscribers.value = await fetchSubscribers()
  } catch (e) {
    error.value = e.message || 'Failed to load subscribers'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-header h1 {
  font-size: 20px;
  font-weight: 900;
  color: var(--ink);
  margin: 0;
}

.loading-state,
.error-state {
  padding: 40px 20px;
  text-align: center;
  font-size: 14px;
}

.loading-state { color: var(--ink-3); }
.error-state { color: var(--coral); }

.divide-list > * + * { border-top: 1px solid var(--border); }

.sub-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
}

.sub-email {
  font-size: 13px;
  font-weight: 700;
  color: var(--ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sub-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: none;
  font-size: 11px;
  color: var(--ink-3);
}

.sub-source {
  padding: 2px 8px;
  border-radius: 12px;
  background: rgba(78, 255, 197, 0.12);
  color: var(--mint);
  font-weight: 700;
  text-transform: uppercase;
  font-size: 10px;
}
</style>
