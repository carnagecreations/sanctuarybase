<template>
  <div class="space-y-4">
    <!-- DIET SECTION -->
    <div>
      <div class="section-header">
        <SectionLabel>🍽️ Diet Management</SectionLabel>
        <AppButton size="sm" variant="primary" @click="showDietModal = true">✏️ Edit Diet</AppButton>
      </div>

      <AppCard v-if="currentDiet" noPad>
        <div class="diet-content">
          <div class="diet-item">
            <span class="diet-label">Food Type:</span>
            <span class="diet-value">{{ currentDiet.foodType }}</span>
          </div>
          <div class="diet-item">
            <span class="diet-label">Portions:</span>
            <span class="diet-value">{{ currentDiet.portions?.amount }} {{ currentDiet.portions?.unit }}</span>
          </div>
          <div class="diet-item">
            <span class="diet-label">Feeding Schedule:</span>
            <span class="diet-value">{{ currentDiet.feedingSchedule }} times daily</span>
          </div>
          <div v-if="currentDiet.supplements" class="diet-item">
            <span class="diet-label">Supplements:</span>
            <span class="diet-value">{{ currentDiet.supplements }}</span>
          </div>
          <div v-if="currentDiet.allergies" class="diet-item">
            <span class="diet-label">Allergies:</span>
            <span class="diet-value">{{ currentDiet.allergies }}</span>
          </div>
          <div v-if="currentDiet.notes" class="diet-item">
            <span class="diet-label">Notes:</span>
            <span class="diet-value">{{ currentDiet.notes }}</span>
          </div>
        </div>
      </AppCard>
      <EmptyState v-else icon="🍽️" title="No diet recorded" message="Click 'Edit Diet' to add feeding information." />
    </div>

    <!-- HEALTH METRICS SECTION -->
    <div>
      <div class="section-header">
        <SectionLabel>❤️ Health Metrics</SectionLabel>
        <AppButton size="sm" variant="primary" @click="showWeightModal = true">📊 Log Weight</AppButton>
      </div>

      <!-- Current Weight & Trend -->
      <div v-if="recentMetrics.length" class="metrics-grid">
        <AppCard class="metric-card">
          <div class="metric-display">
            <div class="metric-title">Current Weight</div>
            <div class="metric-value">{{ recentMetrics[0].weight }}</div>
            <div class="metric-unit">{{ recentMetrics[0].weight_unit || 'kg' }}</div>
          </div>
          <div v-if="weightTrend" class="metric-trend">
            <span class="trend-arrow" :class="`trend-${weightTrend.direction}`">
              {{ weightTrend.direction === 'up' ? '△' : weightTrend.direction === 'down' ? '▼' : '=' }}
            </span>
            <div class="trend-text">
              <div class="trend-change" :class="`trend-${weightTrend.direction}`">
                {{ weightTrend.change }} {{ recentMetrics[0].weight_unit || 'kg' }}
              </div>
              <div class="trend-period">from previous</div>
            </div>
          </div>
        </AppCard>

        <AppCard class="metric-card">
          <div class="metric-display">
            <div class="metric-title">Body Condition</div>
            <div class="condition-score">{{ recentMetrics[0].bodyCondition }}/5</div>
            <div class="condition-label">{{ getConditionLabel(recentMetrics[0].bodyCondition) }}</div>
          </div>
        </AppCard>
      </div>

      <!-- Log Weight Form -->
      <AppCard>
        <div class="form-grid">
          <AppInput
            v-model="newMetric.weight"
            type="number"
            placeholder="Weight"
            step="0.1"
            label="Weight"
          />
          <AppSelect
            v-model="newMetric.weight_unit"
            :options="weightUnitOptions"
            label="Unit"
          />
          <AppInput
            v-model="newMetric.date"
            type="date"
            label="Date"
            style="grid-column: span 2"
          />
          <AppSelect
            v-model="newMetric.bodyCondition"
            :options="bodyConditionOptions"
            label="Body Condition (1=Thin, 5=Obese)"
            style="grid-column: span 2"
          />
          <AppInput
            v-model="newMetric.notes"
            placeholder="Notes (optional)"
            style="grid-column: span 2"
          />
          <div class="form-actions" style="grid-column: span 2">
            <AppButton variant="secondary" @click="setTodayDate">📅 Today</AppButton>
            <AppButton variant="primary" @click="addHealthMetric">✓ Log Weight</AppButton>
          </div>
        </div>
      </AppCard>

      <!-- Weight Chart -->
      <div v-if="recentMetrics.length > 1">
        <SectionLabel>Weight Trend</SectionLabel>
        <AppCard>
          <div class="chart">
            <div
              v-for="(m, i) in recentMetrics.slice().reverse()"
              :key="m.id"
              class="chart-bar"
              :title="`${m.weight}${m.weight_unit}`"
            >
              <div class="bar-container">
                <div class="bar" :style="{ height: (parseFloat(m.weight) / maxWeight * 100) + '%' }" />
              </div>
              <div class="bar-label">{{ formatDate(m.date) }}</div>
            </div>
          </div>
        </AppCard>
      </div>

      <!-- Health Metrics History -->
      <div v-if="recentMetrics.length">
        <SectionLabel>Measurement History</SectionLabel>
        <AppCard :flat="true">
          <div class="divide-list">
            <div v-for="m in recentMetrics" :key="m.id" class="metric-entry">
              <div class="metric-entry-main">
                <div class="metric-entry-weight">{{ m.weight }} {{ m.weight_unit || 'kg' }}</div>
                <div class="metric-entry-condition">
                  <span class="condition-badge">{{ getConditionLabel(m.bodyCondition) }}</span>
                </div>
              </div>
              <div class="metric-entry-date">{{ formatDate(m.date) }}</div>
            </div>
          </div>
        </AppCard>
      </div>
    </div>

    <!-- DIET MODAL -->
    <DietModal
      v-if="showDietModal"
      :animal-id="animal.id"
      :initial-diet="currentDiet"
      @save="saveDiet"
      @close="showDietModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { AppCard, SectionLabel, EmptyState, AppButton, AppInput, AppSelect } from '../../ui'
import { useAnimalDietStore } from '../../../stores/animalDiet'
import { useHealthMetricsStore } from '../../../stores/healthMetrics'
import DietModal from '../modals/DietModal.vue'

const props = defineProps({
  animal: { type: Object, required: true }
})

const dietStore = useAnimalDietStore()
const metricsStore = useHealthMetricsStore()

const showDietModal = ref(false)
const showWeightModal = ref(false)
const currentDiet = ref(null)
const recentMetrics = ref([])
const newMetric = ref({
  weight: '',
  weight_unit: 'kg',
  date: '',
  bodyCondition: '3',
  notes: ''
})

const weightUnitOptions = [
  { label: 'kg', value: 'kg' },
  { label: 'lbs', value: 'lbs' }
]

const bodyConditionOptions = [
  { label: '1 - Thin', value: '1' },
  { label: '2 - Lean', value: '2' },
  { label: '3 - Ideal', value: '3' },
  { label: '4 - Overweight', value: '4' },
  { label: '5 - Obese', value: '5' }
]

const maxWeight = computed(() => {
  if (recentMetrics.value.length === 0) return 100
  return Math.max(...recentMetrics.value.map(m => parseFloat(m.weight))) * 1.1
})

const weightTrend = computed(() => {
  return metricsStore.getTrend(recentMetrics.value)
})

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
}

const getConditionLabel = (score) => {
  const labels = {
    '1': 'Thin',
    '2': 'Lean',
    '3': 'Ideal',
    '4': 'Overweight',
    '5': 'Obese'
  }
  return labels[String(score)] || 'Unknown'
}

const setTodayDate = () => {
  const today = new Date()
  newMetric.value.date = today.toISOString().split('T')[0]
}

const addHealthMetric = async () => {
  if (!newMetric.value.weight || !newMetric.value.date) {
    alert('Please fill in weight and date')
    return
  }

  try {
    await metricsStore.addMetric({
      animalId: props.animal.id,
      weight: newMetric.value.weight,
      weight_unit: newMetric.value.weight_unit,
      date: newMetric.value.date,
      bodyCondition: parseInt(newMetric.value.bodyCondition),
      notes: newMetric.value.notes,
      recordedBy: 'user'
    })

    // Reset form
    newMetric.value = {
      weight: '',
      weight_unit: 'kg',
      date: '',
      bodyCondition: '3',
      notes: ''
    }

    // Reload metrics
    await loadMetrics()
  } catch (error) {
    console.error('Failed to add metric:', error)
    alert('Failed to log weight')
  }
}

const saveDiet = async (dietData) => {
  try {
    if (currentDiet.value?.id) {
      await dietStore.updateDiet(currentDiet.value.id, dietData)
    } else {
      await dietStore.addDiet({
        animalId: props.animal.id,
        ...dietData
      })
    }
    showDietModal.value = false
    await loadDiet()
  } catch (error) {
    console.error('Failed to save diet:', error)
    alert('Failed to save diet')
  }
}

const loadDiet = async () => {
  const diets = await dietStore.fetchFoodByAnimalId(props.animal.id)
  currentDiet.value = diets.length > 0 ? diets[0] : null
}

const loadMetrics = async () => {
  recentMetrics.value = await metricsStore.fetchByAnimalId(props.animal.id)
}

onMounted(async () => {
  await loadDiet()
  await loadMetrics()
})
</script>

<style scoped>
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.diet-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.diet-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid var(--border);
}

.diet-item:last-child {
  border-bottom: none;
}

.diet-label {
  font-weight: 600;
  color: var(--ink-2);
  min-width: 120px;
}

.diet-value {
  color: var(--ink);
  text-align: right;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.metric-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 140px;
}

.metric-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.metric-title {
  font-size: 12px;
  color: var(--ink-3);
  text-transform: uppercase;
  font-weight: 600;
}

.metric-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--ink);
}

.metric-unit {
  font-size: 12px;
  color: var(--ink-2);
}

.condition-score {
  font-size: 32px;
  font-weight: 700;
  color: var(--ink);
}

.condition-label {
  font-size: 13px;
  color: var(--ink-2);
  font-weight: 500;
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--bg);
  border-radius: var(--r);
}

.trend-arrow {
  font-size: 18px;
  font-weight: 700;
}

.trend-arrow.trend-up {
  color: #ef4444;
}

.trend-arrow.trend-down {
  color: #10b981;
}

.trend-arrow.trend-stable {
  color: var(--ink-2);
}

.trend-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.trend-change {
  font-size: 13px;
  font-weight: 600;
}

.trend-change.trend-up {
  color: #ef4444;
}

.trend-change.trend-down {
  color: #10b981;
}

.trend-change.trend-stable {
  color: var(--ink-2);
}

.trend-period {
  font-size: 11px;
  color: var(--ink-3);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.form-actions {
  display: flex;
  gap: 8px;
}

.form-actions button {
  flex: 1;
}

.chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  gap: 8px;
  height: 200px;
  padding: 16px;
}

.chart-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.bar-container {
  width: 100%;
  height: 160px;
  background: var(--bg);
  border-radius: var(--r);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  border: 1px solid var(--border);
}

.bar {
  width: 70%;
  background: linear-gradient(180deg, #3b82f6 0%, #1e40af 100%);
  border-radius: var(--r) var(--r) 0 0;
  min-height: 4px;
}

.bar-label {
  font-size: 11px;
  color: var(--ink-2);
  text-align: center;
  width: 100%;
}

.divide-list {
  display: flex;
  flex-direction: column;
}

.metric-entry {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
}

.metric-entry:last-child {
  border-bottom: none;
}

.metric-entry-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.metric-entry-weight {
  font-weight: 600;
  color: var(--ink);
}

.metric-entry-condition {
  display: flex;
  gap: 6px;
}

.condition-badge {
  font-size: 12px;
  padding: 4px 8px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--r);
  color: var(--ink-2);
}

.metric-entry-date {
  font-size: 12px;
  color: var(--ink-3);
}

.space-y-4 > * + * {
  margin-top: 20px;
}
</style>
