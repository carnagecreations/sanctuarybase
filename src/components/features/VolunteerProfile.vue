<template>
  <PageContainer>

    <div class="profile-hero">
      <div class="avatar">{{ initials }}</div>
      <div class="hero-info">
        <div class="hero-name">{{ profile?.name || auth.user?.name }}</div>
        <div class="hero-email">{{ profile?.email || auth.user?.email }}</div>
        <div class="hero-badges">
          <span class="badge-vol">{{ roleLabel }}</span>
          <span v-if="profile?.experience" class="badge-exp">{{ profile.experience }}</span>
          <span v-if="profile?.waiverSigned" class="badge-waiver">✓ Waiver signed</span>
        </div>
      </div>
    </div>

    <SectionLabel>My info</SectionLabel>
    <AppCard v-if="!editing">
      <div class="info-grid">
        <div class="info-row">
          <span class="info-label">Name</span>
          <span>{{ profile?.name || auth.user?.name || '—' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Phone</span>
          <span>{{ profile?.phone || auth.user?.phone || '—' }}</span>
        </div>
        <div v-if="isVolunteer" class="info-row">
          <span class="info-label">Experience</span>
          <span>{{ profile?.experience || '—' }}</span>
        </div>
        <div v-if="isVolunteer" class="info-row">
          <span class="info-label">Why I volunteer</span>
          <span class="info-why">{{ profile?.why || '—' }}</span>
        </div>
      </div>
      <AppButton size="sm" @click="startEdit" style="margin-top:14px">✏️ Edit my info</AppButton>
    </AppCard>

    <AppCard v-else>
      <div class="edit-grid">
        <div class="edit-field">
          <label>Name</label>
          <input v-model="draft.name" type="text" placeholder="Your name" />
        </div>
        <div class="edit-field">
          <label>Phone</label>
          <input v-model="draft.phone" type="tel" placeholder="(123) 456-7890" />
        </div>
        <div v-if="isVolunteer" class="edit-field">
          <label>Why I volunteer</label>
          <textarea v-model="draft.why" rows="3" placeholder="What brought you here..."></textarea>
        </div>
      </div>
      <div class="edit-actions">
        <AppButton variant="primary" @click="save" :disabled="saving">{{ saving ? 'Saving...' : 'Save' }}</AppButton>
        <AppButton @click="editing = false">Cancel</AppButton>
      </div>
    </AppCard>

    <template v-if="isVolunteer">
      <SectionLabel>My availability</SectionLabel>
      <AppCard>
        <div v-if="!editingAvailability" class="days-grid">
          <span v-for="d in allDays" :key="d" class="day-chip" :class="{ active: profile?.availability?.includes(d) }">
            {{ d }}
          </span>
        </div>
        <div v-else class="days-grid editable">
          <button v-for="d in allDays" :key="d" class="day-chip" :class="{ active: draft.availability.includes(d) }" @click="toggleDay(d)">
            {{ d }}
          </button>
        </div>
        <div v-if="!profile?.availability?.length && !editingAvailability" class="empty-note">No availability set</div>
        <AppButton v-if="!editingAvailability" size="sm" @click="startEditAvailability" style="margin-top:8px">✏️ Edit availability</AppButton>
        <div v-else style="display:flex; gap:8px; margin-top:8px">
          <AppButton size="sm" variant="primary" @click="saveAvailability" :disabled="savingAvail">{{ savingAvail ? 'Saving...' : 'Save' }}</AppButton>
          <AppButton size="sm" @click="editingAvailability = false">Cancel</AppButton>
        </div>
      </AppCard>

      <SectionLabel>My skills</SectionLabel>
      <AppCard>
        <div v-if="!editingSkills" class="skills-grid">
          <span v-for="s in profile?.skills" :key="s" class="skill-chip">{{ s }}</span>
          <div v-if="!profile?.skills?.length" class="empty-note">No skills listed</div>
        </div>
        <div v-else class="skills-edit">
          <div class="skill-input-group">
            <input v-model="newSkill" placeholder="Add a skill..." @keyup.enter="addSkill" />
            <AppButton size="sm" variant="primary" @click="addSkill" :disabled="!newSkill.trim()">Add</AppButton>
          </div>
          <div class="skills-grid">
            <div v-for="s in draft.skills" :key="s" class="skill-chip removable">
              {{ s }}
              <button class="remove-skill" @click="removeSkill(s)">✕</button>
            </div>
          </div>
        </div>
        <AppButton v-if="!editingSkills" size="sm" @click="startEditSkills" style="margin-top:8px">✏️ Edit skills</AppButton>
        <div v-else style="display:flex; gap:8px; margin-top:8px">
          <AppButton size="sm" variant="primary" @click="saveSkills" :disabled="savingSkills">{{ savingSkills ? 'Saving...' : 'Save' }}</AppButton>
          <AppButton size="sm" @click="editingSkills = false">Cancel</AppButton>
        </div>
      </AppCard>
    </template>

    <SectionLabel>Account</SectionLabel>
    <AppCard>
      <div class="info-row">
        <span class="info-label">Role</span>
        <span>{{ roleLabel }}</span>
      </div>
      <div class="info-row" style="margin-top:8px">
        <span class="info-label">Member since</span>
        <span>{{ joinedDate }}</span>
      </div>
      <div v-if="isVolunteer" class="info-row" style="margin-top:8px">
        <span class="info-label">Waiver signed</span>
        <span>{{ profile?.waiverSignedAt ? new Date(profile.waiverSignedAt).toLocaleDateString() : '—' }}</span>
      </div>
    </AppCard>

    <AppButton variant="danger" @click="signOut" style="margin-top:8px;width:100%">Sign out</AppButton>

  </PageContainer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { PageContainer, AppCard, SectionLabel, AppButton } from '../ui'
import { useAuthStore } from '../../stores/auth'
import { usePeopleStore } from '../../stores/people'

const auth = useAuthStore()
const peopleStore = usePeopleStore()
const editing = ref(false)
const saving = ref(false)
const editingAvailability = ref(false)
const editingSkills = ref(false)
const savingAvail = ref(false)
const savingSkills = ref(false)
const newSkill = ref('')

const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// Volunteers are also tracked as CRM contacts in `people` (for availability,
// skills, waiver, donations). Staff/admin accounts live only in `users` —
// they don't get a `people` record just for having a login, so `profile`
// is optional here and every field falls back to `auth.user`.
const profile = computed(() =>
  (Array.isArray(peopleStore.people) ? peopleStore.people : []).find(p => p.email === auth.user?.email)
)

const isVolunteer = computed(() => auth.user?.role === 'volunteer')
const roleLabel = computed(() => {
  const role = auth.user?.role
  return role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Volunteer'
})

const initials = computed(() => {
  const name = profile.value?.name || auth.user?.name || ''
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
})

const joinedDate = computed(() => {
  const d = profile.value?.createdAt || auth.user?.createdAt
  return d ? new Date(d).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'
})

const draft = ref({ name: '', phone: '', why: '', availability: [], skills: [] })

const startEdit = () => {
  draft.value = {
    name: profile.value?.name || auth.user?.name || '',
    phone: profile.value?.phone || auth.user?.phone || '',
    why: profile.value?.why || '',
    availability: [...(profile.value?.availability || [])],
    skills: [...(profile.value?.skills || [])],
  }
  editing.value = true
}

const save = async () => {
  saving.value = true
  try {
    // users/{uid} is the source of truth for name/phone across all roles.
    await auth.updateProfile({ name: draft.value.name, phone: draft.value.phone })
    // Keep the linked CRM contact (if any) in sync so People/CRM stays accurate.
    if (profile.value?.id) {
      await peopleStore.updatePerson(profile.value.id, { ...draft.value })
    }
  } finally {
    saving.value = false
    editing.value = false
  }
}

const startEditAvailability = () => {
  draft.value.availability = [...(profile.value?.availability || [])]
  editingAvailability.value = true
}

const toggleDay = (day) => {
  const idx = draft.value.availability.indexOf(day)
  if (idx > -1) {
    draft.value.availability.splice(idx, 1)
  } else {
    draft.value.availability.push(day)
  }
}

const saveAvailability = async () => {
  savingAvail.value = true
  try {
    if (profile.value?.id) {
      await peopleStore.updatePerson(profile.value.id, { availability: draft.value.availability })
    }
  } finally {
    savingAvail.value = false
    editingAvailability.value = false
  }
}

const startEditSkills = () => {
  draft.value.skills = [...(profile.value?.skills || [])]
  newSkill.value = ''
  editingSkills.value = true
}

const addSkill = () => {
  const skill = newSkill.value.trim()
  if (skill && !draft.value.skills.includes(skill)) {
    draft.value.skills.push(skill)
    newSkill.value = ''
  }
}

const removeSkill = (skill) => {
  const idx = draft.value.skills.indexOf(skill)
  if (idx > -1) {
    draft.value.skills.splice(idx, 1)
  }
}

const saveSkills = async () => {
  savingSkills.value = true
  try {
    if (profile.value?.id) {
      await peopleStore.updatePerson(profile.value.id, { skills: draft.value.skills })
    }
  } finally {
    savingSkills.value = false
    editingSkills.value = false
  }
}

const signOut = () => auth.signOut()

onMounted(() => peopleStore.fetchPeople())
</script>

<style scoped>
.profile-hero {
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 16px;
  background: linear-gradient(135deg, var(--brand-l), rgba(78,255,197,.08));
  border: 1px solid var(--border-2);
  border-radius: var(--rxl);
  margin-bottom: 16px;
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--mint);
  color: #000;
  font-size: 22px;
  font-weight: 900;
  font-family: 'Fredoka One', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.hero-name {
  font-size: 18px;
  font-weight: 800;
  color: var(--ink);
  margin-bottom: 2px;
}

.hero-email {
  font-size: 12px;
  color: var(--ink-3);
  font-weight: 600;
  margin-bottom: 8px;
}

.hero-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.badge-vol, .badge-exp, .badge-waiver {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 800;
}

.badge-vol { background: var(--teal-l); color: var(--mint); }
.badge-exp { background: var(--surface-2); color: var(--ink-3); }
.badge-waiver { background: rgba(78,255,197,.15); color: var(--mint); }

.info-grid { display: flex; flex-direction: column; }

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 8px 0;
  border-bottom: 1px solid var(--border);
  font-size: 12px;
  gap: 12px;
}

.info-row:last-child { border-bottom: none; }

.info-label { font-weight: 700; color: var(--ink-2); flex-shrink: 0; }

.info-why { text-align: right; color: var(--ink-3); }

.edit-grid { display: flex; flex-direction: column; gap: 12px; }

.edit-field { display: flex; flex-direction: column; gap: 4px; }

.edit-field label {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--ink-3);
  letter-spacing: .05em;
}

.edit-field input,
.edit-field textarea {
  padding: 10px 12px;
  background: var(--surface-2);
  border: 1.5px solid var(--border);
  border-radius: 8px;
  color: var(--ink);
  font-size: 13px;
  font-family: 'Nunito', sans-serif;
  resize: vertical;
}

.edit-field input:focus, .edit-field textarea:focus {
  outline: none;
  border-color: var(--mint);
}

.edit-actions { display: flex; gap: 8px; margin-top: 12px; }

.days-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.days-grid.editable .day-chip {
  cursor: pointer;
  transition: all .2s;
}

.days-grid.editable .day-chip:hover {
  transform: translateY(-2px);
}

.day-chip {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  background: var(--surface-2);
  border: 1.5px solid var(--border);
  color: var(--ink-3);
}

.day-chip.active {
  background: var(--teal-l);
  border-color: var(--mint);
  color: var(--mint);
}

.skills-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.skill-chip {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  background: var(--surface-2);
  border: 1.5px solid var(--border);
  color: var(--ink-2);
}

.skill-chip.removable {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
}

.remove-skill {
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  color: var(--ink-3);
  padding: 0;
  line-height: 1;
  transition: color .2s;
}

.remove-skill:hover {
  color: var(--coral);
}

.skills-edit {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skill-input-group {
  display: flex;
  gap: 6px;
}

.skill-input-group input {
  flex: 1;
  padding: 8px 12px;
  background: var(--surface-2);
  border: 1.5px solid var(--border);
  border-radius: 8px;
  color: var(--ink);
  font-size: 13px;
  font-family: 'Nunito', sans-serif;
}

.skill-input-group input:focus {
  outline: none;
  border-color: var(--mint);
}

.empty-note {
  font-size: 12px;
  color: var(--ink-3);
  font-style: italic;
}
</style>
