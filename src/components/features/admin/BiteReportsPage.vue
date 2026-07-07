<template>
  <PageContainer>
    <button class="back-btn" @click="ui.setCurrentTab('admin-hub')">← Admin Hub</button>

    <div class="page-header">
      <h1>🚨 Bite Reports</h1>
      <AppButton variant="primary">+ New report</AppButton>
    </div>

    <SectionLabel>Pending review</SectionLabel>
    <AppCard v-if="pending.length" :flat="true">
      <div class="divide-list">
        <div v-for="b in pending" :key="b.id" class="bite-card">
          <div class="bite-header">
            <span class="bite-animal">{{ b.emoji }} {{ b.animalName }}</span>
            <AppBadge type="high">⚠️ {{ b.status }}</AppBadge>
          </div>
          <div class="bite-info">
            <span>{{ b.date }}</span> · <span>Victim: {{ b.victim }}</span>
          </div>
          <div class="bite-desc">{{ b.description }}</div>
          <div class="bite-actions">
            <AppButton size="sm" variant="primary">Review</AppButton>
            <AppButton size="sm" variant="secondary">More info</AppButton>
          </div>
        </div>
      </div>
    </AppCard>
    <EmptyState v-else icon="✓" title="No pending" message="All bite reports have been reviewed." />

    <SectionLabel>Reviewed</SectionLabel>
    <AppCard v-for="b in reviewed" :key="b.id" :flat="true">
      <div class="bite-header">
        <span class="bite-animal">{{ b.emoji }} {{ b.animalName }}</span>
        <AppBadge type="success">✓ {{ b.status }}</AppBadge>
      </div>
      <div class="bite-info">
        <span>{{ b.date }}</span> · <span>Victim: {{ b.victim }}</span>
      </div>
    </AppCard>
  </PageContainer>
</template>

<script setup>
import { onMounted } from 'vue'
import { PageContainer, AppCard, SectionLabel, AppButton, AppBadge, EmptyState } from '../../ui'
import { useUIStore } from '../../../stores/ui'
import { useBiteReportsStore } from '../../../stores/biteReports'

const ui = useUIStore()
const store = useBiteReportsStore()

const pending = store.pending
const reviewed = store.reviewed

onMounted(() => {
  store.fetchBiteReports()
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

.bite-card { padding: 10px 0; }
.bite-card:first-child { padding-top: 0; }
.bite-card:last-child { padding-bottom: 0; }

.bite-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.bite-animal {
  font-size: 13px;
  font-weight: 800;
  color: var(--ink);
}

.bite-info {
  font-size: 11px;
  color: var(--ink-3);
  font-weight: 600;
  margin-bottom: 6px;
}

.bite-desc {
  font-size: 12px;
  color: var(--ink-2);
  margin-bottom: 8px;
  line-height: 1.5;
}

.bite-actions {
  display: flex;
  gap: 6px;
}
</style>
