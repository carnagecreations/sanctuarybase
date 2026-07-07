<template>
  <PageContainer>
    <!-- Hero Banner -->
    <div class="hub-hero">
      <div class="hero-content">
        <div class="hero-icon">📋</div>
        <div class="hero-title">Volunteer Tasks</div>
        <div class="hero-sub">Claim tasks and help the sanctuary</div>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="hub-tabs">
      <button
        v-for="t in tabs"
        :key="t.id"
        class="hub-tab"
        :class="{ active: activeTab === t.id }"
        @click="activeTab = t.id"
      >{{ t.emoji }} {{ t.label }}</button>
    </div>

    <!-- Available Tasks -->
    <template v-if="activeTab === 'available'">
      <div class="tasks-section">
        <div class="section-title">Available Tasks ({{ availableTasks.length }})</div>
        <template v-if="availableTasks.length > 0">
          <div class="tasks-grid">
            <TaskCard
              v-for="task in availableTasks"
              :key="task.id"
              :task="task"
              @claim="claimTask(task)"
            />
          </div>
        </template>
        <EmptyState v-else icon="✅" title="All caught up!" message="No tasks available right now. Check back soon!" />
      </div>
    </template>

    <!-- My Tasks (Claimed) -->
    <template v-if="activeTab === 'claimed'">
      <div class="tasks-section">
        <div class="section-title">My Tasks ({{ myTasks.length }})</div>
        <template v-if="myTasks.length > 0">
          <div class="tasks-grid">
            <TaskCard
              v-for="task in myTasks"
              :key="task.id"
              :task="task"
              :is-my-task="true"
              @complete="completeTask(task)"
              @unclaim="unclaimTask(task)"
            />
          </div>
        </template>
        <EmptyState v-else icon="🎯" title="No claimed tasks" message="Claim a task from the Available tab to get started!" />
      </div>
    </template>

    <!-- Completed Tasks -->
    <template v-if="activeTab === 'completed'">
      <div class="tasks-section">
        <div class="section-title">Completed Tasks ({{ completedTasks.length }})</div>
        <template v-if="completedTasks.length > 0">
          <div class="tasks-grid">
            <TaskCard
              v-for="task in completedTasks"
              :key="task.id"
              :task="task"
              :is-completed="true"
            />
          </div>
        </template>
        <EmptyState v-else icon="🏁" title="No completed tasks yet" message="Complete tasks from your 'My Tasks' to see them here!" />
      </div>
    </template>
  </PageContainer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { PageContainer, EmptyState } from '../ui'
import { useTasksStore } from '../../stores/tasks'
import { useAuthStore } from '../../stores/auth'
import { useUIStore } from '../../stores/ui'
import TaskCard from './VolunteerTaskCard.vue'

const tasksStore = useTasksStore()
const authStore = useAuthStore()
const ui = useUIStore()

const tabs = [
  { id: 'available', emoji: '📍', label: 'Available' },
  { id: 'claimed', emoji: '✋', label: 'My Tasks' },
  { id: 'completed', emoji: '✅', label: 'Completed' },
]

const activeTab = ref('available')
const currentVolunteer = computed(() => authStore.user?.id)

const allTasks = computed(() => tasksStore.tasks || [])

const availableTasks = computed(() =>
  allTasks.value.filter(t => !t.claimedBy || t.claimedBy === '')
)

const myTasks = computed(() =>
  allTasks.value.filter(t => t.claimedBy === currentVolunteer.value && t.status !== 'completed')
)

const completedTasks = computed(() =>
  allTasks.value.filter(t => t.completedBy === currentVolunteer.value)
)

const claimTask = async (task) => {
  try {
    await tasksStore.updateTask(task.id, {
      claimedBy: currentVolunteer.value,
      claimedDate: new Date().toISOString(),
      status: 'in-progress',
    })
    ui.showToast(`✋ Task claimed: ${task.title}`)
  } catch (err) {
    ui.showToast('Error claiming task', 'error')
  }
}

const completeTask = async (task) => {
  try {
    await tasksStore.updateTask(task.id, {
      completedBy: currentVolunteer.value,
      completedDate: new Date().toISOString(),
      status: 'completed',
    })
    ui.showToast(`✅ Task completed: ${task.title}`)
  } catch (err) {
    ui.showToast('Error completing task', 'error')
  }
}

const unclaimTask = async (task) => {
  try {
    await tasksStore.updateTask(task.id, {
      claimedBy: '',
      status: 'available',
    })
    ui.showToast(`Released: ${task.title}`)
  } catch (err) {
    ui.showToast('Error releasing task', 'error')
  }
}

onMounted(() => tasksStore.fetchTasks())
</script>

<style scoped>
.hub-hero {
  background: linear-gradient(135deg, #4EFFC5 0%, #FF6B9D 100%);
  border-radius: var(--r);
  padding: 40px 24px;
  text-align: center;
  color: white;
  margin-bottom: 24px;
}

.hero-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.hero-icon {
  font-size: 48px;
}

.hero-title {
  font-family: 'Fredoka One', sans-serif;
  font-size: 28px;
  font-weight: 900;
  margin: 0;
}

.hero-sub {
  font-size: 14px;
  opacity: 0.9;
}

.hub-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 2px solid var(--border);
}

.hub-tab {
  padding: 12px 16px;
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 700;
  color: var(--ink-3);
  cursor: pointer;
  transition: all 0.15s;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
}

.hub-tab:hover {
  color: var(--ink);
}

.hub-tab.active {
  color: var(--mint);
  border-bottom-color: var(--mint);
}

.tasks-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--ink);
}

.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

@media (max-width: 640px) {
  .tasks-grid {
    grid-template-columns: 1fr;
  }
}
</style>
