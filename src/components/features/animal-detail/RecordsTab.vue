<template>
  <div>
    <SectionLabel>Photos & files</SectionLabel>
    <AppCard :flat="true">
      <div class="placeholder-box">
        <span class="placeholder-icon">📸</span>
        <span class="placeholder-text">Upload photos and documents</span>
      </div>
      <EmptyState v-if="false" icon="📸" title="No photos" message="Upload animal photos for records." />
    </AppCard>

    <SectionLabel>Costs & expenses</SectionLabel>
    <AppCard :flat="true">
      <div v-if="costs.length" class="divide-list">
        <div v-for="c in costs" :key="c.id" class="cost-entry">
          <div class="cost-desc">{{ c.description }}</div>
          <div class="cost-amount">${{ c.amount }}</div>
          <div class="cost-date">{{ c.date }}</div>
        </div>
      </div>
      <EmptyState v-else icon="💰" title="No costs logged" message="Track medical and care expenses." />
    </AppCard>

    <SectionLabel>Current foster</SectionLabel>
    <AppCard :flat="true">
      <div v-if="fosterHistory.length" class="divide-list">
        <div v-for="f in fosterHistory" :key="f.id" class="foster-entry">
          <div class="foster-name">{{ f.name }}</div>
          <div class="foster-dates">{{ f.startDate }} → {{ f.endDate }}</div>
          <div v-if="f.notes" class="foster-notes">{{ f.notes }}</div>
        </div>
      </div>
      <EmptyState v-else icon="🏠" title="No current foster" message="Assign a foster from the person's profile in People to track placements here." />
    </AppCard>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { AppCard, SectionLabel, EmptyState } from '../../ui'
import { usePeopleStore } from '../../../stores/people'
import { personTypeList, formatDate } from '../admin/people/personDisplay'

const props = defineProps({
  animal: { type: Object, required: true }
})

const peopleStore = usePeopleStore()

const costs = []

// Real placements, sourced from the same linkedAnimals relationship the
// People/CRM "Assign an animal" control writes to (see PersonDetailDrawer).
const fosterHistory = computed(() => {
  return peopleStore.people
    .filter(p => personTypeList(p).includes('foster'))
    .flatMap(p => (p.linkedAnimals || [])
      .filter(a => a.id === props.animal.id)
      .map(a => ({ id: `${p.id}-${a.id}`, name: p.name, startDate: a.linkedAt ? formatDate(a.linkedAt) : 'Unknown date', endDate: 'Present', notes: null })))
})

onMounted(() => {
  if (!peopleStore.people.length) peopleStore.fetchPeople()
})
</script>

<style scoped>
.placeholder-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 30px;
  background: var(--surface-2);
  border: 2px dashed var(--border);
  border-radius: var(--r);
  text-align: center;
}

.placeholder-icon { font-size: 32px; }
.placeholder-text { font-size: 12px; color: var(--ink-3); font-weight: 600; }

.divide-list > * + * { border-top: 1px solid var(--border); }

.cost-entry {
  padding: 10px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}
.cost-entry:first-child { padding-top: 0; }
.cost-entry:last-child { padding-bottom: 0; }

.cost-desc { font-size: 12px; color: var(--ink); font-weight: 600; }
.cost-amount { font-size: 13px; font-weight: 800; color: var(--ink); }
.cost-date { font-size: 11px; color: var(--ink-3); }

.foster-entry { padding: 10px 0; }
.foster-entry:first-child { padding-top: 0; }
.foster-entry:last-child { padding-bottom: 0; }

.foster-name { font-size: 13px; font-weight: 800; color: var(--ink); }
.foster-dates { font-size: 11px; color: var(--ink-3); margin-top: 2px; }
.foster-notes { font-size: 11px; color: var(--ink-3); margin-top: 4px; font-style: italic; }
</style>
