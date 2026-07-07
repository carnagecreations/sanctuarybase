<template>
  <AppModal v-if="grant" :open="true" :title="grant.name" @close="close">
      <AppBadge type="success">{{ capitalizeFirst(grant.priority) }} Match</AppBadge>

      <div class="modal-section">
        <h3>Organization</h3>
        <p>{{ grant.organization }}</p>
        <p class="text-secondary">{{ grant.orgDescription }}</p>
      </div>

      <div class="modal-section">
        <h3>Funding</h3>
        <p class="amount-highlight">{{ formatCurrency(grant.amount) }} available</p>
        <p class="text-secondary">Applications accepted: {{ grant.applicationsPerYear }} per year</p>
      </div>

      <div class="modal-section">
        <h3>Deadline</h3>
        <p>{{ formatDate(grant.deadline) }}</p>
        <p class="text-secondary">{{ daysUntilDeadline(grant.deadline) }} days remaining</p>
      </div>

      <div class="modal-section">
        <h3>Focus Areas</h3>
        <p>{{ grant.focus }}</p>
        <div class="tags-list">
          <span v-for="type in grant.animalTypes" :key="type" class="tag-pill">
            {{ type }}
          </span>
        </div>
      </div>

      <div class="modal-section">
        <h3>Grant Overview</h3>
        <p>{{ grant.description }}</p>
      </div>

      <div class="modal-section">
        <h3>Key Requirements</h3>
        <ul class="requirement-list">
          <li v-for="(req, idx) in grant.keyRequirements" :key="idx">{{ req }}</li>
        </ul>
      </div>

      <div class="modal-section">
        <h3>Eligibility</h3>
        <ul class="requirement-list">
          <li v-for="(elig, idx) in grant.eligibility" :key="idx">{{ elig }}</li>
        </ul>
      </div>

      <div class="modal-section">
        <h3>Application Process</h3>
        <ol class="requirement-list">
          <li v-for="(step, idx) in grant.applicationSteps" :key="idx">{{ step }}</li>
        </ol>
      </div>

      <template #actions>
        <AppButton variant="primary" @click="emitApply">
          Apply Now
        </AppButton>
        <AppButton variant="secondary" @click="emitWebsite">
          Visit Website
        </AppButton>
        <AppButton variant="secondary" @click="emitLetter">
          Write Letter with AI
        </AppButton>
      </template>
  </AppModal>
</template>

<script setup>
import { AppBadge, AppButton, AppModal } from '../../ui'

const props = defineProps({
  grant: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'apply', 'website', 'letter'])

const daysUntilDeadline = (deadline) => {
  if (deadline === 'Ongoing') return 9999
  const today = new Date()
  const deadlineDate = new Date(deadline)
  const diff = deadlineDate - today
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

const formatDate = (dateStr) => {
  if (dateStr === 'Ongoing') return 'Ongoing'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatCurrency = (amount) => {
  return '$' + Number(amount).toLocaleString()
}

const capitalizeFirst = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const close = () => {
  emit('close')
}

const emitApply = () => {
  emit('apply', props.grant)
}

const emitWebsite = () => {
  emit('website', props.grant)
}

const emitLetter = () => {
  emit('letter', props.grant)
}
</script>

<style scoped>
.modal-section {
  margin-bottom: 20px;
}

.modal-section h3 {
  font-size: 13px;
  font-weight: 800;
  color: var(--ink-2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 8px;
}

.modal-section p {
  margin: 0 0 8px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--ink);
}

.modal-section p:last-child {
  margin-bottom: 0;
}

.text-secondary {
  color: var(--ink-3);
  font-size: 12px;
}

.amount-highlight {
  font-size: 18px;
  font-weight: 800;
  color: var(--mint);
}

.tags-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.tag-pill {
  display: inline-block;
  padding: 6px 12px;
  background: var(--mint);
  color: white;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.requirement-list {
  margin: 0;
  padding-left: 20px;
  font-size: 13px;
  color: var(--ink);
  line-height: 1.6;
}

.requirement-list li {
  margin-bottom: 8px;
}

.requirement-list li:last-child {
  margin-bottom: 0;
}

</style>
