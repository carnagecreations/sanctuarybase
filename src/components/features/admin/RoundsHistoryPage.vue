<template>
  <PageContainer>
    <div class="space-y-4">
      <SectionLabel>Morning Rounds History</SectionLabel>

      <!-- Date Filter -->
      <AppInput v-model="selectedDate" type="date" label="Select Date" />

      <!-- History for Selected Date -->
      <div v-if="historyForDate.length === 0" class="mt-4">
        <EmptyState icon="📋" title="No History" message="No rounds completed on this date." />
      </div>

      <div v-else class="space-y-4">
        <div v-for="round in historyForDate" :key="round.id" class="space-y-2">
          <SectionLabel>{{ round.volunteer }} - {{ round.startTime }}</SectionLabel>

          <!-- Sections Completed -->
          <div class="space-y-2">
            <AppCard v-for="section in round.sections" :key="section.id" flat noPad>
              <div class="p-3">
                <div class="flex items-center justify-between mb-2">
                  <div class="font-bold text-sm">{{ section.name }}</div>
                  <AppBadge type="success">✓ Complete</AppBadge>
                </div>
                <div class="text-xs space-y-1 text-gray-400">
                  <div><span>Time:</span> {{ section.completedAt }}</div>
                  <div v-if="section.notes"><span>Notes:</span> {{ section.notes }}</div>
                  <div><span>Animals Checked:</span> {{ section.animalsChecked }}</div>
                </div>
              </div>
            </AppCard>
          </div>

          <!-- Summary -->
          <AppCard flat noPad>
            <div class="p-3 bg-gray-800 space-y-1">
              <div class="text-sm"><span class="text-gray-400">Duration:</span> {{ round.duration }}</div>
              <div class="text-sm"><span class="text-gray-400">Issues Reported:</span> {{ round.issuesCount }}</div>
              <div v-if="round.notes" class="text-sm pt-2 border-t border-gray-700">{{ round.notes }}</div>
            </div>
          </AppCard>
        </div>
      </div>

      <!-- Past Rounds (Quick View) -->
      <div>
        <SectionLabel>Recent Rounds</SectionLabel>
        <div class="space-y-2 mt-3">
          <AppCard v-for="past in pastRounds" :key="past.id" flat noPad>
            <div class="p-3 flex justify-between items-center cursor-pointer hover:bg-gray-800 transition" @click="selectedDate = past.date">
              <div class="text-sm">
                <div class="font-bold">{{ past.volunteer }}</div>
                <div class="text-xs text-gray-400">{{ past.date }}</div>
              </div>
              <div class="text-xs">{{ past.duration }}</div>
            </div>
          </AppCard>
        </div>
      </div>
    </div>
  </PageContainer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoundsHistoryStore } from '../../../stores/roundsHistory'
import PageContainer from '../../ui/PageContainer.vue'
import SectionLabel from '../../ui/SectionLabel.vue'
import AppCard from '../../ui/AppCard.vue'
import AppInput from '../../ui/AppInput.vue'
import AppBadge from '../../ui/AppBadge.vue'
import EmptyState from '../../ui/EmptyState.vue'

const store = useRoundsHistoryStore()
const selectedDate = ref(new Date().toISOString().split('T')[0])

const history = computed(() => {
  return store.rounds
})

const pastRounds = computed(() => {
  return store.rounds.slice(0, 4)
})

const historyForDate = computed(() => {
  return history.value.filter(h => {
    const roundDate = h.createdAt ? h.createdAt.split('T')[0] : null
    return roundDate === selectedDate.value
  })
})

onMounted(() => {
  store.fetchRounds()
})
</script>
