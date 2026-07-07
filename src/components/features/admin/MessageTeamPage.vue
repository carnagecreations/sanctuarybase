<template>
  <PageContainer>
    <div class="msg-container">
      <!-- Header -->
      <div class="msg-header">
        <div>
          <h1 class="msg-title">Team Messages</h1>
          <p class="msg-subtitle">Send announcements and updates to your volunteers</p>
        </div>
      </div>

      <div class="msg-grid">
        <!-- Left Column: Compose -->
        <div class="msg-column">
          <MessageComposeCard @sent="onMessageSent" @toast="showToast" />
        </div>

        <!-- Delete Confirmation Dialog -->
        <DeleteMessageDialog
          :show="deleteConfirmShow"
          :loading="deleteConfirmLoading"
          @cancel="cancelDelete"
          @confirm="confirmDelete"
        />

        <!-- Right Column: Message History -->
        <div class="msg-column">
          <MessageHistoryCard
            :messages="messages"
            :loading="loadingMessages"
            @delete="handleDeleteMessage"
          />
        </div>
      </div>

      <!-- Toast Notification -->
      <Transition name="toast">
        <div v-if="toastMessage" :class="['toast-notification', toastType]">
          {{ toastMessage }}
        </div>
      </Transition>
    </div>
  </PageContainer>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import PageContainer from '../../ui/PageContainer.vue'
import { useMessagesStore } from '../../../stores/messages'
import MessageComposeCard from './message-team/MessageComposeCard.vue'
import MessageHistoryCard from './message-team/MessageHistoryCard.vue'
import DeleteMessageDialog from './message-team/DeleteMessageDialog.vue'

const messagesStore = useMessagesStore()

// Data
const messages = ref([])

// States
const loadingMessages = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

// Dialogs
const deleteConfirmShow = ref(false)
const deleteMessageItem = ref(null)
const deleteConfirmLoading = ref(false)

const showToast = (message, type = 'success', duration = 3000) => {
  toastMessage.value = message
  toastType.value = type
  setTimeout(() => {
    toastMessage.value = ''
  }, duration)
}

const onMessageSent = () => {
  // Refresh messages after the compose card sends one
  messages.value = messagesStore.messages
}

const handleDeleteMessage = (messageId) => {
  const msg = messages.value.find(m => m.id === messageId)
  if (msg) {
    deleteMessageItem.value = msg
    deleteConfirmShow.value = true
  }
}

const cancelDelete = () => {
  deleteConfirmShow.value = false
  deleteMessageItem.value = null
}

const confirmDelete = async () => {
  if (!deleteMessageItem.value?.id) return

  deleteConfirmLoading.value = true
  try {
    await messagesStore.deleteMessage(deleteMessageItem.value.id)
    messages.value = messagesStore.messages
    showToast('Message deleted successfully', 'success')
    deleteConfirmShow.value = false
    deleteMessageItem.value = null
  } catch (err) {
    console.error('Failed to delete message:', err)
    showToast('Failed to delete message', 'error')
  } finally {
    deleteConfirmLoading.value = false
  }
}

onMounted(() => {
  // Load messages asynchronously without blocking
  loadingMessages.value = true
  messagesStore.fetchMessages()
    .then(() => {
      messages.value = messagesStore.messages
    })
    .catch(err => {
      console.error('Failed to load messages:', err)
      showToast('Failed to load messages', 'error')
    })
    .finally(() => {
      loadingMessages.value = false
    })
})
</script>

<style scoped>
.msg-container {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.msg-header {
  padding: 8px 0;
}

.msg-title {
  font-size: 28px;
  font-weight: 900;
  color: var(--ink);
  margin: 0;
  letter-spacing: -0.5px;
}

.msg-subtitle {
  font-size: 13px;
  color: var(--ink-3);
  margin: 6px 0 0 0;
}

/* Grid Layout */
.msg-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  min-height: calc(100vh - 280px);
}

.msg-column {
  display: flex;
  flex-direction: column;
}

@media (max-width: 1200px) {
  .msg-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

/* Toast Notification */
.toast-notification {
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 14px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  z-index: 1000;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border);
  max-width: 300px;
}

.toast-notification.success {
  background: rgba(78, 255, 197, 0.1);
  color: var(--mint);
  border-color: rgba(78, 255, 197, 0.2);
}

.toast-notification.error {
  background: rgba(255, 107, 107, 0.1);
  color: var(--coral);
  border-color: rgba(255, 107, 107, 0.2);
}

/* Toast Animation */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translateX(400px);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(400px);
  opacity: 0;
}
</style>
