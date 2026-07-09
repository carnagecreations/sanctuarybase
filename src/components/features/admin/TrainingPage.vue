<template>
  <PageContainer>
    <div class="training-hub">
      <!-- Header -->
      <div class="hub-header">
        <h1 class="hub-title">🎓 Volunteer Training & Resources</h1>
        <p class="hub-subtitle">Your one-stop guide to sanctuary care, animal safety, and volunteer success.</p>
      </div>

      <!-- Admin: add a module anywhere -->
      <AppButton v-if="isAdmin" variant="primary" @click="startCreate()">+ Add module</AppButton>

      <!-- Create/Edit module (admin only) -->
      <AppModal
        v-if="isAdmin && showForm"
        :open="true"
        :title="editingId ? 'Edit Module' : 'New Module'"
        size="lg"
        @close="cancelForm"
      >
        <div class="form-group">
          <label>Section</label>
          <input v-model="form.section" placeholder="e.g. Getting Started, Care Tasks" />
        </div>
        <div class="form-group">
          <label>Icon (emoji)</label>
          <input v-model="form.icon" placeholder="👋" maxlength="4" />
        </div>
        <div class="form-group">
          <label>Title</label>
          <input v-model="form.title" placeholder="Module title" />
        </div>
        <div class="form-group">
          <label>Description (short teaser shown on the card)</label>
          <textarea v-model="form.description" placeholder="What this module covers..." rows="2"></textarea>
        </div>
        <div class="form-group">
          <label>Content (full text shown when a volunteer opens the module)</label>
          <textarea v-model="form.content" placeholder="The full training text goes here..." rows="6"></textarea>
        </div>
        <div class="form-group">
          <label>Order (lower shows first within its section)</label>
          <input v-model.number="form.order" type="number" />
        </div>

        <div class="quiz-editor">
          <div class="quiz-editor-header">
            <label>Quiz (optional)</label>
            <button type="button" class="text-btn" @click="addQuestion">+ Add question</button>
          </div>
          <p v-if="!form.quiz.length" class="empty-note">No quiz questions yet.</p>
          <div v-for="(q, qi) in form.quiz" :key="qi" class="quiz-question-editor">
            <div class="quiz-question-editor-row">
              <input v-model="q.question" placeholder="Question text" />
              <button type="button" class="icon-action" title="Remove question" @click="removeQuestion(qi)">🗑️</button>
            </div>
            <label v-for="(opt, oi) in q.options" :key="oi" class="quiz-option-editor">
              <input type="radio" :name="'correct-' + qi" :checked="q.correctIndex === oi" @change="q.correctIndex = oi" />
              <input v-model="q.options[oi]" placeholder="Option text" />
              <button v-if="q.options.length > 2" type="button" class="icon-action" title="Remove option" @click="removeOption(qi, oi)">✕</button>
            </label>
            <button v-if="q.options.length < 4" type="button" class="text-btn" @click="addOption(qi)">+ Add option</button>
          </div>
        </div>

        <template #actions>
          <AppButton variant="primary" @click="saveModule" :disabled="!form.title || saving">
            {{ saving ? 'Saving...' : (editingId ? 'Save changes' : 'Add module') }}
          </AppButton>
          <AppButton @click="cancelForm">Cancel</AppButton>
        </template>
      </AppModal>

      <!-- Read a module / take its quiz (everyone) -->
      <AppModal
        v-if="readingModule"
        :open="true"
        :title="readingModule.title"
        size="lg"
        @close="closeReadModal"
      >
        <div class="read-icon">{{ readingModule.icon || '📘' }}</div>
        <p class="read-content">{{ readingModule.content || readingModule.description }}</p>

        <template v-if="readingModule.quiz?.length">
          <SectionLabel>Quiz</SectionLabel>

          <div v-if="ownCompletion && !retaking" class="quiz-result-summary">
            <p>{{ ownCompletion.passed ? '✅ Passed' : '❌ Not passed yet' }} — scored {{ ownCompletion.score }}/{{ ownCompletion.total }}</p>
            <AppButton size="sm" @click="startQuiz">Retake quiz</AppButton>
          </div>

          <div v-else>
            <div v-for="(q, qi) in readingModule.quiz" :key="qi" class="quiz-question">
              <p class="quiz-question-text">{{ qi + 1 }}. {{ q.question }}</p>
              <label v-for="(opt, oi) in q.options" :key="oi" class="quiz-option">
                <input type="radio" :name="'take-' + qi" :value="oi" v-model.number="quizAnswers[qi]" />
                {{ opt }}
              </label>
            </div>
            <AppButton
              variant="primary"
              :disabled="Object.keys(quizAnswers).length < readingModule.quiz.length || submittingQuiz"
              @click="submitQuiz"
            >
              {{ submittingQuiz ? 'Submitting...' : 'Submit quiz' }}
            </AppButton>
          </div>
        </template>

        <template v-if="isAdmin && readingModule.quiz?.length">
          <SectionLabel>Completions ({{ moduleCompletions.length }})</SectionLabel>
          <div v-if="moduleCompletions.length" class="completions-list">
            <div v-for="c in moduleCompletions" :key="c.id" class="completion-row">
              <span>{{ c.userName || c.userEmail }}</span>
              <span>{{ c.passed ? '✅' : '❌' }} {{ c.score }}/{{ c.total }}</span>
            </div>
          </div>
          <p v-else class="empty-note">No one has taken this quiz yet.</p>
        </template>

        <template #actions>
          <AppButton v-if="isAdmin" size="sm" @click="startEditContent">✏️ Edit content</AppButton>
          <AppButton @click="closeReadModal">Close</AppButton>
        </template>
      </AppModal>

      <!-- Dedicated content editor (admin only) -->
      <AppModal
        v-if="editingContent"
        :open="true"
        :title="`Edit: ${readingModule?.title}`"
        size="lg"
        @close="cancelEditContent"
      >
        <SectionLabel>Module Content</SectionLabel>
        <div class="content-editor-container">
          <textarea v-model="contentDraft" class="content-editor" placeholder="Enter the full training content here..." />
        </div>

        <SectionLabel>Quiz Questions</SectionLabel>
        <p class="section-note">Leave empty for no quiz. Each question needs 2-4 options with one marked as correct.</p>

        <div v-if="!quizDraft.length" class="empty-note">
          No quiz questions yet.
          <AppButton size="sm" @click="quizDraft.push({ question: '', options: ['', ''], correctIndex: 0 })" class="add-btn">
            + Add question
          </AppButton>
        </div>

        <div v-for="(q, qi) in quizDraft" :key="qi" class="quiz-editor-section">
          <div class="quiz-question-header">
            <span class="quiz-question-number">Question {{ qi + 1 }}</span>
            <button type="button" class="icon-action" @click="quizDraft.splice(qi, 1)" title="Delete question">🗑️</button>
          </div>

          <div class="form-group">
            <label>Question text</label>
            <input v-model="q.question" placeholder="What is...?" />
          </div>

          <div class="form-group">
            <label>Options (select correct answer)</label>
            <div v-for="(opt, oi) in q.options" :key="oi" class="quiz-option-editor">
              <input type="radio" :name="'q' + qi" :value="oi" v-model.number="q.correctIndex" />
              <input v-model="q.options[oi]" placeholder="Option text" />
              <button v-if="q.options.length > 2" type="button" class="icon-action" @click="q.options.splice(oi, 1)">✕</button>
            </div>
            <button v-if="q.options.length < 4" type="button" class="text-btn" @click="q.options.push('')">
              + Add option
            </button>
          </div>
        </div>

        <div v-if="quizDraft.length" class="add-question-btn">
          <button type="button" class="text-btn" @click="quizDraft.push({ question: '', options: ['', ''], correctIndex: 0 })">
            + Add question
          </button>
        </div>

        <template #actions>
          <AppButton variant="primary" @click="saveContentEdit" :disabled="savingContent">
            {{ savingContent ? 'Saving...' : 'Save all changes' }}
          </AppButton>
          <AppButton @click="cancelEditContent">Cancel</AppButton>
        </template>
      </AppModal>

      <!-- Dynamic training module sections -->
      <template v-for="group in groupedModules" :key="group.section">
        <SectionLabel>{{ group.section }}</SectionLabel>
        <div class="cards-grid">
          <AppCard v-for="m in group.items" :key="m.id" variant="elevated" interactive class="training-card" @click="openReadModal(m)">
            <div v-if="isAdmin" class="card-admin-actions">
              <button class="icon-action" title="Edit" @click.stop="startEdit(m)">✏️</button>
              <button class="icon-action" title="Delete" @click.stop="removeModule(m)">🗑️</button>
            </div>
            <div class="card-icon">{{ m.icon || '📘' }}</div>
            <h3 class="card-title">{{ m.title }}</h3>
            <p class="card-description">{{ m.description }}</p>
            <p v-if="m.quiz?.length" class="quiz-badge">📝 Includes a quiz</p>
          </AppCard>
        </div>
      </template>
      <div v-if="isAdmin && !groupedModules.length && !showForm" class="no-announcements">
        <p>No training modules yet — click "+ Add module" to create the first one.</p>
      </div>

      <!-- Animals Section -->
      <SectionLabel>Know Your Animals</SectionLabel>
      <AppCard variant="elevated" class="animals-card">
        <h3 class="card-title">How to Handle Different Species</h3>
        <div class="animals-content">
          <div class="animal-type">
            <strong>🐕 Dogs:</strong> Understand temperament assessment, safe handling techniques, and building trust with sanctuary canines.
          </div>
          <div class="animal-type">
            <strong>🐈 Cats:</strong> Learn feline behavior signals, stress indicators, enrichment needs, and proper holding methods.
          </div>
          <div class="animal-type">
            <strong>🐴 Horses:</strong> Master safe ground work, tack care, health monitoring, and pasture management protocols.
          </div>
          <div class="animal-type">
            <strong>🚜 Farm Animals:</strong> Care for goats, sheep, pigs, and poultry with species-specific handling and nutrition guidance.
          </div>
        </div>
      </AppCard>

      <!-- Support Section -->
      <SectionLabel>Support & Resources</SectionLabel>
      <div class="support-grid">
        <AppCard variant="elevated" interactive class="support-card" @click="openContactModal">
          <div class="card-icon">❓</div>
          <h3 class="card-title">Questions?</h3>
          <p class="card-description">Contact our staff for immediate help and guidance on any sanctuary topic.</p>
        </AppCard>
      </div>

      <!-- Contact info + ask-a-question (everyone reads/asks, admin edits/answers) -->
      <AppModal v-if="showContactModal" :open="true" title="Questions?" size="lg" @close="closeContactModal">
        <div v-if="!editingContact">
          <p v-if="settingsStore.contact?.email"><strong>Email:</strong> {{ settingsStore.contact.email }}</p>
          <p v-if="settingsStore.contact?.note">{{ settingsStore.contact.note }}</p>
          <p v-if="!settingsStore.contact" class="empty-note">No contact info set yet.</p>
          <AppButton v-if="isAdmin" size="sm" @click="startEditContact">✏️ Edit contact info</AppButton>
        </div>
        <div v-else>
          <div class="form-group">
            <label>Email</label>
            <input v-model="contactDraft.email" placeholder="hello@sfrescue.org" />
          </div>
          <div class="form-group">
            <label>Note</label>
            <textarea v-model="contactDraft.note" rows="3" placeholder="Anything else volunteers should know..."></textarea>
          </div>
          <AppButton variant="primary" @click="saveContact" :disabled="savingContact">
            {{ savingContact ? 'Saving...' : 'Save' }}
          </AppButton>
          <AppButton @click="editingContact = false">Cancel</AppButton>
        </div>

        <SectionLabel>Ask a question</SectionLabel>
        <div class="form-group">
          <textarea v-model="questionDraft" rows="3" placeholder="Type your question here..."></textarea>
        </div>
        <AppButton
          variant="primary"
          @click="submitQuestion"
          :disabled="!questionDraft.trim() || submittingQuestion"
        >
          {{ submittingQuestion ? 'Sending...' : 'Send question' }}
        </AppButton>

        <template v-if="!isAdmin && questionsStore.questions.length">
          <SectionLabel>Your questions</SectionLabel>
          <div v-for="q in questionsStore.questions" :key="q.id" class="question-row">
            <p class="question-text">{{ q.question }}</p>
            <p v-if="q.status === 'answered'" class="question-answer">💬 {{ q.answer }}</p>
            <p v-else class="question-pending">⏳ Waiting for a reply</p>
          </div>
        </template>

        <template v-if="isAdmin">
          <SectionLabel>Volunteer Questions ({{ openQuestionsCount }} open)</SectionLabel>
          <p v-if="!questionsStore.questions.length" class="empty-note">No questions yet.</p>
          <div v-for="q in questionsStore.questions" :key="q.id" class="question-row">
            <div class="question-row-header">
              <p class="question-meta">{{ q.askedByName || q.askedByEmail }} · {{ formatDate(q.createdAt) }}</p>
              <button class="icon-action" title="Delete question" @click="deleteQuestion(q)">🗑️</button>
            </div>
            <p class="question-text">{{ q.question }}</p>
            <p v-if="q.status === 'answered'" class="question-answer">💬 {{ q.answer }}</p>
            <div v-else class="reply-row">
              <input v-model="replyDrafts[q.id]" placeholder="Type a reply..." />
              <AppButton size="sm" @click="sendReply(q)" :disabled="!replyDrafts[q.id]?.trim()">Reply</AppButton>
            </div>
          </div>
        </template>

        <template #actions>
          <AppButton @click="closeContactModal">Close</AppButton>
        </template>
      </AppModal>
    </div>
  </PageContainer>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, computed } from 'vue'
import { useTrainingStore } from '../../../stores/training'
import { useTrainingCompletionsStore } from '../../../stores/trainingCompletions'
import { useSettingsStore } from '../../../stores/settings'
import { useVolunteerQuestionsStore } from '../../../stores/volunteerQuestions'
import { useAuthStore } from '../../../stores/auth'
import { PageContainer, AppCard, AppModal, SectionLabel, AppButton } from '../../ui'

const trainingStore = useTrainingStore()
const completionsStore = useTrainingCompletionsStore()
const settingsStore = useSettingsStore()
const questionsStore = useVolunteerQuestionsStore()
const auth = useAuthStore()

const isAdmin = computed(() => auth.user?.role === 'admin')

// Modules grouped by section, preserving each section's first-appearance
// order (not alphabetical) so admins control ordering purely via drag-free
// `order` numbers rather than fighting section naming.
const groupedModules = computed(() => {
  const groups = []
  const bySection = new Map()
  for (const m of trainingStore.sortedModules) {
    const section = m.section?.trim() || 'General'
    if (!bySection.has(section)) {
      const group = { section, items: [] }
      bySection.set(section, group)
      groups.push(group)
    }
    bySection.get(section).items.push(m)
  }
  return groups
})

const showForm = ref(false)
const editingId = ref(null)
const saving = ref(false)
const form = reactive({ section: '', icon: '', title: '', description: '', content: '', order: 0, quiz: [] })

const startCreate = (section = '') => {
  editingId.value = null
  Object.assign(form, { section, icon: '', title: '', description: '', content: '', order: 0, quiz: [] })
  showForm.value = true
}

const startEdit = (m) => {
  editingId.value = m.id
  Object.assign(form, {
    section: m.section || '',
    icon: m.icon || '',
    title: m.title || '',
    description: m.description || '',
    content: m.content || '',
    order: m.order ?? 0,
    // Deep-clone so editing in the form doesn't mutate the store's copy
    // before Save is actually clicked.
    quiz: m.quiz ? JSON.parse(JSON.stringify(m.quiz)) : [],
  })
  showForm.value = true
}

const cancelForm = () => {
  showForm.value = false
  editingId.value = null
}

const addQuestion = () => {
  form.quiz.push({ question: '', options: ['', ''], correctIndex: 0 })
}

const removeQuestion = (qi) => {
  form.quiz.splice(qi, 1)
}

const addOption = (qi) => {
  if (form.quiz[qi].options.length < 4) form.quiz[qi].options.push('')
}

const removeOption = (qi, oi) => {
  const q = form.quiz[qi]
  if (q.options.length <= 2) return
  q.options.splice(oi, 1)
  if (q.correctIndex >= q.options.length) q.correctIndex = q.options.length - 1
  else if (q.correctIndex > oi) q.correctIndex--
}

const saveModule = async () => {
  if (!form.title) return
  saving.value = true
  try {
    const data = { ...form }
    if (editingId.value) {
      await trainingStore.updateTrainingModule(editingId.value, data)
    } else {
      await trainingStore.createTrainingModule(data)
    }
    cancelForm()
  } catch (err) {
    console.error('Failed to save training module:', err)
  } finally {
    saving.value = false
  }
}

const removeModule = async (m) => {
  if (!confirm(`Delete "${m.title}"?`)) return
  try {
    await trainingStore.deleteTrainingModule(m.id)
  } catch (err) {
    console.error('Failed to delete training module:', err)
  }
}

// ── Read a module / take its quiz ──────────────────────────────────────────
const readingModule = ref(null)
const ownCompletion = ref(null)
const retaking = ref(false)
const submittingQuiz = ref(false)
const quizAnswers = reactive({})

const moduleCompletions = computed(() =>
  completionsStore.completions.filter(c => c.moduleId === readingModule.value?.id)
)

const openReadModal = async (m) => {
  readingModule.value = m
  retaking.value = false
  ownCompletion.value = null
  Object.keys(quizAnswers).forEach(k => delete quizAnswers[k])
  if (m.quiz?.length && auth.user?.id) {
    ownCompletion.value = await completionsStore.fetchOwnCompletion(m.id, auth.user.id)
    if (isAdmin.value) completionsStore.watchModule(m.id)
  }
}

const closeReadModal = () => {
  if (readingModule.value?.id && isAdmin.value) completionsStore.unwatchModule(readingModule.value.id)
  readingModule.value = null
  editingContent.value = false
}

// ── Dedicated content editor ─────────────────────────────────────────────────
const editingContent = ref(false)
const contentDraft = ref('')
const quizDraft = ref([])
const savingContent = ref(false)

const startEditContent = () => {
  // Use content if it exists, otherwise fall back to description (for backward compatibility with seeded modules)
  contentDraft.value = readingModule.value?.content || readingModule.value?.description || ''
  // Deep clone quiz so editing doesn't mutate the store
  quizDraft.value = readingModule.value?.quiz ? JSON.parse(JSON.stringify(readingModule.value.quiz)) : []
  editingContent.value = true
}

const cancelEditContent = () => {
  editingContent.value = false
  contentDraft.value = ''
  quizDraft.value = []
}

const saveContentEdit = async () => {
  if (!readingModule.value?.id) return
  savingContent.value = true
  try {
    // Filter out empty quiz questions and validate
    const validQuiz = quizDraft.value.filter(q => q.question?.trim()).map(q => ({
      question: q.question,
      options: q.options.filter(opt => opt?.trim()),
      correctIndex: q.correctIndex,
    }));

    await trainingStore.updateTrainingModule(readingModule.value.id, {
      content: contentDraft.value,
      quiz: validQuiz,
    })
    readingModule.value.content = contentDraft.value
    readingModule.value.quiz = validQuiz
    editingContent.value = false
  } catch (err) {
    console.error('Failed to save content:', err)
  } finally {
    savingContent.value = false
  }
}

const startQuiz = () => {
  retaking.value = true
  Object.keys(quizAnswers).forEach(k => delete quizAnswers[k])
}

const submitQuiz = async () => {
  const quiz = readingModule.value.quiz
  submittingQuiz.value = true
  try {
    let score = 0
    quiz.forEach((q, i) => { if (quizAnswers[i] === q.correctIndex) score++ })
    const total = quiz.length
    const passed = total > 0 && score / total >= 0.7
    await completionsStore.submitCompletion({
      moduleId: readingModule.value.id,
      userId: auth.user.id,
      userName: auth.user.name || '',
      userEmail: auth.user.email || '',
      score, total, passed,
    })
    ownCompletion.value = { score, total, passed }
    retaking.value = false
  } catch (err) {
    console.error('Failed to submit quiz:', err)
  } finally {
    submittingQuiz.value = false
  }
}

// ── Contact info card + ask-a-question ──────────────────────────────────────
const showContactModal = ref(false)
const editingContact = ref(false)
const savingContact = ref(false)
const contactDraft = reactive({ email: '', note: '' })
const questionDraft = ref('')
const submittingQuestion = ref(false)
const replyDrafts = reactive({})

const openQuestionsCount = computed(() =>
  questionsStore.questions.filter(q => q.status !== 'answered').length
)

const openContactModal = () => {
  showContactModal.value = true
  if (isAdmin.value) questionsStore.watchAll()
  else if (auth.user?.id) questionsStore.watchOwn(auth.user.id)
}

const closeContactModal = () => {
  showContactModal.value = false
  editingContact.value = false
  questionsStore.cleanup()
}

const startEditContact = () => {
  Object.assign(contactDraft, {
    email: settingsStore.contact?.email || '',
    note: settingsStore.contact?.note || '',
  })
  editingContact.value = true
}

const saveContact = async () => {
  savingContact.value = true
  try {
    await settingsStore.updateContact({ ...contactDraft })
    editingContact.value = false
  } catch (err) {
    console.error('Failed to save contact info:', err)
  } finally {
    savingContact.value = false
  }
}

const submitQuestion = async () => {
  if (!questionDraft.value.trim() || !auth.user?.id) return
  submittingQuestion.value = true
  try {
    await questionsStore.askQuestion({
      askedById: auth.user.id,
      askedByName: auth.user.name || '',
      askedByEmail: auth.user.email || '',
      question: questionDraft.value.trim(),
    })
    questionDraft.value = ''
  } catch (err) {
    console.error('Failed to submit question:', err)
  } finally {
    submittingQuestion.value = false
  }
}

const sendReply = async (q) => {
  const text = replyDrafts[q.id]?.trim()
  if (!text) return
  try {
    await questionsStore.answerQuestion(q.id, text)
    delete replyDrafts[q.id]
  } catch (err) {
    console.error('Failed to send reply:', err)
  }
}

const deleteQuestion = async (q) => {
  if (!confirm(`Delete this question${q.askedByName ? ` from ${q.askedByName}` : ''}?`)) return
  try {
    await questionsStore.deleteQuestion(q.id)
  } catch (err) {
    console.error('Failed to delete question:', err)
  }
}

onMounted(async () => {
  await Promise.all([
    trainingStore.fetchTrainingModules(),
    settingsStore.fetchContact(),
  ])
})

onBeforeUnmount(() => {
  trainingStore.cleanup()
  completionsStore.cleanup()
  questionsStore.cleanup()
})

// Format date for display
const formatDate = (timestamp) => {
  if (!timestamp) return ''

  // Handle Firebase Timestamp object
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)

  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) {
    return `${diffMins}m ago`
  } else if (diffHours < 24) {
    return `${diffHours}h ago`
  } else if (diffDays < 7) {
    return `${diffDays}d ago`
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }
}
</script>

<style scoped>
.training-hub {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  padding-bottom: var(--space-8);
}

.hub-header {
  text-align: center;
  margin-bottom: var(--space-4);
}

.hub-title {
  font-size: clamp(28px, 5vw, 40px);
  font-weight: var(--font-weight-black);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-3) 0;
  letter-spacing: -0.5px;
}

.hub-subtitle {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  margin: 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

/* Cards Grid - responsive layout */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-6);
  margin-bottom: var(--space-4);
}

@media (max-width: 768px) {
  .cards-grid {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }
}

.training-card {
  position: relative;
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  text-align: center;
  transition: all var(--duration-normal) var(--ease-out);
}

.training-card:hover {
  transform: translateY(-4px);
}

.card-admin-actions {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  display: flex;
  gap: 4px;
}

.icon-action {
  background: var(--color-bg-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 13px;
  line-height: 1;
  padding: 4px 6px;
  cursor: pointer;
}

.icon-action:hover {
  border-color: var(--color-mint);
}

.form-group {
  margin-bottom: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-group label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  color: var(--color-text-tertiary);
  letter-spacing: .05em;
}

.form-group input,
.form-group textarea {
  padding: 10px 12px;
  background: var(--color-bg-2);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-family: inherit;
  font-size: var(--font-size-sm);
  resize: vertical;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-mint);
}

.text-btn {
  background: none;
  border: none;
  color: var(--color-mint);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  padding: 0;
}

.text-btn:hover { text-decoration: underline; }

.quiz-editor {
  border-top: 1px solid var(--color-border);
  padding-top: var(--space-4);
  margin-top: var(--space-2);
}

.quiz-editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
}

.quiz-question-editor {
  background: var(--color-bg-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  margin-bottom: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.quiz-question-editor-row {
  display: flex;
  gap: var(--space-2);
}

.quiz-question-editor-row input {
  flex: 1;
}

.quiz-option-editor {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.quiz-option-editor input[type="text"],
.quiz-option-editor input:not([type="radio"]) {
  flex: 1;
  padding: 6px 10px;
  background: var(--color-bg-1, var(--color-bg-2));
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.empty-note {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  font-style: italic;
}

.read-icon {
  font-size: 40px;
  text-align: center;
  margin-bottom: var(--space-2);
}

.read-content {
  white-space: pre-wrap;
  line-height: 1.6;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-4);
}

.quiz-question {
  margin-bottom: var(--space-4);
}

.quiz-question-text {
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2) 0;
}

.quiz-option {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2);
  font-size: var(--font-size-sm);
  cursor: pointer;
}

.quiz-result-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  background: var(--color-bg-2);
  border-radius: var(--radius-md);
  padding: var(--space-4);
}

.completions-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.completion-row {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-sm);
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--color-border);
}

.quiz-badge {
  font-size: var(--font-size-xs);
  color: var(--color-mint);
  font-weight: var(--font-weight-bold);
  margin: 0;
}

.question-row {
  background: var(--color-bg-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  margin-bottom: var(--space-3);
}

.question-row-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-2);
}

.question-meta {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  margin: 0 0 var(--space-1) 0;
}

.question-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2) 0;
}

.question-answer {
  font-size: var(--font-size-sm);
  color: var(--color-mint);
  margin: 0;
}

.question-pending {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  font-style: italic;
  margin: 0;
}

.reply-row {
  display: flex;
  gap: var(--space-2);
}

.reply-row input {
  flex: 1;
  padding: 8px 10px;
  background: var(--color-bg-1, var(--color-bg-2));
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.content-editor-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  margin-bottom: var(--space-4);
}

.content-editor {
  flex: 1;
  min-height: 400px;
  padding: var(--space-3);
  background: var(--color-bg-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-family: monospace;
  font-size: var(--font-size-sm);
  line-height: 1.6;
  resize: vertical;
}

.content-editor:focus {
  outline: none;
  border-color: var(--color-mint);
  box-shadow: 0 0 0 2px rgba(78, 255, 197, 0.1);
}

.section-note {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  font-style: italic;
  margin: 0 0 var(--space-3) 0;
}

.quiz-editor-section {
  background: var(--color-bg-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  margin-bottom: var(--space-3);
}

.quiz-question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.quiz-question-number {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.quiz-option-editor {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.quiz-option-editor input[type="radio"] {
  flex-shrink: 0;
  margin: 0;
}

.quiz-option-editor input:not([type="radio"]) {
  flex: 1;
  padding: 6px 10px;
  background: var(--color-bg-1, var(--color-bg-2));
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.add-question-btn {
  margin-top: var(--space-2);
}

.add-btn {
  margin-top: var(--space-2);
}

.card-icon {
  font-size: 48px;
  line-height: 1;
}

.card-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.card-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
}

/* Animals Card */
.animals-card {
  padding: var(--space-7);
}

.animals-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  margin-top: var(--space-4);
}

.animal-type {
  padding: var(--space-4);
  background: var(--color-bg-3);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  line-height: 1.6;
  border-left: 3px solid var(--color-mint);
}

/* Announcements */
.announcements-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.announcement-card {
  padding: var(--space-6);
}

.announcement-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-4);
  margin-bottom: var(--space-3);
}

.announcement-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
  flex: 1;
}

.announcement-date {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  white-space: nowrap;
  flex-shrink: 0;
}

.announcement-body {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.6;
}

.no-announcements {
  padding: var(--space-8) var(--space-4);
  text-align: center;
  color: var(--color-text-tertiary);
  font-size: var(--font-size-sm);
}

/* Support Grid */
.support-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--space-5);
}

@media (max-width: 768px) {
  .support-grid {
    grid-template-columns: 1fr;
  }
}

.support-card {
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  text-align: center;
}

.support-card .card-icon {
  font-size: 40px;
}

.support-card .card-title {
  font-size: var(--font-size-base);
}

.support-card .card-description {
  font-size: var(--font-size-xs);
}
</style>
