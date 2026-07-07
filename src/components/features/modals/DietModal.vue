<template>
  <AppModal :open="true" :title="initialDiet ? 'Edit Diet' : 'Add Diet'" @close="$emit('close')">
        <form @submit.prevent="submitForm">
          <!-- Food Type -->
          <div class="form-section">
            <label class="form-label">Food Type *</label>
            <AppInput
              v-model="form.foodType"
              placeholder="e.g., Premium Dry Kibble, Raw Meat, Mixed"
              required
            />
          </div>

          <!-- Portions -->
          <div class="form-section">
            <label class="form-label">Portions *</label>
            <div class="portion-grid">
              <AppInput
                v-model="form.portions.amount"
                type="number"
                placeholder="Amount"
                step="0.1"
                required
              />
              <AppSelect
                v-model="form.portions.unit"
                :options="portionUnits"
                required
              />
            </div>
          </div>

          <!-- Feeding Schedule -->
          <div class="form-section">
            <label class="form-label">Feeding Schedule (times per day) *</label>
            <AppSelect
              v-model="form.feedingSchedule"
              :options="feedingScheduleOptions"
              required
            />
          </div>

          <!-- Supplements -->
          <div class="form-section">
            <label class="form-label">Supplements</label>
            <AppInput
              v-model="form.supplements"
              placeholder="e.g., Calcium, Vitamin D, Probiotics"
            />
          </div>

          <!-- Allergies -->
          <div class="form-section">
            <label class="form-label">Allergies / Intolerances</label>
            <AppInput
              v-model="form.allergies"
              placeholder="e.g., Chicken, Dairy, Grains"
            />
          </div>

          <!-- Notes -->
          <div class="form-section">
            <label class="form-label">Notes</label>
            <textarea
              v-model="form.notes"
              placeholder="Additional diet information, preferences, or feeding tips"
              class="form-textarea"
            ></textarea>
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <AppButton
              type="button"
              variant="secondary"
              @click="$emit('close')"
            >
              Cancel
            </AppButton>
            <AppButton type="submit" variant="primary">
              {{ initialDiet ? 'Update Diet' : 'Add Diet' }}
            </AppButton>
          </div>
        </form>
  </AppModal>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { AppInput, AppSelect, AppButton, AppModal } from '../../ui'

const props = defineProps({
  animalId: { type: String, required: true },
  initialDiet: { type: Object, default: null }
})

const emit = defineEmits(['save', 'close'])

const form = ref({
  foodType: '',
  portions: { amount: '', unit: 'cups' },
  feedingSchedule: '2',
  supplements: '',
  allergies: '',
  notes: ''
})

const portionUnits = [
  { label: 'cups', value: 'cups' },
  { label: 'grams', value: 'g' },
  { label: 'ounces', value: 'oz' },
  { label: 'kg', value: 'kg' },
  { label: 'ml', value: 'ml' },
]

const feedingScheduleOptions = [
  { label: 'Once daily', value: '1' },
  { label: 'Twice daily', value: '2' },
  { label: 'Three times daily', value: '3' },
  { label: 'Four times daily', value: '4' },
  { label: 'As needed', value: 'as-needed' },
]

const submitForm = () => {
  if (!form.value.foodType || !form.value.portions.amount || !form.value.feedingSchedule) {
    alert('Please fill in required fields')
    return
  }

  emit('save', {
    foodType: form.value.foodType,
    portions: {
      amount: form.value.portions.amount,
      unit: form.value.portions.unit
    },
    feedingSchedule: form.value.feedingSchedule,
    supplements: form.value.supplements || null,
    allergies: form.value.allergies || null,
    notes: form.value.notes || null
  })
}

onMounted(() => {
  if (props.initialDiet) {
    form.value = {
      foodType: props.initialDiet.foodType || '',
      portions: {
        amount: props.initialDiet.portions?.amount || '',
        unit: props.initialDiet.portions?.unit || 'cups'
      },
      feedingSchedule: props.initialDiet.feedingSchedule || '2',
      supplements: props.initialDiet.supplements || '',
      allergies: props.initialDiet.allergies || '',
      notes: props.initialDiet.notes || ''
    }
  } else {
    form.value.feedingSchedule = '2'
  }
})
</script>

<style scoped>
.form-section {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-weight: 600;
  color: var(--ink-2);
  font-size: 13px;
  text-transform: uppercase;
}

.portion-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.form-textarea {
  border: 1px solid var(--border);
  border-radius: var(--r);
  padding: 10px;
  font-family: inherit;
  font-size: 14px;
  color: var(--ink);
  background: var(--bg);
  resize: vertical;
  min-height: 80px;
  transition: border-color 0.15s;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding: 20px;
  border-top: 1px solid var(--border);
}

.form-actions button {
  flex: 1;
}
</style>
