<template>
  <PageContainer>

    <div class="vet-layout">

      <!-- Left panel: context -->
      <div class="vet-left">
        <SectionLabel>Animal</SectionLabel>
        <AppCard :flat="true" :no-pad="true">
          <!-- Animal search -->
          <div class="animal-search-wrap">
            <AppInput v-model="animalSearch" placeholder="Find by name..." />
            <div v-if="animalSearch && !selectedAnimal" class="animal-list">
              <div
                v-for="a in filteredAnimals"
                :key="a.id"
                class="animal-item"
                @click="selectAnimal(a)"
              >
                <span>{{ getSpeciesEmoji(a.species) }}</span>
                <div>
                  <div class="animal-item__name">{{ a.name }}</div>
                  <div class="animal-item__sub">{{ a.species }} · {{ a.age || 'Age unknown' }}</div>
                </div>
              </div>
            </div>
            <div v-if="animalSearch && filteredAnimals.length === 0" class="animal-empty">
              No animals found
            </div>
          </div>
          <!-- Selected animal -->
          <div v-if="selectedAnimal" class="selected-animal">
            <div class="selected-animal__header">
              <span class="selected-animal__emoji">{{ getSpeciesEmoji(selectedAnimal.species) }}</span>
              <div>
                <div class="selected-animal__name">{{ selectedAnimal.name }}</div>
                <div class="selected-animal__sub">{{ selectedAnimal.species }} · {{ selectedAnimal.age || 'Age unknown' }}</div>
              </div>
              <button class="selected-animal__clear" @click="selectedAnimal = null; animalSearch = ''">✕</button>
            </div>
            <div class="selected-animal__stats">
              <div v-if="selectedAnimal.weight" class="mini-stat"><span>{{ selectedAnimal.weight }}</span><span>Weight</span></div>
              <div v-if="daysInCare(selectedAnimal)" class="mini-stat"><span>{{ daysInCare(selectedAnimal) }}d</span><span>In care</span></div>
              <div class="mini-stat">
                <span :class="selectedAnimal.healthStatus === 'healthy' ? 'text-mint' : 'text-coral'">
                  {{ selectedAnimal.healthStatus === 'healthy' ? '✓' : '!' }}
                </span>
                <span>Health</span>
              </div>
            </div>
          </div>
        </AppCard>

        <!-- Vitals reference -->
        <SectionLabel>Vitals reference</SectionLabel>
        <AppCard title="Normal ranges" :flat="true">
          <div class="vitals-grid">
            <div v-for="(val, key) in vitals" :key="key" class="vital">
              <span class="vital__label">{{ key }}</span>
              <span class="vital__val">{{ val }}</span>
            </div>
          </div>
        </AppCard>
      </div>

      <!-- Right panel: chat -->
      <div class="vet-right">
        <!-- Quick prompts -->
        <div class="quick-prompts">
          <button v-for="p in quickPrompts" :key="p.label" class="quick-btn" :style="`--c: ${p.color}`" @click="sendQuick(p.text)">
            {{ p.emoji }} {{ p.label }}
          </button>
        </div>

        <!-- Messages -->
        <div class="messages" ref="messagesEl">
          <div v-if="messages.length === 0" class="chat-empty">
            <div class="chat-empty__icon">🩺</div>
            <div class="chat-empty__title">Ready to assist</div>
            <div class="chat-empty__sub">{{ selectedAnimal ? `Ask about ${selectedAnimal.name}` : 'Select an animal and ask veterinary questions' }}</div>
          </div>
          <div
            v-for="m in messages"
            :key="m.id"
            class="msg"
            :class="m.role === 'user' ? 'msg--user' : 'msg--ai'"
          >
            <div class="msg__bubble">
              <p class="msg__text">{{ m.text }}</p>
              <p class="msg__time">{{ m.time }}</p>
            </div>
          </div>
          <div v-if="loading" class="msg msg--ai">
            <div class="msg__bubble msg__bubble--typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>

        <!-- Input -->
        <div class="chat-input-row">
          <input
            v-model="inputText"
            class="chat-input"
            placeholder="Ask a veterinary question..."
            :disabled="!selectedAnimal"
            @keyup.enter="sendMessage"
          />
          <AppButton variant="primary" :disabled="!inputText.trim() || loading || !selectedAnimal" @click="sendMessage">Send</AppButton>
        </div>
        <div class="chat-disclaimer">For informational purposes only — always consult a licensed veterinarian.</div>
      </div>
    </div>

  </PageContainer>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { PageContainer, AppCard, SectionLabel, AppButton, AppInput } from '../ui'
import { useAnimalsStore } from '../../stores/animals'
import { authHeaders } from '../../services/siteApi'

const animalsStore = useAnimalsStore()

const animalSearch   = ref('')
const selectedAnimal = ref(null)
const inputText      = ref('')
const loading        = ref(false)
const messagesEl     = ref(null)
const messages       = ref([])

const animals = computed(() => Array.isArray(animalsStore.animals) ? animalsStore.animals : [])

const filteredAnimals = computed(() => {
  const list = animals.value
  return animalSearch.value
    ? list.filter(a => a.name?.toLowerCase().startsWith(animalSearch.value.toLowerCase()))
    : list
})

const selectAnimal = (a) => {
  selectedAnimal.value = a
  animalSearch.value = a.name
  messages.value = []
}

const speciesVitals = {
  cat:    { Temp: '100–102.5°F', 'Heart Rate': '120–140 bpm', 'Resp Rate': '20–30 brpm' },
  dog:    { Temp: '99–102.5°F',  'Heart Rate': '60–140 bpm',  'Resp Rate': '15–30 brpm' },
  rabbit: { Temp: '101–103°F',   'Heart Rate': '130–325 bpm', 'Resp Rate': '30–60 brpm' },
  horse:  { Temp: '99–101°F',    'Heart Rate': '28–44 bpm',   'Resp Rate': '8–16 brpm'  },
  goat:   { Temp: '101–104°F',   'Heart Rate': '70–135 bpm',  'Resp Rate': '12–20 brpm' },
  pig:    { Temp: '101–103.5°F', 'Heart Rate': '60–100 bpm',  'Resp Rate': '10–20 brpm' },
  bird:   { Temp: '101–106°F',   'Heart Rate': '200–400 bpm', 'Resp Rate': '20–40 brpm' },
  default: { Temp: '100–102°F', 'Heart Rate': 'varies', 'Resp Rate': 'varies' },
}

const vitals = computed(() => {
  const sp = selectedAnimal.value?.species?.toLowerCase() ?? 'default'
  return speciesVitals[sp] ?? speciesVitals.default
})

const getSpeciesEmoji = (species) => {
  const map = {
    cat: '🐱', dog: '🐶', rabbit: '🐰', horse: '🐴',
    goat: '🐐', pig: '🐷', bird: '🦅', default: '🐾'
  }
  return map[species?.toLowerCase()] || map.default
}

// Same fix as Animals.vue/AnimalDetail.vue: daysInCare was a static
// field set once at intake and never updated. Compute it live instead.
const daysInCare = (animal) => {
  const raw = animal?.intakeDate || animal?.createdAt
  if (!raw) return 0
  const d = typeof raw?.toDate === 'function' ? raw.toDate() : new Date(raw)
  if (isNaN(d)) return 0
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000))
}

const quickPrompts = [
  { label: 'Dehydration',  emoji: '💧', color: '#4EFFC5', text: 'How do I check for dehydration and what are the signs?' },
  { label: 'Injuries',     emoji: '🩹', color: '#FF7A45', text: 'How should I handle and clean a minor wound?' },
  { label: 'Vitals',       emoji: '❤️', color: '#FF6B6B', text: 'What are normal vitals and how do I measure them?' },
  { label: 'Infection',    emoji: '🦠', color: '#74B0FF', text: 'What are signs of infection I should watch for?' },
  { label: 'Emergency',    emoji: '🚨', color: '#FF6B6B', text: 'What are signs of an emergency requiring immediate vet care?' },
  { label: 'Nutrition',    emoji: '🥗', color: '#4EFFC5', text: 'What are general nutritional guidelines for this species?' },
]

let msgId = 0

const scrollToBottom = async () => {
  await nextTick()
  if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight
}

const sendMessage = async () => {
  if (!inputText.value.trim() || loading.value || !selectedAnimal.value) return

  const text = inputText.value.trim()
  inputText.value = ''
  const context = `(for ${selectedAnimal.value.name} the ${selectedAnimal.value.species}) `

  messages.value.push({
    id: ++msgId,
    role: 'user',
    text: context + text,
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  })

  loading.value = true
  scrollToBottom()

  try {
    const response = await fetch('/api/vet-chat', {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify({
        animal: selectedAnimal.value,
        question: text,
        species: selectedAnimal.value.species,
      })
    })

    const data = await response.json()

    messages.value.push({
      id: ++msgId,
      role: 'ai',
      text: data.response || 'Unable to generate response. Please consult a veterinarian.',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    })
  } catch (error) {
    messages.value.push({
      id: ++msgId,
      role: 'ai',
      text: 'Sorry, I could not connect to the vet assistant. Please try again or consult a licensed veterinarian.',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    })
  }

  loading.value = false
  scrollToBottom()
}

const sendQuick = (text) => { inputText.value = text; sendMessage() }

onMounted(() => animalsStore.fetchAnimals())
</script>

<style scoped>
.vet-layout {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 12px;
  align-items: start;
}

@media (max-width: 600px) {
  .vet-layout { grid-template-columns: 1fr; }
}

/* Left panel */
.vet-left { display: flex; flex-direction: column; gap: 0; }

.animal-search-wrap { padding: 12px; position: relative; }

.animal-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--r);
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  margin-top: 4px;
}

.animal-empty {
  padding: 12px;
  text-align: center;
  font-size: 12px;
  color: var(--ink-3);
}

.animal-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background .1s;
  font-size: 12px;
  border-bottom: 1px solid var(--border);
}
.animal-item:last-child { border-bottom: none; }
.animal-item:hover { background: var(--surface); }
.animal-item span { font-size: 16px; }
.animal-item__name { font-weight: 800; color: var(--ink); }
.animal-item__sub { font-size: 10px; color: var(--ink-3); }

.selected-animal {
  padding: 12px;
  background: var(--surface-2);
  border-top: 1px solid var(--border);
}
.selected-animal__header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.selected-animal__emoji { font-size: 24px; }
.selected-animal__name { font-weight: 800; color: var(--ink); font-size: 12px; }
.selected-animal__sub { font-size: 10px; color: var(--ink-3); }
.selected-animal__clear {
  background: none;
  border: none;
  color: var(--ink-3);
  font-size: 16px;
  cursor: pointer;
  padding: 0;
  margin-left: auto;
}
.selected-animal__stats {
  display: flex;
  gap: 8px;
}
.mini-stat {
  flex: 1;
  text-align: center;
  padding: 6px;
  background: var(--surface);
  border-radius: 6px;
  font-size: 10px;
}
.mini-stat span:first-child {
  display: block;
  font-weight: 800;
  color: var(--mint);
  font-size: 11px;
  margin-bottom: 2px;
}
.mini-stat span:last-child {
  display: block;
  color: var(--ink-3);
  font-weight: 700;
}

.vitals-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}
.vital {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
}
.vital__label { font-weight: 800; color: var(--ink-2); }
.vital__val { font-weight: 800; color: var(--mint); }

/* Right panel */
.vet-right {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r);
  padding: 12px;
  min-height: 400px;
}

.quick-prompts {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.quick-btn {
  padding: 6px 10px;
  background: rgba(78,255,197,.1);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
  color: var(--ink-2);
  transition: all .1s;
  border-color: rgba(255,255,255,.1);
}
.quick-btn:hover { border-color: var(--c); background: rgba(255,255,255,.05); }
.quick-btn:disabled { opacity: .4; cursor: not-allowed; }

.messages {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  background: var(--surface-2);
  border-radius: 10px;
  border: 1px solid var(--border);
}

.chat-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex: 1;
  color: var(--ink-3);
}
.chat-empty__icon { font-size: 32px; }
.chat-empty__title { font-weight: 800; font-size: 12px; color: var(--ink-2); }
.chat-empty__sub { font-size: 11px; }

.msg {
  display: flex;
  justify-content: flex-start;
  animation: fadeIn .2s ease-in;
}
@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; } }

.msg--user { justify-content: flex-end; }
.msg__bubble {
  max-width: 70%;
  padding: 9px 12px;
  border-radius: 10px;
  font-size: 12px;
  line-height: 1.4;
}
.msg--user .msg__bubble { background: var(--mint); color: var(--bg); }
.msg--ai .msg__bubble { background: var(--surface); border: 1px solid var(--border); color: var(--ink); }

.msg__bubble--typing {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 8px 12px;
}
.msg__bubble--typing span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--ink-3);
  animation: typing .6s ease-in-out infinite;
}
.msg__bubble--typing span:nth-child(2) { animation-delay: .1s; }
.msg__bubble--typing span:nth-child(3) { animation-delay: .2s; }
@keyframes typing {
  0%, 60%, 100% { opacity: .3; }
  30% { opacity: 1; }
}

.msg__text { margin: 0; }
.msg__time {
  margin: 3px 0 0;
  font-size: 10px;
  opacity: .6;
}

.chat-input-row {
  display: flex;
  gap: 6px;
}
.chat-input {
  flex: 1;
  padding: 9px 12px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--ink);
  font-family: 'Nunito', sans-serif;
  font-size: 12px;
}
.chat-input:focus { outline: none; border-color: var(--mint); }
.chat-input:disabled { opacity: .5; cursor: not-allowed; }

.chat-disclaimer {
  font-size: 10px;
  color: var(--ink-3);
  text-align: center;
  font-style: italic;
}

.text-mint { color: var(--mint); }
.text-coral { color: var(--coral); }
</style>
