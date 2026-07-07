<template>
  <div class="detail-drawer">
    <div class="drawer-card">
      <div class="drawer-header">
        <div :style="avatarStyle((Array.isArray(person.types) ? person.types[0] : person.type) || 'volunteer')" class="drawer-avatar">
          {{ person.name?.charAt(0)?.toUpperCase() }}
        </div>
        <div class="drawer-title-block">
          <div class="drawer-name">{{ person.name }}</div>
          <div class="drawer-type">
            <span v-for="t in (Array.isArray(person.types) ? person.types : (person.type ? [person.type] : []))" :key="t">
              {{ typeIcons[t] }} {{ t }}
            </span>
          </div>
        </div>
        <button class="panel-close" @click="$emit('close')">✕</button>
      </div>

      <!-- Drawer tabs -->
      <div class="drawer-tabs">
        <button v-for="tab in drawerTabs" :key="tab" class="dtab" :class="{ active: drawerTab === tab }" @click="drawerTab = tab">{{ tab }}</button>
      </div>

      <div class="drawer-body">
        <!-- Info tab -->
        <template v-if="drawerTab === 'Info'">
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Status</div>
              <AppBadge :type="badgeType(person.status)">{{ person.status || 'active' }}</AppBadge>
            </div>
            <div v-if="person.email" class="info-item">
              <div class="info-label">Email</div>
              <a :href="`mailto:${person.email}`" class="info-link">{{ person.email }}</a>
            </div>
            <div v-if="person.phone" class="info-item">
              <div class="info-label">Phone</div>
              <a :href="`tel:${person.phone}`" class="info-link">{{ person.phone }}</a>
            </div>
            <div v-if="person.location" class="info-item">
              <div class="info-label">Location</div>
              <div class="info-val">{{ person.location }}</div>
            </div>
            <div v-if="person.tags?.length" class="info-item full">
              <div class="info-label">Tags</div>
              <div class="drawer-tags">
                <span v-for="tag in person.tags" :key="tag" class="tag">{{ tag }}</span>
              </div>
            </div>
            <div v-if="person.notes" class="info-item full">
              <div class="info-label">Notes</div>
              <div class="info-notes">{{ person.notes }}</div>
            </div>
            <div class="info-item full">
              <div class="info-label">Linked Animals</div>
              <div v-if="person.linkedAnimals?.length" class="linked-animals">
                <span v-for="a in person.linkedAnimals" :key="a.id" class="animal-chip">
                  🦎 {{ a.name }}
                  <button class="chip-remove" title="Unlink" @click="removeAnimal(a.id)">✕</button>
                </span>
              </div>
              <div v-else class="drawer-empty" style="padding:8px 0">No animals linked yet</div>
              <div class="assign-animal">
                <select v-model="animalToAssign" class="mini-select">
                  <option value="">Assign an animal…</option>
                  <option v-for="a in unlinkedAnimals" :key="a.id" :value="a.id">{{ a.name }}<template v-if="a.species"> ({{ a.species }})</template></option>
                </select>
                <AppButton size="sm" variant="secondary" :disabled="!animalToAssign" @click="assignAnimal">+ Assign</AppButton>
              </div>
              <p v-if="isFoster" class="assign-hint">Assigning marks the animal &ldquo;In Foster&rdquo;.</p>
            </div>
          </div>
        </template>

        <!-- Donations tab -->
        <template v-else-if="drawerTab === 'Donations'">
          <div class="donation-list">
            <div v-if="person.donations?.length">
              <div class="donation-total">
                Total: <strong>${{ donationTotal(person) }}</strong>
              </div>
              <div v-for="(d, i) in [...(person.donations || [])].reverse()" :key="i" class="donation-row">
                <div class="d-amount">${{ d.amount }}</div>
                <div class="d-body">
                  <div class="d-note">{{ d.note || 'General donation' }}</div>
                  <div class="d-date">{{ formatDate(d.date) }}</div>
                </div>
              </div>
            </div>
            <div v-else class="drawer-empty">No donations recorded</div>
          </div>
          <!-- Add donation -->
          <div class="add-donation">
            <input v-model="newDonation.amount" type="number" placeholder="Amount $" class="mini-input" />
            <input v-model="newDonation.note" type="text" placeholder="Note (optional)" class="mini-input flex-1" />
            <AppButton size="sm" variant="primary" @click="addDonation">+ Add</AppButton>
          </div>
        </template>

        <!-- Notes tab -->
        <template v-else-if="drawerTab === 'Notes'">
          <div class="notes-list">
            <div v-if="person.notesList?.length">
              <div v-for="(n, i) in [...(person.notesList || [])].reverse()" :key="i" class="note-row">
                <div class="note-author">{{ n.author }}</div>
                <div class="note-text" v-html="renderMentions(n.text)" />
                <div class="note-date">{{ formatDate(n.createdAt) }}</div>
              </div>
            </div>
            <div v-else class="drawer-empty">No notes yet</div>
          </div>
          <!-- Add note with @mentions -->
          <div class="add-note">
            <div class="note-input-wrap">
              <textarea
                v-model="newNoteText"
                class="note-textarea"
                rows="3"
                placeholder="Add a note... use @name to mention someone"
                @input="checkMention"
                @keydown.enter.ctrl="addNote"
              />
              <div v-if="mentionSuggestions.length" class="mention-dropdown">
                <button
                  v-for="p in mentionSuggestions"
                  :key="p.id"
                  class="mention-option"
                  @click.prevent="insertMention(p.name)"
                >{{ p.name }}</button>
              </div>
            </div>
            <AppButton size="sm" variant="primary" @click="addNote">Post Note</AppButton>
          </div>
        </template>
      </div>

      <div class="drawer-actions">
        <AppButton variant="primary" size="sm" @click="$emit('edit', person)">Edit</AppButton>
        <AppButton variant="secondary" size="sm" v-if="person.email" @click="window.location.href = `mailto:${person.email}`">Email</AppButton>
        <AppButton variant="secondary" size="sm" v-if="person.phone" @click="window.location.href = `tel:${person.phone}`">Call</AppButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { AppButton, AppBadge } from '../../../ui'
import { usePeopleStore } from '../../../../stores/people'
import { useAnimalsStore } from '../../../../stores/animals'
import { useUIStore } from '../../../../stores/ui'
import { avatarStyle, badgeType, typeIcons, formatDate, personTypeList } from './personDisplay'

const props = defineProps({
  person: { type: Object, required: true },
})

const emit = defineEmits(['close', 'edit', 'update:person'])

const peopleStore = usePeopleStore()
const animalsStore = useAnimalsStore()
const ui = useUIStore()
const window = globalThis.window

const isFoster = computed(() => personTypeList(props.person).includes('foster'))
const animalToAssign = ref('')

const unlinkedAnimals = computed(() => {
  const linkedIds = new Set((props.person.linkedAnimals || []).map(a => a.id))
  return animalsStore.animals.filter(a => !linkedIds.has(a.id))
})

const refreshPerson = () => {
  emit('update:person', peopleStore.people.find(p => p.id === props.person.id) || props.person)
}

const assignAnimal = async () => {
  if (!animalToAssign.value) return
  const animal = animalsStore.animals.find(a => a.id === animalToAssign.value)
  if (!animal) return
  try {
    await peopleStore.linkAnimal(props.person.id, animal.id, animal.name)
    if (isFoster.value) {
      await animalsStore.updateAnimal(animal.id, { status: 'fostered' })
    }
    refreshPerson()
    animalToAssign.value = ''
    ui.showToast(`${animal.name} assigned to ${props.person.name}`)
  } catch (e) {
    ui.showToast(`Failed to assign animal: ${e.message}`, 'error')
  }
}

const removeAnimal = async (animalId) => {
  try {
    await peopleStore.unlinkAnimal(props.person.id, animalId)
    refreshPerson()
    ui.showToast('Animal unlinked')
  } catch (e) {
    ui.showToast(`Failed to unlink animal: ${e.message}`, 'error')
  }
}

onMounted(() => {
  if (!animalsStore.animals.length) animalsStore.fetchAnimals()
})

const drawerTab = ref('Info')
const drawerTabs = ['Info', 'Donations', 'Notes']
const newDonation = ref({ amount: '', note: '' })
const newNoteText = ref('')
const mentionSuggestions = ref([])

const donationTotal = (person) => {
  return (person.donations || []).reduce((sum, d) => sum + Number(d.amount || 0), 0).toFixed(2)
}

const addDonation = async () => {
  if (!newDonation.value.amount) { ui.showToast('Enter an amount', 'error'); return }
  await peopleStore.addDonation(props.person.id, {
    amount: parseFloat(newDonation.value.amount),
    note: newDonation.value.note,
    date: new Date().toISOString(),
  })
  // refresh selected
  emit('update:person', peopleStore.people.find(p => p.id === props.person.id) || props.person)
  newDonation.value = { amount: '', note: '' }
  ui.showToast('Donation recorded')
}

const checkMention = () => {
  const text = newNoteText.value
  const atIdx = text.lastIndexOf('@')
  if (atIdx !== -1 && atIdx === text.length - 1 - (text.length - atIdx - 1)) {
    const query = text.slice(atIdx + 1).toLowerCase()
    if (query.length >= 1) {
      mentionSuggestions.value = peopleStore.people.filter(p => p.name?.toLowerCase().startsWith(query)).slice(0, 5)
    } else {
      mentionSuggestions.value = []
    }
  } else {
    mentionSuggestions.value = []
  }
}

const insertMention = (name) => {
  const text = newNoteText.value
  const atIdx = text.lastIndexOf('@')
  newNoteText.value = text.slice(0, atIdx) + '@' + name + ' '
  mentionSuggestions.value = []
}

const addNote = async () => {
  if (!newNoteText.value.trim()) { ui.showToast('Note is empty', 'error'); return }
  const mentions = (newNoteText.value.match(/@(\w[\w\s]*)/g) || []).map(m => m.slice(1).trim())
  await peopleStore.addNote(props.person.id, newNoteText.value, mentions)
  emit('update:person', peopleStore.people.find(p => p.id === props.person.id) || props.person)
  newNoteText.value = ''
  ui.showToast('Note added')
}

const renderMentions = (text) => {
  return (text || '').replace(/@([\w][\w\s]*)/g, '<span class="mention">@$1</span>')
}
</script>

<style scoped>
.panel-close { background: none; border: none; font-size: 16px; color: var(--ink-3); cursor: pointer; }

/* Detail drawer */
.detail-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 300px;
  z-index: 200;
  display: flex;
  flex-direction: column;
}

.drawer-card {
  height: 100%;
  background: var(--surface);
  border-left: 1px solid var(--border);
  box-shadow: -4px 0 24px rgba(0,0,0,.3);
  display: flex;
  flex-direction: column;
}
.drawer-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid var(--border);
}
.drawer-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 800;
  color: #fff;
  flex-shrink: 0;
}
.drawer-title-block { flex: 1; }
.drawer-name { font-size: 15px; font-weight: 800; color: var(--ink); }
.drawer-type { font-size: 11px; color: var(--ink-3); text-transform: uppercase; letter-spacing: .03em; }

.drawer-body { flex: 1; overflow-y: auto; padding: 16px; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.info-item { display: flex; flex-direction: column; gap: 4px; }
.info-item.full { grid-column: span 2; }
.info-label { font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--ink-3); letter-spacing: .04em; }
.info-val { font-size: 12px; color: var(--ink); }
.info-link { font-size: 12px; color: var(--mint); text-decoration: none; }
.info-notes { font-size: 12px; color: var(--ink-2); line-height: 1.6; }
.drawer-tags { display: flex; flex-wrap: wrap; gap: 4px; }

.tag {
  padding: 2px 6px;
  background: rgba(78,255,197,.12);
  border: 1px solid rgba(78,255,197,.3);
  border-radius: 10px;
  font-size: 10px;
  color: var(--mint);
  font-weight: 700;
}

.drawer-actions {
  padding: 14px 16px;
  border-top: 1px solid var(--border);
  display: flex;
  gap: 8px;
}

/* Drawer tabs */
.drawer-tabs {
  display: flex;
  border-bottom: 1px solid var(--border);
}
.dtab {
  flex: 1;
  padding: 9px;
  background: none;
  border: none;
  font-family: 'Nunito', sans-serif;
  font-size: 11px;
  font-weight: 800;
  color: var(--ink-3);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all .15s;
  text-transform: uppercase;
  letter-spacing: .04em;
}
.dtab:hover { color: var(--ink); }
.dtab.active { color: var(--mint); border-bottom-color: var(--mint); }

/* Donations */
.donation-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
.donation-total { font-size: 13px; font-weight: 800; color: var(--mint); margin-bottom: 10px; }
.donation-row { display: flex; align-items: center; gap: 10px; padding: 8px; background: var(--surface-2); border-radius: var(--r); border: 1px solid var(--border); }
.d-amount { font-family: 'Fredoka One', sans-serif; font-size: 18px; color: var(--mint); width: 56px; flex-shrink: 0; }
.d-body { flex: 1; }
.d-note { font-size: 12px; color: var(--ink); font-weight: 700; }
.d-date { font-size: 10px; color: var(--ink-3); }

.add-donation { display: flex; gap: 6px; align-items: center; border-top: 1px solid var(--border); padding-top: 12px; }
.mini-input {
  padding: 7px 10px; background: var(--surface-2); border: 1px solid var(--border);
  border-radius: var(--r); color: var(--ink); font-family: 'Nunito', sans-serif; font-size: 12px;
  width: 70px;
}
.mini-input.flex-1 { flex: 1; width: auto; }
.mini-input:focus { outline: none; border-color: var(--mint); }

/* Notes */
.notes-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
.note-row { padding: 10px; background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--r); }
.note-author { font-size: 10px; font-weight: 800; color: var(--mint); text-transform: uppercase; letter-spacing: .03em; margin-bottom: 4px; }
.note-text { font-size: 12px; color: var(--ink); line-height: 1.5; margin-bottom: 4px; }
.note-date { font-size: 10px; color: var(--ink-3); }

.add-note { border-top: 1px solid var(--border); padding-top: 12px; display: flex; flex-direction: column; gap: 8px; }
.note-input-wrap { position: relative; }
.note-textarea {
  width: 100%; padding: 8px 10px; background: var(--surface-2); border: 1px solid var(--border);
  border-radius: var(--r); color: var(--ink); font-family: 'Nunito', sans-serif; font-size: 12px;
  resize: none;
}
.note-textarea:focus { outline: none; border-color: var(--mint); }

.mention-dropdown {
  position: absolute; bottom: 100%; left: 0; right: 0;
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--r);
  z-index: 300; max-height: 160px; overflow-y: auto;
}
.mention-option {
  display: block; width: 100%; padding: 8px 12px; text-align: left;
  background: none; border: none; color: var(--ink); font-size: 12px; font-weight: 700;
  cursor: pointer; transition: background .1s;
}
.mention-option:hover { background: var(--surface-2); }

.mention { color: var(--mint); font-weight: 800; }

/* Linked animals */
.linked-animals { display: flex; flex-wrap: wrap; gap: 4px; }
.animal-chip {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 6px 3px 8px; background: rgba(167,139,250,.12);
  border: 1px solid rgba(167,139,250,.3); border-radius: 10px;
  font-size: 10px; color: #A78BFA; font-weight: 700;
}
.chip-remove {
  background: none; border: none; color: #A78BFA; cursor: pointer;
  font-size: 9px; padding: 0; line-height: 1; opacity: .7;
}
.chip-remove:hover { opacity: 1; }

.assign-animal { display: flex; gap: 6px; margin-top: 8px; }
.mini-select {
  flex: 1; padding: 7px 8px; background: var(--surface-2); border: 1px solid var(--border);
  border-radius: var(--r); color: var(--ink); font-family: 'Nunito', sans-serif; font-size: 12px;
}
.mini-select:focus { outline: none; border-color: var(--mint); }
.assign-hint { font-size: 10px; color: var(--ink-3); margin-top: 6px; font-style: italic; }

.drawer-empty { font-size: 12px; color: var(--ink-3); text-align: center; padding: 20px 0; }
</style>
