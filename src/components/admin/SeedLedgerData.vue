<template>
  <div class="seed-ledger-container">
    <h2>Seed Ledger Data</h2>
    <p>This component will add 5 sample ledger entries to the database.</p>

    <AppButton
      variant="primary"
      @click="seedLedgerData"
      :disabled="loading"
    >
      {{ loading ? 'Seeding...' : 'Seed Ledger Data' }}
    </AppButton>

    <div v-if="message" :class="['message', messageType]">
      {{ message }}
    </div>

    <div v-if="results.length > 0" class="results">
      <h3>Added Entries:</h3>
      <ul>
        <li v-for="result in results" :key="result.id">
          <strong>{{ result.description }}</strong> - ${{ result.amount }} ({{ result.type }})
          <br>
          <small>ID: {{ result.id }}</small>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useLedgerStore } from '../../stores/ledger'
import { AppButton } from '../ui'

const ledgerStore = useLedgerStore()
const loading = ref(false)
const message = ref('')
const messageType = ref('') // 'success' or 'error'
const results = ref([])

// Sample ledger data for a reptile sanctuary
const sampleLedgerData = [
  {
    description: 'Heating lamp supplies and equipment',
    category: 'Supplies & Equipment',
    type: 'expense',
    amount: 245.50,
    notes: 'UVB bulbs, heat tape, thermostats for enclosures'
  },
  {
    description: 'Monthly food donation from community',
    category: 'Donations',
    type: 'income',
    amount: 500.00,
    notes: 'Insects, frozen prey, fresh vegetables'
  },
  {
    description: 'Veterinary care - health checkups',
    category: 'Medical & Veterinary',
    type: 'expense',
    amount: 1200.00,
    notes: 'Annual checkups for 8 animals, vaccination records updated'
  },
  {
    description: 'Grant received - Wildlife Conservation Fund',
    category: 'Grants & Funding',
    type: 'income',
    amount: 2500.00,
    notes: 'Q2 wildlife rehabilitation grant'
  },
  {
    description: 'Enclosure renovation and maintenance',
    category: 'Facility Maintenance',
    type: 'expense',
    amount: 875.25,
    notes: 'Glass cleaning, substrate replacement, structural repairs'
  }
]

const seedLedgerData = async () => {
  loading.value = true
  message.value = ''
  results.value = []
  messageType.value = ''

  try {
    for (const entry of sampleLedgerData) {
      const newEntry = await ledgerStore.addLedgerEntry(entry)
      results.value.push(newEntry)
    }

    message.value = `Successfully added ${results.value.length} ledger entries!`
    messageType.value = 'success'
  } catch (error) {
    message.value = `Error seeding ledger data: ${error.message}`
    messageType.value = 'error'
    console.error('Error:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.seed-ledger-container {
  padding: 20px;
  background: var(--surface);
  border-radius: var(--r);
  max-width: 600px;
  margin: 20px auto;
}

h2 {
  font-size: 18px;
  font-weight: 700;
  color: var(--ink);
  margin: 0 0 8px 0;
}

p {
  font-size: 14px;
  color: var(--ink-3);
  margin: 0 0 16px 0;
}

.message {
  padding: 12px;
  border-radius: var(--r);
  margin-top: 16px;
  font-size: 14px;
  font-weight: 600;
}

.message.success {
  background: rgba(76, 175, 80, 0.1);
  color: var(--mint);
  border: 1px solid var(--mint);
}

.message.error {
  background: rgba(244, 67, 54, 0.1);
  color: var(--coral);
  border: 1px solid var(--coral);
}

.results {
  margin-top: 16px;
  padding: 12px;
  background: var(--surface-2);
  border-radius: var(--r);
}

.results h3 {
  font-size: 14px;
  font-weight: 700;
  color: var(--ink);
  margin: 0 0 8px 0;
}

.results ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.results li {
  padding: 8px;
  background: var(--surface);
  border-radius: var(--r);
  margin-bottom: 8px;
  font-size: 12px;
  color: var(--ink);
  border-left: 3px solid var(--mint);
}

.results li small {
  display: block;
  margin-top: 4px;
  color: var(--ink-3);
  font-size: 10px;
}

.results li:last-child {
  margin-bottom: 0;
}
</style>
