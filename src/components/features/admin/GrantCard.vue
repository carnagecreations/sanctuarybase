<template>
  <div class="grant-card" @click="selectGrant">
    <div class="grant-card__header">
      <div class="grant-card__title">{{ grant.name }}</div>
      <AppBadge :type="grant.priority === 'high' ? 'success' : grant.priority === 'medium' ? 'warning' : 'info'">
        {{ capitalizeFirst(grant.priority) }} Match
      </AppBadge>
    </div>

    <div class="grant-card__org">{{ grant.organization }}</div>

    <div class="grant-card__amount">
      <strong>{{ formatCurrency(grant.amount) }}</strong> available
    </div>

    <div class="grant-card__deadline" :class="{ urgent: daysUntilDeadline(grant.deadline) <= 14 }">
      ⏰ Deadline: {{ formatDate(grant.deadline) }}
      <span class="days-left">({{ daysUntilDeadline(grant.deadline) }}d)</span>
    </div>

    <div class="grant-card__focus">
      <span class="focus-tag">{{ grant.focus }}</span>
      <span v-if="grant.animalTypes" class="focus-tag secondary">
        {{ grant.animalTypes.join(', ') }}
      </span>
    </div>

    <div class="grant-card__requirements">
      <div class="req-label">Key Requirements:</div>
      <ul class="req-list">
        <li v-for="(req, idx) in grant.keyRequirements.slice(0, 2)" :key="idx">{{ req }}</li>
        <li v-if="grant.keyRequirements.length > 2" class="more-items">
          +{{ grant.keyRequirements.length - 2 }} more
        </li>
      </ul>
    </div>

    <div class="grant-card__footer">
      <AppButton variant="primary" size="sm" @click.stop="selectGrant">
        View Details & Apply
      </AppButton>
    </div>
  </div>
</template>

<script setup>
import { AppBadge, AppButton } from '../../ui'

const props = defineProps({
  grant: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['select'])

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

const selectGrant = () => {
  emit('select', props.grant)
}
</script>

<style scoped>
.grant-card {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--r);
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.grant-card:hover {
  border-color: var(--mint);
  box-shadow: 0 8px 24px rgba(78, 255, 197, 0.15);
  transform: translateY(-4px);
}

.grant-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.grant-card__title {
  font-size: 16px;
  font-weight: 700;
  color: var(--ink);
  margin: 0;
}

.grant-card__org {
  font-size: 13px;
  color: var(--ink-2);
  font-weight: 600;
}

.grant-card__amount {
  font-size: 15px;
  color: var(--mint);
  font-weight: 700;
}

.grant-card__deadline {
  font-size: 12px;
  color: var(--ink-2);
  padding: 8px 12px;
  background: var(--surface);
  border-radius: 6px;
}

.grant-card__deadline.urgent {
  background: rgba(255, 107, 107, 0.1);
  color: var(--coral);
  font-weight: 600;
}

.days-left {
  opacity: 0.7;
  font-size: 11px;
}

.grant-card__focus {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.focus-tag {
  font-size: 11px;
  padding: 4px 8px;
  background: var(--mint);
  color: white;
  border-radius: 4px;
  font-weight: 600;
}

.focus-tag.secondary {
  background: var(--amber);
}

.grant-card__requirements {
  padding-top: 8px;
  border-top: 1px solid var(--border);
}

.req-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--ink-2);
  text-transform: uppercase;
  margin-bottom: 6px;
}

.req-list {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 12px;
  color: var(--ink-3);
  line-height: 1.4;
}

.req-list li {
  margin-bottom: 4px;
}

.req-list li:before {
  content: '• ';
  color: var(--mint);
  font-weight: 700;
}

.more-items {
  color: var(--mint);
  font-weight: 600;
}

.grant-card__footer {
  margin-top: 4px;
}
</style>
