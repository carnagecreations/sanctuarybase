<template>
  <PageContainer>
    <button class="back-btn" @click="ui.setCurrentTab('admin-hub')">← Admin Hub</button>

    <div class="page-header">
      <h1>💰 Ledger</h1>
      <AppButton variant="primary" @click="openAddEntry">+ New entry</AppButton>
    </div>

    <!-- Add/Edit Entry Modal -->
    <AppModal v-if="showAddModal" :open="true" :title="editingId ? 'Edit Entry' : 'New Ledger Entry'" size="sm" @close="closeModal">
      <div class="form-group">
        <label class="form-label">Description *</label>
        <input v-model="formData.description" type="text" class="form-input" placeholder="e.g., Medical supplies, Donation from John Smith" />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Type *</label>
          <select v-model="formData.type" class="form-input">
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Category *</label>
          <select v-model="formData.category" class="form-input">
            <option value="" disabled>Select a category</option>
            <option v-for="cat in categoryOptions" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Amount *</label>
          <input v-model="formData.amount" type="number" class="form-input" placeholder="0.00" step="0.01" min="0" />
        </div>
        <div class="form-group">
          <label class="form-label">Date *</label>
          <input v-model="formData.date" type="date" class="form-input" />
        </div>
      </div>

      <template #actions>
        <AppButton variant="secondary" @click="closeModal">Cancel</AppButton>
        <AppButton variant="primary" @click="saveEntry" :disabled="saving">
          {{ saving ? 'Saving...' : editingId ? 'Update' : 'Add Entry' }}
        </AppButton>
      </template>
    </AppModal>

    <SectionLabel>Balance</SectionLabel>
    <AppCard title="Account summary">
      <div class="balance-display">
        <div class="balance-row">
          <span class="balance-label">Current balance</span>
          <span class="balance-amount">${{ currentBalance }}</span>
        </div>
        <div class="balance-row">
          <span class="balance-label">This month income</span>
          <span class="balance-amount income">+${{ thisMonthIncome }}</span>
        </div>
        <div class="balance-row">
          <span class="balance-label">This month expenses</span>
          <span class="balance-amount expense">-${{ thisMonthExpenses }}</span>
        </div>
      </div>
    </AppCard>

    <SectionLabel>Recent transactions</SectionLabel>
    <AppCard :flat="true">
      <div v-if="transactions.length" class="divide-list">
        <div v-for="t in transactions" :key="t.id" class="transaction transaction-row" @click="openEditEntry(t.id)">
          <div class="transaction-info">
            <span class="transaction-desc">{{ t.description }}</span>
            <span class="transaction-cat">{{ t.category }}</span>
          </div>
          <div class="transaction-right">
            <span class="transaction-amount" :class="t.type">{{ t.type === 'income' ? '+' : '-' }}${{ t.amount }}</span>
            <span class="transaction-date">{{ t.date }}</span>
            <button class="transaction-delete" @click.stop="deleteEntry(t.id)" title="Delete">🗑</button>
          </div>
        </div>
      </div>
      <EmptyState v-else icon="💰" title="No entries" message="Add your first ledger entry." />
    </AppCard>

    <SectionLabel>Category summary</SectionLabel>
    <AppCard :flat="true">
      <div class="category-list">
        <div v-for="c in categories" :key="c.id" class="category-row">
          <span class="category-name">{{ c.name }}</span>
          <span class="category-amount">{{ c.type === 'income' ? '+' : '-' }}${{ c.amount }}</span>
        </div>
      </div>
    </AppCard>
  </PageContainer>
</template>

<script setup>
import { PageContainer, AppCard, SectionLabel, AppButton, EmptyState, AppModal } from '../../ui'
import { useUIStore } from '../../../stores/ui'
import { useLedgerStore } from '../../../stores/ledger'
import { computed, onMounted, ref } from 'vue'

const ui = useUIStore()
const ledger = useLedgerStore()

// Firestore returns `createdAt` as a Timestamp object (with .toDate()) once
// an entry has round-tripped through a real fetch — only the brief in-memory
// state right after addLedgerEntry() still has the plain JS Date that was
// written. `new Date(timestamp)` on the former silently produces "Invalid
// Date", so every read of entry.createdAt needs to go through this first.
const toDate = (v) => (v?.toDate ? v.toDate() : new Date(v))

// Matches stores/ledger.schema.json's category enum exactly — a free-text
// field here would fragment the category totals on the Finance Stats page
// (e.g. "Supplies" vs "supplies" vs "Supplies & Equipment" all counted
// separately) since that page groups transactions by this exact string.
const categoryOptions = [
  'Supplies & Equipment', 'Donations', 'Medical & Veterinary', 'Grants & Funding',
  'Facility Maintenance', 'Food & Nutrition', 'Utilities', 'Salaries & Wages',
  'Transportation', 'Insurance', 'Other',
]

// Modal state
const showAddModal = ref(false)
const editingId = ref(null)
const saving = ref(false)

// Form state
const formData = ref({
  description: '',
  category: '',
  type: 'expense',
  amount: '',
  date: new Date().toISOString().split('T')[0]
})

const defaultForm = () => ({
  description: '',
  category: '',
  type: 'expense',
  amount: '',
  date: new Date().toISOString().split('T')[0]
})

const openAddEntry = () => {
  editingId.value = null
  formData.value = defaultForm()
  showAddModal.value = true
}

const openEditEntry = (id) => {
  const entry = ledger.ledgers.find(e => e.id === id)
  if (entry) {
    editingId.value = id
    formData.value = {
      description: entry.description || '',
      category: entry.category || '',
      type: entry.type || 'expense',
      amount: entry.amount || '',
      date: entry.createdAt ? toDate(entry.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    }
    showAddModal.value = true
  }
}

const closeModal = () => {
  showAddModal.value = false
  editingId.value = null
  formData.value = defaultForm()
}

const saveEntry = async () => {
  if (!formData.value.description.trim() || !formData.value.category.trim() || !formData.value.amount) {
    ui.showToast('Please fill in all fields', 'error')
    return
  }

  saving.value = true
  try {
    if (editingId.value) {
      await ledger.updateLedgerEntry(editingId.value, {
        description: formData.value.description,
        category: formData.value.category,
        type: formData.value.type,
        amount: parseFloat(formData.value.amount),
        createdAt: new Date(formData.value.date)
      })
      ui.showToast('Entry updated')
    } else {
      await ledger.addLedgerEntry({
        description: formData.value.description,
        category: formData.value.category,
        type: formData.value.type,
        amount: parseFloat(formData.value.amount),
        createdAt: new Date(formData.value.date)
      })
      ui.showToast('Entry added')
    }
    closeModal()
  } catch (error) {
    ui.showToast('Error saving entry', 'error')
    console.error(error)
  } finally {
    saving.value = false
  }
}

const deleteEntry = async (id) => {
  if (confirm('Are you sure you want to delete this entry?')) {
    try {
      await ledger.deleteLedgerEntry(id)
      ui.showToast('Entry deleted')
    } catch (error) {
      ui.showToast('Error deleting entry', 'error')
      console.error(error)
    }
  }
}

onMounted(() => {
  ledger.fetchLedgers()
})

const transactions = computed(() => {
  return ledger.ledgers.slice(0, 5).map(entry => ({
    id: entry.id,
    description: entry.description || '',
    category: entry.category || '',
    type: entry.type || 'expense',
    amount: entry.amount || '0',
    date: entry.createdAt ? toDate(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
  }))
})

const categories = computed(() => {
  const categoryMap = {}

  ledger.ledgers.forEach(entry => {
    const cat = entry.category || 'Other'
    if (!categoryMap[cat]) {
      categoryMap[cat] = {
        id: cat,
        name: cat,
        amount: 0,
        type: entry.type || 'expense',
      }
    }
    categoryMap[cat].amount += parseFloat(entry.amount) || 0
  })

  return Object.values(categoryMap)
})

const currentBalance = computed(() => {
  let balance = 0
  ledger.ledgers.forEach(entry => {
    if (entry.type === 'income') {
      balance += parseFloat(entry.amount) || 0
    } else {
      balance -= parseFloat(entry.amount) || 0
    }
  })
  return balance.toFixed(2)
})

const thisMonthIncome = computed(() => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  let income = 0
  ledger.ledgers.forEach(entry => {
    if (entry.type === 'income') {
      const entryDate = toDate(entry.createdAt)
      if (entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear) {
        income += parseFloat(entry.amount) || 0
      }
    }
  })
  return income.toFixed(2)
})

const thisMonthExpenses = computed(() => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  let expenses = 0
  ledger.ledgers.forEach(entry => {
    if (entry.type === 'expense') {
      const entryDate = toDate(entry.createdAt)
      if (entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear) {
        expenses += parseFloat(entry.amount) || 0
      }
    }
  })
  return expenses.toFixed(2)
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

.balance-display {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.balance-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: var(--surface-2);
  border-radius: var(--r);
}

.balance-label {
  font-size: 12px;
  color: var(--ink-3);
  font-weight: 600;
}

.balance-amount {
  font-size: 14px;
  font-weight: 900;
  color: var(--ink);
  font-family: 'Fredoka One', sans-serif;
}

.balance-amount.income { color: var(--mint); }
.balance-amount.expense { color: var(--coral); }

.divide-list > * + * { border-top: 1px solid var(--border); }

.transaction {
  padding: 10px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: space-between;
}
.transaction:first-child { padding-top: 0; }
.transaction:last-child { padding-bottom: 0; }

.transaction-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.transaction-desc {
  font-size: 12px;
  font-weight: 700;
  color: var(--ink);
}

.transaction-cat {
  font-size: 10px;
  color: var(--ink-3);
}

.transaction-amount {
  font-size: 12px;
  font-weight: 800;
  flex-shrink: 0;
}

.transaction-amount.income { color: var(--mint); }
.transaction-amount.expense { color: var(--coral); }

.transaction-date {
  font-size: 10px;
  color: var(--ink-3);
  flex-shrink: 0;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.category-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid var(--border);
  font-size: 12px;
}
.category-row:last-child { border-bottom: none; }

.category-name {
  font-weight: 600;
  color: var(--ink);
}

.category-amount {
  font-weight: 800;
  color: var(--mint);
}

.form-label {
  display: block;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--ink-3);
  margin-bottom: 4px;
  letter-spacing: 0.04em;
}

.form-input {
  width: 100%;
  padding: 9px 12px;
  background: var(--surface-2);
  border: 1.5px solid var(--border);
  border-radius: var(--r);
  color: var(--ink);
  font-family: 'Nunito', sans-serif;
  font-size: 13px;
  transition: border 0.15s;
}

.form-input:focus {
  outline: none;
  border-color: var(--mint);
}

.form-group {
  margin-bottom: 12px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

/* Transaction Row Interactive */
.transaction-row {
  cursor: pointer;
  transition: background 0.15s;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.transaction-row:hover {
  background: var(--surface-2);
  border-radius: var(--r);
}

.transaction-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.transaction-delete {
  background: none;
  border: none;
  color: var(--ink-3);
  cursor: pointer;
  font-size: 14px;
  opacity: 0;
  transition: opacity 0.15s, color 0.15s;
  padding: 4px 8px;
}

.transaction-row:hover .transaction-delete {
  opacity: 1;
}

.transaction-row:hover .transaction-delete:hover {
  color: var(--coral);
}
</style>
