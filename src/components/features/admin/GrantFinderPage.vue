<template>
  <PageContainer>
    <div class="space-y-4">
      <!-- Header -->
      <div class="header-section">
        <div>
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
            <button class="back-btn" @click="goBack" title="Back to Admin Hub">←</button>
            <h1 class="page-title">Grant Finder</h1>
          </div>
          <p class="page-subtitle">Discover funding opportunities for wildlife sanctuaries, conservation, and animal care</p>
        </div>
      </div>

      <!-- Summary Stats -->
      <div class="stats-grid">
        <StatCard number="47" label="Available Grants" />
        <StatCard number="$12.5M" label="Total Funding" />
        <StatCard number="203" label="Conservation-Focused" />
        <StatCard number="18" label="Domestic Animal Care" />
      </div>

      <!-- Filters Panel -->
      <GrantFiltersPanel v-model="filters" @search="onSearch" @clear="onClear">
        <template #sort>
          <GrantSortMenu v-model="sortBy" />
        </template>
      </GrantFiltersPanel>

      <!-- Results Section -->
      <div class="results-header">
        <h2>{{ filteredGrants.length }} Grants Found</h2>
        <span class="result-meta">Sorted by {{ getSortLabel() }}</span>
      </div>

      <!-- Grant Cards Grid -->
      <div v-if="filteredGrants.length > 0" class="grants-grid">
        <GrantCard
          v-for="grant in filteredGrants"
          :key="grant.id"
          :grant="grant"
          @select="selectGrant"
        />
      </div>
      <EmptyState v-else icon="🔍" title="No grants found" message="Try adjusting your filters" />

      <!-- Grant Detail Modal -->
      <GrantDetailModal
        :grant="selectedGrant"
        @close="closeModal"
        @apply="onApplyGrant"
        @website="onViewWebsite"
        @letter="onGenerateLetter"
      />
    </div>
  </PageContainer>
</template>

<script setup>
import { ref, shallowRef, computed, onMounted } from 'vue'
import { PageContainer, StatCard, EmptyState } from '../../ui'
import { useUIStore } from '../../../stores/ui'
import GrantFiltersPanel from './GrantFiltersPanel.vue'
import GrantSortMenu from './GrantSortMenu.vue'
import GrantCard from './GrantCard.vue'
import GrantDetailModal from './GrantDetailModal.vue'

const ui = useUIStore()

// Grant database (~52 KB) is loaded lazily via dynamic import so it lands in
// its own chunk instead of the main bundle. The data file itself is unchanged.
const grantsModule = shallowRef(null)
onMounted(async () => {
  grantsModule.value = await import('./grantData.js')
})

const filters = ref({
  animalType: '',
  minAmount: null,
  maxAmount: null,
  deadline: '',
  orgType: '',
})

const sortBy = ref('deadline')
const selectedGrant = ref(null)

const filteredGrants = computed(() => {
  if (!grantsModule.value) return []
  const { allGrants, daysUntilDeadline } = grantsModule.value
  let results = allGrants

  if (filters.value.animalType) {
    results = results.filter(g =>
      g.animalTypes.some(type => type.toLowerCase().includes(filters.value.animalType.toLowerCase()))
    )
  }

  if (filters.value.minAmount) {
    results = results.filter(g => g.amount >= filters.value.minAmount)
  }

  if (filters.value.maxAmount) {
    results = results.filter(g => g.amount <= filters.value.maxAmount)
  }

  if (filters.value.deadline) {
    results = results.filter(g => {
      const daysLeft = daysUntilDeadline(g.deadline)
      switch (filters.value.deadline) {
        case 'this-month': return daysLeft <= 30
        case '3-months': return daysLeft <= 90
        case '6-months': return daysLeft <= 180
        case 'year': return daysLeft <= 365
        case 'ongoing': return g.deadline === 'Ongoing'
        default: return true
      }
    })
  }

  if (filters.value.orgType) {
    const typeMap = {
      government: ['National', 'NSF', 'UK', 'NEH'],
      foundation: ['Foundation', 'Fund'],
      corporate: ['Company', 'Bank', 'Google', 'Johnson'],
      nonprofit: ['Society', 'Alliance', 'Conservancy'],
    }
    const keywords = typeMap[filters.value.orgType] || []
    results = results.filter(g =>
      keywords.some(keyword => g.organization.includes(keyword))
    )
  }

  results.sort((a, b) => {
    switch (sortBy.value) {
      case 'amount':
        return b.amount - a.amount
      case 'priority':
        const priorityMap = { high: 3, medium: 2, low: 1 }
        return (priorityMap[b.priority] || 0) - (priorityMap[a.priority] || 0)
      case 'recent':
        return b.id - a.id
      case 'deadline':
      default:
        return daysUntilDeadline(a.deadline) - daysUntilDeadline(b.deadline)
    }
  })

  return results
})

const getSortLabel = () => {
  const sortOptions = [
    { label: '📅 Deadline (Soonest)', value: 'deadline' },
    { label: '💰 Amount (Highest)', value: 'amount' },
    { label: '⭐ Best Match', value: 'priority' },
    { label: '📝 Recently Added', value: 'recent' },
  ]
  const option = sortOptions.find(o => o.value === sortBy.value)
  return option ? option.label.substring(2) : 'Deadline'
}

const selectGrant = (grant) => {
  selectedGrant.value = grant
}

const closeModal = () => {
  selectedGrant.value = null
}

const onApplyGrant = (grant) => {
  ui.showToast(`Saved ${grant.name} to your applications!`)
  closeModal()
}

const onViewWebsite = (grant) => {
  ui.showToast(`Opening ${grant.organization} website...`)
}

const onGenerateLetter = (grant) => {
  localStorage.setItem('selectedGrantForLetter', JSON.stringify(grant))
  ui.setCurrentTab('admin-grant-letter')
  closeModal()
}

const onSearch = () => {
  ui.showToast(`Found ${filteredGrants.length} grants`)
}

const onClear = () => {
  ui.showToast('Filters cleared')
}

const goBack = () => {
  ui.setCurrentTab('admin-hub')
}
</script>

<style scoped>
.space-y-4 > * + * { margin-top: 16px; }

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.back-btn {
  width: 32px;
  height: 32px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  border-radius: 6px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ink);
}

.back-btn:hover {
  background: var(--mint);
  border-color: var(--mint);
  color: white;
  transform: translateX(-2px);
}

.page-title {
  font-size: 28px;
  font-weight: 900;
  color: var(--ink);
  margin: 0;
  font-family: 'Fredoka One', sans-serif;
}

.page-subtitle {
  font-size: 13px;
  color: var(--ink-3);
  margin: 6px 0 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.results-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--ink);
}

.result-meta {
  font-size: 12px;
  color: var(--ink-3);
  font-style: italic;
}

.grants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 12px;
}
</style>
