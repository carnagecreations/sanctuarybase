<template>
  <PageContainer v-if="showSeedHelper">
    <AppCard flat>
      <div class="p-6 space-y-4">
        <div>
          <h2 class="text-xl font-bold mb-2">Seed Outcomes Data</h2>
          <p class="text-sm text-gray-400 mb-4">
            Add 5 realistic sample outcome records to Firestore for testing and demonstration purposes.
          </p>
        </div>

        <div class="bg-gray-800 rounded p-3 text-xs space-y-2">
          <div class="font-bold text-teal-400">Sample Records:</div>
          <div>- Luna (Dog, Adoption)</div>
          <div>- Whiskers (Cat, Transfer)</div>
          <div>- Max (Dog, Return)</div>
          <div>- Shadow (Cat, Adoption)</div>
          <div>- Buddy (Dog, Deceased)</div>
        </div>

        <div class="flex gap-2">
          <AppButton
            @click="handleSeed"
            :disabled="loading"
            :loading="loading"
          >
            {{ loading ? 'Seeding...' : 'Seed Data' }}
          </AppButton>
          <AppButton variant="secondary" @click="$emit('close')">
            Close
          </AppButton>
        </div>

        <div v-if="message" :class="['p-3 rounded text-sm', messageClass]">
          {{ message }}
        </div>
      </div>
    </AppCard>
  </PageContainer>
</template>

<script setup>
import { ref } from 'vue'
import { seedOutcomes } from '../../../utils/seedOutcomes'
import PageContainer from '../../ui/PageContainer.vue'
import AppCard from '../../ui/AppCard.vue'
import AppButton from '../../ui/AppButton.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const loading = ref(false)
const message = ref('')
const messageClass = ref('')
const showSeedHelper = ref(props.show)

const handleSeed = async () => {
  loading.value = true
  message.value = ''

  try {
    const result = await seedOutcomes()
    message.value = `Success! Added ${result.count} outcome records to Firestore.`
    messageClass.value = 'bg-green-900 text-green-200 border border-green-700'
  } catch (error) {
    message.value = `Error: ${error.message}`
    messageClass.value = 'bg-red-900 text-red-200 border border-red-700'
  } finally {
    loading.value = false
  }
}
</script>
