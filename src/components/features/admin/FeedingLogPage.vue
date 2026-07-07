<template>
  <PageContainer>
    <button class="back-btn" @click="ui.setCurrentTab('admin-hub')">← Admin Hub</button>

    <div class="page-header">
      <h1>🍖 Feeding Log</h1>
      <AppButton variant="primary" @click="showLogForm = true">+ Log feeding</AppButton>
    </div>

    <!-- Log Feeding Modal -->
    <AppModal v-if="showLogForm" :open="true" title="Log Feeding" size="sm" @close="showLogForm = false">
      <!-- Mode Toggle -->
      <div class="mode-toggle">
        <button :class="{ active: feedingMode === 'single' }" @click="feedingMode = 'single'" class="mode-btn">
          Single Animal
        </button>
        <button :class="{ active: feedingMode === 'bulk' }" @click="feedingMode = 'bulk'" class="mode-btn">
          Bulk Feed
        </button>
      </div>

      <!-- Single Animal Mode -->
      <template v-if="feedingMode === 'single'">
        <div class="form-group">
          <label>Animal *</label>
          <select v-model="feedingForm.animalId" class="form-select">
            <option value="">Select an animal...</option>
            <option v-for="animal in animals" :key="animal.id" :value="animal.id">
              {{ animal.emoji }} {{ animal.name }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>Diet *</label>
          <select v-model="feedingForm.diet" class="form-select">
            <option value="">Select diet type...</option>
            <option value="Vegetables">🥬 Vegetables</option>
            <option value="Meat">🥩 Meat</option>
            <option value="Fish">🐟 Fish</option>
            <option value="Fruits">🍎 Fruits</option>
            <option value="Insects">🦗 Insects</option>
            <option value="Hay">🌾 Hay</option>
            <option value="Pellets">🌰 Pellets</option>
            <option value="Mixed">🍱 Mixed</option>
          </select>
        </div>
        <div class="form-group">
          <label>Amount *</label>
          <input v-model="feedingForm.amount" placeholder="e.g., 2 cups..." class="form-input" />
        </div>
      </template>

      <!-- Bulk Feed Mode -->
      <template v-if="feedingMode === 'bulk'">
        <div class="form-group">
          <label>Animals * (Select multiple)</label>
          <div class="animal-checkboxes">
            <label v-for="animal in animals" :key="animal.id" class="checkbox-item">
              <input
                type="checkbox"
                :value="animal.id"
                v-model="bulkSelectedAnimals"
                class="checkbox-input"
              />
              <span>{{ animal.emoji }} {{ animal.name }}</span>
            </label>
          </div>
        </div>
        <div class="form-group">
          <label>Diet *</label>
          <select v-model="bulkDiet" class="form-select">
            <option value="">Select diet type...</option>
            <option value="Vegetables">🥬 Vegetables</option>
            <option value="Meat">🥩 Meat</option>
            <option value="Fish">🐟 Fish</option>
            <option value="Fruits">🍎 Fruits</option>
            <option value="Insects">🦗 Insects</option>
            <option value="Hay">🌾 Hay</option>
            <option value="Pellets">🌰 Pellets</option>
            <option value="Mixed">🍱 Mixed</option>
          </select>
        </div>
      </template>

      <div class="form-group">
        <label>Notes</label>
        <textarea v-model="feedingForm.notes" placeholder="Any notes..." class="form-textarea" rows="2"></textarea>
      </div>

      <template #actions>
        <AppButton @click="showLogForm = false">Cancel</AppButton>
        <AppButton
          variant="primary"
          @click="submitFeeding"
          :disabled="feedingMode === 'single' ? !feedingForm.animalId || !feedingForm.diet || !feedingForm.amount : !bulkSelectedAnimals.length || !bulkDiet"
        >
          ✓ {{ feedingMode === 'bulk' ? `Feed ${bulkSelectedAnimals.length} Animals` : 'Log Feeding' }}
        </AppButton>
      </template>
    </AppModal>

    <SectionLabel>Today's feedings</SectionLabel>
    <AppCard v-if="todaysFeedings.length" :flat="true">
      <div class="divide-list">
        <div v-for="f in todaysFeedings" :key="f.id" class="feeding-item">
          <div class="feeding-header">
            <span class="feeding-animal">{{ f.emoji }} {{ f.name }}</span>
            <AppBadge :type="f.given ? 'success' : 'info'">{{ f.given ? '✓' : 'Pending' }}</AppBadge>
          </div>
          <div class="feeding-details">
            <span>{{ f.diet }}</span> · <span>{{ f.amount }}</span> · <span>{{ f.time }}</span>
          </div>
          <div v-if="f.notes" class="feeding-notes">Notes: {{ f.notes }}</div>
          <div v-if="!f.given" class="feeding-actions">
            <AppButton size="sm" variant="primary" :disabled="busyId === f.id" @click="markFed(f)">
              {{ busyId === f.id ? 'Saving…' : '✓ Fed' }}
            </AppButton>
          </div>
        </div>
      </div>
    </AppCard>
    <EmptyState v-else icon="🍖" title="No feedings logged today" message="Use Log Feeding or Bulk Feed to record today's feedings." />

    <SectionLabel>Recent feedings</SectionLabel>
    <AppCard v-if="recentFeedings.length" :flat="true">
      <div class="divide-list">
        <div v-for="f in recentFeedings" :key="f.id" class="recent-row">
          <div class="recent-animal">
            <span class="recent-emoji">🐾</span>
            <span class="recent-name">{{ f.name || 'Unknown animal' }}</span>
          </div>
          <div class="recent-details">
            <span class="recent-diet">{{ f.diet }}</span>
            <span class="recent-time">{{ formatTime(f.timestamp) }}</span>
          </div>
        </div>
      </div>
    </AppCard>
    <EmptyState v-else icon="🍖" title="No recent feedings" message="Feedings will appear here as they are logged." />
  </PageContainer>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue'
import { PageContainer, AppCard, SectionLabel, AppButton, AppBadge, EmptyState, AppModal } from '../../ui'
import { useUIStore } from '../../../stores/ui'
import { useFeedingLogsStore } from '../../../stores/feedingLogs'
import { useAnimalsStore } from '../../../stores/animals'

const ui = useUIStore()
const feedingLogsStore = useFeedingLogsStore()
const animalsStore = useAnimalsStore()

const showLogForm = ref(false)
const feedingMode = ref('single') // 'single' or 'bulk'
const busyId = ref(null)

const feedingForm = ref({
  animalId: '',
  diet: '',
  amount: '',
  notes: ''
})

const bulkSelectedAnimals = ref([])
const bulkDiet = ref('')

const animals = computed(() => {
  return Array.isArray(animalsStore.animals) ? animalsStore.animals : []
})

const submitFeeding = async () => {
  try {
    if (feedingMode.value === 'single') {
      await feedingLogsStore.addFeedingLog({
        ...feedingForm.value,
        timestamp: new Date().toISOString(),
        given: true
      })
      ui.showToast('✓ Feeding logged successfully', 'success')
    } else {
      // Bulk feed mode
      for (const animalId of bulkSelectedAnimals.value) {
        await feedingLogsStore.addFeedingLog({
          animalId,
          diet: bulkDiet.value,
          amount: 'Standard',
          notes: feedingForm.value.notes,
          timestamp: new Date().toISOString(),
          given: true
        })
      }
      ui.showToast(`✓ ${bulkSelectedAnimals.value.length} animals fed`, 'success')
    }

    showLogForm.value = false
    feedingForm.value = { animalId: '', diet: '', amount: '', notes: '' }
    bulkSelectedAnimals.value = []
    bulkDiet.value = ''
  } catch (err) {
    ui.showToast('Failed to log feeding', 'error')
  }
}

const markFed = async (f) => {
  busyId.value = f.id
  try {
    await feedingLogsStore.updateFeedingLog(f.id, { given: true })
    ui.showToast(`✓ ${f.name || 'Feeding'} marked as fed`, 'success')
  } catch {
    ui.showToast('Failed to update feeding', 'error')
  } finally {
    busyId.value = null
  }
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

onMounted(() => {
  feedingLogsStore.fetchFeedingLogs()
})

const todaysFeedings = computed(() => {
  const today = new Date().toDateString()
  return feedingLogsStore.feedingLogs.filter(f => {
    const logDate = new Date(f.timestamp?.toDate?.() || f.timestamp).toDateString()
    return logDate === today
  })
})

const recentFeedings = computed(() => {
  return feedingLogsStore.feedingLogs
    .filter(f => {
      const logDate = new Date(f.timestamp?.toDate?.() || f.timestamp).toDateString()
      const today = new Date().toDateString()
      // Show completed feedings from today and all feedings from previous days
      if (logDate === today) return f.given
      return true
    })
    .sort((a, b) => {
      const aDate = new Date(a.timestamp?.toDate?.() || a.timestamp)
      const bDate = new Date(b.timestamp?.toDate?.() || b.timestamp)
      return bDate - aDate
    })
    .slice(0, 10)
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

.divide-list > * + * { border-top: 1px solid var(--border); }

.feeding-item {
  padding: 14px 0;
  transition: background .2s;
}

.feeding-item:hover {
  background: rgba(78,255,197,.03);
  border-radius: 6px;
  padding: 14px 8px;
  margin: 0 -8px;
}

.feeding-item:first-child { padding-top: 0; }
.feeding-item:last-child { padding-bottom: 0; }

.feeding-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.feeding-animal {
  font-size: 15px;
  font-weight: 800;
  color: var(--ink);
}

.feeding-details {
  font-size: 13px;
  color: var(--ink-2);
  font-weight: 600;
  margin-bottom: 6px;
}

.feeding-notes {
  font-size: 12px;
  color: var(--ink-3);
  margin-bottom: 8px;
  font-style: italic;
}

.feeding-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.divide-list > * + * { border-top: 1px solid var(--border); }

.recent-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
}
.recent-row:first-child { padding-top: 0; }
.recent-row:last-child { padding-bottom: 0; }

.recent-animal {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.recent-emoji {
  font-size: 18px;
  flex-shrink: 0;
}

.recent-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--ink);
}

.recent-details {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.recent-diet {
  font-size: 12px;
  color: var(--ink-2);
  font-weight: 600;
}

.recent-time {
  font-size: 12px;
  color: var(--ink-3);
  font-weight: 600;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.form-group label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--ink-3);
  letter-spacing: 0.05em;
}

.form-input,
.form-textarea {
  padding: 10px 12px;
  background: var(--surface-2);
  border: 1.5px solid var(--border);
  border-radius: var(--r);
  color: var(--ink);
  font-size: 13px;
  font-family: inherit;
  transition: border-color 0.15s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--mint);
}

/* Mode Toggle */
.mode-toggle {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.mode-btn {
  flex: 1;
  padding: 10px;
  background: var(--surface-2);
  border: 1.5px solid var(--border);
  border-radius: var(--r);
  color: var(--ink-2);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}

.mode-btn.active {
  background: var(--mint);
  border-color: var(--mint);
  color: white;
}

.mode-btn:hover:not(.active) {
  border-color: var(--mint);
  color: var(--mint);
}

/* Select Dropdown */
.form-select {
  width: 100%;
  padding: 10px 12px;
  background: var(--surface-2);
  border: 1.5px solid var(--border);
  border-radius: var(--r);
  color: var(--ink);
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.15s;
}

.form-select:focus {
  outline: none;
  border-color: var(--mint);
}

.form-select option {
  background: var(--surface);
  color: var(--ink);
}

/* Animal Checkboxes */
.animal-checkboxes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
  padding: 12px;
  background: var(--surface-2);
  border: 1.5px solid var(--border);
  border-radius: var(--r);
  max-height: 200px;
  overflow-y: auto;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: var(--surface);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;
  font-size: 13px;
}

.checkbox-item:hover {
  background: var(--surface-3);
}

.checkbox-input {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: var(--mint);
}
</style>
