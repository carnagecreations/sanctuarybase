<template>
  <PageContainer>
    <div class="safe-houses-page">
      <div class="page-header">
        <h1>🏠 Safe Houses (Foster Homes)</h1>
        <div class="stats">
          <StatCard :number="String(fosters.length)" label="Active Fosters" />
          <StatCard :number="String(totalAnimals)" label="In Foster Care" />
        </div>
      </div>

      <SectionLabel>Foster Homes</SectionLabel>
      <div v-if="fosters.length" class="fosters-grid">
        <AppCard v-for="foster in fosters" :key="foster.id" class="foster-card">
          <div class="foster-info">
            <div class="foster-name">{{ foster.name }}</div>
            <div v-if="foster.email" class="foster-contact">{{ foster.email }}</div>
            <div v-if="foster.phone" class="foster-contact">{{ foster.phone }}</div>
          </div>
          <div v-if="foster.tags?.length" class="foster-tags">
            <span v-for="tag in foster.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
          <div v-if="foster.linkedAnimals?.length" class="animals-list">
            <div style="font-size: 11px; font-weight: 700; color: var(--ink-3); margin-bottom: 4px;">ANIMALS:</div>
            <div v-for="a in foster.linkedAnimals" :key="a.id" style="font-size: 12px; color: var(--ink);">• {{ a.name }}</div>
          </div>
          <div v-else style="font-size: 12px; color: var(--ink-3); font-style: italic; margin: 8px 0;">No animals assigned</div>
          <AppButton size="sm" variant="secondary" style="margin-top: 8px;">Contact</AppButton>
        </AppCard>
      </div>
      <EmptyState v-else icon="🏠" title="No fosters" message="Add foster volunteers to get started." />
    </div>
  </PageContainer>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { usePeopleStore } from '../../../stores/people'
import { personTypeList } from './people/personDisplay'
import { PageContainer, AppCard, AppButton, StatCard, SectionLabel, EmptyState } from '../../ui'

const peopleStore = usePeopleStore()

const fosters = computed(() => {
  return peopleStore.people.filter(p => personTypeList(p).includes('foster'))
})

const totalAnimals = computed(() => {
  return fosters.value.reduce((sum, f) => sum + (f.linkedAnimals?.length || 0), 0)
})

onMounted(async () => {
  await peopleStore.fetchPeople()
})
</script>

<style scoped>
.safe-houses-page { display: flex; flex-direction: column; gap: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: center; gap: 24px; }
.page-header h1 { font-size: 28px; font-weight: 900; margin: 0; flex: 1; }
.stats { display: flex; gap: 16px; }
.fosters-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
.foster-card { padding: 16px; display: flex; flex-direction: column; gap: 8px; }
.foster-name { font-size: 14px; font-weight: 700; }
.foster-contact { font-size: 11px; color: var(--ink-3); }
.foster-tags { display: flex; flex-wrap: wrap; gap: 4px; }
.tag { display: inline-block; padding: 2px 8px; background: rgba(78, 255, 197, 0.12); border: 1px solid rgba(78, 255, 197, 0.3); border-radius: 10px; font-size: 10px; color: var(--mint); font-weight: 700; }
.animals-list { padding-top: 8px; border-top: 1px solid var(--border); }
</style>
