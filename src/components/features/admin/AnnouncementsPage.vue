<template>
  <PageContainer>
    <button class="back-btn" @click="ui.setCurrentTab('admin-hub')">← Admin Hub</button>

    <div class="page-header">
      <h1>📢 Announcements</h1>
      <AppButton v-if="canCreateAnnouncement" variant="primary" @click="showForm = true">+ New announcement</AppButton>
    </div>


    <!-- Create announcement form (admin or staff) -->
    <AppCard v-if="canCreateAnnouncement && showForm" class="form-card">
      <div class="form-header">
        <h2>New Announcement</h2>
        <button class="close-btn" @click="showForm = false">✕</button>
      </div>
      <div class="form-group">
        <label>Title</label>
        <input v-model="form.title" placeholder="Announcement title" />
      </div>
      <div class="form-group">
        <label>Message</label>
        <textarea v-model="form.body" placeholder="Write your announcement..." rows="4"></textarea>
      </div>
      <div class="form-actions">
        <AppButton variant="primary" @click="createAnnouncement" :disabled="!form.title || !form.body || saving">
          {{ saving ? 'Creating...' : 'Publish' }}
        </AppButton>
        <AppButton @click="showForm = false">Cancel</AppButton>
      </div>
    </AppCard>

    <SectionLabel v-if="active.length" >Active announcements</SectionLabel>
    <div v-if="!active.length" class="empty-state">
      <div style="color: var(--ink-3); font-size: 13px; padding: 20px; text-align: center;">No active announcements</div>
    </div>
    <AppCard v-for="a in active" :key="a.id" :flat="true" class="announcement-card">
      <div class="announcement-header">
        <div class="announcement-title">{{ a.title }}</div>
        <div v-if="canCreateAnnouncement" class="announcement-actions">
          <AppButton size="sm" variant="secondary" @click="deleteAnnouncement(a.id)" :disabled="saving">Delete</AppButton>
        </div>
      </div>
      <div class="announcement-date">{{ formatDate(a.createdAt) }}</div>
      <div class="announcement-body">{{ a.body }}</div>
    </AppCard>

    <SectionLabel v-if="previous.length">Previous</SectionLabel>
    <div v-if="!previous.length && active.length" class="empty-state">
      <div style="color: var(--ink-3); font-size: 13px; padding: 20px; text-align: center;">No previous announcements</div>
    </div>
    <AppCard v-for="a in previous" :key="a.id" :flat="true">
      <div class="announcement-header">
        <div class="announcement-title">{{ a.title }}</div>
        <div v-if="canCreateAnnouncement" class="announcement-actions">
          <AppButton size="sm" variant="secondary" @click="deleteAnnouncement(a.id)" :disabled="saving">Delete</AppButton>
        </div>
      </div>
      <div class="announcement-date">{{ formatDate(a.createdAt) }}</div>
      <div v-if="a.body" class="announcement-body">{{ a.body }}</div>
    </AppCard>
  </PageContainer>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref, reactive } from 'vue'
import { PageContainer, AppCard, SectionLabel, AppButton } from '../../ui'
import { useUIStore } from '../../../stores/ui'
import { useAuthStore } from '../../../stores/auth'
import { useAnnouncementsStore } from '../../../stores/announcements'

const ui = useUIStore()
const auth = useAuthStore()
const announcementsStore = useAnnouncementsStore()

const isAdmin = computed(() => auth.user?.role === 'admin')
const canCreateAnnouncement = computed(() => auth.user?.role === 'admin' || auth.user?.role === 'staff')
const showForm = ref(false)
const saving = ref(false)
const form = reactive({
  title: '',
  body: ''
})

const formatDate = (timestamp) => {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  const today = new Date()
  const isToday = date.toDateString() === today.toDateString()
  const isThisYear = date.getFullYear() === today.getFullYear()

  if (isToday) {
    return `Posted today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
  } else if (isThisYear) {
    return `Posted ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
  } else {
    return `Posted ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}`
  }
}

const active = computed(() =>
  announcementsStore.announcements.filter(a => a.active !== false)
)

const previous = computed(() =>
  announcementsStore.announcements.filter(a => a.active === false)
)

const createAnnouncement = async () => {
  if (!form.title || !form.body) return
  saving.value = true
  try {
    await announcementsStore.createAnnouncement({
      title: form.title,
      body: form.body,
      active: true
    })
    form.title = ''
    form.body = ''
    showForm.value = false
  } catch (err) {
    console.error('Failed to create announcement:', err)
  } finally {
    saving.value = false
  }
}

const deleteAnnouncement = async (id) => {
  if (!confirm('Delete this announcement?')) return
  saving.value = true
  try {
    await announcementsStore.deleteAnnouncement(id)
  } catch (err) {
    console.error('Failed to delete announcement:', err)
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await announcementsStore.fetchAnnouncements()
})

onBeforeUnmount(() => {
  announcementsStore.cleanup()
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
  margin-bottom: 16px;
}

.page-header h1 {
  font-size: 22px;
  font-weight: 900;
  color: var(--ink);
  margin: 0;
  font-family: 'Fredoka One', sans-serif;
}

.announcement-card { margin-bottom: 8px; }

.announcement-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 6px;
}

.announcement-actions {
  display: flex;
  gap: 6px;
}

.announcement-title {
  font-size: 13px;
  font-weight: 800;
  color: var(--ink);
  flex: 1;
}

.announcement-date {
  font-size: 10px;
  color: var(--ink-3);
  font-weight: 600;
}

.announcement-body {
  font-size: 12px;
  color: var(--ink-2);
  margin-bottom: 8px;
  line-height: 1.5;
}

.announcement-badge {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  color: var(--ink-3);
  background: var(--surface-2);
  padding: 4px 8px;
  border-radius: 4px;
}

.form-card { margin-bottom: 16px; }

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.form-header h2 {
  font-size: 16px;
  font-weight: 800;
  color: var(--ink);
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: var(--ink-3);
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
}

.close-btn:hover { color: var(--ink); }

.form-group {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-group label {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--ink-3);
  letter-spacing: .05em;
}

.form-group input,
.form-group textarea {
  padding: 10px 12px;
  background: var(--surface-2);
  border: 1.5px solid var(--border);
  border-radius: 8px;
  color: var(--ink);
  font-size: 13px;
  font-family: 'Nunito', sans-serif;
  resize: vertical;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--mint);
}

.form-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}
</style>
