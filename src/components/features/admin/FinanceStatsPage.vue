<template>
  <PageContainer>
    <button class="back-btn" @click="ui.setCurrentTab('admin-hub')">← Admin Hub</button>

    <div class="page-header">
      <h1>📈 Finance Stats</h1>
    </div>

    <div class="space-y-4">
      <!-- Key Metrics -->
      <div class="metrics-grid">
        <StatCard :number="formatCurrency(totalRevenue)" label="Total Revenue" />
        <StatCard :number="formatCurrency(totalExpenses)" label="Total Expenses" />
        <StatCard :number="formatCurrency(netBalance)" label="Net Balance" />
        <StatCard :number="String(totalDonors)" label="Total Donors" />
      </div>

      <!-- Revenue by Category -->
      <div>
        <SectionLabel>Revenue by Category</SectionLabel>
        <div v-if="revenueCategories.length" class="space-y-2 mt-3">
          <div v-for="cat in revenueCategories" :key="cat.id" class="bg-gray-800 rounded p-3">
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm font-bold">{{ cat.name }}</span>
              <span class="text-sm">{{ cat.amount }}</span>
            </div>
            <div class="w-full bg-gray-700 rounded h-2">
              <div class="bg-teal-400 h-2 rounded" :style="{ width: cat.percent + '%' }" />
            </div>
          </div>
        </div>
        <EmptyState v-else icon="📊" title="No revenue data" message="Add income transactions to see revenue breakdown." />
      </div>

      <!-- Expenses by Category -->
      <div>
        <SectionLabel>Expenses by Category</SectionLabel>
        <div v-if="expenseCategories.length" class="space-y-2 mt-3">
          <div v-for="cat in expenseCategories" :key="cat.id" class="bg-gray-800 rounded p-3">
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm font-bold">{{ cat.name }}</span>
              <span class="text-sm">{{ cat.amount }}</span>
            </div>
            <div class="w-full bg-gray-700 rounded h-2">
              <div class="bg-coral-500 h-2 rounded" :style="{ width: cat.percent + '%' }" />
            </div>
          </div>
        </div>
        <EmptyState v-else icon="💸" title="No expense data" message="Add expense transactions to see expense breakdown." />
      </div>

      <!-- Recent Transactions -->
      <div>
        <SectionLabel>Recent Transactions</SectionLabel>
        <div v-if="transactions.length" class="space-y-2 mt-3">
          <AppCard v-for="txn in transactions" :key="txn.id" flat noPad>
            <div class="p-3 flex justify-between items-center">
              <div class="text-sm">
                <div class="font-bold">{{ txn.description }}</div>
                <div class="text-xs text-gray-400">{{ txn.date }}</div>
              </div>
              <div class="text-right">
                <div class="font-bold" :class="txn.type === 'income' ? 'text-green-400' : 'text-coral-500'">
                  {{ txn.type === 'income' ? '+' : '' }}{{ txn.amount }}
                </div>
              </div>
            </div>
          </AppCard>
        </div>
        <EmptyState v-else icon="📋" title="No transactions" message="Start adding finance records to see transaction history." />
      </div>
    </div>
  </PageContainer>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { PageContainer, AppCard, SectionLabel, StatCard, EmptyState } from '../../ui'
import { useUIStore } from '../../../stores/ui'
import { useLedgerStore } from '../../../stores/ledger'
import { useDonorsStore } from '../../../stores/donors'

const ui = useUIStore()
const ledger = useLedgerStore()
const donorsStore = useDonorsStore()

// See the identical helper + comment in LedgerPage.vue — Firestore returns
// createdAt as a Timestamp object on a real fetch, not a plain Date.
const toDate = (v) => (v?.toDate ? v.toDate() : new Date(v))

// This page used to read a separate `financeStats` collection whose own
// computed logic never matched its own seed data shape (flat {type,
// category, amount} expected, but seeded docs were nested monthly
// aggregates) — it was silently broken. `ledgers` is the real, working
// transaction log (see LedgerPage.vue), so this dashboard is now computed
// directly from it instead of a second, disconnected source of truth.
const groupByCategory = (type) => {
  const grouped = {}
  ledger.ledgers.forEach((entry) => {
    if (entry.type !== type) return
    const category = entry.category || 'Other'
    grouped[category] = (grouped[category] || 0) + (parseFloat(entry.amount) || 0)
  })
  const total = Object.values(grouped).reduce((sum, v) => sum + v, 0)
  return Object.entries(grouped).map(([name, amount], idx) => ({
    id: idx,
    name,
    amount: `$${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
    percent: total ? Math.round((amount / total) * 100) : 0,
  }))
}

const revenueCategories = computed(() => groupByCategory('income'))
const expenseCategories = computed(() => groupByCategory('expense'))

const transactions = computed(() => {
  return [...ledger.ledgers]
    .sort((a, b) => toDate(b.createdAt) - toDate(a.createdAt))
    .slice(0, 10)
    .map((entry) => ({
      id: entry.id,
      description: entry.description || 'Transaction',
      type: entry.type || 'expense',
      amount: `$${Math.abs(parseFloat(entry.amount) || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}`,
      date: entry.createdAt ? toDate(entry.createdAt).toLocaleDateString() : '',
    }))
})

const totalRevenue = computed(() =>
  ledger.ledgers.filter((e) => e.type === 'income').reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)
)

const totalExpenses = computed(() =>
  ledger.ledgers.filter((e) => e.type === 'expense').reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)
)

const netBalance = computed(() => totalRevenue.value - totalExpenses.value)

// Total donor records on file — the old "Active Donors" figure was computed
// by counting unique description strings across the last 10 transactions,
// which isn't a real donor count. This is a real one, just not
// activity-windowed; relabeled to "Total Donors" so it doesn't overclaim.
const totalDonors = computed(() => donorsStore.donors.length)

const formatCurrency = (num) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  }).format(num)
}

onMounted(() => {
  ledger.fetchLedgers()
  donorsStore.fetchDonors()
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
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 900;
  color: var(--ink);
  margin: 0;
  letter-spacing: -.01em;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.space-y-4 > * + * {
  margin-top: 24px;
}
</style>
