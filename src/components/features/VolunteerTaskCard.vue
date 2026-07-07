<template>
  <div class="task-card" :class="{ completed: isCompleted }">
    <div class="task-header">
      <div class="task-title">{{ task.title }}</div>
      <div class="task-badge" :class="task.priority">{{ task.priority }}</div>
    </div>

    <div class="task-description">{{ task.description }}</div>

    <div v-if="task.dueDate" class="task-meta">
      ⏰ Due: {{ formatDate(task.dueDate) }}
    </div>

    <div v-if="task.estimatedHours" class="task-meta">
      ⏱️ ~{{ task.estimatedHours }}h
    </div>

    <div v-if="isMyTask && task.claimedDate" class="task-meta claimed">
      ✋ Claimed {{ formatRelativeTime(task.claimedDate) }}
    </div>

    <div v-if="isCompleted && task.completedDate" class="task-meta completed">
      ✅ Completed {{ formatRelativeTime(task.completedDate) }}
    </div>

    <div class="task-actions">
      <button v-if="!isMyTask && !isCompleted" class="btn-claim" @click="$emit('claim')">
        Claim Task
      </button>
      <button v-if="isMyTask && !isCompleted" class="btn-complete" @click="$emit('complete')">
        Mark Complete
      </button>
      <button v-if="isMyTask && !isCompleted" class="btn-unclaim" @click="$emit('unclaim')">
        Release
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  task: { type: Object, required: true },
  isMyTask: { type: Boolean, default: false },
  isCompleted: { type: Boolean, default: false },
})

defineEmits(['claim', 'complete', 'unclaim'])

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const formatRelativeTime = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const diffMs = now - d
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.task-card {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--r);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.15s;
}

.task-card:hover {
  border-color: var(--mint);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(78, 255, 197, 0.15);
}

.task-card.completed {
  opacity: 0.7;
  background: var(--surface);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.task-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--ink);
  flex: 1;
}

.task-badge {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  white-space: nowrap;
}

.task-badge.high {
  background: rgba(255, 107, 107, 0.15);
  color: #FF6B6B;
}

.task-badge.medium {
  background: rgba(255, 165, 0, 0.15);
  color: #FFA500;
}

.task-badge.low {
  background: rgba(78, 255, 197, 0.15);
  color: var(--mint);
}

.task-description {
  font-size: 13px;
  color: var(--ink-2);
  line-height: 1.5;
}

.task-meta {
  font-size: 12px;
  color: var(--ink-3);
}

.task-meta.claimed {
  color: var(--mint);
  font-weight: 600;
}

.task-meta.completed {
  color: var(--mint);
  font-weight: 600;
}

.task-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.btn-claim,
.btn-complete,
.btn-unclaim {
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
  flex: 1;
}

.btn-claim {
  background: var(--mint);
  color: white;
}

.btn-claim:hover {
  filter: brightness(0.95);
}

.btn-complete {
  background: var(--mint);
  color: white;
}

.btn-complete:hover {
  filter: brightness(0.95);
}

.btn-unclaim {
  background: var(--surface);
  color: var(--ink-2);
  border: 1px solid var(--border);
}

.btn-unclaim:hover {
  background: var(--surface-3);
  color: var(--ink);
}
</style>
