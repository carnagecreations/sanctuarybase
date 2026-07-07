<template>
  <PageContainer>
    <div class="space-y-4">
      <!-- Outcome Stats -->
      <div class="grid grid-cols-2 gap-3">
        <StatCard :number="adoptionCount" label="Adoptions" clickable @click="filterStatus = 'adoption'" />
        <StatCard :number="transferCount" label="Transfers" clickable @click="filterStatus = 'transfer'" />
        <StatCard :number="returnCount" label="Returns" clickable @click="filterStatus = 'return'" />
        <StatCard :number="deceasedCount" label="Deceased" clickable @click="filterStatus = 'deceased'" />
      </div>

      <!-- Filter -->
      <AppSelect v-model="filterStatus" :options="statusOptions" label="Filter by Outcome" />

      <!-- Outcomes List -->
      <div class="space-y-3">
        <AppCard v-for="outcome in filteredOutcomes" :key="outcome.id" noPad>
          <div class="p-4 space-y-2">
            <div class="flex items-start justify-between">
              <div>
                <div class="font-bold">{{ outcome.animalName }}</div>
                <div class="text-xs text-gray-400">{{ outcome.breed }} • Intake: {{ outcome.intakeDate }}</div>
              </div>
              <AppBadge :type="outcomeBadgeType(outcome.outcome)">{{ outcome.outcome }}</AppBadge>
            </div>
            <div class="text-xs pt-2 border-t border-gray-700 space-y-1">
              <div><span class="text-gray-400">Outcome Date:</span> {{ outcome.outcomeDate }}</div>
              <div v-if="outcome.destination"><span class="text-gray-400">Destination:</span> {{ outcome.destination }}</div>
              <div v-if="outcome.reason"><span class="text-gray-400">Reason:</span> {{ outcome.reason }}</div>
            </div>
            <div class="flex gap-2 pt-2">
              <AppButton variant="secondary" size="sm">View Details</AppButton>
              <AppButton variant="secondary" size="sm">Print Report</AppButton>
            </div>
          </div>
        </AppCard>
      </div>

      <!-- LRR (Live Release Rate) Stats -->
      <div>
        <SectionLabel>Live Release Rate (LRR)</SectionLabel>
        <AppCard flat noPad>
          <div class="p-4 space-y-3">
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span>Overall LRR</span>
                <span class="font-bold text-teal-400">{{ overallLRR }}%</span>
              </div>
              <div class="w-full bg-gray-700 rounded h-2">
                <div class="bg-teal-400 h-2 rounded" :style="{ width: overallLRR + '%' }"></div>
              </div>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span>Dogs LRR</span>
                <span class="font-bold text-teal-400">{{ dogsLRR }}%</span>
              </div>
              <div class="w-full bg-gray-700 rounded h-2">
                <div class="bg-teal-400 h-2 rounded" :style="{ width: dogsLRR + '%' }"></div>
              </div>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span>Cats LRR</span>
                <span class="font-bold text-teal-400">{{ catsLRR }}%</span>
              </div>
              <div class="w-full bg-gray-700 rounded h-2">
                <div class="bg-teal-400 h-2 rounded" :style="{ width: catsLRR + '%' }"></div>
              </div>
            </div>
          </div>
        </AppCard>
      </div>
    </div>
  </PageContainer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useOutcomesStore } from '../../../stores/outcomes'
import PageContainer from '../../ui/PageContainer.vue'
import SectionLabel from '../../ui/SectionLabel.vue'
import AppCard from '../../ui/AppCard.vue'
import AppSelect from '../../ui/AppSelect.vue'
import AppButton from '../../ui/AppButton.vue'
import AppBadge from '../../ui/AppBadge.vue'
import StatCard from '../../ui/StatCard.vue'

const store = useOutcomesStore()
const filterStatus = ref('all')

const statusOptions = [
  { label: 'All Outcomes', value: 'all' },
  { label: 'Adoptions', value: 'adoption' },
  { label: 'Transfers', value: 'transfer' },
  { label: 'Returns', value: 'return' },
  { label: 'Deceased', value: 'deceased' },
]

const outcomes = computed(() => store.outcomes)

const filteredOutcomes = computed(() => {
  return filterStatus.value === 'all'
    ? outcomes.value
    : outcomes.value.filter(o => o.outcome === filterStatus.value)
})

const adoptionCount = computed(() => store.outcomes.filter(o => o.outcome === 'adoption').length)
const transferCount = computed(() => store.outcomes.filter(o => o.outcome === 'transfer').length)
const returnCount = computed(() => store.outcomes.filter(o => o.outcome === 'return').length)
const deceasedCount = computed(() => store.outcomes.filter(o => o.outcome === 'deceased').length)

const calculateLRR = () => {
  const allOutcomes = store.outcomes
  if (allOutcomes.length === 0) return 0
  const liveReleases = allOutcomes.filter(o => o.outcome !== 'deceased').length
  return Math.round((liveReleases / allOutcomes.length) * 1000) / 10
}

const calculateSpeciesLRR = (species) => {
  const speciesOutcomes = store.outcomes.filter(o => o.species?.toLowerCase() === species.toLowerCase() || o.type?.toLowerCase() === species.toLowerCase())
  if (speciesOutcomes.length === 0) return 0
  const liveReleases = speciesOutcomes.filter(o => o.outcome !== 'deceased').length
  return Math.round((liveReleases / speciesOutcomes.length) * 1000) / 10
}

const overallLRR = computed(() => calculateLRR())
const dogsLRR = computed(() => calculateSpeciesLRR('dog'))
const catsLRR = computed(() => calculateSpeciesLRR('cat'))

const outcomeBadgeType = (outcome) => {
  const map = {
    adoption: 'success',
    transfer: 'info',
    return: 'info',
    deceased: 'danger',
  }
  return map[outcome] || 'info'
}

onMounted(() => {
  store.fetchOutcomes()
})
</script>
