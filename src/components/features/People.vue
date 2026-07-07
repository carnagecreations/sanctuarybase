<template>
  <PageContainer>

    <!-- Stats -->
    <div class="stats-row">
      <StatCard :value="String(volunteers.length)"   label="Volunteers" />
      <StatCard :value="String(activeCount)"         label="Active" />
    </div>

    <!-- Search row -->
    <div class="search-row">
      <AppInput v-model="search" placeholder="Search volunteers..." class="search-input" />
      <AppButton variant="primary" @click="showCreate = !showCreate">+ Add</AppButton>
    </div>

    <!-- Create account form -->
    <AppCard v-if="showCreate" title="Create volunteer account">
      <div class="form-grid">
        <AppInput v-model="newUser.firstName" label="First name" placeholder="Jane" />
        <AppInput v-model="newUser.lastName"  label="Last name"  placeholder="Smith" />
      </div>
      <AppInput v-model="newUser.email"    label="Email"    type="email"    placeholder="jane@email.com" class="field-gap" />
      <AppInput v-model="newUser.password" label="Temp password" type="password" placeholder="Minimum 8 characters" class="field-gap" />
      <AppSelect v-model="newUser.role" label="Role" class="field-gap"
        :options="[{value:'volunteer',label:'Volunteer'},{value:'staff',label:'Staff'},{value:'admin',label:'Admin'}]"
      />
      <div class="form-actions">
        <AppButton variant="primary" :disabled="creatingAccount" @click="createAccount">
          {{ creatingAccount ? 'Creating...' : 'Create account' }}
        </AppButton>
        <AppButton @click="showCreate = false">Cancel</AppButton>
      </div>
    </AppCard>

    <!-- Volunteer list -->
    <SectionLabel>All volunteers ({{ filtered.length }})</SectionLabel>

    <template v-if="filtered.length > 0">
      <AppCard v-for="v in filtered" :key="v.id" :flat="true" class="vol-card">
        <template v-if="editingId === v.id">
          <div class="edit-form">
            <div class="form-grid">
              <AppInput v-model="editForm.name"  label="Name" placeholder="Full name" />
              <AppInput v-model="editForm.email" label="Email" type="email" placeholder="email@example.com" />
            </div>
            <AppSelect v-if="canEditRoles" v-model="editForm.role" label="Role" class="field-gap" :options="assignableRoleOptions" />
            <AppInput v-model="editForm.skillsText" label="Skills (comma separated)" placeholder="Cleaning, Feeding, Socializing" class="field-gap" />
            <div class="form-actions">
              <AppButton size="sm" variant="primary" :disabled="savingEdit" @click="saveEdit(v.id)">
                {{ savingEdit ? 'Saving…' : 'Save' }}
              </AppButton>
              <AppButton size="sm" @click="cancelEdit">Cancel</AppButton>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="vol-header">
            <UserRow :name="v.name" :sub="v.email">
              <template #badge>
                <AppBadge :type="v.role === 'Admin' ? 'adm' : v.role === 'Staff' ? 'staff' : 'vol'">
                  {{ v.role || 'Volunteer' }}
                </AppBadge>
              </template>
            </UserRow>
          </div>
          <div v-if="skillsText(v).length" class="vol-skills">
            Skills: {{ skillsText(v) }}
          </div>
          <div v-if="noteText(v)" class="vol-note">
            📌 {{ noteText(v) }}
          </div>
          <div class="vol-actions">
            <AppButton size="sm" @click="startEdit(v)">Edit</AppButton>
            <AppButton size="sm" @click="goToShifts(v)">Shifts</AppButton>
          </div>
        </template>
      </AppCard>
    </template>
    <EmptyState v-else-if="!peopleStore.loading" icon="👤" title="No volunteers found" message="Add your first volunteer to get started." />
    <div v-else class="loading-text">Loading...</div>

  </PageContainer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { PageContainer, AppCard, StatCard, SectionLabel, AppButton, AppBadge, AppInput, AppSelect, UserRow, EmptyState } from '../ui'
import { usePeopleStore } from '../../stores/people'
import { useUIStore } from '../../stores/ui'
import { useAuthStore } from '../../stores/auth'
import { useUserRolesStore } from '../../stores/userRoles'
import { personTypeList } from './admin/people/personDisplay'

const peopleStore = usePeopleStore()
const ui          = useUIStore()
const auth        = useAuthStore()
const userRoles   = useUserRolesStore()
const search      = ref('')
const showCreate  = ref(false)
const creatingAccount = ref(false)
const newUser     = ref({ firstName: '', lastName: '', email: '', password: '', role: 'volunteer' })

const editingId  = ref(null)
const savingEdit = ref(false)
const editForm   = ref({ name: '', email: '', role: 'Volunteer', skillsText: '' })

// Only staff/admin can change someone's real app permissions; staff can't
// grant admin (matches the Firestore rules enforcing this server-side too).
const canEditRoles = computed(() => auth.user?.role === 'admin' || auth.user?.role === 'staff')
const assignableRoleOptions = computed(() => {
  const opts = [{ value: 'Volunteer', label: 'Volunteer' }, { value: 'Staff', label: 'Staff' }]
  if (auth.user?.role === 'admin') opts.push({ value: 'Admin', label: 'Admin' })
  return opts
})

const volunteers = computed(() => (Array.isArray(peopleStore.people) ? peopleStore.people : []).filter(p => personTypeList(p).includes('volunteer')))
const activeCount = computed(() => volunteers.value.filter(p => p.status === 'active' || !p.status).length)

const filtered = computed(() => {
  const list = volunteers.value
  if (!search.value.trim()) return list
  const q = search.value.toLowerCase()
  return list.filter(v =>
    v.name?.toLowerCase().includes(q) ||
    v.email?.toLowerCase().includes(q)
  )
})

const skillsText = (v) => Array.isArray(v.skills) ? v.skills.join(', ') : (v.skills || '')

const noteText = (v) => {
  if (Array.isArray(v.notes)) return v.notes.length ? v.notes[v.notes.length - 1].text : ''
  return v.notes || ''
}

const startEdit = (v) => {
  editForm.value = {
    name: v.name || '',
    email: v.email || '',
    role: v.role || 'Volunteer',
    skillsText: skillsText(v),
  }
  editingId.value = v.id
}

const cancelEdit = () => {
  editingId.value = null
}

const saveEdit = async (id) => {
  if (!editForm.value.name.trim()) { ui.showToast('Name is required', 'error'); return }
  savingEdit.value = true
  try {
    const original = peopleStore.getPersonById(id)
    const roleChanged = canEditRoles.value && editForm.value.role !== (original?.role || 'Volunteer')

    await peopleStore.updatePerson(id, {
      name: editForm.value.name.trim(),
      email: editForm.value.email.trim(),
      role: editForm.value.role,
      skills: editForm.value.skillsText.split(',').map(s => s.trim()).filter(Boolean),
    })

    if (roleChanged) {
      try {
        const result = await userRoles.setRoleForEmail(editForm.value.email.trim(), editForm.value.role.toLowerCase())
        ui.showToast(result.applied
          ? `${editForm.value.name}'s access updated to ${editForm.value.role}`
          : `${editForm.value.name} will become ${editForm.value.role} on their next login`)
      } catch (err) {
        ui.showToast(err.message || 'Could not update their access level', 'error')
      }
    } else {
      ui.showToast('Volunteer updated')
    }
    editingId.value = null
  } catch (err) {
    ui.showToast('Failed to save changes', 'error')
  } finally {
    savingEdit.value = false
  }
}

const goToShifts = (v) => {
  ui.shiftPrefillVolunteer = v.name
  ui.setCurrentTab('admin-shift-calendar')
}

const createAccount = async () => {
  const { firstName, lastName, email, password, role } = newUser.value

  if (!firstName.trim()) { ui.showToast('First name is required', 'error'); return }
  if (!lastName.trim()) { ui.showToast('Last name is required', 'error'); return }
  if (!email.trim()) { ui.showToast('Email is required', 'error'); return }
  if (!password.trim()) { ui.showToast('Temporary password is required', 'error'); return }
  if (password.length < 8) { ui.showToast('Password must be at least 8 characters', 'error'); return }

  creatingAccount.value = true
  try {
    const idToken = await auth.getIdToken()
    const result = await fetch('/api/create-staff-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password: password.trim(),
        role: role.toLowerCase(),
      }),
    })

    if (!result.ok) {
      const error = await result.json()
      throw new Error(error.error || error.message || 'Failed to create account')
    }

    ui.showToast(`${firstName} ${lastName} account created`)
    newUser.value = { firstName: '', lastName: '', email: '', password: '', role: 'volunteer' }
    showCreate.value = false
    await peopleStore.fetchPeople()
  } catch (err) {
    console.error('Create account error:', err)
    ui.showToast(err.message || 'Error creating account', 'error')
  } finally {
    creatingAccount.value = false
  }
}

onMounted(() => peopleStore.fetchPeople())
</script>

<style scoped>
.stats-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 4px;
}

.search-row {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  margin-bottom: 4px;
}
.search-input { flex: 1; }

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 10px;
}
.field-gap { margin-top: 10px; }

.form-actions {
  display: flex;
  gap: 8px;
  margin-top: 14px;
}

.edit-form .form-actions { margin-top: 10px; }

.vol-card { margin-bottom: 8px; }
.vol-header { margin-bottom: 10px; }

.vol-skills {
  font-size: 11px;
  color: var(--ink-3);
  font-weight: 600;
  margin-bottom: 6px;
}

.vol-note {
  font-size: 11px;
  color: var(--amber);
  font-weight: 700;
  background: var(--amber-l);
  padding: 8px 10px;
  border-radius: var(--r);
  margin-bottom: 8px;
}

.vol-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.loading-text {
  text-align: center;
  color: var(--ink-3);
  font-size: 13px;
  padding: 24px;
}
</style>
