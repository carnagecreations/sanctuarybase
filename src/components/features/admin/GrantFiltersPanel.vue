<template>
  <div>
    <!-- Search & Filter Bar -->
    <AppCard title="Search & Filter" noPad>
      <div class="filter-section">
        <div class="filter-row">
          <div class="filter-group">
            <label>Animal Type</label>
            <AppSelect
              v-model="filters.animalType"
              :options="animalTypeOptions"
              placeholder="All types"
            />
          </div>
          <div class="filter-group">
            <label>Funding Range ($)</label>
            <div class="range-inputs">
              <AppInput
                v-model.number="filters.minAmount"
                type="number"
                placeholder="Min"
              />
              <span class="range-dash">-</span>
              <AppInput
                v-model.number="filters.maxAmount"
                type="number"
                placeholder="Max"
              />
            </div>
          </div>
          <div class="filter-group">
            <label>Deadline Range</label>
            <AppSelect
              v-model="filters.deadline"
              :options="deadlineOptions"
              placeholder="Any time"
            />
          </div>
          <div class="filter-group">
            <label>Organization Type</label>
            <AppSelect
              v-model="filters.orgType"
              :options="orgTypeOptions"
              placeholder="All organizations"
            />
          </div>
        </div>
        <div class="filter-actions">
          <AppButton variant="primary" size="sm" @click="emitFilters">🔍 Search</AppButton>
          <AppButton variant="secondary" size="sm" @click="emitClear">⟲ Reset</AppButton>
          <slot name="sort" />
        </div>
      </div>
    </AppCard>

    <!-- Active Filters Display -->
    <div v-if="activeFiltersCount > 0" class="active-filters">
      <div class="filters-label">
        Active Filters: <span class="filter-count">{{ activeFiltersCount }}</span>
      </div>
      <div class="filter-tags">
        <span v-if="filters.animalType" class="tag">
          {{ filters.animalType }} <button @click="filters.animalType = ''">✕</button>
        </span>
        <span v-if="filters.minAmount || filters.maxAmount" class="tag">
          ${{ filters.minAmount || '0' }}-${{ filters.maxAmount || 'Unlimited' }}
          <button @click="filters.minAmount = filters.maxAmount = null">✕</button>
        </span>
        <span v-if="filters.deadline" class="tag">
          {{ filters.deadline }} <button @click="filters.deadline = ''">✕</button>
        </span>
        <span v-if="filters.orgType" class="tag">
          {{ filters.orgType }} <button @click="filters.orgType = ''">✕</button>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { AppCard, AppButton, AppInput, AppSelect } from '../../ui'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue', 'search', 'clear'])

const filters = ref(props.modelValue)

const animalTypeOptions = [
  { label: 'Reptiles', value: 'reptiles' },
  { label: 'Exotic Birds', value: 'birds' },
  { label: 'Primates', value: 'primates' },
  { label: 'Large Mammals', value: 'large-mammals' },
  { label: 'Small Mammals', value: 'small-mammals' },
  { label: 'Amphibians', value: 'amphibians' },
  { label: 'Mixed Species', value: 'mixed' },
]

const deadlineOptions = [
  { label: 'This Month', value: 'this-month' },
  { label: 'Next 3 Months', value: '3-months' },
  { label: 'Next 6 Months', value: '6-months' },
  { label: 'This Year', value: 'year' },
  { label: 'Ongoing', value: 'ongoing' },
]

const orgTypeOptions = [
  { label: 'Government', value: 'government' },
  { label: 'Foundation', value: 'foundation' },
  { label: 'Private Donor', value: 'private' },
  { label: 'Corporate', value: 'corporate' },
  { label: 'Non-profit', value: 'nonprofit' },
]

const activeFiltersCount = computed(() => {
  let count = 0
  if (filters.value.animalType) count++
  if (filters.value.minAmount || filters.value.maxAmount) count++
  if (filters.value.deadline) count++
  if (filters.value.orgType) count++
  return count
})

const emitFilters = () => {
  emit('update:modelValue', filters.value)
  emit('search')
}

const emitClear = () => {
  filters.value = {
    animalType: '',
    minAmount: null,
    maxAmount: null,
    deadline: '',
    orgType: '',
  }
  emit('update:modelValue', filters.value)
  emit('clear')
}
</script>

<style scoped>
.filter-section {
  padding: 16px;
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 12px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group label {
  font-size: 12px;
  font-weight: 700;
  color: var(--ink-2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.range-inputs {
  display: grid;
  grid-template-columns: 1fr 24px 1fr;
  gap: 8px;
  align-items: center;
}

.range-dash {
  text-align: center;
  color: var(--ink-3);
}

.filter-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-start;
}

.active-filters {
  margin-top: 12px;
  padding: 12px 16px;
  background: rgba(78, 255, 197, 0.08);
  border: 1px solid rgba(78, 255, 197, 0.3);
  border-radius: var(--r);
}

.filters-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--ink-2);
  text-transform: uppercase;
  margin-bottom: 8px;
}

.filter-count {
  background: var(--mint);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 800;
  font-size: 11px;
}

.filter-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: var(--mint);
  color: white;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.tag button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
  display: flex;
  align-items: center;
  transition: opacity 0.15s;
}

.tag button:hover {
  opacity: 0.7;
}
</style>
