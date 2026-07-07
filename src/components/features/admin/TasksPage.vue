<template>
  <PageContainer>
    <div class="page-header">
      <h1>✅ Tasks</h1>
      <AppButton variant="primary" @click="showAdd = true">+ New Task</AppButton>
    </div>

    <!-- Add Task Form -->
    <AppCard v-if="showAdd" :flat="true" style="margin-bottom: 16px;">
      <div class="form-group">
        <div class="form-label">Task Title *</div>
        <AppInput v-model="newTask.title" placeholder="e.g., Order hay for horses" />
      </div>
      <div class="form-group">
        <div class="form-label">Description</div>
        <textarea v-model="newTask.description" placeholder="Details about the task..." class="task-textarea"></textarea>
      </div>
      <div class="form-row">
        <div class="form-group">
          <div class="form-label">Priority</div>
          <AppSelect v-model="newTask.priority" :options="priorityOptions" />
        </div>
        <div class="form-group">
          <div class="form-label">Repeat</div>
          <AppSelect v-model="newTask.frequency" :options="frequencyOptions" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group" v-if="newTask.frequency === 'none'">
          <div class="form-label">Due Date</div>
          <AppInput v-model="newTask.dueDate" type="date" />
        </div>
        <div class="form-group" v-if="newTask.frequency === 'weekly'">
          <div class="form-label">Every</div>
          <AppSelect v-model="newTask.weekday" :options="weekdayOptions" />
        </div>
        <div class="form-group" v-if="newTask.frequency === 'monthly'">
          <div class="form-label">On Day of Month (1–28)</div>
          <AppInput v-model="newTask.monthday" type="number" min="1" max="28" />
        </div>
      </div>
      <div class="form-actions">
        <AppButton variant="primary" @click="addTask" :disabled="!newTask.title.trim()">
          {{ newTask.frequency === 'none' ? 'Add Task' : 'Add Recurring Task' }}
        </AppButton>
        <AppButton @click="showAdd = false">Cancel</AppButton>
      </div>
    </AppCard>

    <!-- Recurring task templates -->
    <template v-if="recurringTemplates.length">
      <SectionLabel>Recurring</SectionLabel>
      <AppCard :flat="true" style="margin-bottom: 16px;">
        <div class="divide-list">
          <div v-for="tpl in recurringTemplates" :key="tpl.id" class="task-item">
            <span class="repeat-icon" aria-hidden="true">🔁</span>
            <div class="task-info">
              <div class="task-title">{{ tpl.title }}</div>
              <div v-if="tpl.description" class="task-desc">{{ tpl.description }}</div>
              <div class="task-meta">
                <span class="priority" :class="'priority-' + (tpl.priority || 'medium').toLowerCase()">{{ tpl.priority || 'Medium' }}</span>
                <span class="recur-label">{{ recurrenceLabel(tpl) }}</span>
              </div>
            </div>
            <AppButton size="sm" variant="danger" @click="removeTemplate(tpl.id)">Delete</AppButton>
          </div>
        </div>
      </AppCard>
    </template>

    <!-- Tasks by Status -->
    <SectionLabel>Pending</SectionLabel>
    <AppCard v-if="pendingTasks.length" :flat="true">
      <div class="divide-list">
        <div v-for="t in pendingTasks" :key="t.id" class="task-item">
          <input type="checkbox" @change="toggleTask(t)" class="task-checkbox" />
          <div class="task-info">
            <div class="task-title">{{ t.title }}</div>
            <div v-if="t.description" class="task-desc">{{ t.description }}</div>
            <div class="task-meta">
              <span class="priority" :class="'priority-' + (t.priority || 'medium').toLowerCase()">{{ t.priority || 'Medium' }}</span>
              <span v-if="t.dueDate">📅 {{ formatDate(t.dueDate) }}</span>
            </div>
          </div>
          <AppButton size="sm" variant="danger" @click="removeTask(t.id)">Delete</AppButton>
        </div>
      </div>
    </AppCard>
    <EmptyState v-else icon="🎯" title="No pending tasks" message="Great progress! All tasks are complete." />

    <SectionLabel style="margin-top: 16px;">Completed</SectionLabel>
    <AppCard v-if="completedTasks.length" :flat="true">
      <div class="divide-list">
        <div v-for="t in completedTasks" :key="t.id" class="task-item done">
          <input type="checkbox" checked @change="toggleTask(t)" class="task-checkbox" />
          <div class="task-info">
            <div class="task-title done">{{ t.title }}</div>
          </div>
          <AppButton size="sm" variant="danger" @click="removeTask(t.id)">Delete</AppButton>
        </div>
      </div>
    </AppCard>
    <EmptyState v-else icon="📭" title="No completed tasks" />

  </PageContainer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { PageContainer, AppCard, SectionLabel, AppButton, AppInput, AppSelect, EmptyState } from '../../ui'
import { useTasksStore } from '../../../stores/tasks'
import { useRecurringTasksStore } from '../../../stores/recurringTasks'
import { useUIStore } from '../../../stores/ui'

const tasksStore = useTasksStore()
const recurringStore = useRecurringTasksStore()
const ui = useUIStore()

const showAdd = ref(false)
const newTask = ref({
  title: '',
  description: '',
  priority: 'Medium',
  dueDate: '',
  frequency: 'none',
  weekday: '1',
  monthday: '1',
})

const priorityOptions = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
]

const frequencyOptions = [
  { value: 'none', label: 'Does not repeat' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]

const weekdayOptions = [
  { value: '0', label: 'Sunday' },
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
]

const recurringTemplates = computed(() => recurringStore.templates || [])

const recurrenceLabel = (tpl) => {
  if (tpl.frequency === 'daily') return '🔁 Every day'
  if (tpl.frequency === 'weekly') {
    const day = weekdayOptions.find(o => Number(o.value) === Number(tpl.weekday))?.label || 'Sunday'
    return `🔁 Weekly on ${day}`
  }
  if (tpl.frequency === 'monthly') return `🔁 Monthly on day ${tpl.monthday || 1}`
  return ''
}

const allTasks = computed(() => tasksStore.tasks || [])
const pendingTasks = computed(() => allTasks.value.filter(t => !t.completed))
const completedTasks = computed(() => allTasks.value.filter(t => t.completed))

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const addTask = async () => {
  if (!newTask.value.title.trim()) return
  try {
    if (newTask.value.frequency !== 'none') {
      await recurringStore.addTemplate({
        title: newTask.value.title,
        description: newTask.value.description,
        priority: newTask.value.priority,
        frequency: newTask.value.frequency,
        weekday: newTask.value.weekday,
        monthday: newTask.value.monthday,
      })
      // Materialize the current period's instance right away if it's due
      await recurringStore.generateDueTasks()
      ui.showToast('Recurring task added')
    } else {
      await tasksStore.addTask({
        title: newTask.value.title,
        description: newTask.value.description,
        priority: newTask.value.priority,
        dueDate: newTask.value.dueDate,
      })
      ui.showToast('Task added')
    }
    newTask.value = { title: '', description: '', priority: 'Medium', dueDate: '', frequency: 'none', weekday: '1', monthday: '1' }
    showAdd.value = false
  } catch {
    ui.showToast('Failed to add task', 'error')
  }
}

const removeTemplate = async (id) => {
  try {
    await recurringStore.deleteTemplate(id)
    ui.showToast('Recurring task removed — existing tasks were kept')
  } catch {
    ui.showToast('Failed to remove recurring task', 'error')
  }
}

const toggleTask = async (task) => {
  try {
    await tasksStore.updateTask(task.id, { completed: !task.completed })
  } catch {
    ui.showToast('Failed to update task', 'error')
  }
}

const removeTask = async (id) => {
  try {
    await tasksStore.deleteTask(id)
    ui.showToast('Task deleted')
  } catch {
    ui.showToast('Failed to delete task', 'error')
  }
}

onMounted(async () => {
  await tasksStore.fetchTasks()
  await recurringStore.fetchTemplates()
  // Catch up any due recurring tasks when an admin opens this page
  const created = await recurringStore.generateDueTasks()
  if (created > 0) ui.showToast(`${created} recurring task${created > 1 ? 's' : ''} added for this period`)
})
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-header h1 {
  font-size: 20px;
  font-weight: 900;
  color: var(--ink);
  margin: 0;
}

.form-group {
  margin-bottom: 12px;
}

.form-label {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--ink-3);
  margin-bottom: 4px;
  display: block;
}

.task-textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: var(--r);
  background: var(--surface-2);
  color: var(--ink);
  font-size: 12px;
  font-family: 'Nunito', sans-serif;
  resize: vertical;
  min-height: 60px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.divide-list > * + * { border-top: 1px solid var(--border); }

.task-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 0;
}

.task-item.done {
  opacity: 0.6;
}

.task-checkbox {
  margin-top: 3px;
  cursor: pointer;
  flex-shrink: 0;
}

.task-info {
  flex: 1;
  min-width: 0;
}

.task-title {
  font-size: 13px;
  font-weight: 800;
  color: var(--ink);
  margin-bottom: 4px;
}

.task-title.done {
  text-decoration: line-through;
  color: var(--ink-3);
}

.task-desc {
  font-size: 12px;
  color: var(--ink-3);
  margin-bottom: 6px;
  font-weight: 600;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: var(--ink-3);
  font-weight: 600;
}

.priority {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
}

.priority-low {
  background: rgba(52, 211, 153, 0.15);
  color: var(--mint);
}

.priority-medium {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
}

.priority-high {
  background: rgba(255, 122, 69, 0.15);
  color: var(--coral);
}

.repeat-icon {
  margin-top: 2px;
  flex-shrink: 0;
  font-size: 14px;
}

.recur-label {
  font-weight: 700;
}
</style>
