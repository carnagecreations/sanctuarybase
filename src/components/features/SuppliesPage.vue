<template>
  <PageContainer>
    <SectionLabel>Supplies & Equipment</SectionLabel>

    <!-- Search + category filter -->
    <AppCard v-if="!loading && supplies.length" class="filters-card">
      <input
        v-model="search"
        type="text"
        class="search-input"
        placeholder="Search supplies…"
        aria-label="Search supplies"
      />
      <div class="category-chips">
        <button
          class="chip"
          :class="{ active: category === '' }"
          @click="category = ''"
        >All</button>
        <button
          v-for="cat in presentCategories"
          :key="cat.value"
          class="chip"
          :class="{ active: category === cat.value }"
          @click="category = category === cat.value ? '' : cat.value"
        >{{ cat.label }}</button>
      </div>
    </AppCard>

    <!-- Loading -->
    <AppCard v-if="loading">
      <div class="loading-state">Loading inventory…</div>
    </AppCard>

    <!-- Empty -->
    <AppCard v-else-if="!supplies.length">
      <EmptyState
        icon="📦"
        title="No supplies yet"
        message="When the team adds inventory, you'll see it here."
      />
    </AppCard>

    <!-- No matches -->
    <AppCard v-else-if="!filtered.length">
      <EmptyState
        icon="🔍"
        title="No matching supplies"
        message="Try a different search or category."
      />
    </AppCard>

    <!-- Inventory list -->
    <AppCard v-else class="list-card">
      <div class="supply-row" v-for="supply in filtered" :key="supply.id">
        <div class="supply-main">
          <div class="supply-name">{{ supply.name }}</div>
          <div class="supply-meta">
            <span class="supply-category">{{ categoryLabel(supply.category) }}</span>
            <span v-if="supply.notes" class="supply-notes">· {{ supply.notes }}</span>
          </div>
        </div>
        <div class="supply-stock">
          <div class="supply-qty">{{ supply.quantity }} <span class="supply-unit">{{ supply.unit }}</span></div>
          <AppBadge :type="stockBadge(supply).type" size="sm">{{ stockBadge(supply).label }}</AppBadge>
          <button
            v-if="canRequestRestock(supply)"
            class="restock-btn"
            :disabled="requesting === supply.id"
            @click="requestRestock(supply)"
          >{{ requesting === supply.id ? 'Requesting…' : 'Request restock' }}</button>
          <span v-else-if="supply.restockRequested" class="restock-requested">✓ Restock requested</span>
        </div>
      </div>
    </AppCard>
  </PageContainer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { PageContainer, SectionLabel, AppCard, AppBadge, EmptyState } from '../ui'
import { useSupplyInventoryStore } from '../../stores/supplyInventory'
import { useAuthStore } from '../../stores/auth'
import { useUIStore } from '../../stores/ui'

const supplyStore = useSupplyInventoryStore()
const auth = useAuthStore()
const ui = useUIStore()
const search = ref('')
const category = ref('')
const requesting = ref(null)

const loading = computed(() => supplyStore.loading)
const supplies = computed(() => supplyStore.supplies)

// Same category set as the admin Supply Inventory page
const CATEGORIES = [
  { value: 'food', label: 'Food' },
  { value: 'medicine', label: 'Medicine' },
  { value: 'bedding', label: 'Bedding' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'cleaning', label: 'Cleaning Supplies' },
  { value: 'enrichment', label: 'Enrichment' },
  { value: 'first-aid', label: 'First Aid' },
  { value: 'other', label: 'Other' }
]

const presentCategories = computed(() =>
  CATEGORIES.filter(c => supplies.value.some(s => s.category === c.value))
)

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase()
  return supplies.value
    .filter(s => !category.value || s.category === category.value)
    .filter(s => !term ||
      (s.name || '').toLowerCase().includes(term) ||
      (s.notes || '').toLowerCase().includes(term))
    .slice()
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
})

const categoryLabel = (value) =>
  CATEGORIES.find(c => c.value === value)?.label || value || 'Other'

const stockBadge = (supply) => {
  if (!supply.quantity) return { type: 'high', label: 'Out of stock' }
  if (supply.quantity <= supply.reorderLevel) return { type: 'med', label: 'Low stock' }
  return { type: 'success', label: 'In stock' }
}

const canRequestRestock = (supply) =>
  (!supply.quantity || supply.quantity <= supply.reorderLevel) && !supply.restockRequested

const requestRestock = async (supply) => {
  requesting.value = supply.id
  try {
    await supplyStore.requestRestock(supply.id, auth.user?.name || 'Volunteer')
    ui.showToast(`Restock requested for ${supply.name}`)
  } catch (err) {
    ui.showToast('Could not request restock', 'error')
  } finally {
    requesting.value = null
  }
}

onMounted(() => {
  supplyStore.fetchAll()
})
</script>

<style scoped>
.filters-card {
  margin-bottom: 16px;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid var(--line, rgba(255, 255, 255, 0.1));
  background: var(--surface-2, rgba(255, 255, 255, 0.04));
  color: var(--ink-1, #fff);
  font-family: inherit;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: var(--mint, #4effc5);
}

.category-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.chip {
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid var(--line, rgba(255, 255, 255, 0.12));
  background: transparent;
  color: var(--ink-2, rgba(255, 255, 255, 0.7));
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.chip.active {
  background: rgba(78, 255, 197, 0.15);
  border-color: var(--mint, #4effc5);
  color: var(--mint, #4effc5);
}

.loading-state {
  padding: 40px 20px;
  text-align: center;
  color: var(--ink-3, rgba(255, 255, 255, 0.5));
  font-size: 14px;
}

.list-card {
  padding: 0;
  overflow: hidden;
}

.supply-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--line, rgba(255, 255, 255, 0.06));
}

.supply-row:last-child {
  border-bottom: none;
}

.supply-main {
  min-width: 0;
}

.supply-name {
  font-weight: 700;
  font-size: 15px;
  color: var(--ink-1, #fff);
}

.supply-meta {
  font-size: 12px;
  color: var(--ink-3, rgba(255, 255, 255, 0.5));
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.supply-stock {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex: none;
}

.supply-qty {
  font-weight: 800;
  font-size: 16px;
  color: var(--ink-1, #fff);
  font-variant-numeric: tabular-nums;
}

.supply-unit {
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-3, rgba(255, 255, 255, 0.5));
}

.restock-btn {
  padding: 4px 12px;
  border-radius: 20px;
  border: 1px solid var(--mint, #4effc5);
  background: rgba(78, 255, 197, 0.12);
  color: var(--mint, #4effc5);
  font-family: inherit;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.restock-btn:hover:not(:disabled) {
  background: rgba(78, 255, 197, 0.22);
}

.restock-btn:disabled {
  opacity: 0.6;
  cursor: default;
}

.restock-requested {
  font-size: 11px;
  font-weight: 700;
  color: var(--mint, #4effc5);
  white-space: nowrap;
}
</style>
