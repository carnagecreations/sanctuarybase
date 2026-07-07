<template>
  <PageContainer>
    <div class="space-y-4">
      <SectionLabel>Animal Intake Wizard</SectionLabel>

      <!-- Progress Indicator -->
      <div class="flex gap-2 justify-between mb-4">
        <div v-for="step in 5" :key="step" class="flex-1 h-2 rounded" :class="step <= currentStep ? 'bg-teal-400' : 'bg-gray-700'" />
      </div>

      <!-- Step 1: Basic Info -->
      <AppCard v-if="currentStep === 1">
        <div class="space-y-3">
          <div class="text-sm font-bold mb-4">Step 1: Basic Information</div>
          <AppInput v-model="form.name" label="Animal Name" placeholder="e.g., Luna" />
          <AppInput v-model="form.species" label="Species" placeholder="Dog, Cat, etc." />
          <AppSelect v-model="form.breed" :options="breedOptions" label="Breed" />
          <AppInput v-model="form.age" label="Age" placeholder="e.g., 2 years" />
          <AppSelect v-model="form.sex" :options="sexOptions" label="Sex" />
          <div class="flex gap-2 pt-2">
            <AppButton variant="secondary" @click="cancelIntake">Cancel</AppButton>
            <AppButton variant="primary" @click="nextStep">Next</AppButton>
          </div>
        </div>
      </AppCard>

      <!-- Step 2: Physical Description -->
      <AppCard v-if="currentStep === 2">
        <div class="space-y-3">
          <div class="text-sm font-bold mb-4">Step 2: Physical Description</div>
          <AppInput v-model="form.color" label="Color/Markings" placeholder="e.g., Black with white markings" />
          <AppInput v-model="form.weight" label="Weight" placeholder="e.g., 50 lbs" />
          <AppInput v-model="form.microchip" label="Microchip ID (if any)" placeholder="Optional" />
          <div class="flex gap-2 pt-2">
            <AppButton variant="secondary" @click="previousStep">Back</AppButton>
            <AppButton variant="primary" @click="nextStep">Next</AppButton>
          </div>
        </div>
      </AppCard>

      <!-- Step 3: Medical Info -->
      <AppCard v-if="currentStep === 3">
        <div class="space-y-3">
          <div class="text-sm font-bold mb-4">Step 3: Medical Information</div>
          <label class="flex items-center gap-2 text-sm">
            <input v-model="form.neutered" type="checkbox" class="rounded" />
            Spayed/Neutered
          </label>
          <label class="flex items-center gap-2 text-sm">
            <input v-model="form.vaccinated" type="checkbox" class="rounded" />
            Up to date on vaccinations
          </label>
          <AppInput v-model="form.medicalNotes" label="Medical Notes" placeholder="Any health issues or concerns?" />
          <AppInput v-model="form.medications" label="Current Medications" placeholder="If any" />
          <div class="flex gap-2 pt-2">
            <AppButton variant="secondary" @click="previousStep">Back</AppButton>
            <AppButton variant="primary" @click="nextStep">Next</AppButton>
          </div>
        </div>
      </AppCard>

      <!-- Step 4: Behavioral Info -->
      <AppCard v-if="currentStep === 4">
        <div class="space-y-3">
          <div class="text-sm font-bold mb-4">Step 4: Behavioral Information</div>
          <AppSelect v-model="form.temperament" :options="temperamentOptions" label="Temperament" />
          <label class="flex items-center gap-2 text-sm">
            <input v-model="form.goodWithKids" type="checkbox" class="rounded" />
            Good with kids
          </label>
          <label class="flex items-center gap-2 text-sm">
            <input v-model="form.goodWithPets" type="checkbox" class="rounded" />
            Good with other animals
          </label>
          <AppInput v-model="form.behaviorNotes" label="Behavioral Notes" placeholder="Any quirks or special handling needed?" />
          <div class="flex gap-2 pt-2">
            <AppButton variant="secondary" @click="previousStep">Back</AppButton>
            <AppButton variant="primary" @click="nextStep">Next</AppButton>
          </div>
        </div>
      </AppCard>

      <!-- Step 5: Intake Source -->
      <AppCard v-if="currentStep === 5">
        <div class="space-y-3">
          <div class="text-sm font-bold mb-4">Step 5: Intake Source</div>
          <AppSelect v-model="form.source" :options="sourceOptions" label="How did we get this animal?" />
          <AppInput v-model="form.ownerName" label="Owner Name (if applicable)" placeholder="Optional" />
          <AppInput v-model="form.ownerContact" label="Owner Contact (if applicable)" placeholder="Optional" />
          <AppInput v-model="form.intakeNotes" label="Additional Notes" placeholder="Anything else we should know?" />
          <div class="flex gap-2 pt-2">
            <AppButton variant="secondary" :disabled="saving" @click="previousStep">Back</AppButton>
            <AppButton variant="primary" :loading="saving" @click="completeIntake">Complete Intake</AppButton>
          </div>
        </div>
      </AppCard>

      <!-- Recent Intakes -->
      <div v-if="currentStep === 1">
        <SectionLabel>Recent Intakes</SectionLabel>
        <div v-if="recentIntakes.length === 0" class="mt-3">
          <EmptyState icon="🐾" title="No Recent Intakes" message="Completed intakes will show up here." />
        </div>
        <div class="space-y-2 mt-3">
          <AppCard v-for="intake in recentIntakes" :key="intake.id" flat noPad>
            <div class="p-3 flex justify-between items-center">
              <div class="text-sm">
                <div class="font-bold">{{ intake.name }}</div>
                <div class="text-xs text-gray-400">{{ intake.species }} • {{ intake.date }}</div>
              </div>
              <div class="text-xs">{{ intake.status }}</div>
            </div>
          </AppCard>
        </div>
      </div>
    </div>
  </PageContainer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import PageContainer from '../../ui/PageContainer.vue'
import SectionLabel from '../../ui/SectionLabel.vue'
import AppCard from '../../ui/AppCard.vue'
import AppInput from '../../ui/AppInput.vue'
import AppSelect from '../../ui/AppSelect.vue'
import AppButton from '../../ui/AppButton.vue'
import EmptyState from '../../ui/EmptyState.vue'
import { useUIStore } from '../../../stores/ui'
import { useAnimalsStore } from '../../../stores/animals'
import { useAuthStore } from '../../../stores/auth'

const ui = useUIStore()
const animalsStore = useAnimalsStore()
const authStore = useAuthStore()
const currentStep = ref(1)
const saving = ref(false)

const breedOptions = [
  { label: 'Golden Retriever', value: 'golden-retriever' },
  { label: 'Labrador', value: 'labrador' },
  { label: 'Mixed', value: 'mixed' },
]

const sexOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
]

const temperamentOptions = [
  { label: 'Friendly', value: 'friendly' },
  { label: 'Cautious', value: 'cautious' },
  { label: 'Aggressive', value: 'aggressive' },
  { label: 'Playful', value: 'playful' },
]

const sourceOptions = [
  { label: 'Surrendered by Owner', value: 'owner' },
  { label: 'Stray Found', value: 'stray' },
  { label: 'Rescue Transfer', value: 'transfer' },
  { label: 'Animal Control', value: 'control' },
]

const form = ref({
  name: '',
  species: '',
  breed: '',
  age: '',
  sex: '',
  color: '',
  weight: '',
  microchip: '',
  neutered: false,
  vaccinated: false,
  medicalNotes: '',
  medications: '',
  temperament: '',
  goodWithKids: false,
  goodWithPets: false,
  behaviorNotes: '',
  source: '',
  ownerName: '',
  ownerContact: '',
  intakeNotes: '',
})

const formatIntakeDate = (createdAt) => {
  if (!createdAt) return 'Unknown date'
  const d = typeof createdAt?.toDate === 'function' ? createdAt.toDate() : new Date(createdAt)
  return isNaN(d.getTime()) ? 'Unknown date' : d.toLocaleDateString()
}

const recentIntakes = computed(() =>
  [...animalsStore.animals]
    .sort((a, b) => {
      const da = typeof a.createdAt?.toDate === 'function' ? a.createdAt.toDate() : new Date(a.createdAt || 0)
      const db = typeof b.createdAt?.toDate === 'function' ? b.createdAt.toDate() : new Date(b.createdAt || 0)
      return db - da
    })
    .slice(0, 5)
    .map(a => ({
      id: a.id,
      name: a.name,
      species: a.species,
      date: formatIntakeDate(a.createdAt),
      status: a.status || 'intake',
    }))
)

const nextStep = () => {
  if (currentStep.value < 5) currentStep.value++
}

const previousStep = () => {
  if (currentStep.value > 1) currentStep.value--
}

const resetForm = () => {
  form.value = {
    name: '', species: '', breed: '', age: '', sex: '',
    color: '', weight: '', microchip: '',
    neutered: false, vaccinated: false, medicalNotes: '', medications: '',
    temperament: '', goodWithKids: false, goodWithPets: false, behaviorNotes: '',
    source: '', ownerName: '', ownerContact: '', intakeNotes: '',
  }
}

const completeIntake = async () => {
  if (!form.value.name.trim() || !form.value.species.trim()) {
    ui.showToast('Name and species are required (Step 1)', 'error')
    currentStep.value = 1
    return
  }
  saving.value = true
  try {
    await animalsStore.addAnimal({
      // Core animal record (matches Animals page schema)
      name: form.value.name.trim(),
      species: form.value.species.trim(),
      breed: form.value.breed,
      age: form.value.age,
      sex: form.value.sex,
      weight: form.value.weight,
      status: 'intake',
      healthStatus: 'unknown',
      location: '',
      notes: form.value.intakeNotes,
      // Physical / medical / behavioral details
      color: form.value.color,
      microchip: form.value.microchip,
      neutered: form.value.neutered,
      vaccinated: form.value.vaccinated,
      medicalNotes: form.value.medicalNotes,
      medications: form.value.medications,
      temperament: form.value.temperament,
      goodWithKids: form.value.goodWithKids,
      goodWithPets: form.value.goodWithPets,
      behaviorNotes: form.value.behaviorNotes,
      // Intake metadata
      intake: {
        source: form.value.source,
        ownerName: form.value.ownerName,
        ownerContact: form.value.ownerContact,
        notes: form.value.intakeNotes,
        date: new Date().toISOString(),
        recordedBy: authStore.user?.name || authStore.user?.email || 'Unknown',
      },
    })
    ui.showToast(`${form.value.name.trim()} added to the animal roster! 🐾`, 'success')
    resetForm()
    currentStep.value = 1
  } catch (e) {
    ui.showToast(`Failed to save intake: ${e.message}`, 'error')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  animalsStore.fetchAnimals()
})

const cancelIntake = () => {
  ui.setCurrentTab('dashboard')
}
</script>
